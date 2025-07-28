import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useCart } from '../../contexts/CartContext';
import styles from '../../styles/Page Styles/ProductDetail.module.css';

const ProductDetailPage = () => {
  const router = useRouter();
  const { productId, qty } = router.query;
  const { t } = useTranslation('common');
  const { addToCartEnhanced } = useCart();



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

  // State management
  const [product, setProduct] = useState(null);
  const [accessories, setAccessories] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [accessoriesLoading, setAccessoriesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  // Fetch product data
  useEffect(() => {
    if (!productId) return;

    const fetchProductData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch product details
        // Force the correct port based on current server
        const baseUrl = window.location.origin;
        const productApiUrl = `${baseUrl}/api/get-product?id=${productId}`;
        const productResponse = await fetch(productApiUrl);
        const productData = await productResponse.json();

        if (!productResponse.ok) {
          throw new Error(productData.error || 'Failed to load product');
        }

        setProduct(productData.product);
        setLoading(false);

        // Fetch accessories separately (non-blocking)
        try {
          setAccessoriesLoading(true);
          const accessoriesApiUrl = `${baseUrl}/api/get-accessories`;
          const accessoriesResponse = await fetch(accessoriesApiUrl);
          const accessoriesData = await accessoriesResponse.json();

          if (accessoriesResponse.ok) {
            setAccessories(accessoriesData.accessories || []);
          } else {
            setAccessories([]); // Fallback to empty array
          }
        } catch (accessoryErr) {
          console.error('❌ Error fetching accessories:', accessoryErr);
          setAccessories([]); // Fallback to empty array
        } finally {
          setAccessoriesLoading(false);
        }

      } catch (err) {
        console.error('Error fetching product data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

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

    const selectedAccessoryObjects = selectedAccessories.map(accId => 
      accessories.find(acc => acc.AccessoryID === accId)
    ).filter(Boolean);

    // Use enhanced cart functionality
    addToCartEnhanced(
      product, 
      quantity, 
      selectedAccessoryObjects, 
      installationSelected, 
      INSTALLATION_PRICE_PER_UNIT
    );

    // Navigate to checkout
    router.push('/checkout');
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Head>
          <title>{t('productDetail.loading')} - {t('metaTitle')}</title>
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
          <title>{t('productDetail.notFound')} - {t('metaTitle')}</title>
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
                {product.InstallationType && renderSpecCard('🔧', t('productDetail.specs.installation'), product.InstallationType, t('productDetail.tooltips.installationType'))}
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
                <div className={styles.priceMain}>{formatPrice(product.Price * quantity)}</div>
                <div className={styles.priceSecondary}>{formatPriceEUR(product.Price * quantity)}</div>
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
              className={styles.addToCartButton}
              onClick={handleAddToCart}
              disabled={product.IsArchived || product.Stock === 0}
            >
              {product.IsArchived || product.Stock === 0
                ? t('productDetail.outOfStock')
                : t('productDetail.addToCart')
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export async function getStaticProps({ locale }) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  
  return {
    props: {
      ...(await serverSideTranslations(locale || 'bg', ['common'])),
    },
  };
}

export default ProductDetailPage; 