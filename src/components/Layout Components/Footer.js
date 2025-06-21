import Link from 'next/link'
import { FaFacebook, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa'
import styles from '../../styles/Component Styles/Footer.module.css'
import { useTranslation } from 'next-i18next';

/**
 * The Footer component displays the footer section of the website, including social icons, menu items, and a wave effect container.
 * @returns {JSX.Element} The JSX code for the Footer component.
 */
const Footer = () => {
  const { t } = useTranslation('common');
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <>
      <div className={styles.footer}>
        <Link href="/"><img src={isEnglish ? "/Images/Logo.png" : "/Images/Logo_Bulgarian.png"} alt="Logo" className={styles.logo} /></Link>

        <div className={styles.infoSection}>
          <div className={styles.contactItem}>
            <a
              href="https://maps.app.goo.gl/XTAUqdxUTcj2obDu5"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapButton}
            >
              <FaMapMarkerAlt className={styles.infoicon} />
              &nbsp; Martini 7, Paralia Ofriniou 640 08, Greece
            </a>
          </div>
        </div>
        <div className={styles.socialIcon}>
          <Link href='https://www.facebook.com/profile.php?id=61575061973914'>
            <FaFacebook />
          </Link>
          <Link href='https://www.instagram.com/abstract_apartment'>
            <FaInstagram />
          </Link>
          {/* Phone Link */}
          <Link href='tel:+359886790681'>
            <FaPhone />
          </Link>

          {/* Email Link */}
          <Link href='mailto:abstract.apartments@gmail.com'>
            <FaEnvelope />
          </Link>
        </div>
        <div className={styles.menu}>
          <Link href="/" locale={i18n.language}>{t('nav.home')}</Link>
          <Link href="/about" locale={i18n.language}>{t('nav.details')}</Link>
          <Link href="/services" locale={i18n.language}>{t('nav.gallery')}</Link>
          <Link href="/AvailableDates" locale={i18n.language}>{t('nav.dates')}</Link>
          <Link href="/PriceList" locale={i18n.language}>{t('nav.pricelist')}</Link>
          <Link href="/contact" locale={i18n.language}>{t('nav.contact')}</Link>
          <Link href="/reviews" locale={i18n.language}>{t('nav.reviews')}</Link>
        </div>
        <p className={styles.p} >{t('nav.АМА')}</p>
        <p className={styles.p} >{t('nav.creator')}</p>
      </div>
    </>
  )
}

export default Footer