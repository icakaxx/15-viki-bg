import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import PriceFilter from '../components/PriceFilter';
import QuantitySelector from '../components/QuantitySelector';
// Layout is already provided by _app.js, no need to import
import styles from '../styles/Page Styles/BuyPage.module.css';
import Image from 'next/image';

const BuyPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation('common');
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
  
  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className={styles.skeletonGrid}>
      {[...Array(6)].map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonImage}></div>
          <div className={`${styles.skeletonText} ${styles.skeletonText.short}`}></div>
          <div className={`${styles.skeletonText} ${styles.skeletonText.medium}`}></div>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      ))}
    </div>
  );

  // Handle hydration safely
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Filter states
  const [filters, setFilters] = useState({
    brands: [],
    types: [],
    capacities: [],
    energyRatings: [],
    colors: [],
    priceRange: { min: 0, max: 3000 }
  });

  // Temporary filters for mobile (applied only when user hits "Apply")
  const [tempMobileFilters, setTempMobileFilters] = useState(null);

  // Price bounds state
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 10000 });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Include archived products so they show as "out of stock"
        const response = await fetch('/api/get-products?showArchived=true');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        const productsArray = data.products || data || [];
        setProducts(productsArray);
        
        // Set initial price range based on products
        if (productsArray.length > 0) {
          const prices = productsArray.map(p => p.Price);
          const calculatedMinPrice = Math.floor(Math.min(...prices) / 100) * 100;
          const calculatedMaxPrice = Math.ceil(Math.max(...prices) / 100) * 100;
          
          // Update the price bounds state
          setPriceBounds({ min: calculatedMinPrice, max: calculatedMaxPrice });
          
          // Only set the initial range if it hasn't been set yet
          setFilters(prev => ({
            ...prev,
            priceRange: { 
              min: calculatedMinPrice, 
              max: calculatedMaxPrice 
            }
          }));
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch products after component is mounted (client-side)
    if (mounted) {
      fetchProducts();
    }
  }, [mounted]);

  // Get unique filter options and counts
  const filterOptions = useMemo(() => {
    const brands = {};
    const types = {};
    const capacities = {};
    const energyRatings = {};
    const colors = {};

    products.forEach(product => {
      // Count brands
      brands[product.Brand] = (brands[product.Brand] || 0) + 1;
      
      // Count types
      types[product.Type] = (types[product.Type] || 0) + 1;
      
      // Count capacities
      const capacity = product.CapacityBTU;
      capacities[capacity] = (capacities[capacity] || 0) + 1;
      
      // Count energy ratings
      energyRatings[product.EnergyRating] = (energyRatings[product.EnergyRating] || 0) + 1;
      
      // Count colors
      if (product.Colour) {
        colors[product.Colour] = (colors[product.Colour] || 0) + 1;
      }
    });

    return { brands, types, capacities, energyRatings, colors };
  }, [products]);

  // Get unique values for filters
  const uniqueBrands = [...new Set(products.map(p => p.Brand))].filter(Boolean).sort();
  const uniqueTypes = [...new Set(products.map(p => p.Type))].filter(Boolean).sort();
  const uniqueCapacities = [...new Set(products.map(p => p.CapacityBTU))].filter(val => val != null && val !== undefined && !isNaN(val)).sort((a, b) => a - b);
  const uniqueEnergyRatings = [...new Set(products.map(p => p.EnergyRating))].filter(Boolean).sort();
  const uniqueColors = [...new Set(products.map(p => p.Colour))].filter(Boolean).sort();

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    const activeFilters = tempMobileFilters || filters;
    
    return products.filter(product => {
      // Brand filter
      if (activeFilters.brands.length > 0 && !activeFilters.brands.includes(product.Brand)) {
        return false;
      }
      
      // Type filter
      if (activeFilters.types.length > 0 && !activeFilters.types.includes(product.Type)) {
        return false;
      }
      
      // Capacity filter
      if (activeFilters.capacities.length > 0 && !activeFilters.capacities.includes(product.CapacityBTU)) {
        return false;
      }
      
      // Energy rating filter
      if (activeFilters.energyRatings.length > 0 && !activeFilters.energyRatings.includes(product.EnergyRating)) {
        return false;
      }
      
      // Color filter
      if (activeFilters.colors.length > 0 && !activeFilters.colors.includes(product.Colour)) {
        return false;
      }
      
      // Price range filter
      if (product.Price < activeFilters.priceRange.min || product.Price > activeFilters.priceRange.max) {
        return false;
      }
      
      return true;
    });
  }, [products, filters, tempMobileFilters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, tempMobileFilters]);

  const handleFilterChange = (filterType, value) => {
    const updateFunction = tempMobileFilters ? setTempMobileFilters : setFilters;
    updateFunction(prev => {
      const newFilters = { ...prev };
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = prev[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...prev[filterType], value];
      }
      return newFilters;
    });
  };

  const handlePriceChange = (min, max) => {
    const updateFunction = tempMobileFilters ? setTempMobileFilters : setFilters;
    updateFunction(prev => ({
      ...prev,
      priceRange: { min, max }
    }));
  };

  const clearAllFilters = () => {
    // Calculate the default price range from actual products
    const productPrices = products.map(p => p.Price);
    const actualMinPrice = productPrices.length > 0 ? Math.floor(Math.min(...productPrices) / 100) * 100 : 0;
    const actualMaxPrice = productPrices.length > 0 ? Math.ceil(Math.max(...productPrices) / 100) * 100 : 10000;
    
    const defaultFilters = {
      brands: [],
      types: [],
      capacities: [],
      energyRatings: [],
      colors: [],
      priceRange: { min: actualMinPrice, max: actualMaxPrice }
    };
    
    if (tempMobileFilters) {
      setTempMobileFilters(defaultFilters);
    } else {
      setFilters(defaultFilters);
    }
  };

  // Mobile filter handlers
  const openMobileFilters = () => {
    // Create a clean copy of current filters for mobile editing
    setTempMobileFilters({
      brands: [...filters.brands],
      types: [...filters.types],
      capacities: [...filters.capacities],
      energyRatings: [...filters.energyRatings],
      colors: [...filters.colors],
      priceRange: { ...filters.priceRange }
    });
    setMobileFiltersOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeMobileFilters = () => {
    setMobileFiltersOpen(false);
    setTempMobileFilters(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  const applyMobileFilters = () => {
    if (tempMobileFilters) {
      setFilters(tempMobileFilters);
    }
    closeMobileFilters();
  };

  const getActiveFilterCount = () => {
    const activeFilters = tempMobileFilters || filters;
    let count = 0;
    count += activeFilters.brands.length;
    count += activeFilters.types.length;
    count += activeFilters.capacities.length;
    count += activeFilters.energyRatings.length;
    count += activeFilters.colors.length;
    
    // Only count price range as active if user has manually changed it from the product-based range
    const productPrices = products.map(p => p.Price);
    if (productPrices.length > 0) {
      const actualMinPrice = Math.floor(Math.min(...productPrices) / 100) * 100;
      const actualMaxPrice = Math.ceil(Math.max(...productPrices) / 100) * 100;
      
      if (activeFilters.priceRange.min !== actualMinPrice || activeFilters.priceRange.max !== actualMaxPrice) {
        count += 1;
      }
    }
    
    return count;
  };



  const calculateDiscount = (price, previousPrice) => {
    if (!previousPrice || previousPrice <= price) return null;
    return Math.round(((previousPrice - price) / previousPrice) * 100);
  };

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return '€0.00';
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN'
    }).format(price);
  };

  const formatPriceEUR = (price) => {
    if (price == null || isNaN(price)) return '€0.00';
    // BGN to EUR conversion rate (approximate - 1 EUR = 1.96 BGN)
    const eurPrice = price / 1.96;
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(eurPrice);
  };

  // Helper function to translate AC types
  const translateType = (type) => {
    if (!type) return '';
    const typeKey = type.toLowerCase();
    return t(`buyPage.types.${typeKey}`) || type;
  };

  // Handle escape key and back button
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && mobileFiltersOpen) {
        closeMobileFilters();
      }
    };

    const handlePopState = () => {
      if (mobileFiltersOpen) {
        closeMobileFilters();
      }
    };

    if (mobileFiltersOpen) {
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [mobileFiltersOpen]);

  // Touch gesture handling for bottom sheet
  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      if (!mobileFiltersOpen) return;
      
      const panel = document.querySelector(`.${styles.mobileFilterPanel}`);
      if (!panel || !panel.contains(e.target)) return;
      
      startY = e.touches[0].clientY;
      isDragging = true;
      panel.style.transition = 'none';
    };

    const handleTouchMove = (e) => {
      if (!isDragging || !mobileFiltersOpen) return;
      
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 0) { // Only allow downward drag
        const panel = document.querySelector(`.${styles.mobileFilterPanel}`);
        if (panel) {
          panel.style.transform = `translateY(${deltaY}px)`;
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging || !mobileFiltersOpen) return;
      
      const panel = document.querySelector(`.${styles.mobileFilterPanel}`);
      if (panel) {
        panel.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        const deltaY = currentY - startY;
        if (deltaY > 100) { // Threshold for closing
          closeMobileFilters();
        } else {
          panel.style.transform = 'translateY(0)';
        }
      }
      
      isDragging = false;
    };

    if (mobileFiltersOpen) {
      document.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [mobileFiltersOpen]);

  const FilterSidebar = ({ isMobile = false }) => {
    const currentFilters = isMobile ? (tempMobileFilters || filters) : filters;
    const filterChangeHandler = isMobile ? 
      (filterType, value) => handleFilterChange(filterType, value) :
      handleFilterChange;
    const priceChangeHandler = isMobile ? handlePriceChange : handlePriceChange;



    return (
      <div className={styles.filterSidebar}>
        <div className={styles.filterSidebarContent}>
          <div className={styles.filterSidebarHeader}>
            {!isMobile && (
              <>
                <h2 className={styles.filterTitle}>{t('buyPage.filters.title')}</h2>
                <br/>
                <button 
                  onClick={clearAllFilters}
                  className={styles.clearButton}>
                  {t('buyPage.filters.clearAll')}
                </button>
              </>
            )}
          </div>
          
          <div className={styles.filterSidebarBody}>
            {/* Brand Filter */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.brand')}</h3>
              <div className={styles.filterOptions}>
                {uniqueBrands.map(brand => (
                  <label key={brand} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      className={styles.filterCheckbox}
                      checked={currentFilters.brands.includes(brand)}
                      onChange={() => filterChangeHandler('brands', brand)}
                    />
                    <span className={styles.filterLabel}>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.type')}</h3>
              <div className={styles.filterOptions}>
                {uniqueTypes.map(type => (
                  <label key={type} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      className={styles.filterCheckbox}
                      checked={currentFilters.types.includes(type)}
                      onChange={() => filterChangeHandler('types', type)}
                    />
                    <span className={styles.filterLabel}>{translateType(type)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Capacity Filter */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.capacity')}</h3>
              <div className={styles.filterOptions}>
                {uniqueCapacities.map(capacity => (
                  <label key={capacity} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      className={styles.filterCheckbox}
                      checked={currentFilters.capacities.includes(parseInt(capacity))}
                      onChange={() => filterChangeHandler('capacities', parseInt(capacity))}
                    />
                    <span className={styles.filterLabel}>{capacity ? capacity.toLocaleString() : capacity} BTU</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Energy Rating Filter */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.energyRating')}</h3>
              <div className={styles.filterOptions}>
                {uniqueEnergyRatings.map(rating => (
                  <label key={rating} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      className={styles.filterCheckbox}
                      checked={currentFilters.energyRatings.includes(rating)}
                      onChange={() => filterChangeHandler('energyRatings', rating)}
                    />
                    <span className={styles.filterLabel}>{rating}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            {uniqueColors.length > 0 && (
              <div className={styles.filterGroup}>
                <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.color')}</h3>
                <div className={styles.filterOptions}>
                  {uniqueColors.map(color => (
                    <label key={color} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        className={styles.filterCheckbox}
                        checked={currentFilters.colors.includes(color)}
                        onChange={() => filterChangeHandler('colors', color)}
                      />
                      <span className={styles.filterLabel}>{color}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <PriceFilter
              minValue={currentFilters.priceRange.min}
              maxValue={currentFilters.priceRange.max}
              onPriceChange={priceChangeHandler}
              minBound={priceBounds.min}
              maxBound={priceBounds.max}
            />
          </div>
        </div>
      </div>
    );
  };

  // Show loading state during hydration or when fetching
  if (!mounted || loading) {
    return (
      <>
        <Head>
          <title>Buy ACs - BGVIKI15 Ltd</title>
          <meta name="description" content="Air conditioners and climate solutions" />
        </Head>
        <div className={styles.container}>
          <h1 className={styles.title}>Buy ACs</h1>
          <SkeletonLoader />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>{`${t('buyPage.title')} - ${t('metaTitle')}`}</title>
          <meta name="description" content={t('metaDescription')} />
        </Head>
        <div className={styles.container}>
          <h1 className={styles.title}>{t('buyPage.title')}</h1>
          <div className={styles.error}>{t('buyPage.error')}: {error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${t('buyPage.title')} - ${t('metaTitle')}`}</title>
        <meta name="description" content={t('metaDescription')} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={`${t('buyPage.title')} - ${t('metaTitle')}`} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta property="og:type" content="website" />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('buyPage.title')}</h1>
        
        <div className={styles.pageLayout}>
          {/* Desktop Sidebar */}
          <div className={styles.sidebarContainer}>
            <FilterSidebar />
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Mobile Filter Toggle */}
            <button
              className={styles.mobileFilterToggle}
              onClick={openMobileFilters}
            >
              {t('buyPage.filters.title')} ({getActiveFilterCount()})
            </button>

            {/* Results Header */}
            <div className={styles.resultsHeader}>
              <div className={styles.resultsCount}>
                {filteredProducts.length > 0 ? (
                  <>
                    {t ? 
                      `${t('buyPage.pagination.showing')} ${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)} ${t('buyPage.pagination.of')} ${filteredProducts.length} ${t('buyPage.filters.results')}` :
                      `Showing ${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)} of ${filteredProducts.length} results`
                    }
                    {totalPages > 1 && (
                      <span className={styles.pageInfo}>
                        {t ? ` (${t('buyPage.pagination.page')} ${currentPage} ${t('buyPage.pagination.of')} ${totalPages})` : ` (Page ${currentPage} of ${totalPages})`}
                      </span>
                    )}
                  </>
                ) : (
                  t ? `${t('buyPage.filters.showingResults')} 0 ${t('buyPage.filters.results')}` : 'Showing 0 results'
                )}
              </div>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className={styles.noProducts}>
                {getActiveFilterCount() > 0 ? 
                  t('buyPage.filters.noResults') : 
                  t('buyPage.noProducts')}
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {currentProducts.map((product, index) => {
                  const discount = calculateDiscount(product.Price, product.PreviousPrice);
                  
                  return (
                    <div key={product.ProductID} className={`${styles.card} ${product.IsArchived ? styles.outOfStock : ''}`}>
                      {/* Out of Stock Overlay for Archived Products */}
                      {product.IsArchived && (
                        <div className={styles.outOfStockOverlay}>
                          <div className={styles.outOfStockText}>
                            Out of Stock
                          </div>
                        </div>
                      )}
                      
                      {/* Clickable Product Info Section */}
                      <Link href={`/buy/${product.ProductID}`} className={styles.productLink}>
                        {/* Promotional Badges */}
                        {(product.IsFeatured || product.IsBestseller || product.IsNew) && (
                          <div className={styles.promotionalBadges}>
                            {product.IsFeatured && (
                              <span className={styles.badge} title={t('buyPage.badges.featured')}>
                                ⭐
                              </span>
                            )}
                            {product.IsBestseller && (
                              <span className={styles.badge} title={t('buyPage.badges.bestseller')}>
                                🏆
                              </span>
                            )}
                            {product.IsNew && (
                              <span className={styles.badge} title={t('buyPage.badges.new')}>
                                🆕
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className={styles.imageContainer}>
                          <Image
                            src={product.ImageURL || '/images/placeholder-ac.svg'}
                            alt={`${product.Brand} ${product.Model}`}
                            fill
                            className={styles.image}
                            priority={index < 6} // Priority loading for first 6 images
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            quality={85}
                          />
                        </div>
                        
                        <div className={styles.productInfo}>
                          <h2 className={styles.brandModel}>
                            {product.Brand} {product.Model}
                          </h2>
                          
                          <div className={styles.specs}>
                            <div className={styles.spec}>
                              <span className={styles.specLabel}>{t('buyPage.type')}:</span> {translateType(product.Type)}
                            </div>
                            <div className={styles.spec}>
                              <span className={styles.specLabel}>{t('buyPage.capacity')}:</span> {product.CapacityBTU} {t('buyPage.btu')}
                            </div>
                            <div className={styles.spec}>
                              <span className={styles.specLabel}>{t('buyPage.energyRating')}:</span> {product.EnergyRating}
                            </div>
                            {product.Colour && (
                              <div className={styles.spec}>
                                <span className={styles.specLabel}>{t('buyPage.color')}:</span> {product.Colour}
                              </div>
                            )}
                            {product.NoiseLevel && (
                              <div className={styles.spec}>
                                <span className={styles.specLabel}>{t('buyPage.noiseLevel')}:</span> {product.NoiseLevel}
                              </div>
                            )}
                            {product.WarrantyPeriod && (
                              <div className={styles.spec}>
                                <span className={styles.specLabel}>{t('buyPage.warranty')}:</span> {product.WarrantyPeriod}
                              </div>
                            )}
                          </div>
                          
                          {/* Feature Icons */}
                          <div className={styles.featureIcons}>
                            {product.Features && product.Features.some(feature => 
                              feature.toLowerCase().includes('wifi') || 
                              feature.toLowerCase().includes('smart')
                            ) && (
                              <span className={styles.featureIcon} title={t('buyPage.features.wifi')}>
                                📱
                              </span>
                            )}
                            {product.Features && product.Features.some(feature => 
                              feature.toLowerCase().includes('inverter')
                            ) && (
                              <span className={styles.featureIcon} title={t('buyPage.features.inverter')}>
                                ⚡
                              </span>
                            )}
                            {product.Features && product.Features.some(feature => 
                              feature.toLowerCase().includes('heat') || 
                              feature.toLowerCase().includes('heating')
                            ) && (
                              <span className={styles.featureIcon} title={t('buyPage.features.heatPump')}>
                                🔥
                              </span>
                            )}
                            {product.Features && product.Features.some(feature => 
                              feature.toLowerCase().includes('eco') || 
                              feature.toLowerCase().includes('energy')
                            ) && (
                              <span className={styles.featureIcon} title={t('buyPage.features.eco')}>
                                🌱
                              </span>
                            )}
                          </div>
                          
                          {/* Stock Status */}
                          <div className={styles.stockStatus}>
                            {product.IsArchived ? (
                              <span className={`${styles.stockBadge} ${styles.outOfStock}`}>
                                {t('buyPage.outOfStock')}
                              </span>
                            ) : product.Stock <= 3 && product.Stock > 0 ? (
                              <span className={`${styles.stockBadge} ${styles.lowStock}`}>
                                {t('buyPage.lowStock')}
                              </span>
                            ) : (
                              <span className={`${styles.stockBadge} ${styles.inStock}`}>
                                {t('buyPage.inStock')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className={styles.pricing}>
                          <div className={styles.priceContainer}>
                            <span className={styles.price}>
                              {formatPrice(product.Price)} / {formatPriceEUR(product.Price)}
                            </span>
                          </div>
                          {product.PreviousPrice && product.PreviousPrice > product.Price && (
                            <>
                              <div className={styles.previousPriceContainer}>
                                <span className={styles.previousPrice}>
                                  {formatPrice(product.PreviousPrice)} / {formatPriceEUR(product.PreviousPrice)}
                                </span>
                              </div>
                              {discount && (
                                <span className={styles.discount}>-{discount}%</span>
                              )}
                            </>
                          )}
                          <div className={styles.installationInfo}>
                            <span className={styles.installationLabel}>{t('buyPage.installationCost')}</span>
                            <span className={styles.installationPrice}>+300 BGN / €153</span>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Quantity Selector stays outside Link to maintain functionality */}
                      <QuantitySelector product={product} />
                    </div>
                  );
                })}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {t ? t('buyPage.pagination.previous') : 'Previous'}
                    </button>
                    
                    <div className={styles.pageNumbers}>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === currentPage;
                        
                        // Show first page, last page, current page, and pages around current
                        const showPage = pageNumber === 1 || 
                                        pageNumber === totalPages || 
                                        Math.abs(pageNumber - currentPage) <= 2;
                        
                        if (!showPage) {
                          // Show ellipsis for gaps
                          if (pageNumber === 2 && currentPage > 4) {
                            return <span key={pageNumber} className={styles.ellipsis}>...</span>;
                          }
                          if (pageNumber === totalPages - 1 && currentPage < totalPages - 3) {
                            return <span key={pageNumber} className={styles.ellipsis}>...</span>;
                          }
                          return null;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            className={`${styles.pageNumber} ${isCurrentPage ? styles.active : ''}`}
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {t ? t('buyPage.pagination.next') : 'Next'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        <div className={`${styles.mobileFilterOverlay} ${mobileFiltersOpen ? styles.active : ''}`}
             onClick={closeMobileFilters}>
          <div className={`${styles.mobileFilterPanel} ${mobileFiltersOpen ? styles.active : ''}`}
               onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.mobileFilterHeader}>
              <h2 className={styles.filterTitle}>{t('buyPage.filters.title')}</h2>
              <div className={styles.mobileFilterHeaderActions}>
                <button 
                  className={styles.mobileClearButton}
                  onClick={clearAllFilters}>
                  {t('buyPage.filters.clearAll')}
                </button>
                <button 
                  className={styles.mobileCloseButton}
                  onClick={closeMobileFilters}
                  aria-label={t('buyPage.filters.close')}>
                  ✕
                </button>
              </div>
            </div>
            
            {/* Mobile Filter Content */}
            <div className={styles.mobileFilterContent}>
              {/* Brand Filter */}
              <div className={styles.filterGroup}>
                <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.brand')}</h3>
                <div className={styles.filterOptions}>
                  {uniqueBrands.map(brand => (
                    <label key={brand} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        className={styles.filterCheckbox}
                        checked={(tempMobileFilters || filters).brands.includes(brand)}
                        onChange={() => handleFilterChange('brands', brand)}
                      />
                      <span className={styles.filterLabel}>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Type Filter */}
              <div className={styles.filterGroup}>
                <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.type')}</h3>
                <div className={styles.filterOptions}>
                  {uniqueTypes.map(type => (
                    <label key={type} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        className={styles.filterCheckbox}
                        checked={(tempMobileFilters || filters).types.includes(type)}
                        onChange={() => handleFilterChange('types', type)}
                      />
                      <span className={styles.filterLabel}>{translateType(type)}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Capacity Filter */}
              <div className={styles.filterGroup}>
                <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.capacity')}</h3>
                <div className={styles.filterOptions}>
                  {uniqueCapacities.map(capacity => (
                    <label key={capacity} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        className={styles.filterCheckbox}
                        checked={(tempMobileFilters || filters).capacities.includes(parseInt(capacity))}
                        onChange={() => handleFilterChange('capacities', parseInt(capacity))}
                      />
                      <span className={styles.filterLabel}>{capacity ? capacity.toLocaleString() : capacity} BTU</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Energy Rating Filter */}
              <div className={styles.filterGroup}>
                <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.energyRating')}</h3>
                <div className={styles.filterOptions}>
                  {uniqueEnergyRatings.map(rating => (
                    <label key={rating} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        className={styles.filterCheckbox}
                        checked={(tempMobileFilters || filters).energyRatings.includes(rating)}
                        onChange={() => handleFilterChange('energyRatings', rating)}
                      />
                      <span className={styles.filterLabel}>{rating}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Color Filter */}
              {uniqueColors.length > 0 && (
                <div className={styles.filterGroup}>
                  <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.color')}</h3>
                  <div className={styles.filterOptions}>
                    {uniqueColors.map(color => (
                      <label key={color} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          className={styles.filterCheckbox}
                          checked={(tempMobileFilters || filters).colors.includes(color)}
                          onChange={() => handleFilterChange('colors', color)}
                        />
                        <span className={styles.filterLabel}>{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Price Filter */}
              <div className={styles.filterGroup}>
                <PriceFilter
                  minValue={(tempMobileFilters || filters).priceRange.min}
                  maxValue={(tempMobileFilters || filters).priceRange.max}
                  onPriceChange={handlePriceChange}
                  minBound={priceBounds.min}
                  maxBound={priceBounds.max}
                />
              </div>
            </div>
            
            <div className={styles.mobileFilterActions}>
              <button 
                className={styles.mobileClearButton}
                onClick={clearAllFilters}>
                {t('buyPage.filters.clearAll')}
              </button>
              <button 
                className={styles.mobileApplyButton}
                onClick={applyMobileFilters}>
                {t('buyPage.filters.apply')} ({getActiveFilterCount()})
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticProps({ locale }) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default BuyPage; 