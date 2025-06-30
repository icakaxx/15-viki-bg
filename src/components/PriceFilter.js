import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from './Layout Components/Header';
import styles from '../styles/Component Styles/PriceFilter.module.css';

const PriceFilter = ({ 
  minValue = 0, 
  maxValue = 3000, 
  onPriceChange,
  disabled = false,
  minBound = 0,
  maxBound = 10000
}) => {
  const { t } = useContext(LanguageContext);
  const [fromPrice, setFromPrice] = useState(minValue);
  const [toPrice, setToPrice] = useState(maxValue);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setFromPrice(minValue);
    setToPrice(maxValue);
    setHasChanges(false);
    setErrors({});
  }, [minValue, maxValue]);

  // Track if values have changed from initial
  useEffect(() => {
    setHasChanges(fromPrice !== minValue || toPrice !== maxValue);
  }, [fromPrice, toPrice, minValue, maxValue]);

  const validateInputs = () => {
    const newErrors = {};
    const fromVal = fromPrice === '' ? minBound : Number(fromPrice);
    const toVal = toPrice === '' ? maxBound : Number(toPrice);

    // Check if from price is greater than to price
    if (fromVal > toVal) {
      newErrors.range = t('buyPage.filters.invalidPriceRange');
    }

    // Check bounds
    if (fromVal < minBound) {
      newErrors.min = t('buyPage.filters.priceMinError', { min: minBound });
    }

    if (toVal > maxBound) {
      newErrors.max = t('buyPage.filters.priceMaxError', { max: maxBound });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFromChange = (e) => {
    const value = e.target.value;
    // Allow empty string or numbers only
    if (value === '' || /^\d+$/.test(value)) {
      setFromPrice(value === '' ? '' : parseInt(value));
    }
  };

  const handleToChange = (e) => {
    const value = e.target.value;
    // Allow empty string or numbers only
    if (value === '' || /^\d+$/.test(value)) {
      setToPrice(value === '' ? '' : parseInt(value));
    }
  };

  const handleApply = () => {
    if (validateInputs() && onPriceChange) {
      const fromVal = fromPrice === '' ? minBound : Number(fromPrice);
      const toVal = toPrice === '' ? maxBound : Number(toPrice);
      onPriceChange(fromVal, toVal);
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    setFromPrice(minBound);
    setToPrice(maxBound);
    setErrors({});
    if (onPriceChange) {
      onPriceChange(minBound, maxBound);
    }
    setHasChanges(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const isValidRange = Object.keys(errors).length === 0;
  const canApply = hasChanges && isValidRange && !disabled;

  return (
    <div className={styles.priceFilter}>
      <label className={styles.label} htmlFor="price-filter">
        {t('buyPage.filters.priceRange')}
      </label>
      
      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={fromPrice || ''}
            onChange={handleFromChange}
            onKeyPress={handleKeyPress}
            onBlur={validateInputs}
            placeholder="0"
            min={minBound}
            max={maxBound}
            disabled={disabled}
            aria-label={`${t('buyPage.filters.priceFrom')} ${t('buyPage.filters.bgn')}`}
            className={`${styles.input} ${errors.min || errors.range ? styles.error : ''}`}
          />
          <span className={styles.currency}>{t('buyPage.filters.bgn')}</span>
        </div>

        <span className={styles.separator}>-</span>

        <div className={styles.inputGroup}>
          <input
            type="text"
            value={toPrice || ''}
            onChange={handleToChange}
            onKeyPress={handleKeyPress}
            onBlur={validateInputs}
            placeholder="3000"
            min={minBound}
            max={maxBound}
            disabled={disabled}
            aria-label={`${t('buyPage.filters.priceTo')} ${t('buyPage.filters.bgn')}`}
            className={`${styles.input} ${errors.max || errors.range ? styles.error : ''}`}
          />
          <span className={styles.currency}>{t('buyPage.filters.bgn')}</span>
        </div>
      </div>

      <div className={styles.buttonRow}>
        <button
          className={`${styles.applyBtn} ${!canApply ? styles.disabled : ''}`}
          onClick={handleApply}
          disabled={!canApply}
          aria-label={t('buyPage.filters.apply')}
        >
          {t('buyPage.filters.apply')}
        </button>

        {hasChanges && (
          <button
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={disabled}
            aria-label={t('buyPage.filters.reset')}
          >
            {t('buyPage.filters.reset')}
          </button>
        )}
      </div>

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <div className={styles.errorMessages} role="alert">
          {Object.values(errors).map((error, index) => (
            <span key={index} className={styles.errorMessage}>
              {error}
            </span>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <div className={styles.helperText}>
        {t('buyPage.filters.priceHelp', { 
          min: minBound ? minBound.toLocaleString('bg-BG') : '0', 
          max: maxBound ? maxBound.toLocaleString('bg-BG') : '10000' 
        })}
      </div>
    </div>
  );
};

export default PriceFilter; 