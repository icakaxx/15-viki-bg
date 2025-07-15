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
  const { productId } = router.query;
  const { t } = useTranslation('common');
  const { addToCartEnhanced } = useCart();

  // Helper function to translate AC types
  const translateType = (type) => {
    if (!type) return '';
    const typeKey = type.toLowerCase();
    return t(`buyPage.types.${typeKey}`) || type;
  };

  // Helper function to count physical characteristics
  const getPhysicalCharacteristicsCount = () => {
    let count = 0;
    if (product.IndoorDimensions) count++;
    if (product.OutdoorDimensions) count++;
    if (product.IndoorWeight) count++;
    if (product.OutdoorWeight) count++;
    if (product.Colour) count++;
    if (product.RefrigerantType) count++;
    return count;
  };

  // State management
  const [product, setProduct] = useState(null);
  const [accessories, setAccessories] = useState([]);
  const [accessoriesLoading, setAccessoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [installationSelected, setInstallationSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Fixed installation price
  const INSTALLATION_PRICE = 300.00;

  // Fetch product data
  useEffect(() => {
    if (!productId) return;

    const fetchProductData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch product details
        const productResponse = await fetch(`/api/get-product?id=${productId}`);
        const productData = await productResponse.json();

        if (!productResponse.ok) {
          throw new Error(productData.error || 'Failed to load product');
        }

        setProduct(productData.product);
        setLoading(false);

        // Fetch accessories separately (non-blocking)
        try {
          setAccessoriesLoading(true);
          const accessoriesResponse = await fetch('/api/get-accessories');
          const accessoriesData = await accessoriesResponse.json();

          if (accessoriesResponse.ok) {
            console.log('✅ Loaded accessories:', accessoriesData.accessories?.length || 0, 'items');
            setAccessories(accessoriesData.accessories || []);
          } else {
            console.warn('⚠️ Failed to load accessories:', accessoriesData.error);
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

  const getAccessoryTotal = () => {
    return selectedAccessories.reduce((total, accId) => {
      const accessory = accessories.find(acc => acc.AccessoryID === accId);
      return total + (accessory?.Price || 0);
    }, 0);
  };

  const getTotalPrice = () => {
    const basePrice = product?.Price || 0;
    const accessoryTotal = getAccessoryTotal();
    const installationCost = installationSelected ? INSTALLATION_PRICE : 0;
    return (basePrice + accessoryTotal + installationCost) * quantity;
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
      INSTALLATION_PRICE
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
                {product.IsFeatured && (
                  <span style={{ 
                    backgroundColor: '#4CAF50', 
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ⭐ Featured
                  </span>
                )}
                {product.IsBestseller && (
                  <span style={{ 
                    backgroundColor: '#FF9800', 
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🏆 Bestseller
                  </span>
                )}
                {product.IsNew && (
                  <span style={{ 
                    backgroundColor: '#2196F3', 
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🆕 New
                  </span>
                )}
                {product.Discount > 0 && (
                  <span style={{ 
                    backgroundColor: '#F44336', 
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🔥 {product.Discount}% OFF
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
                <div className={styles.currentPrice}>
                  {formatPrice(product.Price)}
                </div>
                <div className={styles.priceDetails}>
                  {product.PreviousPrice && product.PreviousPrice > product.Price && (
                    <>
                      <span className={styles.originalPrice}>
                        {formatPrice(product.PreviousPrice)}
                      </span>
                      {discount && (
                        <span className={styles.discount}>
                          -{discount}%
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className={styles.eurPrice}>
                  {formatPriceEUR(product.Price)}
                </div>
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
                <div className={styles.quickSpec}>
                  <div className={styles.quickSpecLabel}>
                    {t('productDetail.specs.type')}
                  </div>
                  <div className={styles.quickSpecValue}>
                    {translateType(product.Type)}
                  </div>
                </div>
                {product.RoomSizeRecommendation && (
                  <div className={styles.quickSpec}>
                    <div className={styles.quickSpecLabel}>
                      Room Size
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
              {t('productDetail.technicalSpecs')} ({getPhysicalCharacteristicsCount()}/6)
            </h2>
            <div className={styles.specsGrid}>
              {product.COP && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>⚡</div>
                  <div className={styles.specName}>
                    COP
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.cop')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.COP}</div>
                </div>
              )}
              {product.SCOP && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>🔥</div>
                  <div className={styles.specName}>
                    SCOP
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.scop')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.SCOP}</div>
                </div>
              )}
              {product.NoiseLevel && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>🔇</div>
                  <div className={styles.specName}>
                    {t('productDetail.specs.noise')}
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.noiseLevel')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.NoiseLevel}</div>
                </div>
              )}
              {product.PowerConsumption && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>⚡</div>
                  <div className={styles.specName}>
                    {t('productDetail.specs.power')}
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.powerConsumption')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.PowerConsumption}</div>
                </div>
              )}
              {product.AirFlow && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>💨</div>
                  <div className={styles.specName}>
                    {t('productDetail.specs.airflow')}
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.airFlow')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.AirFlow}</div>
                </div>
              )}
              {product.IndoorDimensions && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>🏠</div>
                  <div className={styles.specName}>
                    {t('buyPage.physicalCharacteristics.indoorDimensions')}
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.dimensions')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.IndoorDimensions}</div>
                </div>
              )}
              {product.OutdoorDimensions && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>🏢</div>
                  <div className={styles.specName}>
                    {t('buyPage.physicalCharacteristics.outdoorDimensions')}
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.dimensions')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.OutdoorDimensions}</div>
                </div>
              )}
              {product.IndoorWeight && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>⚖️</div>
                  <div className={styles.specName}>
                    {t('buyPage.physicalCharacteristics.indoorWeight')}
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.weight')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.IndoorWeight} {t('buyPage.physicalCharacteristics.kg')}</div>
                </div>
              )}
              {product.OutdoorWeight && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>⚖️</div>
                  <div className={styles.specName}>
                    {t('buyPage.physicalCharacteristics.outdoorWeight')}
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.weight')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.OutdoorWeight} {t('buyPage.physicalCharacteristics.kg')}</div>
                </div>
              )}
              <div className={styles.specCard}>
                <div className={styles.specIcon}>🎨</div>
                <div className={styles.specName}>
                  {t('productDetail.specs.color')}
                  <span 
                    className={styles.infoIcon}
                    title={t('productDetail.tooltips.color')}
                  >
                    ?
                  </span>
                </div>
                <div className={styles.specValue}>{product.Colour}</div>
              </div>
              {product.RefrigerantType && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>❄️</div>
                  <div className={styles.specName}>
                    Refrigerant
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.refrigerantType')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.RefrigerantType}</div>
                </div>
              )}
              {product.OperatingTempRange && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>🌡️</div>
                  <div className={styles.specName}>
                    Operating Range
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.operatingTempRange')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.OperatingTempRange}</div>
                </div>
              )}
              {product.InstallationType && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>🔧</div>
                  <div className={styles.specName}>
                    Installation
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.installationType')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>{product.InstallationType}</div>
                </div>
              )}
              {product.Stock !== undefined && product.Stock !== null && (
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>📦</div>
                  <div className={styles.specName}>
                    Stock
                    <span 
                      className={styles.infoIcon}
                      title={t('productDetail.tooltips.stock')}
                    >
                      ?
                    </span>
                  </div>
                  <div className={styles.specValue}>
                    {product.Stock > 0 ? `${product.Stock} available` : 'Out of stock'}
                  </div>
                </div>
              )}
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
                    <span className={styles.featureText}>{feature}</span>
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
                  {t('productDetail.installation.description')}
                </div>
              </div>
              <div className={styles.installationPriceAndCheckbox}>
                <div className={styles.installationPrice}>
                  <div className={styles.priceMain}>{formatPrice(INSTALLATION_PRICE)}</div>
                  <div className={styles.priceSecondary}>{formatPriceEUR(INSTALLATION_PRICE)}</div>
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
                  <div className={styles.priceMain}>{formatPrice(INSTALLATION_PRICE)}</div>
                  <div className={styles.priceSecondary}>{formatPriceEUR(INSTALLATION_PRICE)}</div>
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
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default ProductDetailPage; 