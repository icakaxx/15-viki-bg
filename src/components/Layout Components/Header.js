import React, { useState, useContext, createContext, useEffect } from "react";
import { FiMenu } from "react-icons/fi";
import styles from "../../styles/Component Styles/Header.module.css";
import { loadTranslations, getTranslation } from "../../lib/i18n";

// Language Context
const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('bg');
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Load translations when locale changes
  useEffect(() => {
    const loadLocaleTranslations = async () => {
      setLoading(true);
      try {
        const translationData = await loadTranslations(locale);
        setTranslations(translationData);
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLocaleTranslations();
  }, [locale]);
  
  const t = (key) => {
    if (loading) return key;
    return getTranslation(translations, key);
  };
  
  const switchLanguage = (newLocale) => {
    setLocale(newLocale);
  };
  
  return (
    <LanguageContext.Provider value={{ locale, t, switchLanguage, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Export the context for use in Footer
export { LanguageContext };

// Custom hook to use language context
const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locale, t, switchLanguage, loading } = useLanguage();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Navigation items with translation keys
  const navigationItems = [
    { href: "#", translationKey: "nav.about" },
    { href: "#", translationKey: "nav.products" },
    { href: "#", translationKey: "nav.buy" },
    { href: "#", translationKey: "nav.inquiry" },
    { href: "#", translationKey: "nav.contact" }
  ];

  if (loading) {
    return (
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <h1 className={styles.logoContainer}>
              <a href="/" aria-label="Homepage" className={styles.logoLink}>
                <img 
                  src="/images/bgVIKI15-eood.jpg" 
                  alt="VIKI15 EOOD Logo" 
                  className={styles.logoImage}
                />
              </a>
            </h1>
          </div>
          <nav className={styles.centerNav}>
            <div>Loading...</div>
          </nav>
          <div className={styles.rightSection}>
            <div className={styles.languageSwitcher}>
              <button className={styles.langOption}>BG</button>
              <span className={styles.langSeparator}>|</span>
              <button className={styles.langOption}>EN</button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        
        {/* Left Section - Logo */}
        <div className={styles.leftSection}>
          <h1 className={styles.logoContainer}>
            <a href="/" aria-label="Homepage" className={styles.logoLink}>
              <img 
                src="/images/bgVIKI15-eood.jpg" 
                alt="VIKI15 EOOD Logo" 
                className={styles.logoImage}
              />
            </a>
          </h1>
        </div>

        {/* Center Navigation */}
        <nav className={styles.centerNav} aria-label="Main navigation">
          <ul className={styles.navList}>
            {navigationItems.map((item, index) => (
              <li key={index}>
                <a href={item.href} className={styles.navLink}>
                  {t(item.translationKey)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Section - Language & Utilities */}
        <div className={styles.rightSection}>
          {/* Language Switcher */}
          <div className={styles.languageSwitcher}>
            <button 
              className={`${styles.langOption} ${locale === 'bg' ? styles.activeLang : ''}`}
              onClick={() => switchLanguage('bg')}
              type="button"
            >
              BG
            </button>
            <span className={styles.langSeparator}>|</span>
            <button 
              className={`${styles.langOption} ${locale === 'en' ? styles.activeLang : ''}`}
              onClick={() => switchLanguage('en')}
              type="button"
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className={styles.mobileMenuToggle}>
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            <FiMenu className={styles.mobileIcon} />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className={styles.mobileNav}>
            <nav aria-label="Mobile navigation">
              <ul className={styles.mobileNavList}>
                {navigationItems.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className={styles.mobileNavLink}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t(item.translationKey)}
                    </a>
                  </li>
                ))}
              </ul>
              {/* Mobile Language Switcher */}
              <div className={styles.mobileLangSwitcher}>
                <button 
                  className={`${styles.mobileLangOption} ${locale === 'bg' ? styles.activeLang : ''}`}
                  onClick={() => {
                    switchLanguage('bg');
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  🇧🇬 Български
                </button>
                <button 
                  className={`${styles.mobileLangOption} ${locale === 'en' ? styles.activeLang : ''}`}
                  onClick={() => {
                    switchLanguage('en');
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  🇺🇸 English
                </button>
              </div>
            </nav>
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;
