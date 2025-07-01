// Translation utility for loading locale files
export async function loadTranslations(locale) {
  console.log(`Loading translations for locale: ${locale}`);
  
  // Try multiple attempts in case of transient failures
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Attempt ${attempt} to fetch /locales/${locale}/common.json`);
      const response = await fetch(`/locales/${locale}/common.json?v=${Date.now()}`);
      
      console.log(`Response status: ${response.status} for locale: ${locale}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load translations for ${locale}`);
      }
      
      const translations = await response.json();
      console.log(`Successfully loaded translations for ${locale}`, Object.keys(translations));
      
      // For English, merge with fallback to ensure all keys are available
      if (locale === 'en') {
        const fallback = getMinimalEnglishFallback();
        const merged = mergeTranslations(fallback, translations);
        console.log(`Merged English translations, final keys:`, Object.keys(merged));
        return merged;
      }
      
      return translations;
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${locale}:`, error);
      
      // If this is the last attempt, handle fallback
      if (attempt === 3) {
        // If we're trying to load English and it fails, return a minimal fallback
        if (locale === 'en') {
          console.warn('English translations failed to load, using minimal fallback');
          return getMinimalEnglishFallback();
        }
        
        // If we're trying to load another language, try English as fallback
        if (locale !== 'en') {
          console.warn(`${locale} translations failed, falling back to English`);
          return loadTranslations('en');
        }
      }
      
      // Wait before retry (except on last attempt)
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  // Final fallback - should not reach here, but just in case
  console.error('All translation loading attempts failed, using minimal fallback');
  return getMinimalEnglishFallback();
}

// Deep merge two translation objects, with loaded taking precedence over fallback
function mergeTranslations(fallback, loaded) {
  const result = { ...fallback };
  
  for (const key in loaded) {
    if (loaded.hasOwnProperty(key)) {
      if (typeof loaded[key] === 'object' && typeof fallback[key] === 'object' && !Array.isArray(loaded[key])) {
        // Recursively merge objects
        result[key] = mergeTranslations(fallback[key] || {}, loaded[key]);
      } else {
        // Use loaded value (overwrites fallback)
        result[key] = loaded[key];
      }
    }
  }
  
  return result;
}

// Minimal English fallback to prevent showing translation keys
function getMinimalEnglishFallback() {
  return {
    "metaTitle": "BGVIKI15 Ltd - Air Conditioning & Climate Solutions",
    "metaDescription": "BGVIKI15 Ltd - Quality and reliable solutions since 2000.",
    "common": {
      "close": "Close"
    },
    "company": {
      "name": "BGVIKI15 Ltd"
    },
    "hero": {
      "title": "Quality and reliable solutions since 2000",
      "subtitle": "Your partner for air conditioners and climate control in Bulgaria. Discover our energy-efficient solutions for comfort in your home.",
      "shopNow": "Shop Now",
      "learnMore": "View Products"
    },
    "features": {
      "title": "Why Choose Us",
      "quality": {
        "title": "High Quality",
        "description": "We work only with leading brands and certified products for long-lasting use."
      },
      "service": {
        "title": "Professional Service", 
        "description": "Our team of experts will consult and maintain your equipment."
      },
      "experience": {
        "title": "Over 20 Years Experience",
        "description": "Since 2000, we have been your reliable partner in the field of air conditioning."
      }
    },
    "cta": {
      "title": "Ready for comfort?",
      "description": "Browse our products and find the perfect solution for your home or office.",
      "button": "View Products"
    },
    "nav": {
      "about": "About",
      "products": "Products & Solutions", 
      "buy": "Buy ACs",
      "inquiry": "Make an inquiry",
      "contact": "Contact"
    },
    "footer": {
      "brandInfo": {
        "tagline": "Quality and reliable solutions since 2000"
      },
      "navigation": {
        "title": "Navigation",
        "about": "About",
        "products": "Products & Solutions",
        "buy": "Buy ACs",
        "inquiry": "Make an inquiry",
        "contact": "Contact"
      },
      "contact": {
        "title": "Contact",
        "phone": "Phone",
        "email": "Email",
        "social": "Social Media"
      },
      "socialLabels": {
        "facebook": "Follow us on Facebook",
        "instagram": "Follow us on Instagram",
        "whatsapp": "Contact us on WhatsApp"
      },
      "backToTop": "Back to top",
      "copyright": "© 2025 BGVIKI15 Ltd. All rights reserved.",
      "attribution": "Design: H&M WSPro",
      "admin": "Go to Administration"
    },
    "cart": {
      "title": "Shopping Cart",
      "viewCart": "View cart",
      "empty": "Your cart is empty",
      "quantity": "Qty",
      "total": "Total",
      "checkout": "Checkout",
      "remove": "Remove"
    },
    "buyPage": {
      "title": "Buy Air Conditioners",
      "loading": "Loading products...",
      "error": "Error loading products",
      "noProducts": "No products found",
      "buyButton": "Buy",
      "addToCart": "Add to Cart",
      "quantity": "Quantity",
      "increaseQuantity": "Increase quantity",
      "decreaseQuantity": "Decrease quantity",
      "inCart": "In cart",
      "previousPrice": "Was:",
      "energyRating": "Energy Rating:",
      "capacity": "Capacity:",
      "type": "Type:",
      "discount": "Discount",
      "btu": "BTU",
      "color": "Color",
      "priceNote": "EUR prices are approximate"
    }
  };
}

// Helper function to get nested translation values
export function getTranslation(translations, key) {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // If translation not found, log it for debugging
      console.warn(`Translation not found for key: ${key}`);
      return key; // Return the key if translation not found
    }
  }
  
  return value;
} 