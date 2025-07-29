import { createContext, useContext, useEffect, useState } from 'react';
import consentManager from '../lib/consentManager';
import TermsConsentModal from './TermsConsentModal';

const ConsentContext = createContext();

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};

export const ConsentProvider = ({ children, termsText }) => {
  const [hasConsent, setHasConsent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check consent status on mount
    const checkConsent = () => {
      const accepted = consentManager.hasAcceptedTerms();
      setHasConsent(accepted);
      
      // Show modal if no consent
      if (!accepted) {
        setShowModal(true);
      }
      
      setIsLoading(false);
    };

    // Listen for consent changes from other components
    const handleTermsAccepted = () => {
      setHasConsent(true);
      setShowModal(false);
    };

    const handleTermsWithdrawn = () => {
      setHasConsent(false);
      setShowModal(true);
    };

    const handleShowTermsModal = () => {
      setShowModal(true);
    };

    // Check initial consent
    checkConsent();

    // Add event listeners
    window.addEventListener('termsAccepted', handleTermsAccepted);
    window.addEventListener('termsWithdrawn', handleTermsWithdrawn);
    window.addEventListener('showTermsModal', handleShowTermsModal);

    return () => {
      window.removeEventListener('termsAccepted', handleTermsAccepted);
      window.removeEventListener('termsWithdrawn', handleTermsWithdrawn);
      window.removeEventListener('showTermsModal', handleShowTermsModal);
    };
  }, []);

  const handleAcceptTerms = () => {
    consentManager.acceptTerms();
    setHasConsent(true);
    setShowModal(false);
  };

  const handleDeclineTerms = () => {
    setShowModal(false);
    // User can still browse but forms will be disabled
  };

  const value = {
    hasConsent,
    isLoading,
    showConsentModal: () => setShowModal(true),
    clearConsent: () => {
      consentManager.clearConsent();
      setHasConsent(false);
      setShowModal(true);
    }
  };

  return (
    <ConsentContext.Provider value={value}>
      {children}
      <TermsConsentModal
        isOpen={showModal}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
        termsText={termsText}
      />
    </ConsentContext.Provider>
  );
};

export default ConsentProvider; 