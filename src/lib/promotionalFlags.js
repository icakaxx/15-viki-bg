// Promotional flags configuration
// Add product IDs to these arrays to enable promotional badges

export const promotionalFlags = {
  // Product IDs that should show "NEW" badge
  newProducts: [108, 107, 106],
  
  // Product IDs that should show "BESTSELLER" badge  
  bestsellerProducts: [108, 105, 104],
  
  // Product IDs that should show "FEATURED" badge
  featuredProducts: [106, 105, 103]
};

// Helper function to check if a product has promotional flags
export const getProductFlags = (productId) => {
  return {
    IsNew: promotionalFlags.newProducts.includes(productId),
    IsBestseller: promotionalFlags.bestsellerProducts.includes(productId),
    IsFeatured: promotionalFlags.featuredProducts.includes(productId)
  };
}; 