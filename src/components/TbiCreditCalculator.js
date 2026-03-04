import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Component Styles/TbiCreditCalculator.module.css';

const DEBOUNCE_MS = 500;
const tbiCache = new Map();

const tbiCacheKey = (termId, priceEUR) => `tbi|${termId ?? ''}|${Number(priceEUR).toFixed(2)}`;

const TbiCreditCalculator = ({ price, productId, onSchemeSelect, onContinue, showSummaryAndCta }) => {
  const { t, i18n } = useTranslation('common');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchSchemes = useCallback(async (priceEUR) => {
    if (!priceEUR || priceEUR <= 0) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const key = tbiCacheKey(null, priceEUR);
    const cached = tbiCache.get(key);
    if (cached && cached.schemes?.length > 0) {
      setSchemes(cached.schemes);
      const defaultScheme = cached.schemes.find(s => s.period === 12) || cached.schemes[0];
      setSelectedSchemeId(defaultScheme?.id ?? null);
      if (onSchemeSelect && defaultScheme) onSchemeSelect(defaultScheme);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tbi-calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(priceEUR).toFixed(2),
          category_id: null,
        }),
        signal: abortRef.current.signal,
      });
      const data = await response.json();
      if (data.success && data.schemes) {
        const schemeArray = Array.isArray(data.schemes) ? data.schemes : Object.values(data.schemes);
        setSchemes(schemeArray);
        tbiCache.set(key, { schemes: schemeArray });
        const defaultScheme = schemeArray.find(s => s.period === 12) || schemeArray[0];
        if (defaultScheme) {
          setSelectedSchemeId(defaultScheme.id);
          if (onSchemeSelect) onSchemeSelect(defaultScheme);
        }
      } else {
        if (data.error) {
          console.error('TBI calculator API error:', data.error);
        }
        const msgKey = 'tbi.calculator.fetchError';
        const translated = t(msgKey);
        const friendly =
          translated === msgKey
            ? 'Възникна грешка при зареждане на условията. Опитайте отново или изберете друга банка.'
            : translated;
        setError(friendly);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('TBI calculator fetch error:', err);
      const msgKey = 'tbi.calculator.fetchError';
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
      fetchSchemes(price);
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

  const getNirLabel = () => {
    const key = 'tbi.calculator.nir';
    const value = t(key);
    if (value === key) {
      return i18n.language === 'bg' ? 'ГЛП' : 'NIR';
    }
    return value;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>{t('tbi.calculator.loading')}</span>
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
            <button type="button" className={styles.retryButton} onClick={() => fetchSchemes(price)}>
              {(() => {
                const key = 'tbi.calculator.retry';
                const translated = t(key);
                return translated === key ? 'Опитай отново' : translated;
              })()}
            </button>
            {showSummaryAndCta && onContinue && (
              <span className={styles.switchBank} onClick={() => onContinue('dsk')} role="button" tabIndex={0}>
                {(() => {
                  const key = 'tbi.calculator.switchBank';
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
          <span className={styles.bankLogo}>tbi</span>
          <div className={styles.bannerText}>
            <span className={styles.bannerTitle}>{t('tbi.calculator.title')}</span>
            <span className={styles.bannerAmount}>
              {t('tbi.calculator.from')} <strong>€{parseFloat(minScheme.monthly_payment).toFixed(2)}</strong> / {t('tbi.calculator.month')}
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
            <label className={styles.dropdownLabel} htmlFor="tbi-months">
              {t('tbi.calculator.period')}
            </label>
            <select
              id="tbi-months"
              className={styles.dropdown}
              value={selectedSchemeId || ''}
              onChange={handleSchemeChange}
            >
              {schemes.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.name || `${scheme.period} ${t('tbi.calculator.months')}`}
                </option>
              ))}
            </select>
          </div>

          {selectedScheme && (
            <div className={styles.schemeDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('tbi.calculator.monthlyPayment')}</span>
                <span className={styles.detailValueHighlight}>
                  €{parseFloat(selectedScheme.monthly_payment).toFixed(2)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('tbi.calculator.totalDue')}</span>
                <span className={styles.detailValue}>
                  €{parseFloat(selectedScheme.total_amount_due).toFixed(2)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('tbi.calculator.apr')}</span>
                <span className={styles.detailValue}>{selectedScheme.apr}%</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{getNirLabel()}</span>
                <span className={styles.detailValue}>{selectedScheme.nir}%</span>
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
                TBI · {selectedScheme.name || `${selectedScheme.period} ${t('tbi.calculator.months')}`} · €{parseFloat(selectedScheme.monthly_payment).toFixed(2)}{' '}
                {(() => {
                  const key = 'tbi.calculator.monthly';
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
                <button type="button" className={styles.ctaButton} onClick={() => onContinue('tbi', selectedScheme)}>
                  {(() => {
                    const key = 'productDetail.installments.continueTbi';
                    const translated = t(key);
                    return translated === key ? 'Продължи с TBI' : translated;
                  })()}
                </button>
              )}
            </>
          )}

          <div className={styles.disclaimer}>
            {t('tbi.calculator.disclaimer')}
          </div>
        </div>
      )}
    </div>
  );
};

export default TbiCreditCalculator;
