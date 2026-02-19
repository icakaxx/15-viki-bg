import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Component Styles/DskCreditCalculator.module.css';

const EUR_RATE = 1.95583;

const toEur = (bgnAmount) => (parseFloat(bgnAmount) / EUR_RATE).toFixed(2);

const DskCreditCalculator = ({ price, productId, onSchemeSelect }) => {
  const { t, i18n } = useTranslation('common');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);

  useEffect(() => {
    if (!price || price <= 0) return;

    const fetchSchemes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dsk-calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            price: price.toFixed(2),
            product_id: String(productId),
            initial_payment: '0',
          }),
        });

        const data = await response.json();
        if (data.success && data.schemes) {
          const schemeArray = Array.isArray(data.schemes) ? data.schemes : Object.values(data.schemes);
          setSchemes(schemeArray);

          const defaultScheme = schemeArray.find(s => s.default === 'Yes') || schemeArray[0];
          if (defaultScheme) {
            setSelectedSchemeId(defaultScheme.id);
            if (onSchemeSelect) onSchemeSelect(defaultScheme);
          }
        } else {
          setError(data.error || t('dsk.calculator.fetchError'));
        }
      } catch (err) {
        console.error('DSK calculator fetch error:', err);
        setError(t('dsk.calculator.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [price, productId]);

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
        <div className={styles.errorBanner}>{error}</div>
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

          <div className={styles.disclaimer}>
            {t('dsk.calculator.disclaimer')}
          </div>
        </div>
      )}
    </div>
  );
};

export default DskCreditCalculator;
