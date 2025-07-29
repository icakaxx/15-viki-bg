import { useConsent } from './ConsentProvider';
import styles from '../styles/Component Styles/ConsentFormWrapper.module.css';

const ConsentFormWrapper = ({ children, formId, showWarning = true }) => {
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
              За да изпратите тази форма, трябва първо да приемете общите условия.
            </p>
            <button
              type="button"
              className={styles.acceptTermsButton}
              onClick={() => window.dispatchEvent(new CustomEvent('showTermsModal'))}
            >
              Приемам условията
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default ConsentFormWrapper; 