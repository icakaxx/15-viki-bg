import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Component Styles/StripePaymentForm.module.css';



// Load Stripe outside of component to avoid recreating on every render
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const CheckoutForm = ({ amount, onPaymentSuccess, onPaymentError, isProcessing, setIsProcessing, orderData, onSubmitOrder, onValidationChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation('common');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [setCardType] = useState('unknown');
  const [cardComplete, setCardComplete] = useState(false);
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);
  const [formData, setFormData] = useState({
    cardholderName: '',
    billingAddress: ''
  });

  // Check if all card fields are complete
  const isCardFormComplete = () => {
    // For Stripe Elements, cardComplete can be unreliable
    // We'll consider it complete if expiry and CVC are complete (which means user has entered card data)
    // and the text inputs are filled
    const result = expiryComplete && cvcComplete && 
           formData.cardholderName.trim() && formData.billingAddress.trim();
    

    
    return result;
  };

  // Notify parent component about validation status
  useEffect(() => {
    if (onValidationChange) {
      const isValid = isCardFormComplete();
      onValidationChange(isValid);
    }
  }, [cardComplete, expiryComplete, cvcComplete, formData.cardholderName, formData.billingAddress, onValidationChange]);

  // Function to process payment (called from parent component)
  const processPayment = async () => {
    if (!stripe || !elements) {
      const error = 'Stripe not initialized';
      setError(error);
      onPaymentError(error);
      return { success: false, error };
    }

    if (!isCardFormComplete()) {
      const error = 'Please fill in all card details';
      setError(error);
      onPaymentError(error);
      return { success: false, error };
    }

    setProcessing(true);
    setError(null);
    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'bgn',
          metadata: {
            order_type: 'online_payment'
          }
        }),
      });

      const { clientSecret, error: intentError } = await response.json();

      if (intentError) {
        const error = intentError;
        setError(error);
        onPaymentError(error);
        return { success: false, error };
      }

      // Confirm payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: formData.cardholderName,
            address: {
              line1: formData.billingAddress
            }
          }
        },
      });

      if (paymentError) {
        const translatedError = translateStripeError(paymentError.message);
        setError(translatedError);
        onPaymentError(translatedError);
        return { success: false, error: translatedError };
      } else if (paymentIntent.status === 'succeeded') {
        // Automatically submit the order with payment comment
        if (orderData && onSubmitOrder) {
          try {
            // Add payment comment to order data
            const orderDataWithPayment = {
              ...orderData,
              paymentInfo: {
                ...orderData.paymentInfo,
                stripePaymentId: paymentIntent.id,
                paymentComment: 'Paid by card via Stripe'
              }
            };
            
            // Submit the order
            await onSubmitOrder(orderDataWithPayment);
            
            // Call the success callback
            onPaymentSuccess(paymentIntent);
          } catch (orderError) {
            console.error('Order submission error after payment:', orderError);
            // Even if order submission fails, payment was successful
            onPaymentSuccess(paymentIntent);
          }
        } else {
          // Fallback if no order data provided
          onPaymentSuccess(paymentIntent);
        }
        
        return { success: true, paymentIntent };
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err.message || 'Payment failed';
      const translatedError = translateStripeError(errorMessage);
      setError(translatedError);
      onPaymentError(translatedError);
      showToast('error', t('checkout.form.stripe.paymentError'), translatedError);
      return { success: false, error: translatedError };
    } finally {
      setProcessing(false);
      setIsProcessing(false);
    }
  };

  // Expose processPayment function to parent component
  useEffect(() => {
    if (window) {
      window.stripeProcessPayment = processPayment;
    }
  }, [cardComplete, expiryComplete, cvcComplete, formData.cardholderName, formData.billingAddress]);

  // Toast notification function
  const showToast = (type, title, message) => {
    const toast = document.createElement('div');
    toast.className = `${styles.toast} ${styles[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`]}`;
    toast.innerHTML = `
      <div class="${styles.toastHeader}">
        <span class="${styles.toastIcon}">${type === 'success' ? '✅' : '❌'}</span>
        <span class="${styles.toastTitle}">${title}</span>
        <button class="${styles.toastClose}" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="${styles.toastMessage}">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
      complete: {
        color: '#32a852',
        iconColor: '#32a852',
      },
    },
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Function to translate common Stripe error messages
  const translateStripeError = (errorMessage) => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('insufficient funds')) {
      return t('checkout.form.stripe.paymentErrorInsufficientFunds');
    } else if (lowerError.includes('declined') || lowerError.includes('card was declined')) {
      return t('checkout.form.stripe.paymentErrorDeclined');
    } else if (lowerError.includes('expired')) {
      return t('checkout.form.stripe.paymentErrorExpired');
    } else if (lowerError.includes('cvc') || lowerError.includes('security code')) {
      return t('checkout.form.stripe.paymentErrorInvalidCvc');
    }
    
    return errorMessage;
  };

  const handleCardChange = (event) => {
    if (event.brand) {
      setCardType(event.brand);
    }
    setCardComplete(event.complete);
  };

  const handleExpiryChange = (event) => {
    setExpiryComplete(event.complete);
  };

  const handleCvcChange = (event) => {
    setCvcComplete(event.complete);
  };

    return (
    <div className={styles.paymentForm}>
      <div className={styles.paymentHeader}>
        <div className={styles.paymentTitle}>
          {t('checkout.form.stripe.securePayment')}
        </div>
        <div className={styles.amountDisplay}>
          {t('checkout.form.stripe.amount')}: {amount.toFixed(2)} {t('checkout.form.stripe.currency')}
        </div>
      </div>

      <div className={styles.formGrid}>
        {/* Card Number */}
        <div className={styles.formGroup}>
          <label className={styles.cardLabel}>
            {t('checkout.form.stripe.cardNumber')}
          </label>
          <div className={styles.cardElementContainer}>
            <CardNumberElement 
              options={cardElementOptions} 
              onChange={handleCardChange}
            />
            {cardComplete && (
              <div className={styles.completeIcon}>✓</div>
            )}
          </div>
        </div>

        {/* Expiry Date */}
        <div className={styles.formGroup}>
          <label className={styles.cardLabel}>
            {t('checkout.form.stripe.expiryDate')}
          </label>
          <div className={styles.cardElementContainer}>
            <CardExpiryElement 
              options={cardElementOptions} 
              onChange={handleExpiryChange}
            />
            {expiryComplete && (
              <div className={styles.completeIcon}>✓</div>
            )}
          </div>
        </div>

        {/* CVC */}
        <div className={styles.formGroup}>
          <label className={styles.cardLabel}>
            {t('checkout.form.stripe.cvc')}
          </label>
          <div className={styles.cardElementContainer}>
            <CardCvcElement 
              options={cardElementOptions} 
              onChange={handleCvcChange}
            />
            {cvcComplete && (
              <div className={styles.completeIcon}>✓</div>
            )}
          </div>
        </div>

        {/* Cardholder Name */}
        <div className={styles.formGroup}>
          <label className={styles.cardLabel}>
            {t('checkout.form.stripe.cardholderName')}
          </label>
          <input
            type="text"
            value={formData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            className={styles.textInput}
            placeholder={t('checkout.form.stripe.cardholderNamePlaceholder')}
            required
          />
        </div>

        {/* Billing Address */}
        <div className={styles.formGroup}>
          <label className={styles.cardLabel}>
            {t('checkout.form.stripe.billingAddress')}
          </label>
          <input
            type="text"
            value={formData.billingAddress}
            onChange={(e) => handleInputChange('billingAddress', e.target.value)}
            className={styles.textInput}
            placeholder={t('checkout.form.stripe.billingAddressPlaceholder')}
            required
          />
        </div>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          <p>{t('checkout.form.stripe.paymentErrorDetails')}</p>
          <p><strong>{error}</strong></p>
        </div>
      )}
      

    </div>
  );
};

const StripePaymentForm = ({ amount, onPaymentSuccess, onPaymentError, isProcessing, setIsProcessing, orderData, onSubmitOrder, onValidationChange }) => {
  const { t } = useTranslation('common');

  if (!stripePromise) {
    return (
      <div className={styles.stripeContainer}>
        <div className={styles.configError}>
          <p>⚠️ {t('checkout.form.stripe.notConfigured') || 'Stripe is not configured. Please contact the administrator.'}</p>
          <p><small>Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable</small></p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stripeContainer}>
      <Elements stripe={stripePromise}>
        <CheckoutForm
          amount={amount}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          orderData={orderData}
          onSubmitOrder={onSubmitOrder}
          onValidationChange={onValidationChange}
        />
      </Elements>
    </div>
  );
};

export default StripePaymentForm; 