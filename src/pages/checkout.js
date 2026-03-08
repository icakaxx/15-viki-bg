import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCart } from '../contexts/CartContext';
import DskCreditCalculator from '../components/DskCreditCalculator';
import TbiCreditCalculator from '../components/TbiCreditCalculator';
import styles from '../styles/Page Styles/CheckoutPage.module.css';

/** TBI payload: map accessory/installation English names to Bulgarian (used only for TBI item names). Prefer by AccessoryID, fallback by Name. */
const TBI_ACCESSORY_NAME_BG_BY_NAME = {
  'Anti-vibration Mount Kit': 'Комплект антивибрационни тампони',
  'Condensate Tray': 'Кондензна вана',
  'Condensate Tray with Heater and Thermostat': 'Кондензна вана с нагревател и термостат',
};
const TBI_ACCESSORY_NAME_BG_BY_ID = {};
const TBI_INSTALLATION_NAME_BG = 'Професионален монтаж';

function getTbiItemNameBg(acc, kind) {
  if (kind === 'installation') {
    return TBI_INSTALLATION_NAME_BG.substring(0, 255);
  }
  const id = acc.AccessoryID;
  if (id != null && TBI_ACCESSORY_NAME_BG_BY_ID[id] !== undefined) {
    return String(TBI_ACCESSORY_NAME_BG_BY_ID[id]).substring(0, 255);
  }
  const en = (acc.Name || '').trim();
  const bg = TBI_ACCESSORY_NAME_BG_BY_NAME[en];
  const name = bg != null ? bg : (acc.Name || 'Аксесоар');
  return String(name).substring(0, 255);
}

