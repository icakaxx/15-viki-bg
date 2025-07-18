import React from "react";
import Link from "next/link";
import companyNameStyles from "../styles/Component Styles/CompanyName.module.css";
import logoContainerStyles from "../styles/Component Styles/LogoContainer.module.css";
import logoImageStyles from "../styles/Component Styles/LogoImage.module.css";
import styles from "../styles/Component Styles/BrandContainer.module.css";

const BrandContainer = ({ className = "" }) => {
  return (
    <Link href="/" className={`${styles.brandContainer} ${className}`}>
      <div className={styles.brandWrapper}>
        {/* Company Name */}
        <div className={companyNameStyles.companyName}>
          БГВИКИ15 ЕООД
        </div>
        
        {/* Logo */}
        <div className={logoContainerStyles.logoContainer}>
          <img 
            src="/images/bgVIKI15-eood.jpg" 
            alt="VIKI15 EOOD Logo" 
            className={logoImageStyles.logoImage}
          />
        </div>
      </div>
    </Link>
  );
};

export default BrandContainer; 