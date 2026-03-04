import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Component Styles/DskCreditCalculator.module.css';

const EUR_RATE = 1.95583;
const DEBOUNCE_MS = 500;
const cache = new Map();

const toEur = (bgnAmount) => (parseFloat(bgnAmount) / EUR_RATE).toFixed(2);

const cacheKey = (bank, termId, totalBGN) => `dsk|${termId ?? ''}|${Number(totalBGN).toFixed(2)}`;

const DskCreditCalculator = ({ price, productId, onSchemeSelect, onContinue, showSummaryAndCta }) => {
  const { t, i18n } = useTranslation('common');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchSchemes = useCallback(async (totalBGN, productIdVal) => {
    if (!totalBGN || totalBGN <= 0) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const key = cacheKey('dsk', null, totalBGN);
    const cached = cache.get(key);
    if (cached && cached.schemes?.length > 0) {
      setSchemes(cached.schemes);
      const defaultScheme = cached.schemes.find(s => s.default === 'Yes') || cached.schemes[0];
      setSelectedSchemeId(defaultScheme?.id ?? null);
      if (onSchemeSelect && defaultScheme) onSchemeSelect(defaultScheme);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dsk-calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: Number(totalBGN).toFixed(2),
          product_id: String(productIdVal),
          initial_payment: '0',
        }),
        signal: abortRef.current.signal,
      });
      const data = await response.json();
      if (data.success && data.schemes) {
        const schemeArray = Array.isArray(data.schemes) ? data.schemes : Object.values(data.schemes);
        setSchemes(schemeArray);
        cache.set(key, { schemes: schemeArray });
        const defaultScheme = schemeArray.find(s => s.default === 'Yes') || schemeArray[0];
        if (defaultScheme) {
          setSelectedSchemeId(defaultScheme.id);
          if (onSchemeSelect) onSchemeSelect(defaultScheme);
        }
      } else {
        if (data.error) {
          console.error('DSK calculator API error:', data.error);
        }
        const msgKey = 'dsk.calculator.fetchError';
        const translated = t(msgKey);
        const friendly =
          translated === msgKey
            ? 'Възникна грешка при зареждане на условията. Опитайте отново или изберете друга банка.'
            : translated;
        setError(friendly);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('DSK calculator fetch error:', err);
      const msgKey = 'dsk.calculator.fetchError';
      const translated = t(msgKey);
      const baseFallback =
        translated === msgKey
          ? 'Възникна грешка при зареждане на условията. Опитайте отново или изберете друга банка.'
          : translated;
      setError(baseFallback);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [onSchemeSelect, t]);

  useEffect(() => {
    if (!price || price <= 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSchemes(price, productId);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [price, productId, fetchSchemes]);

  const handleSchemeChange = (e) => {
    const id = parseInt(e.target.value, 10);
    setSelectedSchemeId(id);
    const scheme = schemes.find(s => s.id === id);
    if (scheme && onSchemeSelect) onSchemeSelect(scheme);
  };

  const getMinMonthlyPayment = () => {
    if (schemes.length === 0) return null;
    return schemes.reduce((min, s) =>
      parseFloat(s.monthly_payment) < parseFloat(min.monthly_payment) ? s : min
    );
  };

  const selectedScheme = schemes.find(s => s.id === selectedSchemeId);

  const getGlpLabel = () => {
    const key = 'dsk.calculator.glp';
    const value = t(key);
    if (value === key) {
      return i18n.language === 'bg' ? 'ГЛП' : 'AIR';
    }
    return value;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>{t('dsk.calculator.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBanner}>
          <div>{error}</div>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className={styles.retryButton} onClick={() => fetchSchemes(price, productId)}>
              {(() => {
                const key = 'dsk.calculator.retry';
                const translated = t(key);
                return translated === key ? 'Опитай отново' : translated;
              })()}
            </button>
            {showSummaryAndCta && onContinue && (
              <span className={styles.switchBank} onClick={() => onContinue('tbi')} role="button" tabIndex={0}>
                {(() => {
                  const key = 'dsk.calculator.switchBank';
                  const translated = t(key);
                  return translated === key ? 'Смени банка' : translated;
                })()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (schemes.length === 0) return null;

  const minScheme = getMinMonthlyPayment();

  return (
    <div className={styles.container}>
      <div className={styles.banner} onClick={() => setExpanded(!expanded)}>
        <div className={styles.bannerLeft}>
          <span className={styles.bankLogo}>DSK</span>
          <div className={styles.bannerText}>
            <span className={styles.bannerTitle}>{t('dsk.calculator.title')}</span>
            <span className={styles.bannerAmount}>
              {t('dsk.calculator.from')} <strong>€{toEur(minScheme.monthly_payment)}</strong> ({parseFloat(minScheme.monthly_payment).toFixed(2)} {t('dsk.calculator.currencyBGN')}) / {t('dsk.calculator.month')}
            </span>
          </div>
        </div>
        <span className={`${styles.expandIcon} ${expanded ? styles.expandedIcon : ''}`}>
          ▼
        </span>
      </div>

      {expanded && (
        <div className={styles.details}>
          <div className={styles.dropdownRow}>
            <label className={styles.dropdownLabel} htmlFor="dsk-months">
              {t('dsk.calculator.period')}
            </label>
            <select
              id="dsk-months"
              className={styles.dropdown}
              value={selectedSchemeId || ''}
              onChange={handleSchemeChange}
            >
              {schemes.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.name || `${scheme.id} ${t('dsk.calculator.months')}`}
                </option>
              ))}
            </select>
          </div>

          {selectedScheme && (
            <div className={styles.schemeDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('dsk.calculator.monthlyPayment')}</span>
                <span className={styles.detailValueHighlight}>
                  €{toEur(selectedScheme.monthly_payment)} <span className={styles.detailBgn}>({parseFloat(selectedScheme.monthly_payment).toFixed(2)} {t('dsk.calculator.currencyBGN')})</span>
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('dsk.calculator.totalDue')}</span>
                <span className={styles.detailValue}>
                  €{toEur(selectedScheme.total_amount_due)} <span className={styles.detailBgn}>({parseFloat(selectedScheme.total_amount_due).toFixed(2)} {t('dsk.calculator.currencyBGN')})</span>
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('dsk.calculator.gpr')}</span>
                <span className={styles.detailValue}>{selectedScheme.gpr}%</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{getGlpLabel()}</span>
                <span className={styles.detailValue}>{selectedScheme.glp}%</span>
              </div>
            </div>
          )}

          {showSummaryAndCta && selectedScheme && (
            <>
              <div className={styles.summaryRow}>
                {(() => {
                  const key = 'productDetail.installments.selected';
                  const translated = t(key);
                  return translated === key ? 'Избрано:' : translated;
                })()}{' '}
                DSK · {selectedScheme.name || `${selectedScheme.id} ${t('dsk.calculator.months')}`} · €{toEur(selectedScheme.monthly_payment)} ({parseFloat(selectedScheme.monthly_payment).toFixed(2)} {t('dsk.calculator.currencyBGN')}){' '}
                {(() => {
                  const key = 'dsk.calculator.monthly';
                  const translated = t(key);
                  return translated === key ? 'месечна вноска' : translated;
                })()}{' '}
                ({(() => {
                  const key = 'productDetail.installments.forTotal';
                  const translated = t(key);
                  return translated === key ? 'за текущата обща сума' : translated;
                })()})
              </div>
              {onContinue && (
                <button type="button" className={styles.ctaButton} onClick={() => onContinue('dsk', selectedScheme)}>
                  {(() => {
                    const key = 'productDetail.installments.continueDsk';
                    const translated = t(key);
                    return translated === key ? 'Продължи с DSK' : translated;
                  })()}
                </button>
              )}
            </>
          )}

          <div className={styles.disclaimer}>
            {t('dsk.calculator.disclaimer')}
          </div>
        </div>
      )}
    </div>
  );
};

export default DskCreditCalculator;
