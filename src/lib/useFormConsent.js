import { useConsent } from '../components/ConsentProvider';
import { useState } from 'react';

export const useFormConsent = () => {
  const { hasConsent, showConsentModal } = useConsent();
  const [consentError, setConsentError] = useState(false);

  /**
   * Validate consent before form submission
   * @param {Function} onSubmit - The original form submission function
   * @returns {Function} - Wrapped submission function with consent validation
   */
  const validateConsent = (onSubmit) => {
    return async (e) => {
      e.preventDefault();
      
      if (!hasConsent) {
        setConsentError(true);
        showConsentModal();
        return false;
      }
      
      setConsentError(false);
      return onSubmit(e);
    };
  };

  /**
   * Get submit button props based on consent status
   * @param {boolean} isSubmitting - Whether form is currently submitting
   * @returns {Object} - Button props including disabled state and styling
   */
  const getSubmitButtonProps = (isSubmitting = false) => {
    return {
      disabled: isSubmitting || !hasConsent,
      style: {
        background: hasConsent ? 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)' : '#ccc',
        color: 'white',
        padding: '1rem 2rem',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: hasConsent ? 'pointer' : 'not-allowed',
        transition: 'all 0.3s ease'
      }
    };
  };

  /**
   * Get consent error message component
   * @returns {JSX.Element|null} - Error message component or null
   */
  const getConsentErrorMessage = () => {
    if (!consentError) return null;
    
    return (
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        color: '#856404',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        ⚠️ За да изпратите формата, трябва първо да приемете общите условия.
      </div>
    );
  };

  /**
   * Clear consent error
   */
  const clearConsentError = () => {
    setConsentError(false);
  };

  return {
    hasConsent,
    consentError,
    validateConsent,
    getSubmitButtonProps,
    getConsentErrorMessage,
    clearConsentError,
    showConsentModal
  };
};

export default useFormConsent; 