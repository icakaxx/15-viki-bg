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
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false); // new state
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
            {/* Group: Company + Navigation */}
              <div className={styles.leftSection}>
                <BrandContainer />
              </div>
                <div className={navigationStyles.navList}>
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
                </div>
            

            {/* Right Section - Cart, Language & Utilities */}
            <div className={styles.rightSection}>
              <CartIcon />
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

            {/* Mobile Header - Logo left, Cart and Burger right */}
            <div className={styles.mobileHeader}>
              
             
                <CartIcon onDropdownChange={setCartDropdownOpen} />
                <button
                  className={styles.mobileMenuButton}
                  onClick={toggleMobileMenu}
                  aria-expanded={mobileMenuOpen}
                  type="button"
                >
                  <FiMenu className={styles.mobileIcon} />
                </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className={styles.mobileNav}>
                <nav>
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
