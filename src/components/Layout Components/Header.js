import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiSearch, FiShare2, FiMenu } from "react-icons/fi";
import styles from "../../styles/Component Styles/Header.module.css";
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

/**
 * Apple-inspired sticky header component with minimal design
 * Features responsive navigation with hamburger menu for mobile
 */
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;

  // Debug log
  console.log('Translation ready:', ready, 'Locale:', locale);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleLanguage = () => setLanguageOpen(!languageOpen);

  const navigationLinks = [
    { href: "#", key: "nav.home" },
    { href: "#", key: "nav.services" },
    { href: "#", key: "nav.buy_air_conditioner" },
    { href: "#", key: "nav.contacts" },
    { href: "#", key: "nav.make_inquiry" }
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/" aria-label="Home">
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={32}
              height={32}
              className={styles.logoImage}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <ul className={styles.navList}>
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.navLink}>
                  {ready ? t(link.key) : link.key}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Actions */}
        <div className={styles.desktopActions}>
          <button 
            className={styles.iconButton} 
            aria-label="Search"
            type="button"
          >
            <FiSearch className={styles.icon} />
          </button>
          
          <button 
            className={styles.iconButton} 
            aria-label="Share"
            type="button"
          >
            <FiShare2 className={styles.icon} />
          </button>
          
          <div className={styles.languageSelector}>
                         <button
               className={styles.languageButton}
               onClick={toggleLanguage}
               aria-haspopup="listbox"
               aria-expanded={languageOpen}
               type="button"
             >
               🌐 {locale === 'en' ? 'English' : 'Български'} ▼
             </button>
             {languageOpen && (
               <div className={styles.languageDropdown}>
                 <button
                   onClick={() => {
                     router.push(router.pathname, router.asPath, { locale: 'en' });
                     setLanguageOpen(false);
                   }}
                   className={`${styles.languageOption} ${locale === 'en' ? styles.activeLanguage : ''}`}
                   type="button"
                 >
                   🇺🇸 English
                 </button>
                 <button
                   onClick={() => {
                     router.push(router.pathname, router.asPath, { locale: 'bg' });
                     setLanguageOpen(false);
                   }}
                   className={`${styles.languageOption} ${locale === 'bg' ? styles.activeLanguage : ''}`}
                   type="button"
                 >
                   🇧🇬 Български
                 </button>
               </div>
             )}
          </div>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className={styles.mobileActions}>
          <button
            className={styles.hamburgerButton}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            type="button"
          >
            <FiMenu className={styles.hamburgerIcon} />
          </button>
        </div>

        {/* Mobile Navigation Drawer - Placeholder for future implementation */}
        {menuOpen && (
          <div className={styles.mobileNav}>
            <nav aria-label="Mobile navigation">
              <ul className={styles.mobileNavList}>
                                 {navigationLinks.map((link) => (
                   <li key={link.href}>
                     <Link 
                       href={link.href} 
                       className={styles.mobileNavLink}
                       onClick={() => setMenuOpen(false)}
                     >
                       {ready ? t(link.key) : link.key}
                     </Link>
                   </li>
                 ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
