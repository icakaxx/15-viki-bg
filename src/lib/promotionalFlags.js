// Promotional flags configuration
// Add product IDs to these arrays to enable promotional badges

export const promotionalFlags = {
  // Product IDs that should show "NEW" badge
  newProducts: [],
  
  // Product IDs that should show "BESTSELLER" badge  
  bestsellerProducts: [],
  
  // Product IDs that should show "FEATURED" badge
  featuredProducts: []
};

// Helper function to check if a product has promotional flags
export const getProductFlags = (productId) => {
  return {
    IsNew: promotionalFlags.newProducts.includes(productId),
    IsBestseller: promotionalFlags.bestsellerProducts.includes(productId),
    IsFeatured: promotionalFlags.featuredProducts.includes(productId)
  };
}; 