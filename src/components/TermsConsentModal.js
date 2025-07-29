import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Component Styles/TermsConsentModal.module.css';

const TermsConsentModal = ({ isOpen, onAccept, onDecline, termsText }) => {
  const { t } = useTranslation('common');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Removed Escape key handler to require explicit user action

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div 
        className={styles.modalContent}
        role="dialog"
        aria-labelledby="terms-title"
        aria-describedby="terms-content"
      >
        <div className={styles.modalHeader}>
          <h2 id="terms-title" className={styles.modalTitle}>
            {t('consent.modalTitle')}
          </h2>
        </div>
        
        <div className={styles.modalBody}>
          <div 
            id="terms-content"
            className={styles.termsContent}
            dangerouslySetInnerHTML={{ __html: termsText }}
          />
        </div>
        
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.declineButton}
            onClick={onDecline}
          >
            {t('consent.decline')}
          </button>
          <button
            type="button"
            className={styles.acceptButton}
            onClick={onAccept}
            autoFocus
          >
            {t('consent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsConsentModal; 