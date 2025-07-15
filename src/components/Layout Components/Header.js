import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiMenu } from "react-icons/fi";
import styles from "../../styles/Component Styles/Header.module.css";
import navigationStyles from "../../styles/Component Styles/NavigationContainer.module.css";
import { useTranslation } from "next-i18next";
import CartIcon from "../CartIcon";
import BrandContainer from "../BrandContainer";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation("common");
  const router = useRouter();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Language switching function
  const switchLanguage = (newLocale) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  // Navigation items with translation keys
  const navigationItems = [
    { href: "/", translationKey: "nav.about" },
    { href: "/products", translationKey: "nav.products" },
    { href: "/buy", translationKey: "nav.buy" },
    { href: "/inquiry", translationKey: "nav.inquiry" },
    { href: "/contact", translationKey: "nav.contact" }
  ];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
        
        {/* Left Section - Brand Container (Logo + Company Name) */}
        <div className={styles.leftSection}>
          <BrandContainer />
        </div>

        {/* Center Navigation */}
        <nav className={navigationStyles.navigationContainer} aria-label="Main navigation">
          <ul className={navigationStyles.navList}>
            {navigationItems.map((item, index) => (
              <li key={index}>
                {item.href.startsWith('#') ? (
                  <a href={item.href} className={navigationStyles.navLink}>
                    {t(item.translationKey)}
                  </a>
                ) : (
                  <Link 
                    href={item.href}
                    className={`${navigationStyles.navLink} ${router.pathname === item.href ? navigationStyles.activeNavLink : ''}`}
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
              className={`${styles.langOption} ${router.locale === 'bg' ? styles.activeLang : ''}`}
              onClick={() => switchLanguage('bg')}
              type="button"
            >
              BG
            </button>
            <span className={styles.langSeparator}>|</span>
            <button 
              className={`${styles.langOption} ${router.locale === 'en' ? styles.activeLang : ''}`}
              onClick={() => switchLanguage('en')}
              type="button"
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile Header - Cart and Menu Toggle */}
        <div className={styles.mobileHeader}>
          {/* Mobile Cart Icon */}
          <CartIcon />
          
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
                  className={`${styles.mobileLangOption} ${router.locale === 'bg' ? styles.activeLang : ''}`}
                  onClick={() => {
                    switchLanguage('bg');
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  🇧🇬 Български
                </button>
                <button 
                  className={`${styles.mobileLangOption} ${router.locale === 'en' ? styles.activeLang : ''}`}
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
  </>
  );
};

export default Header;
