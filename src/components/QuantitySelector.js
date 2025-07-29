import React, { useState, useContext } from 'react';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import styles from '../styles/Component Styles/QuantitySelector.module.css';
import { useConsent } from './ConsentProvider';

const QuantitySelector = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, getCartItemQuantity } = useCart();
  const { t } = useTranslation('common');
  const router = useRouter();
  const { hasConsent } = useConsent();
  
  const currentCartQuantity = getCartItemQuantity(product.ProductID);
  const minQuantity = 1;
  const maxQuantity = 10; // Maximum 10 ACs per product
  
  // Check if product is archived (out of stock)
  const isOutOfStock = product.IsArchived;

  const handleDecrease = () => {
    if (quantity > minQuantity && !isOutOfStock) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity && !isOutOfStock) {
      setQuantity(quantity + 1);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return; // Prevent navigation for archived products
    
    if (!hasConsent) {
      // Show terms modal instead of navigating
      window.dispatchEvent(new CustomEvent('showTermsModal'));
      return;
    }
    
    // Navigate to product detail page with quantity parameter
    router.push(`/buy/${product.ProductID}?qty=${quantity}`);
  };

  const handleQuantityInputChange = (e) => {
    if (isOutOfStock) return; // Prevent quantity changes for archived products
    
    const value = parseInt(e.target.value) || minQuantity;
    if (value >= minQuantity && value <= maxQuantity) {
      setQuantity(value);
    }
  };

  return (
    <div className={`${styles.quantitySelector} ${isOutOfStock ? styles.outOfStock : ''}`}>
      {/* Quantity Controls - Disabled for archived products */}
      <div className={styles.quantityControls}>
        <label className={styles.quantityLabel}>
          {t ? t('buyPage.quantity') : 'Quantity'}:
        </label>
        <div className={styles.quantityInputGroup}>
          <button
            type="button"
            className={`${styles.quantityButton} ${styles.decreaseButton}`}
            onClick={handleDecrease}
            disabled={quantity <= minQuantity || isOutOfStock}
            aria-label={t ? t('buyPage.decreaseQuantity') : 'Decrease quantity'}
          >
            −
          </button>
          
          <input
            type="number"
            className={styles.quantityInput}
            value={quantity}
            onChange={handleQuantityInputChange}
            min={minQuantity}
            max={maxQuantity}
            disabled={isOutOfStock}
            aria-label={t ? t('buyPage.quantity') : 'Quantity'}
          />
          
          <button
            type="button"
            className={`${styles.quantityButton} ${styles.increaseButton}`}
            onClick={handleIncrease}
            disabled={quantity >= maxQuantity || isOutOfStock}
            aria-label={t ? t('buyPage.increaseQuantity') : 'Increase quantity'}
          >
            +
          </button>
        </div>
      </div>

      {/* Buy Now Button - Navigates to product detail page */}
      <button
        type="button"
        className={`${styles.addToCartButton} ${isOutOfStock ? styles.disabled : ''} ${!hasConsent ? styles.consentRequired : ''}`}
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        aria-label={`${t ? t('buyPage.buyButton') : 'Buy'} ${product?.Brand} ${product?.Model}`}
      >
        {isOutOfStock ? 'Out of Stock' : 
         !hasConsent ? 'За да закупите климатик, моля приемете условията' : 
         (t ? t('buyPage.buyButton') : 'Buy')}
      </button>

      {/* Already in Cart Indicator - Hide for archived products */}
      {currentCartQuantity > 0 && !isOutOfStock && (
        <div className={styles.cartIndicator}>
          {t ? `${t('buyPage.inCart')}: ${currentCartQuantity}` : `In cart: ${currentCartQuantity}`}
        </div>
      )}
    </div>
  );
};

export default QuantitySelector; 