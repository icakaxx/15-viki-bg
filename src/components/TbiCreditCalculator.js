import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Component Styles/TbiCreditCalculator.module.css';

const TbiCreditCalculator = ({ price, productId, onSchemeSelect }) => {
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
        const response = await fetch('/api/tbi-calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: price.toFixed(2),
            category_id: null,
          }),
        });

        const data = await response.json();
        if (data.success && data.schemes) {
          const schemeArray = Array.isArray(data.schemes) ? data.schemes : Object.values(data.schemes);
          setSchemes(schemeArray);

          const defaultScheme = schemeArray.find(s => s.period === 12) || schemeArray[0];
          if (defaultScheme) {
            setSelectedSchemeId(defaultScheme.id);
            if (onSchemeSelect) onSchemeSelect(defaultScheme);
          }
        } else {
          setError(data.error || t('tbi.calculator.fetchError'));
        }
      } catch (err) {
        console.error('TBI calculator fetch error:', err);
        setError(t('tbi.calculator.fetchError'));
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

          <div className={styles.disclaimer}>
            {t('tbi.calculator.disclaimer')}
          </div>
        </div>
      )}
    </div>
  );
};

export default TbiCreditCalculator;
