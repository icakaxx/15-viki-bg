import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { useCart } from '../contexts/CartContext';
import StripePaymentForm from '../components/StripePaymentForm';
import styles from '../styles/Page Styles/CheckoutPage.module.css';

const CheckoutPage = () => {
  const { cart, updateQuantity, removeFromCart, updateItemAccessories, updateAccessoryQuantity, updateItemInstallation, clearCart, formatPrice, formatPriceEUR } = useCart();
  const { t } = useTranslation('common');

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    town: '',
    address: '',
    email: '',
    
    // Invoice Information
    invoiceEnabled: '', // Changed to empty string - options: '', 'yes', 'no'
    companyName: '',
    address: '',
    bulstat: '',
    mol: '',
    molCustom: '',
    
    // Payment
    paymentMethod: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [stripePaymentSuccess, setStripePaymentSuccess] = useState(false);
  const [stripePaymentError, setStripePaymentError] = useState(null);
  const [cardFormValid, setCardFormValid] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Handle card form validation
  const handleCardValidationChange = (isValid) => {
    setCardFormValid(isValid);
  };

  // Accordion state - which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    personal: true,    // All sections expanded by default
    invoice: true,
    payment: true
  });

  // Toggle accordion section
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Handle quantity changes for main product
  const handleProductQuantityChange = (cartItemId, productId, newQuantity) => {
    if (newQuantity < 1) {
      if (confirm(t('checkout.confirmRemove'))) {
        removeFromCart(productId, cartItemId);
      }
    } else {
      updateQuantity(productId, newQuantity, cartItemId);
    }
  };

  // Handle removing the entire product from cart
  const handleRemoveProduct = (cartItemId, productId) => {
    if (confirm(t('checkout.confirmRemove'))) {
      removeFromCart(productId, cartItemId);
    }
  };

  // Handle removing installation service
  const handleRemoveInstallation = (cartItemId) => {
    const item = cart.items.find(item => item.cartItemId === cartItemId);
    if (!item) return;

    if (confirm(t('checkout.confirmRemoveInstallation'))) {
      // Update the cart item to remove installation
      updateCartItemInstallation(cartItemId, false);
    }
  };

  // Helper function to update installation status
  const updateCartItemInstallation = (cartItemId, installationStatus) => {
    updateItemInstallation(cartItemId, installationStatus);
  };

  // Handle installation change for all units of a product type
  const handleInstallationChange = (productKey, hasInstallation) => {
    // Find all cart items for this product type
    const productItems = cart.items.filter(item => {
      const itemProductKey = `${item.product.Brand}-${item.product.Model}`;
      return itemProductKey === productKey;
    });

    // Update installation status for all items of this product type
    productItems.forEach(item => {
      updateCartItemInstallation(item.cartItemId, hasInstallation);
    });
  };

  // Handle accessory quantity changes
  const handleAccessoryQuantityChange = (cartItemId, accessoryIndex, newQuantity) => {
    const item = cart.items.find(item => item.cartItemId === cartItemId);
    if (!item) return;

    // Don't allow accessory quantity to exceed product quantity
    if (newQuantity > item.quantity) {
      alert(t('checkout.accessoryLimitExceeded'));
      return;
    }

    if (newQuantity <= 0) {
      // Remove accessory if quantity is 0 or less
      if (confirm(t('checkout.confirmRemoveAccessory'))) {
        const updatedAccessories = item.accessories.filter((_, index) => index !== accessoryIndex);
        updateCartItemAccessories(cartItemId, updatedAccessories);
      }
    } else {
      updateAccessoryQuantity(cartItemId, accessoryIndex, newQuantity);
    }
  };

  // Handle removing accessories
  const handleRemoveAccessory = (cartItemId, accessoryIndex) => {
    if (confirm(t('checkout.confirmRemoveAccessory'))) {
      const item = cart.items.find(item => item.cartItemId === cartItemId);
      if (item) {
        const updatedAccessories = item.accessories.filter((_, index) => index !== accessoryIndex);
        updateCartItemAccessories(cartItemId, updatedAccessories);
      }
    }
  };

  // Helper function to update cart item accessories
  const updateCartItemAccessories = (cartItemId, updatedAccessories) => {
    updateItemAccessories(cartItemId, updatedAccessories);
  };

  // Calculate totals from cart (installation costs are now handled per unit in cart)
  const grandTotal = cart.totalPrice;

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Show/hide Stripe form based on payment method
    if (field === 'paymentMethod') {
      setShowStripeForm(value === 'online');
      setStripePaymentSuccess(false);
      setStripePaymentError(null);
    }
  };

  // Check if personal info is complete
  const isPersonalInfoComplete = () => {
    return formData.firstName.trim() && 
           formData.middleName.trim() && 
           formData.lastName.trim() && 
           formData.phone.trim() && 
           formData.town.trim() &&
           formData.address.trim();
  };

  // Check if invoice info is complete (if enabled)
  const isInvoiceInfoComplete = () => {
    // If no option is selected, invoice info is not complete
    if (formData.invoiceEnabled === '') return false;
    
    // If "no" is selected, invoice info is complete
    if (formData.invoiceEnabled === 'no') return true;
    
    // If "yes" is selected, all invoice fields must be filled
    if (formData.invoiceEnabled === 'yes') {
      return formData.companyName.trim() && 
             formData.address.trim() && 
             formData.bulstat.trim() && 
             (formData.mol.trim() || formData.molCustom.trim());
    }
    
    return false;
  };

  // Check if payment section should be enabled
  const isPaymentSectionEnabled = () => {
    return isPersonalInfoComplete() && isInvoiceInfoComplete();
  };

  // Check if submit button should be disabled
  const isSubmitButtonDisabled = () => {
    // Disable if form is submitting
    if (isSubmitting) return true;
    
    // Check if all required form fields are filled
    if (!isPersonalInfoComplete() || !isInvoiceInfoComplete() || !formData.paymentMethod) {
      return true;
    }
    
    return false;
  };

  // Prepare order data for Stripe payment
  const prepareOrderData = () => {
    return {
      personalInfo: {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        phone: formData.phone,
        town: formData.town,
        address: formData.address,
        email: formData.email
      },
      invoiceInfo: {
        invoiceEnabled: formData.invoiceEnabled === 'yes',
        companyName: formData.companyName || '',
        address: formData.address || '',
        bulstat: formData.bulstat || '',
        mol: formData.mol || '',
        molCustom: formData.molCustom || ''
      },
      paymentInfo: {
        paymentMethod: formData.paymentMethod,
        stripePaymentId: null,
        totalAmount: grandTotal,
        paid_amount: formData.paymentMethod === 'online' ? grandTotal : 0 // Set paid_amount based on payment method
      },
      cartItems: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        serviceOption: 'ac-only',
        product: item.product,
        accessories: item.accessories,
        installation: item.installation,
        installationPrice: item.installationPrice
      })),
      sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      totals: {
        productsTotal: cart.totalPrice,
        installationCost: 0,
        grandTotal: grandTotal
      }
    };
  };

  // Submit order function for Stripe
  const submitOrderFromStripe = async (orderData) => {
    const response = await fetch('/api/submit-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Order submission failed');
    }

    return result;
  };

  // Stripe payment handlers
  const handleStripePaymentSuccess = (paymentIntent) => {
    setStripePaymentSuccess(true);
    setStripePaymentError(null);
    setOrderCompleted(true);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Clear cart and redirect to success page
    clearCart();
    setTimeout(() => {
      window.location.href = `/order-success?orderId=stripe_${paymentIntent.id}&paymentMethod=online`;
    }, 2000);
  };

  const handleStripePaymentError = (error) => {
    setStripePaymentError(error);
    setStripePaymentSuccess(false);
    // Show error toast
    showToast('error', t('checkout.form.stripe.paymentError'), error);
  };

  // Toast notification function
  const showToast = (type, title, message) => {
    const toast = document.createElement('div');
    toast.className = `toast toast${type.charAt(0).toUpperCase() + type.slice(1)}`;
    toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="toast-title">${title}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="toast-message">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  };

  const validateForm = () => {
    const errors = {};

    // Personal Information validation
    if (!formData.firstName.trim()) errors.firstName = t('checkout.form.validation.required');
    if (!formData.middleName.trim()) errors.middleName = t('checkout.form.validation.required');
    if (!formData.lastName.trim()) errors.lastName = t('checkout.form.validation.required');
    if (!formData.phone.trim()) {
      errors.phone = t('checkout.form.validation.required');
    } else if (formData.phone.length < 8) {
      errors.phone = t('checkout.form.validation.invalidPhone');
    }
    if (!formData.town.trim()) errors.town = t('checkout.form.validation.required');
    if (!formData.address.trim()) errors.address = t('checkout.form.validation.required');

    // Email validation (optional - only validate format if provided)
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('checkout.form.validation.invalidEmail');
    }

    // Invoice validation
    if (!formData.invoiceEnabled) {
      errors.invoiceEnabled = t('checkout.form.validation.required');
    } else if (formData.invoiceEnabled === 'yes') {
      if (!formData.companyName.trim()) errors.companyName = t('checkout.form.validation.required');
      if (!formData.address.trim()) errors.address = t('checkout.form.validation.required');
      if (!formData.bulstat.trim()) {
        errors.bulstat = t('checkout.form.validation.required');
      } else if (!/^\d{9}$/.test(formData.bulstat)) {
        errors.bulstat = t('checkout.form.validation.invalidBulstat');
      }
      if (!formData.mol.trim() && !formData.molCustom.trim()) {
        errors.mol = t('checkout.form.validation.required');
      }
    }

    // Payment validation
    if (!formData.paymentMethod) {
      errors.paymentMethod = t('checkout.form.validation.selectPayment');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // For online payment, process payment first
    if (formData.paymentMethod === 'online') {
      if (!cardFormValid) {
        alert(t('checkout.form.stripe.completePaymentFirst'));
        return;
      }
      
      try {
        // Process payment through Stripe
        const result = await window.stripeProcessPayment();
        
        if (result.success) {
          // Payment was successful, order will be submitted automatically
          return;
        } else {
          // Payment failed, show error message
          showToast('error', t('checkout.form.stripe.paymentError'), result.error);
          return;
        }
      } catch (paymentError) {
        showToast('error', t('checkout.form.stripe.paymentError'), paymentError.message);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Format data for API
      const orderData = {
        personalInfo: {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          phone: formData.phone,
          town: formData.town,
          address: formData.address,
          email: formData.email
        },
        invoiceInfo: {
          invoiceEnabled: formData.invoiceEnabled === 'yes',
          companyName: formData.companyName || '',
          address: formData.address || '',
          bulstat: formData.bulstat || '',
          mol: formData.mol || '',
          molCustom: formData.molCustom || ''
        },
        paymentInfo: {
          paymentMethod: formData.paymentMethod,
          stripePaymentId: stripePaymentSuccess ? 'stripe_payment_completed' : null,
          totalAmount: cart.totalPrice,
          paid_amount: formData.paymentMethod === 'online' ? cart.totalPrice : 0 // Set paid_amount based on payment method
        },
        cartItems: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          serviceOption: 'ac-only',
          product: item.product,
          accessories: item.accessories,
          installation: item.installation,
          installationPrice: item.installationPrice
        })),
        sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        totals: {
          productsTotal: cart.totalPrice,
          installationCost: 0,
          grandTotal: cart.totalPrice
        }
      };

      // Submit to API
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success toast with order details
        showToast('success', t('checkout.form.stripe.orderSuccess'), 
          `${t('checkout.form.stripe.orderId')}: ${result.orderId}\n${t('checkout.form.stripe.emailSent')}`);
        setOrderCompleted(true);
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        clearCart();
        
        // Redirect to success page
        setTimeout(() => {
          window.location.href = `/order-success?orderId=${result.orderId}&paymentMethod=${formData.paymentMethod}`;
        }, 2000);
      } else {
        throw new Error(result.error || 'Order submission failed');
      }
      
    } catch (error) {
      showToast('error', t('checkout.form.stripe.orderError'), error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <>
        <Head>
          <title>{`${t('checkout.title')} - ${t('metaTitle')}`}</title>
          <meta name="description" content={t('checkout.title')} />
        </Head>
        <div className={styles.container}>
          <h1 className={styles.title}>{t('checkout.title')}</h1>
          {orderCompleted ? (
            <div className={styles.orderSuccess}>
              <div className={styles.successIcon}>✅</div>
              <h2>{t('checkout.form.stripe.orderSuccess')}</h2>
              <p>{t('checkout.orderSuccessMessage')}</p>
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <p>{t('checkout.redirecting')}</p>
              </div>
            </div>
          ) : (
            <div className={styles.emptyCart}>
              <p>{t('checkout.emptyCart')}</p>
              <Link href="/buy" className={styles.button}>
                {t('checkout.continueShopping')}
              </Link>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${t('checkout.title')} - ${cart.totalItems} ${t('checkout.items')} - ${t('metaTitle')}`}</title>
        <meta name="description" content={`${t('checkout.title')} - ${cart.totalItems} ${t('checkout.items')}`} />
        <meta name="robots" content="noindex, follow" />
      </Head>
      
      <div className={styles.container}>
        <h1 className={styles.title}>{t('checkout.title')}</h1>
        
        {/* Order Summary - Top of page */}
        <div className={styles.orderSummary}>
          <h2 className={styles.summaryTitle}>
            {t('checkout.orderSummary')} ({cart.totalItems} {t('checkout.items')})
          </h2>
          
          {/* Cart Items */}
          <div className={styles.cartItems}>
            {cart.items.map((item) => (
              <div key={item.cartItemId || item.productId} className={styles.cartItemGroup}>
                {/* Main Product */}
                <div className={styles.cartItem}>
                  <img
                    src={item.product.ImageURL || '/images/placeholder-ac.svg'}
                    alt={`${item.product.Brand} ${item.product.Model}`}
                    className={styles.itemImage}
                    onError={(e) => { e.target.src = '/images/placeholder-ac.svg'; }}
                  />
                  <div className={styles.itemDetails}>
                    <h4>{item.product.Brand} {item.product.Model}</h4>
                    <div className={styles.itemSpecs}>
              {item.product.CapacityBTU} {t('buyPage.btu')} {item.product.EnergyRating ? `| ${item.product.EnergyRating}` : ''}
                    </div>
                    <div className={styles.quantityControls}>
                      <div className={styles.quantityControlsGroup}>
                        <span className={styles.quantityLabel}>{t('checkout.quantity')}:</span>
                        <div className={styles.quantitySelector}>
                          <button
                            className={styles.quantityButton}
                            onClick={() => handleProductQuantityChange(item.cartItemId, item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className={styles.quantityValue}>{item.quantity}</span>
                          <button
                            className={styles.quantityButton}
                            onClick={() => handleProductQuantityChange(item.cartItemId, item.productId, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          className={styles.removeProductButton}
                          onClick={() => handleRemoveProduct(item.cartItemId, item.productId)}
                          aria-label="Remove product from cart"
                          title="Remove product"
                        >
                          🗑️ {t('checkout.removeItem')}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={styles.itemPrice}>
                    <div>{formatPrice(item.product.Price * item.quantity)}</div>
                    <div className={styles.itemPriceEur}>{formatPriceEUR(item.product.Price * item.quantity)}</div>
                  </div>
                </div>

                {/* Accessories */}
                {item.accessories && item.accessories.length > 0 && (
                  <div className={styles.accessoriesSection}>
                    <div className={styles.accessoriesTitle}>{t('productDetail.accessories')}:</div>
                    {item.accessories.map((accessory, index) => {
                      const accessoryQuantity = accessory.quantity || item.quantity;
                      return (
                        <div key={index} className={styles.accessoryItem}>
                          <div className={styles.accessoryDetails}>
                            <span className={styles.accessoryName}>
            {t(`productDetail.accessoryNames.${accessory.Name}`) || accessory.Name}
                            </span>
                            <div className={styles.accessoryQuantityControls}>
                              <div className={styles.quantitySelector}>
                                <button
                                  className={styles.quantityButton}
                                  onClick={() => handleAccessoryQuantityChange(item.cartItemId, index, accessoryQuantity - 1)}
                                  disabled={accessoryQuantity === 0}
                                  aria-label="Decrease accessory quantity"
                                >
                                  −
                                </button>
                                <span className={styles.quantityValue}>{accessoryQuantity}</span>
                                <button
                                  className={styles.quantityButton}
                                  onClick={() => handleAccessoryQuantityChange(item.cartItemId, index, accessoryQuantity + 1)}
                                  disabled={accessoryQuantity >= item.quantity}
                                  aria-label="Increase accessory quantity"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                className={styles.removeButton}
                                onClick={() => handleRemoveAccessory(item.cartItemId, index)}
                                aria-label="Remove accessory"
                                title="Remove accessory"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <div className={styles.accessoryPrice}>
                            <div>{formatPrice(accessory.Price * accessoryQuantity)}</div>
                            <div className={styles.itemPriceEur}>{formatPriceEUR(accessory.Price * accessoryQuantity)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Installation */}
                {item.installation && (
                  <div className={styles.installationSection}>
                    <div className={styles.installationItem}>
                      <div className={styles.installationDetails}>
                        <span className={styles.installationName}>
            {t('productDetail.installation.title')}
                        </span>
                        <button
                          className={styles.removeInstallationButton}
                          onClick={() => handleRemoveInstallation(item.cartItemId)}
                          aria-label="Remove installation service"
                          title="Remove installation"
                        >
                          🗑️ {t('checkout.removeInstallation')}
                        </button>
                      </div>
                      <div className={styles.installationPrice}>
                        <div>{formatPrice((item.installationPrice || 0) * item.quantity)}</div>
                        <div className={styles.itemPriceEur}>{formatPriceEUR((item.installationPrice || 0) * item.quantity)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Totals */}
          <div className={styles.totals}>
            <div className={styles.grandTotal}>
              <span>{t('checkout.total')}:</span>
              <span>{formatPrice(cart.totalPrice)} / {formatPriceEUR(cart.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form - Accordion Layout */}
        <form onSubmit={handleSubmit} className={styles.accordionForm}>
          
          {/* Progress Indicator */}
          <div className={styles.progressIndicator}>
            <div className={styles.progressStep}>
              <div className={`${styles.progressDot} ${isPersonalInfoComplete() ? styles.completed : ''}`}>
                {isPersonalInfoComplete() ? '✓' : '1'}
              </div>
              <span className={styles.progressLabel}>{t('checkout.form.personalInfo.title')}</span>
            </div>
            <div className={styles.progressStep}>
              <div className={`${styles.progressDot} ${isInvoiceInfoComplete() ? styles.completed : ''}`}>
                {isInvoiceInfoComplete() ? '✓' : '2'}
              </div>
              <span className={styles.progressLabel}>{t('checkout.form.invoice.title')}</span>
            </div>
            <div className={styles.progressStep}>
              <div className={`${styles.progressDot} ${isPaymentSectionEnabled() ? styles.completed : ''}`}>
                {isPaymentSectionEnabled() ? '✓' : '3'}
              </div>
              <span className={styles.progressLabel}>{t('checkout.form.payment.title')}</span>
            </div>
          </div>
            
          {/* 1. Personal Information */}
          <div className={styles.accordionSection}>
            <div 
              className={styles.accordionHeader}
              onClick={() => toggleSection('personal')}
            >
              <h3 className={styles.accordionTitle}>{t('checkout.form.personalInfo.title')}</h3>
              <span className={`${styles.accordionIcon} ${expandedSections.personal ? styles.expanded : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.personal && (
              <div className={styles.accordionContent}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="firstName">{t('checkout.form.personalInfo.firstName')} *</label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={formErrors.firstName ? styles.inputError : ''}
                    />
                    {formErrors.firstName && <span className={styles.error}>{formErrors.firstName}</span>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="middleName">{t('checkout.form.personalInfo.middleName')} *</label>
                    <input
                      type="text"
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      className={formErrors.middleName ? styles.inputError : ''}
                    />
                    {formErrors.middleName && <span className={styles.error}>{formErrors.middleName}</span>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="lastName">{t('checkout.form.personalInfo.lastName')} *</label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={formErrors.lastName ? styles.inputError : ''}
                    />
                    {formErrors.lastName && <span className={styles.error}>{formErrors.lastName}</span>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">{t('checkout.form.personalInfo.phone')} *</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={formErrors.phone ? styles.inputError : ''}
                    />
                    <small>{t('checkout.form.personalInfo.phoneHelp')}</small>
                    {formErrors.phone && <span className={styles.error}>{formErrors.phone}</span>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="town">{t('checkout.form.personalInfo.town')} *</label>
                    <input
                      type="text"
                      id="town"
                      value={formData.town}
                      onChange={(e) => handleInputChange('town', e.target.value)}
                      className={formErrors.town ? styles.inputError : ''}
                      placeholder={t('checkout.form.personalInfo.townPlaceholder')}
                    />
                    {formErrors.town && <span className={styles.error}>{formErrors.town}</span>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="address">{t('checkout.form.personalInfo.address')} *</label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={formErrors.address ? styles.inputError : ''}
                      placeholder={t('checkout.form.personalInfo.addressPlaceholder')}
                    />
                    {formErrors.address && <span className={styles.error}>{formErrors.address}</span>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="email">{t('checkout.form.personalInfo.email')}</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={formErrors.email ? styles.inputError : ''}
                      placeholder={t('checkout.form.personalInfo.emailPlaceholder')}
                    />
                    {formErrors.email && <span className={styles.error}>{formErrors.email}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Services Section - Removed since installation is now handled per unit in cart */}
          
          {/* 3. Invoice Information */}
          <div className={styles.accordionSection}>
            <div 
              className={styles.accordionHeader}
              onClick={() => toggleSection('invoice')}
            >
              <h3 className={styles.accordionTitle}>{t('checkout.form.invoice.title')}</h3>
              <span className={`${styles.accordionIcon} ${expandedSections.invoice ? styles.expanded : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.invoice && (
              <div className={styles.accordionContent}>
                <p className={styles.sectionSubtitle}>{t('checkout.form.invoice.subtitle')}</p>
                
                <div className={styles.formGroup}>
                  <label>{t('checkout.form.invoice.needInvoice')} *</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioOption}>
                      <input
                        type="radio"
                        name="invoiceEnabled"
                        value="yes"
                        checked={formData.invoiceEnabled === 'yes'}
                        onChange={(e) => handleInputChange('invoiceEnabled', e.target.value)}
                      />
                      {t('checkout.form.invoice.yes')}
                    </label>
                    <label className={styles.radioOption}>
                      <input
                        type="radio"
                        name="invoiceEnabled"
                        value="no"
                        checked={formData.invoiceEnabled === 'no'}
                        onChange={(e) => handleInputChange('invoiceEnabled', e.target.value)}
                      />
                      {t('checkout.form.invoice.no')}
                    </label>
                  </div>
                  {formErrors.invoiceEnabled && <span className={styles.error}>{formErrors.invoiceEnabled}</span>}
                </div>
                
                {formData.invoiceEnabled === 'yes' && (
                  <div className={styles.invoiceSection}>
                    <div className={styles.formGroup}>
                      <label htmlFor="companyName">{t('checkout.form.invoice.companyName')} *</label>
                      <input
                        type="text"
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className={formErrors.companyName ? styles.inputError : ''}
                      />
                      {formErrors.companyName && <span className={styles.error}>{formErrors.companyName}</span>}
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="address">{t('checkout.form.invoice.address')} *</label>
                      <input
                        type="text"
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={formErrors.address ? styles.inputError : ''}
                      />
                      {formErrors.address && <span className={styles.error}>{formErrors.address}</span>}
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="bulstat">{t('checkout.form.invoice.bulstat')} *</label>
                      <input
                        type="text"
                        id="bulstat"
                        value={formData.bulstat}
                        onChange={(e) => handleInputChange('bulstat', e.target.value)}
                        className={formErrors.bulstat ? styles.inputError : ''}
                        maxLength="9"
                      />
                      <small>{t('checkout.form.invoice.bulstatHelp')}</small>
                      {formErrors.bulstat && <span className={styles.error}>{formErrors.bulstat}</span>}
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="mol">{t('checkout.form.invoice.mol')} *</label>
                      <select
                        id="mol"
                        value={formData.mol}
                        onChange={(e) => handleInputChange('mol', e.target.value)}
                        className={formErrors.mol ? styles.inputError : ''}
                      >
                        <option value="">-- {t('checkout.form.invoice.mol')} --</option>
                        <option value="manager">{t('checkout.form.invoice.molSuggestions.manager')}</option>
                        <option value="director">{t('checkout.form.invoice.molSuggestions.director')}</option>
                        <option value="owner">{t('checkout.form.invoice.molSuggestions.owner')}</option>
                        <option value="representative">{t('checkout.form.invoice.molSuggestions.representative')}</option>
                        <option value="custom">{t('checkout.form.invoice.molSuggestions.custom')}</option>
                      </select>
                      {formData.mol === 'custom' && (
                        <input
                          type="text"
                          value={formData.molCustom}
                          onChange={(e) => handleInputChange('molCustom', e.target.value)}
                          placeholder={t('checkout.form.invoice.mol')}
                          style={{ marginTop: '0.5rem' }}
                        />
                      )}
                      {formErrors.mol && <span className={styles.error}>{formErrors.mol}</span>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Payment Method */}
          <div className={`${styles.accordionSection} ${!isPaymentSectionEnabled() ? styles.disabled : ''}`}>
            <div 
              className={`${styles.accordionHeader} ${!isPaymentSectionEnabled() ? styles.disabled : ''}`}
              onClick={() => isPaymentSectionEnabled() && toggleSection('payment')}
            >
              <h3 className={styles.accordionTitle}>
                {t('checkout.form.payment.title')}
                {!isPaymentSectionEnabled() && (
                  <span className={styles.sectionLocked}>
                    🔒 {t('checkout.form.payment.completePrevious')}
                  </span>
                )}
              </h3>
              <span className={`${styles.accordionIcon} ${expandedSections.payment ? styles.expanded : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.payment && (
              <div className={styles.accordionContent}>
                <div className={styles.paymentOptions}>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="office"
                      checked={formData.paymentMethod === 'office'}
                      onChange={() => handleInputChange('paymentMethod', 'office')}
                    />
                    <div className={styles.paymentDetails}>
                      <strong>{t('checkout.form.payment.office')}</strong>
                      <small>{t('checkout.form.payment.officeHelp')}</small>
                    </div>
                  </label>
                  
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={() => handleInputChange('paymentMethod', 'online')}
                    />
                    <div className={styles.paymentDetails}>
                      <strong>{t('checkout.form.payment.online')}</strong>
                      <small>{t('checkout.form.payment.onlineHelp')}</small>
                    </div>
                  </label>
                  
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={() => handleInputChange('paymentMethod', 'cash')}
                    />
                    <div className={styles.paymentDetails}>
                      <strong>{t('checkout.form.payment.cash')}</strong>
                      <small>{t('checkout.form.payment.cashHelp')}</small>
                    </div>
                  </label>
                </div>
                
                {formErrors.paymentMethod && <span className={styles.error}>{formErrors.paymentMethod}</span>}
                
                {/* Stripe Payment Form */}
                {showStripeForm && (
                  <div className={styles.stripeSection}>
                    {stripePaymentSuccess ? (
                      <div className={styles.paymentSuccess}>
                        <div className={styles.successIcon}>✅</div>
                        <p>{t('checkout.form.stripe.paymentSuccess')}</p>
                      </div>
                    ) : (
                      <>
                        <StripePaymentForm
                          amount={grandTotal}
                          onPaymentSuccess={handleStripePaymentSuccess}
                          onPaymentError={handleStripePaymentError}
                          isProcessing={isSubmitting}
                          setIsProcessing={setIsSubmitting}
                          orderData={prepareOrderData()}
                          onSubmitOrder={submitOrderFromStripe}
                          onValidationChange={handleCardValidationChange}
                        />
                        {stripePaymentError && (
                          <div className={styles.paymentError}>
                            <p>{stripePaymentError}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className={styles.formActions}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitButtonDisabled()}
            >
              {isSubmitting ? t('checkout.form.submitting') : t('checkout.form.submit')}
            </button>
            {formData.paymentMethod === 'online' && (
              <div className={styles.onlinePaymentNote}>
                <p>{t('checkout.form.onlinePaymentNote')}</p>
                {!cardFormValid && (
                  <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {t('checkout.form.stripe.completePaymentFirst')}
                  </p>
                )}
                {cardFormValid && (
                  <p style={{ color: '#059669', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    ✓ {t('checkout.form.stripe.cardDetailsComplete')}
                  </p>
                )}
              </div>
            )}
          </div>

        </form>
      </div>
    </>
  );
};

export async function getStaticProps({ locale }) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  
  return {
    props: {
      ...(await serverSideTranslations(locale || 'bg', ['common'])),
    },
  };
}

export default CheckoutPage; 