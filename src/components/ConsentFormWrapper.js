import { useConsent } from './ConsentProvider';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Component Styles/ConsentFormWrapper.module.css';

const ConsentFormWrapper = ({ children, formId, showWarning = true }) => {
  const { t } = useTranslation('common');
  const { hasConsent, isLoading } = useConsent();

  if (isLoading) {
    return <div className={styles.loadingWrapper}>{children}</div>;
  }

  if (!hasConsent) {
    return (
      <div className={styles.disabledWrapper}>
        {children}
        {showWarning && (
          <div className={styles.consentWarning}>
            <div className={styles.warningIcon}>⚠️</div>
            <p className={styles.warningText}>
              {t('consent.required')}
            </p>
            <button
              type="button"
              className={styles.acceptTermsButton}
              onClick={() => window.dispatchEvent(new CustomEvent('showTermsModal'))}
            >
              {t('consent.accept')}
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default ConsentFormWrapper; 