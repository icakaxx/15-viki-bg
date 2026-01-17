import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import path from 'path';
import { useCart } from '../../contexts/CartContext';
import styles from '../../styles/Page Styles/ProductDetail.module.css';
import { useConsent } from '../../components/ConsentProvider';

const ProductDetailPage = ({ initialProduct, initialAccessories, error: serverError }) => {
  const router = useRouter();
  const { productId, qty } = router.query;
  const { t } = useTranslation('common');
  const { addToCartEnhanced } = useCart();
  const { hasConsent } = useConsent();



  // Helper function to translate features
  const translateFeature = (feature) => {
    if (!feature) return '';
    
    // Map English feature names to translation keys
    const featureMap = {
      'WiFi Control': 'buyPage.features.wifi',
      'Inverter Technology': 'buyPage.features.inverter',
      'Heat Pump': 'buyPage.features.heatPump',
      'Eco Mode': 'buyPage.features.eco',
      'Sleep Mode': 'buyPage.features.sleepMode',
      'Auto Restart': 'buyPage.features.autoRestart',
      'Diamond Filter': 'buyPage.features.diamondFilter',
      'Air Purification': 'buyPage.features.airPurification',
      'WindFree Mode': 'buyPage.features.windFreeMode',
      'Nanoe-G': 'buyPage.features.nanoeG',
      'Gallery Design': 'buyPage.features.galleryDesign',
      'Smart Control': 'buyPage.features.smartControl',
      'Energy Saving': 'buyPage.features.energySaving',
      'Auto Clean': 'buyPage.features.autoClean',
      'Quiet Operation': 'buyPage.features.quietOperation',
      'Dual Filter': 'buyPage.features.dualFilter',
      'Anti-fungus': 'buyPage.features.antiFungus'
    };
    
    const translationKey = featureMap[feature];
    return translationKey ? t(translationKey) || feature : feature;
  };

  // Helper function to translate installation types
  const translateInstallationType = (installationType) => {
    if (!installationType) return '';
    
    // Map installation type values to translation keys
    const installationTypeMap = {
      'Wall-mounted': 'admin.products.dropdowns.installationTypes.wallMounted',
      'Ceiling-mounted': 'admin.products.dropdowns.installationTypes.ceilingMounted',
      'Floor-standing': 'admin.products.dropdowns.installationTypes.floorStanding',
      'Ducted': 'admin.products.dropdowns.installationTypes.ducted',
      'Cassette': 'admin.products.dropdowns.installationTypes.cassette'
    };
    
    const translationKey = installationTypeMap[installationType];
    return translationKey ? t(translationKey) || installationType : installationType;
  };

  // Helper function to count all technical specifications
  const getTechnicalSpecsCount = () => {
    let count = 0;
    if (product.COP) count++;
    if (product.SCOP) count++;
    if (product.NoiseLevel) count++;
    if (product.PowerConsumptionCooling) count++;
    if (product.PowerConsumptionHeating) count++;
    if (product.IndoorDimensions) count++;
    if (product.OutdoorDimensions) count++;
    if (product.Colour) count++;
    if (product.OperatingTempRange) count++;
    if (product.InstallationType) count++;
    if (product.Stock !== undefined && product.Stock !== null) count++;
    return count;
  };

  // State management - Initialize with server-side data
  const [product, setProduct] = useState(initialProduct);
  const [accessories, setAccessories] = useState(initialAccessories || []);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [accessoriesLoading, setAccessoriesLoading] = useState(false);
  const [error, setError] = useState(serverError || (initialProduct ? null : 'Product not found'));

  // Fixed installation price per AC unit
  const INSTALLATION_PRICE_PER_UNIT = 300.00;

  // Initialize quantity from URL parameter
  useEffect(() => {
    if (qty) {
      const qtyValue = parseInt(qty);
      if (qtyValue >= 1 && qtyValue <= 10) {
        setQuantity(qtyValue);
      }
    }
  }, [qty]);

  // Helper function to render spec cards with value next to name
  const renderSpecCard = (icon, name, value, tooltip, useSmallFont = false) => (
    <div className={styles.specCard}>
      <div className={styles.specIcon}>{icon}</div>
      <div className={styles.specName}>
        {name}: <span className={useSmallFont ? styles.specValueSmall : styles.specValue}>{value}</span>
      </div>
      {tooltip && (
        <span 
          className={styles.infoIcon}
          title={tooltip}
        >
          ?
        </span>
      )}
    </div>
  );

  // Update product if props change (for client-side navigation)
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setError(null);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (initialAccessories) {
      setAccessories(initialAccessories);
    }
  }, [initialAccessories]);

  // Price calculations
  const formatPrice = (price) => {
    return `${price?.toFixed(2)} ${t('productDetail.currency.bgn')}`;
  };

  const formatPriceEUR = (price) => {
    const eurRate = 1.95583;
    return `${t('productDetail.currency.eur')}${(price / eurRate).toFixed(2)}`;
  };

  const formatPriceBoth = (price) => {
    const eurRate = 1.95583;
    return `${price?.toFixed(2)} ${t('productDetail.currency.bgn')} / ${t('productDetail.currency.eur')}${(price / eurRate).toFixed(2)}`;
  };

  const calculateDiscount = (price, previousPrice) => {
    if (!previousPrice || previousPrice <= price) return null;
    return Math.round(((previousPrice - price) / previousPrice) * 100);
  };

  // Dynamic discount calculation system
  const getDynamicPricing = () => {
    if (!product) return { discount: 0, previousPrice: null, currentPrice: 0 };
    
    let discount, previousPrice, currentPrice, calculatedPrice;
    
    if (product.Discount > 0) {
      // If discount percentage is provided, calculate the discounted price dynamically
      discount = product.Discount;
      previousPrice = product.PreviousPrice || product.Price; // Original price (before discount)
      calculatedPrice = previousPrice * (1 - discount / 100); // Calculate discounted price
      currentPrice = calculatedPrice; // Use calculated price for display
    } else if (product.PreviousPrice && product.PreviousPrice > product.Price) {
      // If previous price is provided and higher than current price, calculate discount
      discount = calculateDiscount(product.Price, product.PreviousPrice);
      previousPrice = product.PreviousPrice;
      currentPrice = product.Price;
    } else {
      // No discount
      discount = 0;
      previousPrice = null;
      currentPrice = product.Price;
    }
    
    return { discount, previousPrice, currentPrice };
  };

  const getAccessoryTotal = () => {
    return selectedAccessories.reduce((total, accId) => {
      const accessory = accessories.find(acc => acc.AccessoryID === accId);
      return total + (accessory?.Price || 0);
    }, 0);
  };

  const getTotalPrice = () => {
    const { currentPrice } = getDynamicPricing();
    const basePrice = currentPrice || 0;
    const accessoryTotal = getAccessoryTotal();
    const installationCost = installationSelected ? INSTALLATION_PRICE_PER_UNIT * quantity : 0;
    return (basePrice + accessoryTotal) * quantity + installationCost;
  };

  // Stock status
  const getStockStatus = () => {
    if (product?.IsArchived || product?.Stock === 0) {
      return { status: 'outOfStock', label: t('productDetail.stock.outOfStock') };
    }
    if (product?.Stock <= 5) {
      return { status: 'lowStock', label: t('productDetail.stock.lowStock') };
    }
    return { status: 'inStock', label: t('productDetail.stock.inStock') };
  };

  // Handle accessory selection
  const toggleAccessory = (accessoryId) => {
    setSelectedAccessories(prev => 
      prev.includes(accessoryId)
        ? prev.filter(id => id !== accessoryId)
        : [...prev, accessoryId]
    );
  };

  // Handle quantity changes
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product || product.IsArchived) return;

    if (!hasConsent) {
      // Show terms modal instead of adding to cart
      window.dispatchEvent(new CustomEvent('showTermsModal'));
      return;
    }

    const selectedAccessoryObjects = selectedAccessories.map(accId => 
      accessories.find(acc => acc.AccessoryID === accId)
    ).filter(Boolean);

    // Create a product object with the discounted price for the cart
    const { currentPrice } = getDynamicPricing();
    const productWithDiscountedPrice = {
      ...product,
      Price: currentPrice // Use the discounted price
    };

    // Use enhanced cart functionality
    addToCartEnhanced(
      productWithDiscountedPrice, 
      quantity, 
      selectedAccessoryObjects, 
      installationSelected, 
      INSTALLATION_PRICE_PER_UNIT
    );

    // Navigate back to buy page
    router.push('/buy');
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Head>
          <title>{`${t('productDetail.loading')} - ${t('metaTitle')}`}</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.loading}>
            {t('productDetail.loading')}...
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <>
        <Head>
          <title>{`${t('productDetail.notFound')} - ${t('metaTitle')}`}</title>
        </Head>
        <div className={styles.container}>
          <Link href="/buy" className={styles.backButton}>
            ← {t('productDetail.backToBuy')}
          </Link>
          <div className={styles.notFound}>
            {error || t('productDetail.notFound')}
          </div>
        </div>
      </>
    );
  }

  const stockStatus = getStockStatus();
  const discount = calculateDiscount(product.Price, product.PreviousPrice);

  return (
          <>
        <Head>
          <title>{`${product.Brand} ${product.Model} - ${t('productDetail.metaTitle')} - ${t('metaTitle')}`}</title>
          <meta name="description" content={product.Description || `${product.Brand} ${product.Model} - ${t('productDetail.metaDescription')}`} />
          <meta property="og:title" content={`${product.Brand} ${product.Model} - ${t('productDetail.metaTitle')}`} />
          <meta property="og:description" content={product.Description || `${product.Brand} ${product.Model} - ${t('productDetail.metaDescription')}`} />
          <meta property="og:image" content={product.ImageURL} />
        </Head>

      <div className={styles.container}>
        {/* Back Button */}
        <Link href="/buy" className={styles.backButton}>
          ← {t('productDetail.backToBuy')}
        </Link>

        {/* Main Product Section */}
        <div className={styles.productDetail}>
          <div className={styles.productHeader}>
            {/* Product Image */}
            <div className={styles.imageSection}>
              <div className={styles.imageContainer}>
                <Image
                  src={product.ImageURL || '/images/placeholder-ac.svg'}
                  alt={`${product.Brand} ${product.Model}`}
                  fill
                  className={styles.productImage}
                />
                <div className={`${styles.stockBadge} ${styles[stockStatus.status]}`}>
                  {stockStatus.label}
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className={styles.productInfo}>
              <h1 className={styles.brandModel}>
                {product.Brand} {product.Model}
              </h1>
              
              {/* Promotional Badges */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap', 
                marginBottom: '16px' 
              }}>
                {product.IsNew && (
                  <span style={{ 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    animation: 'badgeAppear 0.4s ease-out'
                  }}
                  title={t('buyPage.badges.new')}
                  >
                    {t('buyPage.badges.new')}
                  </span>
                )}
                {product.IsBestseller && (
                  <span style={{ 
                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    animation: 'badgeAppear 0.4s ease-out'
                  }}
                  title={t('buyPage.badges.bestseller')}
                  >
                    {t('buyPage.badges.bestseller')}
                  </span>
                )}
                {product.IsFeatured && (
                  <span style={{ 
                    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    animation: 'badgeAppear 0.4s ease-out'
                  }}
                  title={t('buyPage.badges.featured')}
                  >
                    {t('buyPage.badges.featured')}
                  </span>
                )}
                {product.Discount > 0 && (
                  <span style={{ 
                    backgroundColor: '#F44336', 
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    animation: 'badgeAppear 0.4s ease-out'
                  }}>
                    🔥 {product.Discount}% {t('buyPage.discount.off')}
                  </span>
                )}
              </div>

              {/* Pricing - Moved up near title */}
              <div className={styles.pricing}>
                {(() => {
                  const { discount, previousPrice, currentPrice } = getDynamicPricing();
                  return (
                    <>
                      {discount > 0 && previousPrice && (
                        <div style={{ marginBottom: '8px' }}>
                          <span className={styles.originalPrice} style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: '#999' }}>
                            {formatPrice(previousPrice)}
                          </span>
                        </div>
                      )}
                      <div className={styles.currentPrice}>
                        {formatPrice(currentPrice)} / {formatPriceEUR(currentPrice)}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Warranty Info - Moved up */}
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#666' }}>
                <div>{product.WarrantyPeriod || product.Warranty || '60 месеца'} Гаранция</div>
              </div>

              {/* Accessories Section - Moved to top right */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#333' }}>
                  {t('productDetail.accessoriesHeader')}
                </h3>
                
                {/* Accessories List */}
                {accessoriesLoading ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                    Зареждане на аксесоари...
                  </div>
                ) : accessories.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {accessories.map((accessory) => (
                      <label
                        key={accessory.AccessoryID}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          border: selectedAccessories.includes(accessory.AccessoryID) ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                          borderRadius: '8px',
                          backgroundColor: selectedAccessories.includes(accessory.AccessoryID) ? '#f0f9f0' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={selectedAccessories.includes(accessory.AccessoryID)}
                            onChange={() => toggleAccessory(accessory.AccessoryID)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '0.95rem' }}>
                            1 × {t(`productDetail.accessoryNames.${accessory.Name}`) || accessory.Name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginLeft: '0.5rem' }}>
                          {formatPriceEUR(accessory.Price)} / {formatPrice(accessory.Price)}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : null}

                {/* Installation Option */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    border: installationSelected ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: installationSelected ? '#f0f9f0' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: accessories.length > 0 ? '0.75rem' : '0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={installationSelected}
                      onChange={() => setInstallationSelected(!installationSelected)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.95rem' }}>
                      {t('productDetail.installation.title')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginLeft: '0.5rem' }}>
                    {formatPriceEUR(INSTALLATION_PRICE_PER_UNIT)} / {formatPrice(INSTALLATION_PRICE_PER_UNIT)} за единица
                  </div>
                </label>
              </div>

              {/* Price Summary - Compact version */}
              <div style={{ 
                marginBottom: '1.5rem', 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                {selectedAccessories.length > 0 && (
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                    <div>Добавка към цената: {formatPriceEUR(getAccessoryTotal() * quantity)}</div>
                  </div>
                )}
                {installationSelected && (
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                    <div>Монтаж: {formatPriceEUR(INSTALLATION_PRICE_PER_UNIT * quantity)}</div>
                  </div>
                )}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '2px solid #333',
                  marginTop: '0.5rem'
                }}>
                  <strong style={{ fontSize: '1.1rem' }}>Обща сума на поръчката:</strong>
                  <div style={{ textAlign: 'right' }}>
                    {product.PreviousPrice && product.PreviousPrice > getDynamicPricing().currentPrice && (
                      <div style={{ 
                        textDecoration: 'line-through', 
                        color: '#999', 
                        fontSize: '0.85rem',
                        marginBottom: '0.25rem'
                      }}>
                        {formatPriceEUR(product.PreviousPrice * quantity + getAccessoryTotal() * quantity + (installationSelected ? INSTALLATION_PRICE_PER_UNIT * quantity : 0))}
                      </div>
                    )}
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#d32f2f' }}>
                      {formatPriceEUR(getTotalPrice())}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                      {formatPrice(getTotalPrice())}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '500' }}>{t('productDetail.quantity.label')}:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      style={{
                        width: '36px',
                        height: '36px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                        opacity: quantity <= 1 ? 0.5 : 1
                      }}
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                      style={{
                        width: '60px',
                        height: '36px',
                        textAlign: 'center',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <button
                      style={{
                        width: '36px',
                        height: '36px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: quantity >= 10 ? 'not-allowed' : 'pointer',
                        opacity: quantity >= 10 ? 0.5 : 1
                      }}
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 10}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className={`${styles.addToCartButton} ${!hasConsent ? styles.consentRequired : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.IsArchived || product.Stock === 0}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    backgroundColor: product.IsArchived || product.Stock === 0 ? '#ccc' : '#d32f2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: product.IsArchived || product.Stock === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {product.IsArchived || product.Stock === 0
                    ? t('productDetail.outOfStock')
                    : !hasConsent 
                      ? t('consent.warning')
                      : 'поръчай с един клик'
                  }
                </button>
              </div>

            </div>
          </div>

          {/* Technical Specifications - Table Format */}
          <div className={styles.specsSection} style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem' }}>
              {t('productDetail.technicalSpecs')}
            </h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
              <tbody>
                {product.CapacityBTU && (
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', width: '40%', backgroundColor: '#f8f9fa' }}>Btu</td>
                    <td style={{ padding: '0.75rem' }}>{product.CapacityBTU}</td>
                  </tr>
                )}
                {product.EnergyRating && (
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', width: '40%', backgroundColor: '#f8f9fa' }}>Енергиен клас</td>
                    <td style={{ padding: '0.75rem' }}>{product.EnergyRating}</td>
                  </tr>
                )}
                {product.COP && (
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', width: '40%', backgroundColor: '#f8f9fa' }}>COP</td>
                    <td style={{ padding: '0.75rem' }}>{product.COP}</td>
                  </tr>
                )}
                {product.SCOP && (
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', width: '40%', backgroundColor: '#f8f9fa' }}>SCOP</td>
                    <td style={{ padding: '0.75rem' }}>{product.SCOP}</td>
                  </tr>
                )}
                {product.PowerConsumptionCooling && (
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', width: '40%', backgroundColor: '#f8f9fa' }}>Ел.Консумация - охлаждане,kW</td>
                    <td style={{ padding: '0.75rem' }}>{product.PowerConsumptionCooling}</td>
                  </tr>
                )}
                {product.PowerConsumptionHeating && (
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', width: '40%', backgroundColor: '#f8f9fa' }}>Ел.Консумация - отопление,kW</td>
                    <td style={{ padding: '0.75rem' }}>{product.PowerConsumptionHeating}</td>
                  </tr>
                )}
                {product.NoiseLevel && (
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', width: '40%', backgroundColor: '#f8f9fa' }}>Ниво на шум /Hi/Lo/S-lo/, dB</td>
                    <td style={{ padding: '0.75rem' }}>{product.NoiseLevel}</td>
                  </tr>
                )}
                {product.IndoorDimensions && (
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', width: '40%', backgroundColor: '#f8f9fa' }}>Размери Вътрешно тяло,мм</td>
                    <td style={{ padding: '0.75rem' }}>{product.IndoorDimensions}</td>
                  </tr>
                )}
                {product.OutdoorDimensions && (
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', width: '40%', backgroundColor: '#f8f9fa' }}>Размери Външно тяло,мм</td>
                    <td style={{ padding: '0.75rem' }}>{product.OutdoorDimensions}</td>
                  </tr>
                )}
                {product.InstallationType && (
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', width: '40%', backgroundColor: '#f8f9fa' }}>Тип</td>
                    <td style={{ padding: '0.75rem' }}>{translateInstallationType(product.InstallationType)}</td>
                  </tr>
                )}
                {product.Colour && (
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', width: '40%', backgroundColor: '#f8f9fa' }}>Цвят на панела</td>
                    <td style={{ padding: '0.75rem' }}>{product.Colour}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Description - Below Technical Specifications */}
          {product.Description && (
            <div className={styles.specsSection} style={{ marginTop: '2rem', padding: '1.5rem' }}>
              <h2 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>
                Описание
              </h2>
              <p className={styles.description} style={{ lineHeight: '1.6', color: '#555', fontSize: '1rem' }}>
                {product.Description}
              </p>
            </div>
          )}

          {/* Features */}
          {product.Features && product.Features.length > 0 && (
            <div className={styles.featuresSection}>
              <h2 className={styles.sectionTitle}>
                {t('productDetail.features')}
              </h2>
              <div className={styles.featuresList}>
                {product.Features.map((feature, index) => (
                  <div key={index} className={styles.featureItem}>
                    <span className={styles.featureIcon}>✓</span>
                    <span className={styles.featureText}>{translateFeature(feature)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export async function getServerSideProps({ params, locale }) {
  const productId = params.productId;
  
  // i18n config for serverSideTranslations (inline to avoid config file issues in serverless)
  const i18nConfig = {
    i18n: {
      defaultLocale: 'bg',
      locales: ['bg', 'en'],
    },
    localePath: path.resolve('./public/locales'),
  };
  
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Product page SSR: Missing Supabase environment variables');
    return {
      props: {
        ...(await serverSideTranslations(locale || 'bg', ['common'], i18nConfig)),
        initialProduct: null,
        initialAccessories: [],
        error: 'ENV_VARS_MISSING',
      },
    };
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch product data
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error(`Product page SSR: Error fetching product ${productId}:`, productError.message);
      return {
        props: {
          ...(await serverSideTranslations(locale || 'bg', ['common'], i18nConfig)),
          initialProduct: null,
          initialAccessories: [],
          error: 'PRODUCT_FETCH_ERROR',
        },
      };
    }

    if (!productData) {
      console.error(`Product page SSR: No data found for product ${productId}`);
      return {
        props: {
          ...(await serverSideTranslations(locale || 'bg', ['common'], i18nConfig)),
          initialProduct: null,
          initialAccessories: [],
          error: 'PRODUCT_NOT_FOUND',
        },
      };
    }

    // Transform product data
    const transformedProduct = {
      ProductID: productData.id,
      Brand: productData.brand ?? null,
      Model: productData.model ?? null,
      Colour: productData.colour ?? null,
      CapacityBTU: productData.capacity_btu ?? null, // Now supports text
      EnergyRating: productData.energy_rating ?? null, // Now supports A+, A++
      Price: productData.price ?? null,
      PreviousPrice: productData.previous_price ?? null,
      ImageURL: productData.image_url ?? null,
      Stock: productData.stock ?? null,
      Discount: productData.discount ?? null,
      IsArchived: productData.is_archived ?? false,
      CreatedAt: productData.created_at ?? null,
      UpdatedAt: productData.updated_at ?? null,
      COP: productData.cop ?? null,
      SCOP: productData.scop ?? null,
      PowerConsumptionCooling: productData.power_consumption_cooling ?? 
                               productData.electricity_cooling_kw ?? 
                               null,
      PowerConsumptionHeating: productData.power_consumption_heating ?? 
                               productData.electricity_heating_kw ?? 
                               null,
      OperatingTempRange: productData.operating_temp_range ?? null,
      IndoorDimensions: productData.indoor_dimensions ?? null,
      OutdoorDimensions: productData.outdoor_dimensions ?? null,
      NoiseLevel: productData.noise_level ?? null, // Now text field
      Warranty: productData.warranty_period ?? null,
      WarrantyPeriod: productData.warranty_period ?? null,
      RoomSizeRecommendation: productData.room_size_recommendation ?? null,
      InstallationType: productData.installation_type ?? null,
      Description: productData.description || `Premium ${productData.brand} ${productData.model} air conditioner with ${productData.energy_rating} energy efficiency rating.`,
      Features: productData.features ? (typeof productData.features === 'string' ? JSON.parse(productData.features) : productData.features) : [],
      IsFeatured: productData.is_featured ?? false,
      IsBestseller: productData.is_bestseller ?? false,
      IsNew: productData.is_new ?? false,
    };

    // Fetch accessories
    const { data: accessoriesData, error: accessoriesError } = await supabase
      .from('accessories')
      .select('*')
      .order('price', { ascending: true });

    if (accessoriesError) {
      console.error('Product page SSR: Error fetching accessories:', accessoriesError.message);
    }

    const transformedAccessories = (accessoriesData || []).map(acc => ({
      AccessoryID: acc.id,
      Name: acc.name,
      Description: '',
      Price: acc.price || 0,
      ImageURL: '/images/accessories/default.jpg',
      Category: 'General',
      IsAvailable: acc.active !== false,
      CreatedAt: acc.created_at,
    }));

    return {
      props: {
        ...(await serverSideTranslations(locale || 'bg', ['common'], i18nConfig)),
        initialProduct: transformedProduct,
        initialAccessories: transformedAccessories,
        error: null,
      },
    };
  } catch (error) {
    console.error('Product page SSR: Fatal error:', error.message);
    console.error('Stack trace:', error.stack);
    return {
      props: {
        ...(await serverSideTranslations(locale || 'bg', ['common'], i18nConfig)),
        initialProduct: null,
        initialAccessories: [],
        error: 'FATAL_ERROR',
      },
    };
  }
}

export default ProductDetailPage; 