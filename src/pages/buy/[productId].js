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
  console.log('[CLIENT] ProductDetailPage rendered with:', {
    hasInitialProduct: !!initialProduct,
    productId: initialProduct?.ProductID,
    accessoriesCount: initialAccessories?.length || 0,
    serverError: serverError
  });

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
    if (product.PowerConsumption) count++;
    if (product.AirFlow) count++;
    if (product.IndoorDimensions) count++;
    if (product.OutdoorDimensions) count++;
    if (product.IndoorWeight) count++;
    if (product.OutdoorWeight) count++;
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
  const [activeTab, setActiveTab] = useState('overview');

  // Debug log on mount
  useEffect(() => {
    console.log('[CLIENT] Component mounted with state:', {
      hasProduct: !!product,
      hasError: !!error,
      productId: product?.ProductID,
      serverError: serverError
    });
  }, []);

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
              
              {product.Description && (
                <p className={styles.description}>
                  {product.Description}
                </p>
              )}

              {/* Pricing */}
              <div className={styles.pricing}>
                {(() => {
                  const { discount, previousPrice, currentPrice } = getDynamicPricing();
                  return (
                    <>
                      <div className={styles.currentPrice}>
                        {formatPrice(currentPrice)}
                      </div>
                      <div className={styles.priceDetails}>
                        {discount > 0 && (
                          <>
                            <span className={styles.originalPrice}>
                              {formatPrice(previousPrice)}
                            </span>
                            <span className={styles.discount}>
                              -{discount}%
                            </span>
                          </>
                        )}
                      </div>
                      <div className={styles.eurPrice}>
                        {formatPriceEUR(currentPrice)}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Quick Specs */}
              <div className={styles.quickSpecs}>
                <div className={styles.quickSpec}>
                  <div className={styles.quickSpecLabel}>
                    {t('productDetail.specs.capacity')}
                  </div>
                  <div className={styles.quickSpecValue}>
                    {product.CapacityBTU?.toLocaleString()} BTU
                  </div>
                </div>
                <div className={styles.quickSpec}>
                  <div className={styles.quickSpecLabel}>
                    {t('productDetail.specs.energyRating')}
                  </div>
                  <div className={styles.quickSpecValue}>
                    {product.EnergyRating}
                  </div>
                </div>

                {product.RoomSizeRecommendation && (
                  <div className={styles.quickSpec}>
                    <div className={styles.quickSpecLabel}>
                      {t('productDetail.specs.roomSize')}
                      <span 
                        className={styles.infoIcon}
                        title={t('productDetail.tooltips.roomSizeRecommendation')}
                      >
                        ?
                      </span>
                    </div>
                    <div className={styles.quickSpecValue}>
                      {product.RoomSizeRecommendation}
                    </div>
                  </div>
                )}
                <div className={styles.quickSpec}>
                  <div className={styles.quickSpecLabel}>
                    {t('productDetail.specs.warranty')}
                  </div>
                  <div className={styles.quickSpecValue}>
                    {product.WarrantyPeriod || product.Warranty || t('productDetail.warranty.default')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className={styles.specsSection}>
            <h2 className={styles.sectionTitle}>
              {t('productDetail.technicalSpecs')}
            </h2>
            
            {/* Tab Navigation */}
            <div className={styles.specsTabs}>
              <button
                className={`${styles.specsTab} ${activeTab === 'overview' ? styles.active : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                {t('productDetail.specsTabs.overview')}
              </button>
              <button
                className={`${styles.specsTab} ${activeTab === 'technical' ? styles.active : ''}`}
                onClick={() => setActiveTab('technical')}
              >
                {t('productDetail.specsTabs.technical')}
              </button>
              <button
                className={`${styles.specsTab} ${activeTab === 'physical' ? styles.active : ''}`}
                onClick={() => setActiveTab('physical')}
              >
                {t('productDetail.specsTabs.physical')}
              </button>
            </div>

            {/* Overview Tab */}
            <div className={`${styles.specsTabContent} ${activeTab === 'overview' ? styles.active : ''}`}>
              <div className={styles.specsGrid}>
                {product.COP && renderSpecCard('⚡', 'COP', product.COP, t('productDetail.tooltips.cop'))}
                {product.SCOP && renderSpecCard('🔥', 'SCOP', product.SCOP, t('productDetail.tooltips.scop'))}
                {product.NoiseLevel && renderSpecCard('🔇', t('productDetail.specs.noise'), product.NoiseLevel, t('productDetail.tooltips.noiseLevel'))}
                {product.PowerConsumption && renderSpecCard('⚡', t('productDetail.specs.power'), product.PowerConsumption, t('productDetail.tooltips.powerConsumption'))}
                {product.AirFlow && renderSpecCard('💨', t('productDetail.specs.airflow'), product.AirFlow, t('productDetail.tooltips.airFlow'))}
                {product.OperatingTempRange && renderSpecCard('🌡️', t('productDetail.specs.operatingRange'), product.OperatingTempRange, t('productDetail.tooltips.operatingTempRange'))}
              </div>
            </div>

            {/* Technical Details Tab */}
            <div className={`${styles.specsTabContent} ${activeTab === 'technical' ? styles.active : ''}`}>
              <div className={styles.specsGrid}>
                {product.InstallationType && renderSpecCard('🔧', t('productDetail.specs.installation'), translateInstallationType(product.InstallationType), t('productDetail.tooltips.installationType'))}
                {product.Stock !== undefined && product.Stock !== null && renderSpecCard('📦', t('productDetail.specs.stock'), product.Stock > 0 ? `${product.Stock} ${t('productDetail.stock.available')}` : t('productDetail.stock.outOfStockShort'), t('productDetail.tooltips.stock'))}
              </div>
            </div>

            {/* Physical Characteristics Tab */}
            <div className={`${styles.specsTabContent} ${activeTab === 'physical' ? styles.active : ''}`}>
              <div className={styles.specsGrid}>
                {product.IndoorDimensions && renderSpecCard('🏠', t('productDetail.specs.indoorDimensions'), product.IndoorDimensions, t('productDetail.tooltips.dimensions'), true)}
                {product.OutdoorDimensions && renderSpecCard('🏢', t('productDetail.specs.outdoorDimensions'), product.OutdoorDimensions, t('productDetail.tooltips.dimensions'), true)}
                {product.IndoorWeight && renderSpecCard('⚖️', t('productDetail.specs.indoorWeight'), `${product.IndoorWeight} ${t('buyPage.physicalCharacteristics.kg')}`, t('productDetail.tooltips.weight'))}
                {product.OutdoorWeight && renderSpecCard('⚖️', t('productDetail.specs.outdoorWeight'), `${product.OutdoorWeight} ${t('buyPage.physicalCharacteristics.kg')}`, t('productDetail.tooltips.weight'))}
                {renderSpecCard('🎨', t('productDetail.specs.color'), product.Colour, t('productDetail.tooltips.color'))}
              </div>
            </div>
          </div>

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

        {/* Accessories & Options */}
        <div className={styles.optionsSection}>
          <h2 className={styles.sectionTitle}>
            {t('productDetail.options')}
          </h2>

          {/* Accessories */}
          <h3>{t('productDetail.accessories')}</h3>
          {accessoriesLoading ? (
            <div className={styles.accessoriesLoading}>
              <div className={styles.loadingText}>
                {t('productDetail.loadingAccessories')}...
              </div>
            </div>
          ) : accessories.length > 0 ? (
            <div className={styles.accessoriesGrid}>
              {accessories.map((accessory) => (
                <label
                  key={accessory.AccessoryID}
                  className={`${styles.accessoryCard} ${
                    selectedAccessories.includes(accessory.AccessoryID) ? styles.selected : ''
                  }`}
                >
                  <div className={styles.accessoryHeader}>
                    <div className={styles.accessoryInfo}>
                      <h4>{t(`productDetail.accessoryNames.${accessory.Name}`) || accessory.Name}</h4>
                      {accessory.Description && (
                        <div className={styles.accessoryDescription}>
                          {accessory.Description}
                        </div>
                      )}
                    </div>
                    <div className={styles.accessoryPriceAndCheckbox}>
                      <div className={styles.accessoryPrice}>
                        <div className={styles.priceMain}>{formatPrice(accessory.Price)}</div>
                        <div className={styles.priceSecondary}>{formatPriceEUR(accessory.Price)}</div>
                      </div>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selectedAccessories.includes(accessory.AccessoryID)}
                        onChange={() => toggleAccessory(accessory.AccessoryID)}
                      />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className={styles.noAccessories}>
              <p>{t('productDetail.noAccessories')}</p>
            </div>
          )}

          {/* Installation Option */}
          <label
            className={`${styles.installationOption} ${
              installationSelected ? styles.selected : ''
            }`}
          >
            <div className={styles.installationHeader}>
              <div className={styles.installationInfo}>
                <h3>{t('productDetail.installation.title')}</h3>
                <div className={styles.installationDescription}>
                  {t('productDetail.installation.description')} ({t('productDetail.installation.perUnit')})
                </div>
              </div>
              <div className={styles.installationPriceAndCheckbox}>
                <div className={styles.installationPrice}>
                  <div className={styles.priceMain}>{formatPrice(INSTALLATION_PRICE_PER_UNIT)} {t('productDetail.installation.perUnit')}</div>
                  <div className={styles.priceSecondary}>{formatPriceEUR(INSTALLATION_PRICE_PER_UNIT)} {t('productDetail.installation.perUnit')}</div>
                </div>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={installationSelected}
                  onChange={() => setInstallationSelected(!installationSelected)}
                />
              </div>
            </div>
          </label>

          {/* Price Summary */}
          <div className={styles.priceSummary}>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>
                {product.Brand} {product.Model} × {quantity}
              </span>
              <span className={styles.priceValue}>
                <div className={styles.priceMain}>{formatPrice(getDynamicPricing().currentPrice * quantity)}</div>
                <div className={styles.priceSecondary}>{formatPriceEUR(getDynamicPricing().currentPrice * quantity)}</div>
              </span>
            </div>
            {selectedAccessories.map(accessoryId => {
              const accessory = accessories.find(acc => acc.AccessoryID === accessoryId);
              if (!accessory) return null;
              return (
                <div key={accessoryId} className={styles.priceRow}>
                  <span className={styles.priceLabel}>
                    {t(`productDetail.accessoryNames.${accessory.Name}`) || accessory.Name} × {quantity}
                  </span>
                  <span className={styles.priceValue}>
                    <div className={styles.priceMain}>{formatPrice(accessory.Price * quantity)}</div>
                    <div className={styles.priceSecondary}>{formatPriceEUR(accessory.Price * quantity)}</div>
                  </span>
                </div>
              );
            })}
            {installationSelected && (
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>
                  {t('productDetail.priceBreakdown.installation')}
                </span>
                <span className={styles.priceValue}>
                  <div className={styles.priceMain}>{formatPrice(INSTALLATION_PRICE_PER_UNIT * quantity)}</div>
                  <div className={styles.priceSecondary}>{formatPriceEUR(INSTALLATION_PRICE_PER_UNIT * quantity)}</div>
                </span>
              </div>
            )}
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>
                <strong>{t('productDetail.total')}</strong>
              </span>
              <span className={`${styles.priceValue} ${styles.totalPrice}`}>
                <div className={styles.priceMain}>{formatPrice(getTotalPrice())}</div>
                <div className={styles.priceSecondary}>{formatPriceEUR(getTotalPrice())}</div>
              </span>
            </div>
          </div>

          {/* Add to Cart Section */}
          <div className={styles.addToCartSection}>
            <div className={styles.quantitySelector}>
              <label className={styles.quantityLabel}>
                {t('productDetail.quantity.label')}:
              </label>
              <button
                className={styles.quantityButton}
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                title={t('productDetail.quantity.min')}
              >
                −
              </button>
              <input
                type="number"
                className={styles.quantityInput}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                min="1"
                max="10"
                aria-label={t('productDetail.quantity.label')}
              />
              <button
                className={styles.quantityButton}
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 10}
                aria-label="Increase quantity"
                title={t('productDetail.quantity.max')}
              >
                +
              </button>
            </div>
            <button
              className={`${styles.addToCartButton} ${!hasConsent ? styles.consentRequired : ''}`}
              onClick={handleAddToCart}
              disabled={product.IsArchived || product.Stock === 0}
            >
              {product.IsArchived || product.Stock === 0
                ? t('productDetail.outOfStock')
                : !hasConsent 
                  ? t('consent.warning')
                  : t('productDetail.addToCart')
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps({ params, locale }) {
  console.log('[SSR] getServerSideProps called for productId:', params?.productId);
  
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
  console.log('[SSR] Checking env vars - URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL, 'KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[SSR] ERROR: Missing Supabase environment variables!');
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
    console.log('[SSR] Initializing Supabase client...');
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('[SSR] Fetching product data for ID:', productId);
    // Fetch product data
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('[SSR] Supabase error fetching product:', productError);
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
      console.error('[SSR] No product data returned for ID:', productId);
      return {
        props: {
          ...(await serverSideTranslations(locale || 'bg', ['common'], i18nConfig)),
          initialProduct: null,
          initialAccessories: [],
          error: 'PRODUCT_NOT_FOUND',
        },
      };
    }

    console.log('[SSR] Product data fetched successfully:', productData.id, productData.brand, productData.model);

    console.log('[SSR] Transforming product data...');
    // Transform product data
    const transformedProduct = {
      ProductID: productData.id,
      Brand: productData.brand,
      Model: productData.model,
      Colour: productData.colour,
      CapacityBTU: productData.capacity_btu,
      EnergyRating: productData.energy_rating,
      Price: productData.price,
      PreviousPrice: productData.previous_price,
      ImageURL: productData.image_url,
      Stock: productData.stock,
      Discount: productData.discount,
      IsArchived: productData.is_archived,
      CreatedAt: productData.created_at,
      UpdatedAt: productData.updated_at,
      COP: productData.cop,
      SCOP: productData.scop,
      PowerConsumption: productData.power_consumption,
      OperatingTempRange: productData.operating_temp_range,
      IndoorDimensions: productData.indoor_dimensions,
      OutdoorDimensions: productData.outdoor_dimensions,
      IndoorWeight: productData.indoor_weight,
      OutdoorWeight: productData.outdoor_weight,
      NoiseLevel: productData.noise_level,
      AirFlow: productData.air_flow,
      Warranty: productData.warranty_period,
      WarrantyPeriod: productData.warranty_period,
      RoomSizeRecommendation: productData.room_size_recommendation,
      InstallationType: productData.installation_type,
      Description: productData.description || `Premium ${productData.brand} ${productData.model} air conditioner with ${productData.energy_rating} energy efficiency rating.`,
      Features: productData.features ? (typeof productData.features === 'string' ? JSON.parse(productData.features) : productData.features) : [],
      IsFeatured: productData.is_featured || false,
      IsBestseller: productData.is_bestseller || false,
      IsNew: productData.is_new || false,
    };

    console.log('[SSR] Product transformed successfully. Fetching accessories...');
    // Fetch accessories
    const { data: accessoriesData, error: accessoriesError } = await supabase
      .from('accessories')
      .select('*')
      .order('price', { ascending: true });

    if (accessoriesError) {
      console.error('[SSR] Error fetching accessories:', accessoriesError);
    } else {
      console.log('[SSR] Fetched', accessoriesData?.length || 0, 'accessories');
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

    console.log('[SSR] Returning props with product:', transformedProduct.ProductID);
    return {
      props: {
        ...(await serverSideTranslations(locale || 'bg', ['common'], i18nConfig)),
        initialProduct: transformedProduct,
        initialAccessories: transformedAccessories,
        error: null,
      },
    };
  } catch (error) {
    console.error('[SSR] FATAL ERROR in getServerSideProps:', error);
    console.error('[SSR] Error stack:', error.stack);
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