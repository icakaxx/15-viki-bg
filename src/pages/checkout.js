import React, { useContext, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { LanguageContext } from '../components/Layout Components/Header';
import { useCart } from '../contexts/CartContext';
import styles from '../styles/Page Styles/CheckoutPage.module.css';

const CheckoutPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, formatPrice, formatPriceEUR } = useCart();
  const { t } = useContext(LanguageContext);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    
    // Service selections (per product)
    services: {},
    
    // Invoice Information
    invoiceEnabled: false,
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

  // Accordion state - which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    personal: true,    // Start with first section expanded
    services: false,
    invoice: false,
    payment: false
  });

  // Toggle accordion section
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Initialize service selections for each cart item
  React.useEffect(() => {
    const initialServices = {};
    cart.items.forEach(item => {
      if (!formData.services[item.productId]) {
        initialServices[item.productId] = 'ac-only';
      }
    });
    if (Object.keys(initialServices).length > 0) {
      setFormData(prev => ({
        ...prev,
        services: { ...prev.services, ...initialServices }
      }));
    }
  }, [cart.items]);

  // Calculate installation costs (300 BGN per AC unit)
  const installationCost = 300;
  const totalInstallations = cart.items.reduce((total, item) => {
    if (formData.services[item.productId] === 'ac-installation') {
      return total + item.quantity;
    }
    return total;
  }, 0);
  const totalInstallationCost = totalInstallations * installationCost;
  const grandTotal = cart.totalPrice + totalInstallationCost;

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleServiceChange = (productId, service) => {
    setFormData(prev => ({
      ...prev,
      services: { ...prev.services, [productId]: service }
    }));
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

    // Invoice validation (if enabled)
    if (formData.invoiceEnabled) {
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

    setIsSubmitting(true);
    try {
      // Format data for API
      const orderData = {
        personalInfo: {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          phone: formData.phone
        },
        invoiceInfo: {
          invoiceEnabled: formData.invoiceEnabled,
          companyName: formData.companyName || '',
          address: formData.address || '',
          bulstat: formData.bulstat || '',
          mol: formData.mol || '',
          molCustom: formData.molCustom || ''
        },
        paymentInfo: {
          paymentMethod: formData.paymentMethod
        },
        cartItems: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          serviceOption: formData.services[item.productId] || 'ac-only'
        })),
        sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        totals: {
          productsTotal: cart.totalPrice,
          installationCost: totalInstallationCost,
          grandTotal: grandTotal
        }
      };

      console.log('Submitting order:', orderData);

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
        alert(`${t('checkout.formSuccess')} Order ID: ${result.orderId}`);
        clearCart();
      } else {
        throw new Error(result.error || 'Order submission failed');
      }
      
    } catch (error) {
      console.error('Order submission error:', error);
      alert(`${t('checkout.formError')}: ${error.message}`);
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
          <div className={styles.emptyCart}>
            <p>{t('checkout.emptyCart')}</p>
            <Link href="/buy" className={styles.button}>
              {t('checkout.continueShopping')}
            </Link>
          </div>
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
              <div key={item.productId} className={styles.cartItem}>
                <img
                  src={item.product.ImageURL || '/images/placeholder-ac.svg'}
                  alt={`${item.product.Brand} ${item.product.Model}`}
                  className={styles.itemImage}
                  onError={(e) => { e.target.src = '/images/placeholder-ac.svg'; }}
                />
                <div className={styles.itemDetails}>
                  <h4>{item.product.Brand} {item.product.Model}</h4>
                  <div className={styles.itemSpecs}>
                    {item.product.CapacityBTU} {t('buyPage.btu')} • {item.product.EnergyRating}
                  </div>
                  <div className={styles.itemQuantity}>
                    {t('checkout.quantity')}: {item.quantity}
                  </div>
                </div>
                <div className={styles.itemPrice}>
                  <div>{formatPrice(item.product.Price * item.quantity)}</div>
                  <div className={styles.itemPriceEur}>{formatPriceEUR(item.product.Price * item.quantity)}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Totals */}
          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>{t('checkout.total')} ({t('buyPage.title')}):</span>
              <span>{formatPrice(cart.totalPrice)} / {formatPriceEUR(cart.totalPrice)}</span>
            </div>
            {totalInstallations > 0 && (
              <div className={styles.totalRow}>
                <span>{t('checkout.form.services.totalInstallation')} ({totalInstallations} {t('checkout.form.services.installations')}):</span>
                <span>{formatPrice(totalInstallationCost)} / {formatPriceEUR(totalInstallationCost)}</span>
              </div>
            )}
            <div className={styles.grandTotal}>
              <span>{t('checkout.total')}:</span>
              <span>{formatPrice(grandTotal)} / {formatPriceEUR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form - Accordion Layout */}
        <form onSubmit={handleSubmit} className={styles.accordionForm}>
            
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
                </div>
              </div>
            )}
          </div>

          {/* 2. Service Selection */}
          <div className={styles.accordionSection}>
            <div 
              className={styles.accordionHeader}
              onClick={() => toggleSection('services')}
            >
              <h3 className={styles.accordionTitle}>{t('checkout.form.services.title')}</h3>
              <span className={`${styles.accordionIcon} ${expandedSections.services ? styles.expanded : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.services && (
              <div className={styles.accordionContent}>
                <p className={styles.sectionSubtitle}>{t('checkout.form.services.subtitle')}</p>
                
                <div className={styles.servicesList}>
                  {cart.items.map((item) => (
                    <div key={item.productId} className={styles.serviceItem}>
                      <div className={styles.serviceProduct}>
                        <strong>{item.product.Brand} {item.product.Model}</strong>
                        <span>({item.quantity} {t('checkout.quantity')})</span>
                      </div>
                      <div className={styles.serviceOptions}>
                        <label className={styles.radioLabel}>
                          <input
                            type="radio"
                            name={`service-${item.productId}`}
                            value="ac-only"
                            checked={formData.services[item.productId] === 'ac-only'}
                            onChange={() => handleServiceChange(item.productId, 'ac-only')}
                          />
                          {t('checkout.form.services.acOnly')}
                        </label>
                        <label className={styles.radioLabel}>
                          <input
                            type="radio"
                            name={`service-${item.productId}`}
                            value="ac-installation"
                            checked={formData.services[item.productId] === 'ac-installation'}
                            onChange={() => handleServiceChange(item.productId, 'ac-installation')}
                          />
                          {t('checkout.form.services.acWithInstallation')}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className={styles.installationInfo}>
                  <small>{t('checkout.form.services.installationFee')}</small>
                </div>
              </div>
            )}
          </div>

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
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.invoiceEnabled}
                      onChange={(e) => handleInputChange('invoiceEnabled', e.target.checked)}
                    />
                    {t('checkout.form.invoice.enable')}
                  </label>
                </div>
                
                {formData.invoiceEnabled && (
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
          <div className={styles.accordionSection}>
            <div 
              className={styles.accordionHeader}
              onClick={() => toggleSection('payment')}
            >
              <h3 className={styles.accordionTitle}>{t('checkout.form.payment.title')}</h3>
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
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className={styles.formActions}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('checkout.form.submitting') : t('checkout.form.submit')}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default CheckoutPage; 