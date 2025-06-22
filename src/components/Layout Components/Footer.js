import React, { useContext, useState, useEffect } from "react";
import { FiFacebook, FiInstagram, FiPhone, FiMail, FiChevronUp } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import styles from "../../styles/Component Styles/Footer.module.css";

// Import the shared language context from Header
import { LanguageContext } from './Header';

// Custom hook to use language context
const useLanguage = () => {
  const context = useContext(LanguageContext);
  return context || {
    locale: 'bg',
    t: (key) => key,
    switchLanguage: () => {}
  };
};

const Footer = () => {
  const { locale, t } = useLanguage();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Back to top button visibility with debounced scroll
  useEffect(() => {
    let timeoutId = null;
    
    const handleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        setShowBackToTop(window.scrollY > 300);
      }, 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Smooth scroll to top function with accessibility
  const scrollToTop = () => {
    const scrollOptions = {
      top: 0,
      behavior: 'smooth'
    };
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scrollOptions.behavior = 'auto';
    }
    
    window.scrollTo(scrollOptions);
    
    // Focus management for accessibility
    const header = document.querySelector('header');
    if (header) {
      header.focus();
    }
  };

  // Logo loading handlers
  const handleLogoLoad = () => {
    setLogoLoaded(true);
    setLogoError(false);
  };

  const handleLogoError = () => {
    setLogoLoaded(false);
    setLogoError(true);
  };

  const navigationItems = [
    { href: "/", translationKey: "footer.navigation.about", title: t('footer.navigation.about') },
    { href: "/products", translationKey: "footer.navigation.products", title: t('footer.navigation.products') },
    { href: "/buy", translationKey: "footer.navigation.buy", title: t('footer.navigation.buy') },
    { href: "/inquiry", translationKey: "footer.navigation.inquiry", title: t('footer.navigation.inquiry') },
    { href: "/contact", translationKey: "footer.navigation.contact", title: t('footer.navigation.contact') }
  ];

  const socialLinks = [
    { 
      href: "https://facebook.com/bgviki15", 
      icon: FiFacebook, 
      label: "Facebook",
      title: t('footer.socialLabels.facebook')
    },
    { 
      href: "https://instagram.com/bgviki15", 
      icon: FiInstagram, 
      label: "Instagram",
      title: t('footer.socialLabels.instagram')
    },
    { 
      href: "https://wa.me/359888123456", 
      icon: FaWhatsapp, 
      label: "WhatsApp",
      title: t('footer.socialLabels.whatsapp')
    }
  ];

  const companyName = "БГВИКИ15 ЕООД";

  return (
    <>
      <footer className={styles.footer} role="contentinfo" aria-labelledby="footer-heading">
        <div className={styles.container}>
          
          {/* Brand Info Section (Left) */}
          <section className={styles.brandSection} aria-labelledby="brand-heading">
            <div className={styles.logoContainer}>
              {!logoError ? (
                <img 
                  src="/images/bgVIKI15-footer.png" 
                  alt={`${companyName} - ${t('footer.brandInfo.tagline')}`}
                  className={styles.footerLogo}
                  onLoad={handleLogoLoad}
                  onError={handleLogoError}
                  loading="lazy"
                  style={{
                    opacity: logoLoaded ? 1 : 0.7,
                    transition: 'opacity 0.3s ease'
                  }}
                />
              ) : (
                <div 
                  className={styles.logoFallback}
                  role="img"
                  aria-label={`${companyName} Logo`}
                >
                  {companyName}
                </div>
              )}
            </div>
            <h2 id="brand-heading" className={styles.companyName}>
              {companyName}
            </h2>
            <p className={styles.tagline}>{t('footer.brandInfo.tagline')}</p>
            <div className={styles.countryLabel} aria-label="Company location">
              {t('country')}
            </div>
          </section>

          {/* Quick Navigation Section (Center) */}
          <section className={styles.navigationSection} aria-labelledby="nav-heading">
            <h3 id="nav-heading" className={styles.sectionTitle}>
              {t('footer.navigation.title')}
            </h3>
            <nav aria-label="Footer navigation" role="navigation">
              <ul className={styles.navList}>
                {navigationItems.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className={styles.navLink}
                      title={item.title}
                      aria-label={item.title}
                      onFocus={(e) => e.target.setAttribute('data-focused', 'true')}
                      onBlur={(e) => e.target.removeAttribute('data-focused')}
                    >
                      {t(item.translationKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          {/* Contact & Social Section (Right) */}
          <section className={styles.contactSection} aria-labelledby="contact-heading">
            <h3 id="contact-heading" className={styles.sectionTitle}>
              {t('footer.contact.title')}
            </h3>
            
            <div className={styles.contactInfo} role="group" aria-label="Contact information">
              <div className={styles.contactItem}>
                <FiPhone className={styles.contactIcon} aria-hidden="true" />
                <div className={styles.contactDetails}>
                  <span className={styles.contactLabel}>{t('footer.contact.phone')}</span>
                  <a 
                    href="tel:+359888123456" 
                    className={styles.contactLink}
                    title="Call us at +359 888 123 456"
                    aria-label="Call us at +359 888 123 456"
                  >
                    +359 888 123 456
                  </a>
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <FiMail className={styles.contactIcon} aria-hidden="true" />
                <div className={styles.contactDetails}>
                  <span className={styles.contactLabel}>{t('footer.contact.email')}</span>
                  <a 
                    href="mailto:info@bgviki15.bg" 
                    className={styles.contactLink}
                    title="Send us an email"
                    aria-label="Send us an email at info@bgviki15.bg"
                  >
                    info@bgviki15.bg
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.socialSection}>
              <h4 className={styles.socialTitle}>{t('footer.contact.social')}</h4>
              <div className={styles.socialIcons} role="list" aria-label="Social media links">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a 
                      key={index}
                      href={social.href} 
                      className={styles.socialLink} 
                      aria-label={social.title}
                      title={social.title}
                      target="_blank"
                      rel="noopener noreferrer"
                      role="listitem"
                      onFocus={(e) => e.target.setAttribute('data-focused', 'true')}
                      onBlur={(e) => e.target.removeAttribute('data-focused')}
                    >
                      <IconComponent className={styles.socialIcon} aria-hidden="true" />
                      <span className="sr-only">{social.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Bar with Attribution */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomContainer}>
            <p className={styles.copyright}>
              {t('footer.copyright')} | {t('footer.attribution')} (
              <a 
                href="mailto:hm.websiteprovisioning@gmail.com" 
                className={styles.emailLink}
                title="Contact H&M WSPro"
                aria-label="Contact H&M WSPro by email"
              >
                hm.websiteprovisioning@gmail.com
              </a>
              )
            </p>
            <a 
              href="/Administration" 
              className={styles.adminLink} 
              title={t('footer.admin')}
              aria-label={t('footer.admin')}
            >
              ⚙️
            </a>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={styles.backToTop}
          aria-label={t('footer.backToTop')}
          title={t('footer.backToTop')}
          type="button"
        >
          <FiChevronUp className={styles.backToTopIcon} aria-hidden="true" />
          <span className="sr-only">{t('footer.backToTop')}</span>
        </button>
      )}
    </>
  );
};

export default Footer; 