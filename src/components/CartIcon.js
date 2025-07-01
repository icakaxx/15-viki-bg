import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { LanguageContext } from './Layout Components/Header';
import styles from '../styles/Component Styles/CartIcon.module.css';

const CartIcon = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { cart, removeFromCart, formatPrice, formatPriceEUR } = useCart();
  const { t } = useContext(LanguageContext);

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
            d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 17.6 16.6 18 16 18H8C7.4 18 7 17.6 7 17V13M9 21C9.6 21 10 20.6 10 20S9.6 19 9 19 8 19.4 8 20 8.4 21 9 21ZM20 21C20.6 21 21 20.6 21 20S20.6 19 20 19 19 19.4 19 20 19.4 21 20 21Z"
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