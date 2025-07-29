const CONSENT_KEY = 'termsAccepted';
const CONSENT_TIMESTAMP_KEY = 'termsAcceptedTimestamp';
const CONSENT_VERSION_KEY = 'termsAcceptedVersion';

// Current version of terms - increment this when terms change
const CURRENT_TERMS_VERSION = '1.0';

export const consentManager = {
  /**
   * Check if user has accepted terms
   * @returns {boolean}
   */
  hasAcceptedTerms: () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const accepted = localStorage.getItem(CONSENT_KEY);
      const timestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);
      const version = localStorage.getItem(CONSENT_VERSION_KEY);
      
      // Check if consent exists and is valid
      if (accepted === 'true' && timestamp && version) {
        // Check if terms version is current
        if (version === CURRENT_TERMS_VERSION) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking consent status:', error);
      return false;
    }
  },

  /**
   * Accept terms and conditions
   * @param {string} version - Optional version override
   */
  acceptTerms: (version = CURRENT_TERMS_VERSION) => {
    if (typeof window === 'undefined') return;
    
    try {
      const timestamp = new Date().toISOString();
      localStorage.setItem(CONSENT_KEY, 'true');
      localStorage.setItem(CONSENT_TIMESTAMP_KEY, timestamp);
      localStorage.setItem(CONSENT_VERSION_KEY, version);
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('termsAccepted', {
        detail: { timestamp, version }
      }));
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  },

  /**
   * Clear consent (for testing or user withdrawal)
   */
  clearConsent: () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(CONSENT_KEY);
      localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
      localStorage.removeItem(CONSENT_VERSION_KEY);
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('termsWithdrawn'));
    } catch (error) {
      console.error('Error clearing consent:', error);
    }
  },

  /**
   * Get consent details
   * @returns {Object|null}
   */
  getConsentDetails: () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const accepted = localStorage.getItem(CONSENT_KEY);
      const timestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);
      const version = localStorage.getItem(CONSENT_VERSION_KEY);
      
      if (accepted === 'true' && timestamp && version) {
        return {
          accepted: true,
          timestamp,
          version,
          isCurrentVersion: version === CURRENT_TERMS_VERSION
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting consent details:', error);
      return null;
    }
  },

  /**
   * Check if consent needs renewal (e.g., terms updated)
   * @returns {boolean}
   */
  needsRenewal: () => {
    const details = consentManager.getConsentDetails();
    return !details || !details.isCurrentVersion;
  },

  /**
   * Get current terms version
   * @returns {string}
   */
  getCurrentVersion: () => CURRENT_TERMS_VERSION
};

export default consentManager; 