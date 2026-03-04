import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import PriceFilter from '../components/PriceFilter';
import QuantitySelector from '../components/QuantitySelector';
import styles from '../styles/Page Styles/Products.module.css';
import Image from 'next/image';
import { fetchProductsServer } from '../lib/supabaseServer';

const PRODUCTS_PER_PAGE = 20;
const SITE_URL = 'https://www.hc-clima.bg';

const BuyPage = ({ 
  initialProducts = [], 
  totalProducts = 0, 
  currentPage = 1, 
  pageSize = PRODUCTS_PER_PAGE,
  ssrError = null,
  ssrSortBy = 'default',
  ssrSearch = '',
  filterOptions = { brands: [], capacities: [], energyRatings: [], colors: [] },
  priceBounds = { min: 0, max: 10000 }
}) => {
  const [products] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error] = useState(ssrError);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { t } = useTranslation('common');
  const router = useRouter();
  
  const [filters, setFilters] = useState({
    brands: [],
    capacities: [],
    energyRatings: [],
    colors: [],
    priceRange: { min: priceBounds.min, max: priceBounds.max }
  });

  const [sortBy, setSortBy] = useState(ssrSortBy);
  const [searchTerm, setSearchTerm] = useState(ssrSearch);
  const [tempMobileFilters, setTempMobileFilters] = useState(null);
  
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

  const totalPages = Math.ceil(totalProducts / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalProducts);

  const updateUrlAndNavigate = useCallback((newParams) => {
    setLoading(true);
    const query = { ...router.query };
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === 1 || value === 'default') {
        delete query[key];
      } else {
        query[key] = String(value);
      }
    });
    
    router.push({ pathname: '/buy', query }, undefined, { scroll: false });
  }, [router]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    updateUrlAndNavigate({ page: newPage === 1 ? null : newPage });
  }, [currentPage, totalPages, updateUrlAndNavigate]);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
    updateUrlAndNavigate({ sortBy: newSortBy === 'default' ? null : newSortBy, page: null });
  }, [updateUrlAndNavigate]);

  const handleSearchSubmit = useCallback((e) => {
    e?.preventDefault();
    updateUrlAndNavigate({ search: searchTerm || null, page: null });
  }, [searchTerm, updateUrlAndNavigate]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    router.replace(router.asPath);
  }, [router]);

  useEffect(() => {
    setLoading(false);
  }, [initialProducts, currentPage]);

  const uniqueBrands = filterOptions.brands;
  const uniqueCapacities = filterOptions.capacities;
  const uniqueEnergyRatings = filterOptions.energyRatings;
  const uniqueColors = filterOptions.colors;

  const filteredProducts = useMemo(() => {
    const activeFilters = tempMobileFilters || filters;
    
    return products.filter(product => {
      if (activeFilters.brands.length > 0 && !activeFilters.brands.includes(product.Brand)) {
        return false;
      }
      if (activeFilters.capacities.length > 0 && !activeFilters.capacities.includes(product.CapacityBTU)) {
        return false;
      }
      if (activeFilters.energyRatings.length > 0 && !activeFilters.energyRatings.includes(product.EnergyRating)) {
        return false;
      }
      if (activeFilters.colors.length > 0 && !activeFilters.colors.includes(product.Colour)) {
        return false;
      }
      if (product.Price < activeFilters.priceRange.min || product.Price > activeFilters.priceRange.max) {
        return false;
      }
      return true;
    });
  }, [products, filters, tempMobileFilters]);

  const displayProducts = filteredProducts;

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
    const defaultFilters = {
      brands: [],
      capacities: [],
      energyRatings: [],
      colors: [],
      priceRange: { min: priceBounds.min, max: priceBounds.max }
    };
    
    if (tempMobileFilters) {
      setTempMobileFilters(defaultFilters);
    } else {
      setFilters(defaultFilters);
    }
  };

  const openMobileFilters = () => {
    setTempMobileFilters({
      brands: [...filters.brands],
      capacities: [...filters.capacities],
      energyRatings: [...filters.energyRatings],
      colors: [...filters.colors],
      priceRange: { ...filters.priceRange }
    });
    setMobileFiltersOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMobileFilters = () => {
    setMobileFiltersOpen(false);
    setTempMobileFilters(null);
    document.body.style.overflow = 'unset';
  };

  const handleFilterChangeMobileSafe = (filterType, value) => {
    if (!mobileFiltersOpen) return;
    handleFilterChange(filterType, value);
  };

  const handlePriceChangeMobileSafe = (min, max) => {
    if (!mobileFiltersOpen) return;
    handlePriceChange(min, max);
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
    count += activeFilters.capacities.length;
    count += activeFilters.energyRatings.length;
    count += activeFilters.colors.length;
    
    if (activeFilters.priceRange.min !== priceBounds.min || activeFilters.priceRange.max !== priceBounds.max) {
      count += 1;
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
    const eurPrice = price / 1.95583;
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR'
    }).format(eurPrice);
  };

  const translateFeature = (feature) => {
    if (!feature) return '';
    
    const featureMapping = {
      'WiFi Control': 'wifi',
      'Inverter Technology': 'inverter',
      'Heat Pump': 'heatPump',
      'Eco Mode': 'eco',
      'Sleep Mode': 'sleepMode',
      'Auto Restart': 'autoRestart',
      'Diamond Filter': 'diamondFilter',
      'Air Purification': 'airPurification',
      'WindFree Mode': 'windFreeMode',
      'Nanoe-G': 'nanoeG',
      'Gallery Design': 'galleryDesign',
      'Smart Control': 'smartControl',
      'Energy Saving': 'energySaving',
      'Auto Clean': 'autoClean',
      'Quiet Operation': 'quietOperation',
      'Dual Filter': 'dualFilter',
      'Anti-fungus': 'antiFungus'
    };
    
    const translationKey = featureMapping[feature];
    if (translationKey) {
      return t(`buyPage.features.${translationKey}`) || feature;
    }
    
    return feature;
  };

  const translateColor = (color) => {
    if (!color) return '';
    
    const colorMapping = {
      'White': 'white',
      'Black': 'black',
      'Silver': 'silver',
      'Gray': 'gray',
      'Beige': 'beige',
      'Brown': 'brown'
    };
    
    const translationKey = colorMapping[color];
    if (translationKey) {
      return t(`buyPage.colors.${translationKey}`) || color;
    }
    
    return color;
  };

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
      
      if (deltaY > 0) {
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
        if (deltaY > 100) {
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
    const filterChangeHandler = isMobile ? handleFilterChangeMobileSafe : handleFilterChange;
    const priceChangeHandler = isMobile ? handlePriceChangeMobileSafe : handlePriceChange;

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
                    <span className={styles.filterLabel}>{capacity != null ? capacity.toLocaleString('bg-BG') : ''} BTU</span>
                  </label>
                ))}
              </div>
            </div>

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
                      <span className={styles.filterLabel}>{translateColor(color)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

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

  const pageTitle = `${t('buyPage.title')} - ${t('metaTitle')}`;
  const pageDescription = t('metaDescription');

  if (error && products.length === 0) {
    return (
      <>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={`${SITE_URL}/buy`} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={`${SITE_URL}/buy`} />
          <meta property="og:image" content={`${SITE_URL}/images/og-buy.jpg`} />
        </Head>
        <div className={styles.container}>
          <h1 className={styles.title}>{t('buyPage.title')}</h1>
          <div className={styles.error}>
            {t('buyPage.error')}: {error}
            <br />
            <button onClick={handleRetry} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
              {t('buyPage.retry') || 'Try Again'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_URL}/buy`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/buy`} />
        <meta property="og:image" content={`${SITE_URL}/images/og-buy.jpg`} />
      </Head>
      <div className={styles.container}>
        
        <div className={styles.pageLayout}>
          <div className={styles.sidebarContainer}>
            <FilterSidebar />
          </div>

          <div className={styles.mainContent}>
            <button
              className={styles.mobileFilterToggle}
              onClick={openMobileFilters}
            >
              {t('buyPage.filters.title')} ({getActiveFilterCount()})
            </button>

            <div className={styles.resultsHeader}>
              <div className={styles.resultsCount}>
                {loading ? (
                  <span>{t('buyPage.loading')}</span>
                ) : displayProducts.length > 0 ? (
                  <>
                    {t ? 
                      `${t('buyPage.pagination.showing')} ${startIndex + 1}-${Math.min(endIndex, startIndex + displayProducts.length)} ${t('buyPage.pagination.of')} ${totalProducts} ${t('buyPage.filters.results')}` :
                      `Showing ${startIndex + 1}-${Math.min(endIndex, startIndex + displayProducts.length)} of ${totalProducts} results`
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

            {displayProducts.length > 0 && (
              <div className={styles.sortContainer}>
                <label htmlFor="sort-select" className={styles.sortLabel}>
                  {t && t('buyPage.sort.label') !== 'buyPage.sort.label' ? t('buyPage.sort.label') : 'Sort by'}:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className={styles.sortSelect}
                >
                  <optgroup label={t && t('buyPage.sort.groupPrice') !== 'buyPage.sort.groupPrice' ? t('buyPage.sort.groupPrice') : 'Price'}>
                    <option value="default">{t && t('buyPage.sort.default') !== 'buyPage.sort.default' ? t('buyPage.sort.default') : 'Default'}</option>
                    <option value="price-low">{t && t('buyPage.sort.priceLow') !== 'buyPage.sort.priceLow' ? t('buyPage.sort.priceLow') : 'Price: Low to High'}</option>
                    <option value="price-high">{t && t('buyPage.sort.priceHigh') !== 'buyPage.sort.priceHigh' ? t('buyPage.sort.priceHigh') : 'Price: High to Low'}</option>
                  </optgroup>
                  <optgroup label={t && t('buyPage.sort.groupCapacity') !== 'buyPage.sort.groupCapacity' ? t('buyPage.sort.groupCapacity') : 'Capacity'}>
                    <option value="capacity-low">{t && t('buyPage.sort.capacityLow') !== 'buyPage.sort.capacityLow' ? t('buyPage.sort.capacityLow') : 'Capacity: Low to High'}</option>
                    <option value="capacity-high">{t && t('buyPage.sort.capacityHigh') !== 'buyPage.sort.capacityHigh' ? t('buyPage.sort.capacityHigh') : 'Capacity: High to Low'}</option>
                  </optgroup>
                  <optgroup label={t && t('buyPage.sort.groupEnergy') !== 'buyPage.sort.groupEnergy' ? t('buyPage.sort.groupEnergy') : 'Energy Class'}>
                    <option value="energy-best">{t && t('buyPage.sort.energyBest') !== 'buyPage.sort.energyBest' ? t('buyPage.sort.energyBest') : 'Energy Class: Best to Worst'}</option>
                    <option value="energy-worst">{t && t('buyPage.sort.energyWorst') !== 'buyPage.sort.energyWorst' ? t('buyPage.sort.energyWorst') : 'Energy Class: Worst to Best'}</option>
                  </optgroup>
                </select>
              </div>
            )}
            
            {loading ? (
              <SkeletonLoader />
            ) : displayProducts.length === 0 ? (
              <div className={styles.noProducts}>
                {getActiveFilterCount() > 0 ? 
                  t('buyPage.filters.noResults') : 
                  t('buyPage.noProducts')}
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {displayProducts.map((product, index) => {
                  let discount, previousPrice, currentPrice, calculatedPrice;
                  
                  if (product.Discount > 0) {
                    discount = product.Discount;
                    previousPrice = product.PreviousPrice || product.Price;
                    calculatedPrice = previousPrice * (1 - discount / 100);
                    currentPrice = calculatedPrice;
                  } else if (product.PreviousPrice && product.PreviousPrice > product.Price) {
                    discount = calculateDiscount(product.Price, product.PreviousPrice);
                    previousPrice = product.PreviousPrice;
                    currentPrice = product.Price;
                  } else {
                    discount = 0;
                    previousPrice = null;
                    currentPrice = product.Price;
                  }
                  
                const flags = {
                  IsNew: product.IsNew || false,
                  IsBestseller: product.IsBestseller || false,
                  IsFeatured: product.IsFeatured || false,
                  HasDiscount: discount > 0
                };
                  
                  return (
                    <div key={product.ProductID} className={`${styles.card} ${product.IsArchived ? styles.outOfStock : ''}`}>
                      {product.IsArchived && (
                        <div className={styles.outOfStockOverlay}>
                          <div className={styles.outOfStockText}>
                            Out of Stock
                          </div>
                        </div>
                      )}
                      
                      <Link href={`/buy/${product.ProductID}`} className={styles.productLink}>
                        <div className={styles.imageContainer}>
                          {(flags.IsFeatured || flags.IsBestseller || flags.IsNew || flags.HasDiscount) && (
                            <div className={styles.promotionalBadges}>
                              {flags.IsNew && (
                                <span className={`${styles.badge} ${styles.new}`} title={t ? t('buyPage.badges.new') : 'New Product'}>
                                  {t ? t('buyPage.badges.new') : 'NEW'}
                                </span>
                              )}
                              {flags.IsBestseller && (
                                <span className={`${styles.badge} ${styles.bestseller}`} title={t ? t('buyPage.badges.bestseller') : 'Bestseller'}>
                                  {t ? t('buyPage.badges.bestseller') : 'BESTSELLER'}
                                </span>
                              )}
                              {flags.IsFeatured && (
                                <span className={`${styles.badge} ${styles.featured}`} title={t ? t('buyPage.badges.featured') : 'Featured Product'}>
                                  {t ? t('buyPage.badges.featured') : 'FEATURED'}
                                </span>
                              )}
                              {flags.HasDiscount && (
                                <span className={`${styles.badge} ${styles.discount}`} title={`${discount}% discount`}>
                                  🔥 {discount}% {t ? t('buyPage.discount.off') : 'OFF'}
                                </span>
                              )}
                            </div>
                          )}

                          <Image
                            src={product.ImageURL || '/images/placeholder-ac.svg'}
                            alt={`${product.Brand} ${product.Model}`}
                            fill
                            className={styles.image}
                            priority={index < 6}
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            quality={85}
                          />
                        </div>
                        
                        <div className={styles.brandStrip}>
                          {product.Brand}
                        </div>
                        
                          <div className={styles.productInfo}>
                          <h2 className={styles.brandModel}>
                            {product.Brand} {product.Model}
                          </h2>
                          
                          {product.Features && product.Features.length > 0 && (() => {
                            const filteredFeatures = product.Features.filter(feature => {
                              const featureLower = translateFeature(feature).toLowerCase();
                              return featureLower !== 'wi-fi' && featureLower !== 'wifi';
                            });
                            return filteredFeatures.length > 0 && (
                              <div className={styles.featureTags}>
                                {filteredFeatures.slice(0, 4).map((feature, featureIndex) => (
                                  <span key={featureIndex} className={styles.featureTag}>
                                    {translateFeature(feature)}
                                  </span>
                                ))}
                                {filteredFeatures.length > 4 && (
                                  <span
                                    className={styles.featureTag}
                                    title={filteredFeatures.slice(4).map(translateFeature).join(', ')}
                                  >
                                    +{filteredFeatures.length - 4} more
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                          
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
                          
                          <div className={styles.installmentText}>
                            {t('buyPage.actionButtons.buyOnInstallment')}
                          </div>
                          
                          <div className={styles.actionButtons}>
                            <button 
                              className={`${styles.actionButton} ${styles.actionButtonOrange}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <img 
                                src="https://cdn.tbibank.support/logo/tbi-bank.png"
                                alt="TBI Bank"
                                className={styles.buttonImage}
                              />
                            </button>
                            <button 
                              className={`${styles.actionButton} ${styles.actionButtonGreen}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                }}
                            >
                              <img 
                                src="https://dskbank.bg/images/default-source/%D0%BC%D0%B5%D0%B4%D0%B8%D0%B5%D0%BD-%D1%86%D0%B5%D0%BD%D1%82%D1%8A%D1%80-%D0%B1%D0%B0%D0%BD%D0%BA%D0%B0-%D0%B4%D1%81%D0%BA/%D0%BB%D0%BE%D0%B3%D0%BE-%D0%BD%D0%B0-%D0%B1%D0%B0%D0%BD%D0%BA%D0%B0-%D0%B4%D1%81%D0%BA.png"
                                alt="DSK Bank"
                                className={styles.buttonImage}
                              />
                            </button>
                          </div>
                        </div>
                        
                        <div className={styles.pricing}>
                          {discount > 0 ? (
                            <>
                              <div className={styles.originalPriceContainer}>
                                <span className={styles.priceLabel}>ПЦД:</span>
                                <span className={styles.originalPrice}>
                                  {formatPriceEUR(previousPrice)} | {formatPrice(previousPrice)}
                                </span>
                              </div>
                              <div className={styles.currentPriceContainer}>
                                <span className={styles.currentPrice}>
                                  {formatPriceEUR(currentPrice)} | {formatPrice(currentPrice)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className={styles.priceContainer}>
                              <span className={styles.price}>
                                {formatPriceEUR(currentPrice)} | {formatPrice(currentPrice)}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <QuantitySelector product={product} />
                    </div>
                  );
                })}
                </div>
                
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      {t ? t('buyPage.pagination.previous') : 'Previous'}
                    </button>
                    
                    <div className={styles.pageNumbers}>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === currentPage;
                        
                        const showPage = pageNumber === 1 || 
                                        pageNumber === totalPages || 
                                        Math.abs(pageNumber - currentPage) <= 2;
                        
                        if (!showPage) {
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
                            onClick={() => handlePageChange(pageNumber)}
                            disabled={loading}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      {t ? t('buyPage.pagination.next') : 'Next'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {mobileFiltersOpen && (
          <div className={`${styles.mobileFilterOverlay} ${styles.active}`}
               onClick={closeMobileFilters}>
            <div className={`${styles.mobileFilterPanel} ${styles.active}`}
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
              <div className={styles.mobileFilterContent}>
                <div className={styles.filterGroup}>
                  <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.brand')}</h3>
                  <div className={styles.filterOptions}>
                    {uniqueBrands.map(brand => (
                      <label key={brand} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          className={styles.filterCheckbox}
                          checked={(tempMobileFilters || filters).brands.includes(brand)}
                          onChange={() => handleFilterChangeMobileSafe('brands', brand)}
                        />
                        <span className={styles.filterLabel}>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.capacity')}</h3>
                  <div className={styles.filterOptions}>
                    {uniqueCapacities.map(capacity => (
                      <label key={capacity} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          className={styles.filterCheckbox}
                          checked={(tempMobileFilters || filters).capacities.includes(parseInt(capacity))}
                          onChange={() => handleFilterChangeMobileSafe('capacities', parseInt(capacity))}
                        />
                        <span className={styles.filterLabel}>{capacity != null ? capacity.toLocaleString('bg-BG') : ''} BTU</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.filterGroup}>
                  <h3 className={styles.filterGroupTitle}>{t('buyPage.filters.energyRating')}</h3>
                  <div className={styles.filterOptions}>
                    {uniqueEnergyRatings.map(rating => (
                      <label key={rating} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          className={styles.filterCheckbox}
                          checked={(tempMobileFilters || filters).energyRatings.includes(rating)}
                          onChange={() => handleFilterChangeMobileSafe('energyRatings', rating)}
                        />
                        <span className={styles.filterLabel}>{rating}</span>
                      </label>
                    ))}
                  </div>
                </div>
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
                            onChange={() => handleFilterChangeMobileSafe('colors', color)}
                          />
                          <span className={styles.filterLabel}>{translateColor(color)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className={styles.filterGroup}>
                  <PriceFilter
                    minValue={(tempMobileFilters || filters).priceRange.min}
                    maxValue={(tempMobileFilters || filters).priceRange.max}
                    onPriceChange={handlePriceChangeMobileSafe}
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
                  onClick={() => {
                    applyMobileFilters();
                    closeMobileFilters();
                  }}>
                  {t('buyPage.filters.apply')} ({getActiveFilterCount()})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

function mapSortByToSupabase(sortBy) {
  switch (sortBy) {
    case 'price-low':
      return { sortBy: 'price', sortOrder: 'asc' };
    case 'price-high':
      return { sortBy: 'price', sortOrder: 'desc' };
    default:
      return { sortBy: 'updated_at', sortOrder: 'desc' };
  }
}

export async function getServerSideProps({ locale, query }) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  
  const page = Math.max(1, parseInt(query.page) || 1);
  const search = query.search || '';
  const sortByParam = query.sortBy || 'default';
  const { sortBy, sortOrder } = mapSortByToSupabase(sortByParam);
  
  const limit = PRODUCTS_PER_PAGE;
  const offset = (page - 1) * limit;
  
  let initialProducts = [];
  let totalProducts = 0;
  let ssrError = null;
  let filterOptions = { brands: [], capacities: [], energyRatings: [], colors: [] };
  let priceBounds = { min: 0, max: 10000 };
  
  try {
    const [pageResult, allProductsResult] = await Promise.all([
      fetchProductsServer({
        showArchived: false,
        search,
        sortBy,
        sortOrder,
        limit,
        offset
      }),
      fetchProductsServer({
        showArchived: false,
        search: '',
        sortBy: 'updated_at',
        sortOrder: 'desc',
        limit: 1000,
        offset: 0
      })
    ]);
    
    initialProducts = pageResult.products;
    totalProducts = pageResult.total;
    
    const allProducts = allProductsResult.products;
    
    const brands = new Set();
    const capacities = new Set();
    const energyRatings = new Set();
    const colors = new Set();
    const prices = [];
    
    allProducts.forEach(product => {
      if (product.Brand) brands.add(product.Brand);
      if (product.CapacityBTU != null && !isNaN(product.CapacityBTU)) capacities.add(product.CapacityBTU);
      if (product.EnergyRating) energyRatings.add(product.EnergyRating);
      if (product.Colour) colors.add(product.Colour);
      if (product.Price != null) prices.push(product.Price);
    });
    
    filterOptions = {
      brands: [...brands].sort(),
      capacities: [...capacities].sort((a, b) => a - b),
      energyRatings: [...energyRatings].sort(),
      colors: [...colors].sort()
    };
    
    if (prices.length > 0) {
      priceBounds = {
        min: Math.floor(Math.min(...prices) / 100) * 100,
        max: Math.ceil(Math.max(...prices) / 100) * 100
      };
    }
    
  } catch (error) {
    console.error('Error fetching products in getServerSideProps:', error);
    ssrError = 'Failed to load products. Please try again.';
  }
  
  return {
    props: {
      ...(await serverSideTranslations(locale || 'bg', ['common'])),
      initialProducts,
      totalProducts,
      currentPage: page,
      pageSize: limit,
      ssrError,
      ssrSortBy: sortByParam,
      ssrSearch: search,
      filterOptions,
      priceBounds,
    },
  };
}

export default BuyPage;
