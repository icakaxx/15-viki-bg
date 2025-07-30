import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import styles from '../styles/Component Styles/CookieBanner.module.css';
import cookieManager from '../lib/cookieManager';

const CookieBanner = () => {
  const { t } = useTranslation('common');
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    functional: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = cookieManager.hasConsent();
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    cookieManager.acceptAll();
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    cookieManager.acceptEssential();
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    cookieManager.savePreferences(preferences);
    setIsVisible(false);
  };

  const handlePreferenceChange = (type) => {
    if (type === 'essential') return; // Essential cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <div className={styles.bannerText}>
          <h3 className={styles.bannerTitle}>{t('cookieBanner.title')}</h3>
          <p className={styles.bannerDescription}>
            {t('cookieBanner.description')}
            <Link href="/cookie-policy" className={styles.policyLink}>
              {t('cookieBanner.learnMore')}
            </Link>
          </p>
        </div>

        {!showPreferences ? (
          <div className={styles.bannerActions}>
            <button 
              onClick={handleAcceptAll}
              className={`${styles.bannerButton} ${styles.acceptAll}`}
            >
              {t('cookieBanner.acceptAll')}
            </button>
            <button 
              onClick={handleAcceptEssential}
              className={`${styles.bannerButton} ${styles.acceptEssential}`}
            >
              {t('cookieBanner.essentialOnly')}
            </button>
            <button 
              onClick={() => setShowPreferences(true)}
              className={`${styles.bannerButton} ${styles.preferences}`}
            >
              {t('cookieBanner.managePreferences')}
            </button>
          </div>
        ) : (
          <div className={styles.preferencesPanel}>
            <h4 className={styles.preferencesTitle}>{t('cookieBanner.preferencesTitle')}</h4>
            
            <div className={styles.preferenceItem}>
              <div className={styles.preferenceHeader}>
                <label className={styles.preferenceLabel}>
                  <input
                    type="checkbox"
                    checked={preferences.essential}
                    disabled
                    className={styles.preferenceCheckbox}
                  />
                  <span className={styles.preferenceName}>{t('cookieBanner.preferences.essential.title')}</span>
                </label>
                <span className={styles.preferenceRequired}>{t('cookieBanner.preferences.required')}</span>
              </div>
              <p className={styles.preferenceDescription}>
                {t('cookieBanner.preferences.essential.description')}
              </p>
            </div>

            <div className={styles.preferenceItem}>
              <div className={styles.preferenceHeader}>
                <label className={styles.preferenceLabel}>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                    className={styles.preferenceCheckbox}
                  />
                  <span className={styles.preferenceName}>{t('cookieBanner.preferences.analytics.title')}</span>
                </label>
              </div>
              <p className={styles.preferenceDescription}>
                {t('cookieBanner.preferences.analytics.description')}
              </p>
            </div>

            <div className={styles.preferenceItem}>
              <div className={styles.preferenceHeader}>
                <label className={styles.preferenceLabel}>
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={() => handlePreferenceChange('functional')}
                    className={styles.preferenceCheckbox}
                  />
                  <span className={styles.preferenceName}>{t('cookieBanner.preferences.functional.title')}</span>
                </label>
              </div>
              <p className={styles.preferenceDescription}>
                {t('cookieBanner.preferences.functional.description')}
              </p>
            </div>

            <div className={styles.preferenceItem}>
              <div className={styles.preferenceHeader}>
                <label className={styles.preferenceLabel}>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => handlePreferenceChange('marketing')}
                    className={styles.preferenceCheckbox}
                  />
                  <span className={styles.preferenceName}>{t('cookieBanner.preferences.marketing.title')}</span>
                </label>
              </div>
              <p className={styles.preferenceDescription}>
                {t('cookieBanner.preferences.marketing.description')}
              </p>
            </div>

            <div className={styles.preferencesActions}>
              <button 
                onClick={handleSavePreferences}
                className={`${styles.bannerButton} ${styles.savePreferences}`}
              >
                {t('cookieBanner.savePreferences')}
              </button>
              <button 
                onClick={() => setShowPreferences(false)}
                className={`${styles.bannerButton} ${styles.back}`}
              >
                {t('cookieBanner.back')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner; 