const CheckoutPage = () => {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, updateItemAccessories, updateAccessoryQuantity, updateItemInstallation, clearCart, formatPrice, formatPriceEUR } = useCart();
  const { t } = useTranslation('common');

  // State for all available accessories and installation (from DB, same table)
  const [allAccessories, setAllAccessories] = useState([]);
  const [installation, setInstallation] = useState(null);
  const [accessoriesLoading, setAccessoriesLoading] = useState(true);

  // Installation price from DB (fallback 300 BGN if migration not run)
  const INSTALLATION_PRICE_PER_UNIT = installation?.Price ?? 300;

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    town: '',
    postcode: '',
    personalAddress: '',
    email: '',
    
    // Invoice Information
    invoiceEnabled: '', // Changed to empty string - options: '', 'yes', 'no'
    companyName: '',
    invoiceAddress: '',
    bulstat: '',
    mol: '',
    
    // Payment
    paymentMethod: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [selectedDskScheme, setSelectedDskScheme] = useState(null);
  const [dskError, setDskError] = useState(null);
  const [selectedTbiScheme, setSelectedTbiScheme] = useState(null);
  const [tbiError, setTbiError] = useState(null);

  // Fetch all available accessories
  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        setAccessoriesLoading(true);
        const response = await fetch('/api/get-accessories');
        const data = await response.json();
        if (response.ok) {
          setAllAccessories(data.accessories || []);
          setInstallation(data.installation || null);
        }
      } catch (error) {
        console.error('Error fetching accessories:', error);
        setAllAccessories([]);
        setInstallation(null);
      } finally {
        setAccessoriesLoading(false);
      }
    };

    fetchAccessories();
  }, []);

  // Accordion state - which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    invoice: true,
    payment: true
  });

  // Preselect payment from query (e.g. /checkout?payment=installments&bank=dsk&term=12)
  useEffect(() => {
    if (!router.isReady) return;
    const { payment, bank } = router.query;
    if (payment === 'installments' && bank) {
      const method = bank === 'dsk' ? 'dsk_credit' : bank === 'tbi' ? 'tbi_credit' : '';
      if (method) {
        setFormData(prev => ({ ...prev, paymentMethod: method }));
        setExpandedSections(prev => ({ ...prev, payment: true }));
      }
    }
  }, [router.isReady, router.query]);

  // Toggle accordion section
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Make sure installation uses the correct price from cart item or fallback to constant
  const getInstallationPrice = (item) => {
    return item.installationPrice || INSTALLATION_PRICE_PER_UNIT;
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

  // Check if accessory is already selected for this cart item
  const isAccessorySelected = (cartItemId, accessoryId) => {
    const item = cart.items.find(item => item.cartItemId === cartItemId);
    if (!item || !item.accessories) return false;
    return item.accessories.some(acc => acc.AccessoryID === accessoryId);
  };

  // Get accessory quantity for a cart item
  const getAccessoryQuantity = (cartItemId, accessoryId) => {
    const item = cart.items.find(item => item.cartItemId === cartItemId);
    if (!item || !item.accessories) return 0;
    const accessory = item.accessories.find(acc => acc.AccessoryID === accessoryId);
    return accessory ? (accessory.quantity || item.quantity) : 0;
  };

  // Toggle accessory for a cart item
  const handleToggleAccessory = (cartItemId, accessory) => {
    const item = cart.items.find(item => item.cartItemId === cartItemId);
    if (!item) return;

    const isSelected = isAccessorySelected(cartItemId, accessory.AccessoryID);
    
    if (isSelected) {
      // Remove accessory
      const updatedAccessories = item.accessories.filter(acc => acc.AccessoryID !== accessory.AccessoryID);
      updateCartItemAccessories(cartItemId, updatedAccessories);
    } else {
      // Add accessory with quantity = 1
      const newAccessory = { ...accessory, quantity: 1 };
      const updatedAccessories = [...(item.accessories || []), newAccessory];
      updateCartItemAccessories(cartItemId, updatedAccessories);
    }
  };

  // Get accessory index in cart item
  const getAccessoryIndex = (cartItemId, accessoryId) => {
    const item = cart.items.find(item => item.cartItemId === cartItemId);
    if (!item || !item.accessories) return -1;
    return item.accessories.findIndex(acc => acc.AccessoryID === accessoryId);
  };

  // Calculate totals from cart (installation costs are now handled per unit in cart)
  const grandTotal = cart.totalPrice;

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Check if personal info is complete
  const isPersonalInfoComplete = () => {
    return formData.firstName.trim() && 
           formData.middleName.trim() && 
           formData.lastName.trim() && 
           formData.phone.trim() && 
           formData.town.trim() &&
           formData.personalAddress.trim();
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
             formData.invoiceAddress.trim() && 
             formData.bulstat.trim() && 
             formData.mol.trim();
    }
    
    return false;
  };

  // Check if payment section should be enabled
  const isPaymentSectionEnabled = () => {
    return isPersonalInfoComplete() && isInvoiceInfoComplete();
  };

  // Check if any cart items have installation
  const hasInstallation = () => {
    return cart.items.some(item => item.installation === true);
  };

  // Reset payment method if office is selected but installation is added
  useEffect(() => {
    if (formData.paymentMethod === 'office' && hasInstallation()) {
      setFormData(prev => ({ ...prev, paymentMethod: '' }));
    }
  }, [cart.items, formData.paymentMethod]);

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
    if (!formData.personalAddress.trim()) errors.personalAddress = t('checkout.form.validation.required');

    // Email validation (optional - only validate format if provided)
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('checkout.form.validation.invalidEmail');
    }

    // Invoice validation
    if (!formData.invoiceEnabled) {
      errors.invoiceEnabled = t('checkout.form.validation.required');
    } else if (formData.invoiceEnabled === 'yes') {
      if (!formData.companyName.trim()) errors.companyName = t('checkout.form.validation.required');
      if (!formData.invoiceAddress.trim()) errors.invoiceAddress = t('checkout.form.validation.required');
      if (!formData.bulstat.trim()) {
        errors.bulstat = t('checkout.form.validation.required');
      } else if (!/^\d{9}$/.test(formData.bulstat)) {
        errors.bulstat = t('checkout.form.validation.invalidBulstat');
      }
      if (!formData.mol.trim()) {
        errors.mol = t('checkout.form.validation.required');
      }
    }

    // Payment validation
    if (!formData.paymentMethod) {
      errors.paymentMethod = t('checkout.form.validation.selectPayment');
    }

    // Postcode required for DSK credit
    if (formData.paymentMethod === 'dsk_credit' && !formData.postcode.trim()) {
      errors.postcode = t('checkout.form.validation.required');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildOrderData = () => ({
    personalInfo: {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      phone: formData.phone,
      town: formData.town,
      postcode: formData.postcode,
      address: formData.personalAddress,
      email: formData.email
    },
    invoiceInfo: {
      invoiceEnabled: formData.invoiceEnabled === 'yes',
      companyName: formData.companyName || '',
      address: formData.invoiceAddress || '',
      bulstat: formData.bulstat || '',
      mol: formData.mol || ''
    },
    paymentInfo: {
      paymentMethod: formData.paymentMethod,
      totalAmount: cart.totalPrice,
      paid_amount: 0
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
  });

  const submitDskCredit = async (orderId) => {
    const dskItems = cart.items.map(item => ({
      products_id: String(item.productId),
      products_name: `${item.product.Brand} ${item.product.Model}`.substring(0, 103),
      products_q: String(item.quantity),
      products_p: item.product.Price.toFixed(2),
      products_i: item.product.ImageURL || '',
    }));

    const response = await fetch('/api/dsk-pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderid: String(orderId),
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email || '',
        address: formData.personalAddress,
        addresscity: formData.town,
        address2: formData.personalAddress,
        address2city: formData.town,
        postcode: formData.postcode || '',
        price: cart.totalPrice.toFixed(2),
        currency: '0',
        type_client: '0',
        items: dskItems,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || t('dsk.checkout.applicationError'));
    }
    return result.url_redirect;
  };

  const submitTbiCredit = async (orderId) => {
    const EUR_RATE = 1.95583;
    const tbiItems = [];

    cart.items.forEach(item => {
      const qty = item.quantity || 1;

      // Product line (AC unit – prefix for TBI hosted page)
      tbiItems.push({
        name: `Климатик: ${item.product.Brand} ${item.product.Model}`.substring(0, 255),
        description: item.product.Description || '',
        qty: String(qty),
        price: (item.product.Price / EUR_RATE).toFixed(2),
        sku: String(item.productId),
        category: 0,
        imagelink: item.product.ImageURL || '',
      });

      // Accessory lines (consumables – Bulgarian + prefix for TBI hosted page)
      if (item.accessories && item.accessories.length > 0) {
        item.accessories.forEach(acc => {
          const accQty = acc.quantity ?? qty;
          const accPrice = acc.Price ?? acc.price ?? 0;
          if (accPrice <= 0) return;
          tbiItems.push({
            name: `Консуматив: ${getTbiItemNameBg(acc, 'accessory')}`.substring(0, 255),
            description: acc.Description || '',
            qty: String(accQty),
            price: (accPrice / EUR_RATE).toFixed(2),
            sku: acc.AccessoryID ? String(acc.AccessoryID) : `acc-${item.productId}`,
            category: 0,
            imagelink: acc.ImageURL || '',
          });
        });
      }

      // Installation line (service – prefix for TBI hosted page)
      if (item.installation && item.installationPrice) {
        const instPrice = item.installationPrice || 0;
        if (instPrice > 0) {
          tbiItems.push({
            name: 'Услуга: Професионален монтаж',
            description: 'Професионален монтаж',
            qty: String(qty),
            price: (instPrice / EUR_RATE).toFixed(2),
            sku: `installation-${item.productId}`,
            category: 0,
            imagelink: '',
          });
        }
      }
    });

    // Sanity check: payload total vs expected cart total (EUR)
    const payloadTotalEUR = tbiItems.reduce((sum, it) => sum + parseFloat(it.price) * parseInt(it.qty, 10), 0);
    const expectedTotalEUR = cart.totalPrice / EUR_RATE;
    const diff = Math.abs(payloadTotalEUR - expectedTotalEUR);
    if (diff > 0.01) {
      console.warn('[TBI submit] Total mismatch (EUR)', {
        payloadTotalEUR: Math.round(payloadTotalEUR * 100) / 100,
        expectedTotalEUR: Math.round(expectedTotalEUR * 100) / 100,
        diff: Math.round(diff * 100) / 100,
      });
    }

    const response = await fetch('/api/tbi-pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderid: String(orderId),
        firstname: formData.firstName,
        lastname: formData.lastName,
        surname: formData.middleName || '',
        email: formData.email || '',
        phone: formData.phone,
        deliveryaddress: {
          country: 'Bulgaria',
          city: formData.town,
          streetname: formData.personalAddress,
          postalcode: formData.postcode || '',
        },
        items: tbiItems,
        period: selectedTbiScheme?.period || 12,
        successRedirectURL: `${window.location.origin}/order-success?orderId=${orderId}&paymentMethod=tbi_credit`,
        failRedirectURL: `${window.location.origin}/checkout?error=tbi_failed`,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || t('tbi.checkout.applicationError'));
    }
    return result.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setDskError(null);
    setTbiError(null);
    try {
      const orderData = buildOrderData();

      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Order submission failed');
      }

      const orderId = result.orderId;

      if (formData.paymentMethod === 'dsk_credit') {
        try {
          const redirectUrl = await submitDskCredit(orderId);
          showToast('success', t('dsk.checkout.redirecting'), t('dsk.checkout.redirectingMessage'));
          clearCart();
          window.location.href = redirectUrl;
          return;
        } catch (dskErr) {
          setDskError(dskErr.message);
          showToast('error', t('dsk.checkout.applicationError'), dskErr.message);
          setIsSubmitting(false);
          return;
        }
      }

      if (formData.paymentMethod === 'tbi_credit') {
        try {
          const redirectUrl = await submitTbiCredit(orderId);
          showToast('success', t('tbi.checkout.redirecting'), t('tbi.checkout.redirectingMessage'));
          clearCart();
          window.location.href = redirectUrl;
          return;
        } catch (tbiErr) {
          setTbiError(tbiErr.message);
          showToast('error', t('tbi.checkout.applicationError'), tbiErr.message);
          setIsSubmitting(false);
          return;
        }
      }

      showToast('success', t('checkout.form.orderSuccess'), 
        `${t('checkout.form.orderId')}: ${orderId}`);
      setOrderCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      clearCart();
      
      setTimeout(() => {
        window.location.href = `/order-success?orderId=${orderId}&paymentMethod=${formData.paymentMethod}`;
      }, 2000);
      
    } catch (error) {
      showToast('error', t('checkout.form.orderError'), error.message);
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
              <h2>{t('checkout.form.orderSuccess')}</h2>
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
                          <span className={styles.removeIcon} aria-hidden>×</span>
                          {t('checkout.removeItem')}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={styles.itemPrice}>
                    {formatPriceEUR(item.product.Price * item.quantity)} | {formatPrice(item.product.Price * item.quantity)}
                  </div>
                </div>

                {/* Accessories - Always show all available accessories */}
                <div className={styles.accessoriesSection}>
                  <div className={styles.accessoriesTitle}>{t('productDetail.accessories')}:</div>
                  {accessoriesLoading ? (
                    <div style={{ padding: '1rem', color: '#666' }}>
                      {t('productDetail.loadingAccessories')}...
                    </div>
                  ) : allAccessories.length > 0 ? (
                    allAccessories.map((accessory) => {
                      const isSelected = isAccessorySelected(item.cartItemId, accessory.AccessoryID);
                      const accessoryQuantity = getAccessoryQuantity(item.cartItemId, accessory.AccessoryID);
                      const accessoryIndex = getAccessoryIndex(item.cartItemId, accessory.AccessoryID);
                      
                      return (
                        <div key={accessory.AccessoryID} className={styles.accessoryItem}>
                          <div className={styles.accessoryDetails}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleAccessory(item.cartItemId, accessory)}
                                style={{ cursor: 'pointer' }}
                              />
                              <span className={styles.accessoryName}>
                                {t(`productDetail.accessoryNames.${accessory.Name}`) || accessory.Name}
                              </span>
                            </label>
                            {isSelected && (
                              <div className={styles.accessoryQuantityControls}>
                                <div className={styles.quantitySelector}>
                                  <button
                                    className={styles.quantityButton}
                                    onClick={() => handleAccessoryQuantityChange(item.cartItemId, accessoryIndex, accessoryQuantity - 1)}
                                    disabled={accessoryQuantity <= 1}
                                    aria-label="Decrease accessory quantity"
                                  >
                                    −
                                  </button>
                                  <span className={styles.quantityValue}>{accessoryQuantity}</span>
                                  <button
                                    className={styles.quantityButton}
                                    onClick={() => handleAccessoryQuantityChange(item.cartItemId, accessoryIndex, accessoryQuantity + 1)}
                                    disabled={accessoryQuantity >= item.quantity}
                                    aria-label="Increase accessory quantity"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className={styles.accessoryPrice}>
                            {isSelected ? (
                              <span>{formatPriceEUR(accessory.Price * accessoryQuantity)} | {formatPrice(accessory.Price * accessoryQuantity)}</span>
                            ) : (
                              <span style={{ color: '#999' }}>{formatPriceEUR(accessory.Price)} | {formatPrice(accessory.Price)}</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '1rem', color: '#666' }}>
                      {t('productDetail.noAccessories')}
                    </div>
                  )}
                </div>

                {/* Installation - Always show installation option */}
                <div className={styles.installationSection}>
                  <div className={styles.installationItem}>
                    <div className={styles.installationDetails}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={item.installation || false}
                          onChange={(e) => updateCartItemInstallation(item.cartItemId, e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span className={styles.installationName}>
                          {t('productDetail.installation.title')} ({t('productDetail.installation.perUnit')})
                        </span>
                      </label>
                      {item.installation && (
                        <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                          {t('productDetail.installation.description')}
                        </div>
                      )}
                    </div>
                    <div className={styles.installationPrice}>
                      {item.installation ? (
                        <span>{formatPriceEUR(getInstallationPrice(item) * item.quantity)} | {formatPrice(getInstallationPrice(item) * item.quantity)}</span>
                      ) : (
                        <span style={{ color: '#999' }}>{formatPriceEUR(getInstallationPrice(item))} | {formatPrice(getInstallationPrice(item))}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Totals */}
          <div className={styles.totals}>
            <div className={styles.grandTotal}>
              <span>{t('checkout.total')}:</span>
              <span>{formatPriceEUR(cart.totalPrice)} | {formatPrice(cart.totalPrice)}</span>
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
                    <label htmlFor="postcode">
                      {t('checkout.form.personalInfo.postcode')}
                      {formData.paymentMethod === 'dsk_credit' && ' *'}
                    </label>
                    <input
                      type="text"
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      className={formErrors.postcode ? styles.inputError : ''}
                      placeholder={t('checkout.form.personalInfo.postcodePlaceholder')}
                    />
                    {formErrors.postcode && <span className={styles.error}>{formErrors.postcode}</span>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="personalAddress">{t('checkout.form.personalInfo.address')} *</label>
                    <input
                      type="text"
                      id="personalAddress"
                      value={formData.personalAddress}
                      onChange={(e) => handleInputChange('personalAddress', e.target.value)}
                      className={formErrors.personalAddress ? styles.inputError : ''}
                      placeholder={t('checkout.form.personalInfo.addressPlaceholder')}
                    />
                    {formErrors.personalAddress && <span className={styles.error}>{formErrors.personalAddress}</span>}
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
                      <label htmlFor="invoiceAddress">{t('checkout.form.invoice.address')} *</label>
                      <input
                        type="text"
                        id="invoiceAddress"
                        value={formData.invoiceAddress}
                        onChange={(e) => handleInputChange('invoiceAddress', e.target.value)}
                        className={formErrors.invoiceAddress ? styles.inputError : ''}
                      />
                      {formErrors.invoiceAddress && <span className={styles.error}>{formErrors.invoiceAddress}</span>}
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
                      <input
                        type="text"
                        id="mol"
                        value={formData.mol}
                        onChange={(e) => handleInputChange('mol', e.target.value)}
                        className={formErrors.mol ? styles.inputError : ''}
                        placeholder={t('checkout.form.invoice.mol')}
                      />
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
                  <label className={`${styles.paymentOption} ${hasInstallation() ? styles.disabled : ''}`} style={hasInstallation() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="office"
                      checked={formData.paymentMethod === 'office'}
                      onChange={() => handleInputChange('paymentMethod', 'office')}
                      disabled={hasInstallation()}
                      style={hasInstallation() ? { cursor: 'not-allowed' } : {}}
                    />
                    <div className={styles.paymentDetails}>
                      <strong>{t('checkout.form.payment.office')} {hasInstallation() && <span style={{ color: '#999', fontSize: '0.875rem' }}>({t('checkout.form.payment.notAvailableWithInstallation') || 'Not available with installation'})</span>}</strong>
                      <small>{t('checkout.form.payment.officeHelp')}</small>
                    </div>
                  </label>

                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="dsk_credit"
                      checked={formData.paymentMethod === 'dsk_credit'}
                      onChange={() => handleInputChange('paymentMethod', 'dsk_credit')}
                    />
                    <div className={styles.paymentDetails}>
                      <strong>{t('checkout.form.payment.dskCredit')}</strong>
                      <small>{t('checkout.form.payment.dskCreditHelp')}</small>
                    </div>
                  </label>

                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="tbi_credit"
                      checked={formData.paymentMethod === 'tbi_credit'}
                      onChange={() => handleInputChange('paymentMethod', 'tbi_credit')}
                    />
                    <div className={styles.paymentDetails}>
                      <strong>{t('checkout.form.payment.tbiCredit')}</strong>
                      <small>{t('checkout.form.payment.tbiCreditHelp')}</small>
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

                {formData.paymentMethod === 'dsk_credit' && (
                  <div style={{ marginTop: '1rem' }}>
                    <DskCreditCalculator
                      price={cart.totalPrice}
                      productId={cart.items[0]?.productId || '0'}
                      onSchemeSelect={setSelectedDskScheme}
                    />
                    {dskError && (
                      <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#fff3f3', color: '#c62828', borderRadius: '6px', fontSize: '0.9rem' }}>
                        {dskError}
                      </div>
                    )}
                  </div>
                )}

                {formData.paymentMethod === 'tbi_credit' && (
                  <div style={{ marginTop: '1rem' }}>
                    <TbiCreditCalculator
                      price={cart.totalPrice / 1.95583}
                      productId={cart.items[0]?.productId || '0'}
                      onSchemeSelect={setSelectedTbiScheme}
                    />
                    {tbiError && (
                      <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#fff3f3', color: '#c62828', borderRadius: '6px', fontSize: '0.9rem' }}>
                        {tbiError}
                      </div>
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