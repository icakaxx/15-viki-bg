import React, { useState, useEffect, useContext, useCallback } from 'react';
import { LanguageContext } from './Layout Components/Header';
import styles from '../styles/Component Styles/PriceFilter.module.css';

const PriceFilterWithSlider = ({ 
  minValue = 0, 
  maxValue = 3000, 
  onPriceChange,
  disabled = false,
  minBound = 0,
  maxBound = 10000,
  showSlider = true
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

  const validateInputs = useCallback(() => {
    const newErrors = {};

    // Check if from price is greater than to price
    if (fromPrice > toPrice) {
      newErrors.range = t('buyPage.filters.invalidPriceRange');
    }

    // Check bounds
    if (fromPrice < minBound) {
      newErrors.min = t('buyPage.filters.priceMinError', { min: minBound });
    }

    if (toPrice > maxBound) {
      newErrors.max = t('buyPage.filters.priceMaxError', { max: maxBound });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fromPrice, toPrice, minBound, maxBound, t]);

  const handleFromChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setFromPrice(Math.max(minBound, Math.min(value, toPrice)));
  };

  const handleToChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setToPrice(Math.min(maxBound, Math.max(value, fromPrice)));
  };

  const handleSliderChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const value = Math.round(minBound + (maxBound - minBound) * percent);
    
    // Determine which handle is closer
    const distToMin = Math.abs(value - fromPrice);
    const distToMax = Math.abs(value - toPrice);
    
    if (distToMin < distToMax) {
      setFromPrice(Math.max(minBound, Math.min(value, toPrice)));
    } else {
      setToPrice(Math.min(maxBound, Math.max(value, fromPrice)));
    }
  };

  const handleApply = () => {
    if (validateInputs() && onPriceChange) {
      onPriceChange(fromPrice, toPrice);
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

  // Calculate slider positions
  const fromPercent = ((fromPrice - minBound) / (maxBound - minBound)) * 100;
  const toPercent = ((toPrice - minBound) / (maxBound - minBound)) * 100;

  return (
    <div className={styles.priceFilter}>
      <label className={styles.label} htmlFor="price-filter">
        {t('buyPage.filters.priceRange')}
      </label>
      
      {/* Dual Range Slider */}
      {showSlider && (
        <div className={styles.sliderContainer}>
          <div 
            className={styles.sliderTrack}
            onClick={handleSliderChange}
          >
            <div 
              className={styles.sliderRange}
              style={{
                left: `${fromPercent}%`,
                width: `${toPercent - fromPercent}%`
              }}
            />
            <div 
              className={styles.sliderThumb}
              style={{ left: `${fromPercent}%` }}
              onMouseDown={(e) => {
                e.preventDefault();
                // Add drag functionality here
              }}
            />
            <div 
              className={styles.sliderThumb}
              style={{ left: `${toPercent}%` }}
              onMouseDown={(e) => {
                e.preventDefault();
                // Add drag functionality here
              }}
            />
          </div>
          <div className={styles.sliderLabels}>
            <span>{minBound ? minBound.toLocaleString('bg-BG') : '0'} {t('buyPage.filters.bgn')}</span>
            <span>{maxBound ? maxBound.toLocaleString('bg-BG') : '10000'} {t('buyPage.filters.bgn')}</span>
          </div>
        </div>
      )}
      
      <div className={styles.inputRow}>
        <div className={`${styles.inputGroup} ${errors.min ? styles.error : ''}`}>
          <span className={styles.prefix}>{t('buyPage.filters.from')}</span>
          <input
            type="number"
            value={fromPrice}
            onChange={handleFromChange}
            onKeyPress={handleKeyPress}
            onBlur={validateInputs}
            placeholder="0"
            min={minBound}
            max={maxBound}
            disabled={disabled}
            aria-label={`${t('buyPage.filters.priceFrom')} ${t('buyPage.filters.bgn')}`}
            className={styles.input}
          />
          <span className={styles.currency}>{t('buyPage.filters.bgn')}</span>
        </div>

        <div className={`${styles.inputGroup} ${errors.max ? styles.error : ''}`}>
          <span className={styles.prefix}>{t('buyPage.filters.to')}</span>
          <input
            type="number"
            value={toPrice}
            onChange={handleToChange}
            onKeyPress={handleKeyPress}
            onBlur={validateInputs}
            placeholder="3000"
            min={minBound}
            max={maxBound}
            disabled={disabled}
            aria-label={`${t('buyPage.filters.priceTo')} ${t('buyPage.filters.bgn')}`}
            className={styles.input}
          />
          <span className={styles.currency}>{t('buyPage.filters.bgn')}</span>
        </div>

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

export default PriceFilterWithSlider; 