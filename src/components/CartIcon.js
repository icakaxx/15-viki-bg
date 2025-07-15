import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Component Styles/CartIcon.module.css';

const CartIcon = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { cart, removeFromCart, formatPrice, formatPriceEUR } = useCart();
  const { t } = useTranslation('common');

  const handleCartClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  return (
    <div className={styles.cartContainer}>
      {/* Cart Icon with Badge */}
      <button
        className={styles.cartButton}
        onClick={handleCartClick}
        aria-label={`${t('cart.viewCart')} (${cart.totalItems})`}
        type="button"
      >
        <svg
          className={styles.cartIcon}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.89 1.45l8 4A2 2 0 0122 7.24v9.53a2 2 0 01-1.11 1.79l-8 4a2 2 0 01-1.78 0l-8-4A2 2 0 012 16.76V7.24a2 2 0 011.11-1.79l8-4a2 2 0 011.78 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline 
            points="2.32,6.16 12,11 21.68,6.16" 
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line 
            x1="12" 
            y1="22.76" 
            x2="12" 
            y2="11" 
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        {cart.totalItems > 0 && (
          <span className={styles.cartBadge}>
            {cart.totalItems}
          </span>
        )}
      </button>

      {/* Mini Cart Dropdown */}
      {showDropdown && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setShowDropdown(false)}
          />
          <div className={styles.cartDropdown}>
            <div className={styles.cartHeader}>
              <h3 className={styles.cartTitle}>
                {t('cart.title')} ({cart.totalItems})
              </h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowDropdown(false)}
                aria-label={t('common.close')}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className={styles.cartBody}>
              {cart.items.length === 0 ? (
                <div className={styles.emptyCart}>
                  <p>{t('cart.empty')}</p>
                </div>
              ) : (
                <>
                  <div className={styles.cartItems}>
                    {cart.items.map((item) => (
                      <div key={item.productId} className={styles.cartItem}>
                        <div className={styles.itemImage}>
                          <img
                            src={item.product.ImageURL || '/images/placeholder-ac.svg'}
                            alt={`${item.product.Brand} ${item.product.Model}`}
                            className={styles.productImage}
                          />
                        </div>
                        
                        <div className={styles.itemDetails}>
                          <h4 className={styles.itemName}>
                            {item.product.Brand} {item.product.Model}
                          </h4>
                          <div className={styles.itemPrice}>
                            {formatPrice(item.product.Price)} / {formatPriceEUR(item.product.Price)}
                          </div>
                          <div className={styles.itemQuantity}>
                            {t('cart.quantity')}: {item.quantity}
                          </div>
                        </div>
                        
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveItem(item.productId)}
                          aria-label={`${t('cart.remove')} ${item.product.Brand} ${item.product.Model}`}
                          type="button"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sticky Footer - Always visible when cart has items */}
            {cart.items.length > 0 && (
              <div className={styles.cartFooter}>
                <div className={styles.cartTotal}>
                  <strong>
                    {t('cart.total')}: {formatPrice(cart.totalPrice)} / {formatPriceEUR(cart.totalPrice)}
                  </strong>
                </div>
                
                <div className={styles.cartActions}>
                  <Link 
                    href="/checkout" 
                    className={styles.checkoutButton}
                    onClick={() => setShowDropdown(false)}
                  >
                    {t('cart.viewCart')}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CartIcon; 