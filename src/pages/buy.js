import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import PriceFilter from '../components/PriceFilter';
import QuantitySelector from '../components/QuantitySelector';
// Layout is already provided by _app.js, no need to import
import styles from '../styles/Page Styles/Products.module.css';
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
    capacities: [],
    energyRatings: [],
    colors: [],
    priceRange: { min: 0, max: 3000 }
  });

  // Sort state
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price-low', 'price-high'

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
    const capacities = {};
    const energyRatings = {};
    const colors = {};

    products.forEach(product => {
      // Count brands
      brands[product.Brand] = (brands[product.Brand] || 0) + 1;
      

      
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

    return { brands, capacities, energyRatings, colors };
  }, [products]);

  // Get unique values for filters
  const uniqueBrands = [...new Set(products.map(p => p.Brand))].filter(Boolean).sort();
  const uniqueCapacities = [...new Set(products.map(p => p.CapacityBTU))].filter(val => val != null && val !== undefined && !isNaN(val)).sort((a, b) => a - b);
  const uniqueEnergyRatings = [...new Set(products.map(p => p.EnergyRating))].filter(Boolean).sort();
  const uniqueColors = [...new Set(products.map(p => p.Colour))].filter(Boolean).sort();

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    const activeFilters = tempMobileFilters || filters;
    
    let filtered = products.filter(product => {
      // Brand filter
      if (activeFilters.brands.length > 0 && !activeFilters.brands.includes(product.Brand)) {
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

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.Price - b.Price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.Price - a.Price);
        break;
      case 'capacity-low':
        filtered.sort((a, b) => (a.CapacityBTU || 0) - (b.CapacityBTU || 0));
        break;
      case 'capacity-high':
        filtered.sort((a, b) => (b.CapacityBTU || 0) - (a.CapacityBTU || 0));
        break;
      case 'energy-best': {
        // Custom order: A+++ > A++ > A+ > A > B > C
        const order = ['A+++', 'A++', 'A+', 'A', 'B', 'C'];
        filtered.sort((a, b) => {
          const aIndex = order.indexOf(a.EnergyRating);
          const bIndex = order.indexOf(b.EnergyRating);
          return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
        });
        break;
      }
      case 'energy-worst': {
        // Custom order: C > B > A > A+ > A++ > A+++
        const order = ['C', 'B', 'A', 'A+', 'A++', 'A+++'];
        filtered.sort((a, b) => {
          const aIndex = order.indexOf(a.EnergyRating);
          const bIndex = order.indexOf(b.EnergyRating);
          return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
        });
        break;
      }
      default:
        // Keep original order (default)
        break;
    }

    return filtered;
  }, [products, filters, tempMobileFilters, sortBy]);

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

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const clearAllFilters = () => {
    // Calculate the default price range from actual products
    const productPrices = products.map(p => p.Price);
    const actualMinPrice = productPrices.length > 0 ? Math.floor(Math.min(...productPrices) / 100) * 100 : 0;
    const actualMaxPrice = productPrices.length > 0 ? Math.ceil(Math.max(...productPrices) / 100) * 100 : 10000;
    
    const defaultFilters = {
      brands: [],
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

  // Only allow filter changes when mobileFiltersOpen is true
  const handleFilterChangeMobileSafe = (filterType, value) => {
    if (!mobileFiltersOpen) return;
    handleFilterChange(filterType, value);
  };

  // Only allow price changes when mobileFiltersOpen is true
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
    // BGN to EUR conversion rate (1 EUR = 1.95583 BGN - official rate)
    const eurPrice = price / 1.95583;
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(eurPrice);
  };



  // Helper function to translate features
  const translateFeature = (feature) => {
    if (!feature) return '';
    
    // Create a mapping from English feature names to translation keys
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
    
    return feature; // Return original if no translation found
  };

  // Helper function to translate colors
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
    
    return color; // Return original if no translation found
  };

  // Helper function to translate warranty periods
  const translateWarranty = (warranty) => {
    if (!warranty) return '';
    
    // Extract number and unit from warranty string (e.g., "3 years" -> "3" and "years")
    const match = warranty.match(/^(\d+)\s*(year|years|години|година)$/i);
    if (match) {
      const number = match[1];
      const unit = match[2].toLowerCase();
      
      // Try to get the translation with fallback
      let translatedYears;
      try {
        translatedYears = t('buyPage.warranty.years');
        // If the translation returns the key itself, use fallback
        if (translatedYears === 'buyPage.warranty.years') {
          translatedYears = 'years';
        }
      } catch (error) {
        translatedYears = 'years';
      }
      
      if (unit === 'year' || unit === 'years') {
        return `${number} ${translatedYears}`;
      } else if (unit === 'години' || unit === 'година') {
        return `${number} ${translatedYears}`;
      }
    }
    
    return warranty; // Return original if no translation found
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
                      <span className={styles.filterLabel}>{translateColor(color)}</span>
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

            {/* Sort Dropdown */}
            {filteredProducts.length > 0 && (
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
                  // Dynamic discount calculation system
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
                  
                  // Use actual product data for promotional flags instead of config file
                const flags = {
                  IsNew: product.IsNew || false,
                  IsBestseller: product.IsBestseller || false,
                  IsFeatured: product.IsFeatured || false,
                  HasDiscount: discount > 0
                };
                  
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
                        <div className={styles.imageContainer}>
                          {/* Promotional Badges */}
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
                              <span className={styles.specLabel}>{t ? t('buyPage.capacity') : 'Capacity'}:</span> {product.CapacityBTU} BTU
                            </div>
                            <div className={styles.spec}>
                              <span className={styles.specLabel}>{t ? t('buyPage.energyRating') : 'Energy Rating'}:</span> {product.EnergyRating}
                            </div>
                            {product.Colour && (
                              <div className={styles.spec}>
                                <span className={styles.specLabel}>{t ? t('buyPage.color') : 'Color'}:</span> {translateColor(product.Colour)}
                              </div>
                            )}
                            {product.NoiseLevel && (
                              <div className={styles.spec}>
                                <span className={styles.specLabel}>{t ? t('buyPage.noiseLevel') : 'Noise'}:</span> {product.NoiseLevel} dB
                              </div>
                            )}
                            {product.WarrantyPeriod && (
                              <div className={styles.spec}>
                                <span className={styles.specLabel}>{t ? t('buyPage.warranty.label') : 'Warranty'}:</span> {translateWarranty(product.WarrantyPeriod)}
                              </div>
                            )}
                          </div>
                          
                          {/* Feature Tags */}
                          {product.Features && product.Features.length > 0 && (
                            <div className={styles.featureTags}>
                              {product.Features.slice(0, 4).map((feature, featureIndex) => (
                                <span key={featureIndex} className={styles.featureTag}>
                                  {translateFeature(feature)}
                                </span>
                              ))}
                              {product.Features.length > 4 && (
                                <span
                                  className={styles.featureTag}
                                  title={product.Features.slice(4).map(translateFeature).join(', ')}
                                >
                                  +{product.Features.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                          
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
                          
                          {/* Installment Text */}
                          <div className={styles.installmentText}>
                            {t('buyPage.actionButtons.buyOnInstallment')}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className={styles.actionButtons}>
                            <button 
                              className={`${styles.actionButton} ${styles.actionButtonRed}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <img 
                                src="https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg//UniCredit.jpg"
                                alt="UniCredit"
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
                                src="https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg//dsk.png"
                                alt="DSK"
                                className={styles.buttonImage}
                              />
                            </button>
                          </div>
                        </div>
                        
                        <div className={styles.pricing}>
                          {discount > 0 ? (
                            <>
                              {/* Original Price (Crossed Out) */}
                              <div className={styles.originalPriceContainer}>
                                <span className={styles.originalPrice}>
                                  {formatPrice(previousPrice)} / {formatPriceEUR(previousPrice)}
                                </span>
                              </div>
                              {/* Current Price (Dynamically Calculated) */}
                              <div className={styles.currentPriceContainer}>
                                <span className={styles.currentPrice}>
                                  {formatPrice(currentPrice)} / {formatPriceEUR(currentPrice)}
                                </span>
                                {discount && (
                                  <span className={styles.discountBadge}>-{discount}%</span>
                                )}
                              </div>
                            </>
                          ) : (
                            /* Regular Price (No Discount) */
                            <div className={styles.priceContainer}>
                              <span className={styles.price}>
                                {formatPrice(currentPrice)} / {formatPriceEUR(currentPrice)}
                              </span>
                            </div>
                          )}
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
        {mobileFiltersOpen && (
          <div className={`${styles.mobileFilterOverlay} ${styles.active}`}
               onClick={closeMobileFilters}>
            <div className={`${styles.mobileFilterPanel} ${styles.active}`}
                 onClick={(e) => e.stopPropagation()}>
              {/* ...filter content... */}
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
                          onChange={() => handleFilterChangeMobileSafe('brands', brand)}
                        />
                        <span className={styles.filterLabel}>{brand}</span>
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
                          onChange={() => handleFilterChangeMobileSafe('capacities', parseInt(capacity))}
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
                          onChange={() => handleFilterChangeMobileSafe('energyRatings', rating)}
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
                            onChange={() => handleFilterChangeMobileSafe('colors', color)}
                          />
                          <span className={styles.filterLabel}>{translateColor(color)}</span>
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

export async function getStaticProps({ locale }) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  
  return {
    props: {
      ...(await serverSideTranslations(locale || 'bg', ['common'])),
    },
  };
}

export default BuyPage; 