const COOKIE_CONSENT_KEY = 'cookieConsent';
const COOKIE_PREFERENCES_KEY = 'cookiePreferences';
const COOKIE_CONSENT_TIMESTAMP_KEY = 'cookieConsentTimestamp';
const COOKIE_CONSENT_VERSION_KEY = 'cookieConsentVersion';

// Current version of cookie consent - increment this when consent structure changes
const CURRENT_CONSENT_VERSION = '1.0';

export const cookieManager = {
  /**
   * Check if user has given cookie consent
   * @returns {boolean}
   */
  hasConsent: () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      const timestamp = localStorage.getItem(COOKIE_CONSENT_TIMESTAMP_KEY);
      const version = localStorage.getItem(COOKIE_CONSENT_VERSION_KEY);
      
      // Check if consent exists and is valid
      if (consent && timestamp && version) {
        // Check if consent version is current
        if (version === CURRENT_CONSENT_VERSION) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking cookie consent:', error);
      return false;
    }
  },

  /**
   * Accept all cookies
   */
  acceptAll: () => {
    if (typeof window === 'undefined') return;
    
    try {
      const timestamp = new Date().toISOString();
      const preferences = {
        essential: true,
        analytics: true,
        functional: true,
        marketing: true
      };
      
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
      localStorage.setItem(COOKIE_CONSENT_TIMESTAMP_KEY, timestamp);
      localStorage.setItem(COOKIE_CONSENT_VERSION_KEY, CURRENT_CONSENT_VERSION);
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
        detail: { preferences, timestamp, version: CURRENT_CONSENT_VERSION }
      }));
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  },

  /**
   * Accept essential cookies only
   */
  acceptEssential: () => {
    if (typeof window === 'undefined') return;
    
    try {
      const timestamp = new Date().toISOString();
      const preferences = {
        essential: true,
        analytics: false,
        functional: false,
        marketing: false
      };
      
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
      localStorage.setItem(COOKIE_CONSENT_TIMESTAMP_KEY, timestamp);
      localStorage.setItem(COOKIE_CONSENT_VERSION_KEY, CURRENT_CONSENT_VERSION);
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
        detail: { preferences, timestamp, version: CURRENT_CONSENT_VERSION }
      }));
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  },

  /**
   * Save custom cookie preferences
   * @param {Object} preferences - Cookie preferences object
   */
  savePreferences: (preferences) => {
    if (typeof window === 'undefined') return;
    
    try {
      const timestamp = new Date().toISOString();
      
      // Ensure essential is always true
      const validPreferences = {
        ...preferences,
        essential: true
      };
      
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(validPreferences));
      localStorage.setItem(COOKIE_CONSENT_TIMESTAMP_KEY, timestamp);
      localStorage.setItem(COOKIE_CONSENT_VERSION_KEY, CURRENT_CONSENT_VERSION);
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
        detail: { preferences: validPreferences, timestamp, version: CURRENT_CONSENT_VERSION }
      }));
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  },

  /**
   * Get current cookie preferences
   * @returns {Object|null}
   */
  getPreferences: () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (preferences) {
        return JSON.parse(preferences);
      }
      return null;
    } catch (error) {
      console.error('Error getting cookie preferences:', error);
      return null;
    }
  },

  /**
   * Check if specific cookie type is allowed
   * @param {string} type - Cookie type (essential, analytics, functional, marketing)
   * @returns {boolean}
   */
  isAllowed: (type) => {
    if (type === 'essential') return true; // Essential cookies are always allowed
    
    const preferences = cookieManager.getPreferences();
    if (!preferences) return false;
    
    return preferences[type] === true;
  },

  /**
   * Clear cookie consent (for testing or user withdrawal)
   */
  clearConsent: () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      localStorage.removeItem(COOKIE_PREFERENCES_KEY);
      localStorage.removeItem(COOKIE_CONSENT_TIMESTAMP_KEY);
      localStorage.removeItem(COOKIE_CONSENT_VERSION_KEY);
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('cookieConsentWithdrawn'));
    } catch (error) {
      console.error('Error clearing cookie consent:', error);
    }
  },

  /**
   * Get consent details
   * @returns {Object|null}
   */
  getConsentDetails: () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      const timestamp = localStorage.getItem(COOKIE_CONSENT_TIMESTAMP_KEY);
      const version = localStorage.getItem(COOKIE_CONSENT_VERSION_KEY);
      
      if (consent && preferences && timestamp && version) {
        return {
          consented: true,
          preferences: JSON.parse(preferences),
          timestamp,
          version,
          isCurrentVersion: version === CURRENT_CONSENT_VERSION
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cookie consent details:', error);
      return null;
    }
  },

  /**
   * Check if consent needs renewal (e.g., consent structure updated)
   * @returns {boolean}
   */
  needsRenewal: () => {
    const details = cookieManager.getConsentDetails();
    return !details || !details.isCurrentVersion;
  },

  /**
   * Get current consent version
   * @returns {string}
   */
  getCurrentVersion: () => CURRENT_CONSENT_VERSION
};

export default cookieManager; 