import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiPhone, FiMail } from "react-icons/fi";
import styles from "../../styles/Component Styles/Footer.module.css";
import { useTranslation } from "next-i18next";

const Footer = () => {
  const { t } = useTranslation("common");
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
                    <Link 
                      href={item.href} 
                      className={styles.navLink}
                      title={item.title}
                      aria-label={item.title}
                      onFocus={(e) => e.target.setAttribute('data-focused', 'true')}
                      onBlur={(e) => e.target.removeAttribute('data-focused')}
                    >
                      {t(item.translationKey)}
                    </Link>
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
                    href="tel:+359895460717" 
                    className={styles.contactLink}
                    title="Call us at +359 895 460 717"
                    aria-label="Call us at +359 895 460 717"
                  >
                    +359 895 460 717
                  </a>
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <FiMail className={styles.contactIcon} aria-hidden="true" />
                <div className={styles.contactDetails}>
                  <span className={styles.contactLabel}>{t('footer.contact.email')}</span>
                  <a 
                    href="mailto:bgviki.ltd@abv.bg" 
                    className={styles.contactLink}
                    title="Send us an email"
                    aria-label="Send us an email at bgviki.ltd@abv.bg"
                  >
                    bgviki.ltd@abv.bg
                  </a>
                </div>
                            </div>
            </div>

            {/* Social Media Section */}
            <div className={styles.socialSection}>
              <h4 className={styles.socialTitle}>{t('footer.contact.social')}</h4>
              <div className={styles.socialLinks}>
                <a 
                  href="https://facebook.com/bgviki15" 
                  className={styles.socialLink}
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={t('footer.socialLabels.facebook')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" className={styles.socialIcon}>
                    <path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"></path>
                    <path fill="#fff" d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"></path>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com/bgviki15" 
                  className={styles.socialLink}
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={t('footer.socialLabels.instagram')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" className={styles.socialIcon}>
                    <radialGradient id="instagramGradient" cx="19.38" cy="42.035" r="44.899" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#fd5"></stop>
                      <stop offset=".328" stopColor="#ff543f"></stop>
                      <stop offset=".348" stopColor="#fc5245"></stop>
                      <stop offset=".504" stopColor="#e64771"></stop>
                      <stop offset=".643" stopColor="#d53e91"></stop>
                      <stop offset=".761" stopColor="#cc39a4"></stop>
                      <stop offset=".841" stopColor="#c837ab"></stop>
                    </radialGradient>
                    <path fill="url(#instagramGradient)" d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20	c-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20C42.014,38.383,38.417,41.986,34.017,41.99z"></path>
                    <radialGradient id="instagramGradient2" cx="11.786" cy="5.54" r="29.813" gradientTransform="matrix(1 0 0 .6663 0 1.849)" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#4168c9"></stop>
                      <stop offset=".999" stopColor="#4168c9" stopOpacity="0"></stop>
                    </radialGradient>
                    <path fill="url(#instagramGradient2)" d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20	c-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20C42.014,38.383,38.417,41.986,34.017,41.99z"></path>
                    <path fill="#fff" d="M24,31c-3.859,0-7-3.14-7-7s3.141-7,7-7s7,3.14,7,7S27.859,31,24,31z M24,19c-2.757,0-5,2.243-5,5	s2.243,5,5,5s5-2.243,5-5S26.757,19,24,19z"></path>
                    <circle cx="31" cy="16" r="2" fill="#fff"></circle>
                    <path fill="#fff" d="M30,37H18c-3.859,0-7-3.14-7-7V18c0-3.86,3.141-7,7-7h12c3.859,0,7,3.14,7,7v12	C37,33.86,33.859,37,30,37z M18,13c-2.757,0-5,2.243-5,5v12c0,2.757,2.243,5,5,5h12c2.757,0,5-2.243,5-5V18c0-2.757-2.243-5-5-5H18z"></path>
                  </svg>
                </a>
                <a 
                  href="https://wa.me/359895460717" 
                  className={styles.socialLink}
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={t('footer.socialLabels.whatsapp')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" className={styles.socialIcon}>
                    <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path>
                    <path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path>
                    <path fill="#fff" fillRule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Bar with Atribution */}
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
            <Link 
              href="/Administration" 
              className={styles.adminLink} 
              title={t('footer.admin')}
              aria-label={t('footer.admin')}
            >
              ⚙️
            </Link>
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
          <span className={styles.backToTopIcon} aria-hidden="true">👆</span>
        </button>
      )}
    </>
  );
};

export default Footer; 