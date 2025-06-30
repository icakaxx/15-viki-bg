import React, { useState, useContext, createContext, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiMenu } from "react-icons/fi";
import styles from "../../styles/Component Styles/Header.module.css";
import { loadTranslations, getTranslation } from "../../lib/i18n";
import CartIcon from "../CartIcon";

// Language Context
const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('bg');
  const [translations, setTranslations] = useState({});
  const [previousTranslations, setPreviousTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Handle hydration safely
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Load translations when locale changes
  useEffect(() => {
    const loadLocaleTranslations = async () => {
      setLoading(true);
      try {
        // Keep previous translations for smooth transition
        if (Object.keys(translations).length > 0) {
          setPreviousTranslations(translations);
        }
        
        const translationData = await loadTranslations(locale);
        setTranslations(translationData);
        setPreviousTranslations({}); // Clear previous once new ones are loaded
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Only load translations after component is mounted (client-side)
    if (mounted) {
      loadLocaleTranslations();
    }
  }, [locale, mounted]);
  
  const t = (key) => {
    // If not mounted yet (server-side), return the key
    if (!mounted) {
      return key;
    }
    
    // During loading, use previous translations if available, otherwise use current
    const activeTranslations = loading && Object.keys(previousTranslations).length > 0 
      ? previousTranslations 
      : translations;
      
    if (Object.keys(activeTranslations).length === 0) {
      return key; // Only return key if no translations available at all
    }
    
    return getTranslation(activeTranslations, key);
  };
  
  const switchLanguage = (newLocale) => {
    setLocale(newLocale);
  };
  
  return (
    <LanguageContext.Provider value={{ locale, t, switchLanguage, loading: loading && mounted }}>
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
  const router = useRouter();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Navigation items with translation keys
  const navigationItems = [
    { href: "/", translationKey: "nav.about" },
    { href: "/products", translationKey: "nav.products" },
    { href: "/buy", translationKey: "nav.buy" },
    { href: "/inquiry", translationKey: "nav.inquiry" },
    { href: "/contact", translationKey: "nav.contact" }
  ];

  if (loading) {
    return (
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <div className={styles.companyName}>
              БГВИКИ15 ЕООД
            </div>
            <h1 className={styles.logoContainer}>
              <div className={styles.logoWrapper}>
                <img 
                  src="/images/bgVIKI15-eood.jpg" 
                  alt="VIKI15 EOOD Logo" 
                  className={styles.logoImage}
                />
              </div>
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
        
        {/* Left Section - Company Name & Logo */}
        <div className={styles.leftSection}>
          <div className={styles.companyName}>
            БГВИКИ15 ЕООД
          </div>
          <h1 className={styles.logoContainer}>
            <div className={styles.logoWrapper}>
              <img 
                src="/images/bgVIKI15-eood.jpg" 
                alt="VIKI15 EOOD Logo" 
                className={styles.logoImage}
              />
            </div>
          </h1>
        </div>

        {/* Center Navigation */}
        <nav className={styles.centerNav} aria-label="Main navigation">
          <ul className={styles.navList}>
            {navigationItems.map((item, index) => (
              <li key={index}>
                {item.href.startsWith('#') ? (
                  <a href={item.href} className={styles.navLink}>
                    {t(item.translationKey)}
                  </a>
                ) : (
                  <Link 
                    href={item.href}
                    className={`${styles.navLink} ${router.pathname === item.href ? styles.activeNavLink : ''}`}
                  >
                    {t(item.translationKey)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Section - Cart, Language & Utilities */}
        <div className={styles.rightSection}>
          {/* Cart Icon */}
          <CartIcon />
          
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
                    {item.href.startsWith('#') ? (
                      <a 
                        href={item.href} 
                        className={styles.mobileNavLink}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t(item.translationKey)}
                      </a>
                    ) : (
                      <Link 
                        href={item.href}
                        className={`${styles.mobileNavLink} ${router.pathname === item.href ? styles.activeMobileNavLink : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t(item.translationKey)}
                      </Link>
                    )}
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
