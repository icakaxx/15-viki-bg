import React, { useState, useContext, createContext } from "react";
import { FiMenu } from "react-icons/fi";
import styles from "../../styles/Component Styles/Header.module.css";

// Complete translation data including header and footer
const translations = {
  bg: {
    nav: {
      about: "За нас",
      products: "Продукти и решения", 
      buy_air_conditioner: "Купи климатици",
      make_inquiry: "Направи запитване",
      contact: "Контакти"
    },
    footer: {
      tagline: "Качество и надеждностни решения от 2000",
      navigation: "Навигация",
      home: "Начало",
      services: "Услуги", 
      buy_air_conditioner: "Купи климатици",
      make_inquiry: "Направи запитване",
      contact: "Контакти",
      imprint: "Правни условия",
      phone: "Телефон",
      email: "Имейл",
      follow_us: "Последвайте ни",
      rights_reserved: "Всички права запазени",
      company_full: "БГВИКИ15 ЕООД",
      company_english: "БГVIKI15 Ltd",
      designed_by: "Дизайн",
      back_to_top: "Върни се нагоре",
      copyright_full: "© 2025 БГВИКИ15 ЕООД. Всички права запазени. | Дизайн: H&M WSPro"
    }
  },
  en: {
    nav: {
      about: "About",
      products: "Products & Solutions",
      buy_air_conditioner: "Buy ACs", 
      make_inquiry: "Make an inquiry",
      contact: "Contact"
    },
    footer: {
      tagline: "Quality and reliable solutions since 2000",
      navigation: "Navigation",
      home: "Home",
      services: "Services",
      buy_air_conditioner: "Buy ACs", 
      make_inquiry: "Make an inquiry",
      contact: "Contact",
      imprint: "Terms & Conditions",
      phone: "Phone",
      email: "Email", 
      follow_us: "Follow Us",
      rights_reserved: "All rights reserved",
      company_full: "БГVIKI15 Ltd",
      company_english: "БГVIKI15 Ltd",
      designed_by: "Designed by",
      back_to_top: "Back to top",
      copyright_full: "© 2025 БГVIKI15 Ltd. All rights reserved. | Designed by H&M WSPro"
    }
  }
};

// Language Context
const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('bg');
  
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };
  
  const switchLanguage = (newLocale) => {
    setLocale(newLocale);
  };
  
  return (
    <LanguageContext.Provider value={{ locale, t, switchLanguage }}>
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

/**
 * Multilingual Mitsubishi Electric inspired header component
 * Features clean corporate layout with BG/EN language switching
 */
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locale, t, switchLanguage } = useLanguage();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Navigation items with translation keys
  const navigationItems = [
    { href: "#", translationKey: "nav.about" },
    { href: "#", translationKey: "nav.products" },
    { href: "#", translationKey: "nav.buy_air_conditioner" },
    { href: "#", translationKey: "nav.make_inquiry" },
    { href: "#", translationKey: "nav.contact" }
  ];

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
