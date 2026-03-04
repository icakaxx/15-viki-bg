import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCart } from '../contexts/CartContext';
import styles from '../styles/Component Styles/InstallmentContinueModal.module.css';

const InstallmentContinueModal = ({
  visible,
  onClose,
  bank,
  term,
  product,
  quantity,
  selectedAccessories,
  installationSelected,
  installationPrice,
  onAddedToCart,
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { addToCartEnhanced } = useCart();

  if (!visible) return null;

  const termLabel = term != null ? `${term}` : '';

  const addCurrentSelectionToCart = () => {
    if (!product || !addToCartEnhanced) return;
    const accessoryObjects = Array.isArray(selectedAccessories) ? selectedAccessories : [];
    addToCartEnhanced(product, quantity || 1, accessoryObjects, !!installationSelected, installationPrice || 0);
  };

  const handleContinueToCheckout = () => {
    addCurrentSelectionToCart();
    onClose();
    const payment = 'installments';
    router.push(`/checkout?payment=${payment}&bank=${bank}&term=${termLabel}`);
  };

  const handleAddMore = () => {
    addCurrentSelectionToCart();
    if (onAddedToCart) onAddedToCart();
    onClose();
    router.push(`/buy?creditMode=1&bank=${bank}&term=${termLabel}`);
  };

  const handleDecideLater = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="installment-modal-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 id="installment-modal-title" className={styles.title}>
          {(() => {
            const key = 'productDetail.installments.modalTitle';
            const translated = t(key);
            return translated === key ? 'Желаете ли да добавите още продукти към изплащането?' : translated;
          })()}
        </h2>
        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={handleContinueToCheckout}>
            {(() => {
              const key = 'productDetail.installments.noContinue';
              const translated = t(key);
              return translated === key ? 'Не, продължи към кандидатстване' : translated;
            })()}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={handleAddMore}>
            {(() => {
              const key = 'productDetail.installments.yesAddMore';
              const translated = t(key);
              return translated === key ? 'Да, добави още' : translated;
            })()}
          </button>
          <button type="button" className={styles.linkButton} onClick={handleDecideLater}>
            {(() => {
              const key = 'productDetail.installments.decideLater';
              const translated = t(key);
              return translated === key ? 'Ще реша по-късно' : translated;
            })()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallmentContinueModal;
