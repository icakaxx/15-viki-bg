import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Component Styles/CartIcon.module.css';
import { FiShoppingCart } from 'react-icons/fi';

const CartIcon = ({ onDropdownChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { cart, removeFromCart, formatPrice, formatPriceEUR } = useCart();
  const { t } = useTranslation('common');

  const handleCartClick = () => {
    setShowDropdown(prev => {
      const newVal = !prev;
      if (onDropdownChange) onDropdownChange(newVal);
      return newVal;
    });
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  // If dropdown is closed by clicking overlay or close button, notify parent
  const closeDropdown = () => {
    setShowDropdown(false);
    if (onDropdownChange) onDropdownChange(false);
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
        <FiShoppingCart className={styles.cartIcon} />
        
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
            onClick={closeDropdown}
          />
          <div className={styles.cartDropdown}>
            <div className={styles.cartHeader}>
              <h3 className={styles.cartTitle}>
                {t('cart.title')} ({cart.totalItems})
              </h3>
              <button
                className={styles.closeButton}
                onClick={closeDropdown}
                aria-label={t('close')}
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