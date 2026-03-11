import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Component Styles/PriceFilter.module.css';

const EUR_RATE = 1.95583;

const PriceFilterWithSlider = ({ 
  minValue = 0, 
  maxValue = 3000, 
  onPriceChange,
  disabled = false,
  minBound = 0,
  maxBound = 10000,
  showSlider = true
}) => {
  const { t } = useTranslation('common');
  const [fromPrice, setFromPrice] = useState(minValue);
  const [toPrice, setToPrice] = useState(maxValue);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const activeThumbRef = useRef(null); // 'min' | 'max' | null
  const trackRef = useRef(null);

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
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const value = Math.round(minBound + (maxBound - minBound) * Math.min(1, Math.max(0, percent)));
    
    // Determine which handle is closer when clicking on the track
    const distToMin = Math.abs(value - fromPrice);
    const distToMax = Math.abs(value - toPrice);
    
    if (distToMin < distToMax) {
      setFromPrice(Math.max(minBound, Math.min(value, toPrice)));
    } else {
      setToPrice(Math.min(maxBound, Math.max(value, fromPrice)));
    }
  };

  const startDrag = (thumb, event) => {
    if (disabled) return;
    event.preventDefault();
    activeThumbRef.current = thumb; // 'min' or 'max'
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event) => {
      if (!trackRef.current || !activeThumbRef.current) return;
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = (clientX - rect.left) / rect.width;
      const rawValue = minBound + (maxBound - minBound) * Math.min(1, Math.max(0, percent));
      const value = Math.round(rawValue);

      if (activeThumbRef.current === 'min') {
        setFromPrice(prev =>
          Math.max(minBound, Math.min(value, toPrice))
        );
      } else if (activeThumbRef.current === 'max') {
        setToPrice(prev =>
          Math.min(maxBound, Math.max(value, fromPrice))
        );
      }
    };

    const handlePointerUp = () => {
      activeThumbRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, minBound, maxBound, fromPrice, toPrice]);

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

  // Display values in EUR for the summary row
  const fromEur = Math.round(((fromPrice || 0) / EUR_RATE) * 100) / 100;
  const toEur = Math.round(((toPrice || 0) / EUR_RATE) * 100) / 100;

  return (
    <div className={styles.priceFilter}>
      <label className={styles.label} htmlFor="price-filter">
        {(() => {
          const key = 'buyPage.filters.priceTitle';
          const translated = t(key);
          return translated === key ? 'ФИЛТЪР ПО ЦЕНА' : translated;
        })()}
      </label>
      
      {/* Dual Range Slider */}
      {showSlider && (
        <div className={styles.sliderContainer}>
          <div 
            className={styles.sliderTrack}
            onClick={handleSliderChange}
            ref={trackRef}
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
              onMouseDown={(e) => startDrag('min', e)}
              onTouchStart={(e) => startDrag('min', e)}
            />
            <div 
              className={styles.sliderThumb}
              style={{ left: `${toPercent}%` }}
              onMouseDown={(e) => startDrag('max', e)}
              onTouchStart={(e) => startDrag('max', e)}
            />
          </div>
        </div>
      )}

      {/* EUR summary row under slider */}
      <div className={styles.priceSummaryRow}>
        <span className={styles.priceSummaryLabel}>
          {(() => {
            const key = 'buyPage.filters.priceLabel';
            const translated = t(key);
            return translated === key ? 'Цена:' : translated;
          })()}
        </span>
        <span className={styles.priceSummaryValue}>
          {fromEur.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} €&nbsp;–&nbsp;{toEur.toLocaleString('bg-BG', { maximumFractionDigits: 0 })} €
        </span>
      </div>
      
      <div className={styles.buttonRow}>
        <button
          className={`${styles.applyBtn} ${!canApply ? styles.disabled : ''}`}
          onClick={handleApply}
          disabled={!canApply}
          aria-label={t('buyPage.filters.apply')}
        >
          {(() => {
            const key = 'buyPage.filters.apply';
            const translated = t(key);
            return translated === key ? 'ФИЛТЪР' : translated;
          })()}
        </button>
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