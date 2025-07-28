import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Context
const CartContext = createContext();

// Helper function to calculate individual cart item total
const calculateItemTotal = (item) => {
  if (!item) return 0;
  
  const basePrice = item.basePrice || item.product?.Price || 0;
  // Accessories now have individual quantities
  const accessoryTotal = item.accessories?.reduce((sum, acc) => {
    const accessoryQuantity = acc.quantity || item.quantity; // Default to product quantity if not set
    return sum + ((acc.Price || 0) * accessoryQuantity);
  }, 0) || 0;
  const installationCost = item.installation ? (item.installationPrice || 0) * item.quantity : 0;
  
  // Total = (basePrice * quantity) + accessoryTotal + installationCost
  return (basePrice * item.quantity) + accessoryTotal + installationCost;
};

// Cart Actions
  const CART_ACTIONS = {
  LOAD_CART: 'LOAD_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  ADD_TO_CART_ENHANCED: 'ADD_TO_CART_ENHANCED',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  UPDATE_ITEM_ACCESSORIES: 'UPDATE_ITEM_ACCESSORIES',
  UPDATE_ACCESSORY_QUANTITY: 'UPDATE_ACCESSORY_QUANTITY',
  UPDATE_ITEM_INSTALLATION: 'UPDATE_ITEM_INSTALLATION',
  CLEAR_CART: 'CLEAR_CART'
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      return action.payload || { items: [], totalItems: 0, totalPrice: 0 };

    case CART_ACTIONS.ADD_TO_CART: {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.productId === product.ProductID);
      
      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item (simple version without accessories)
        newItems = [...state.items, {
          productId: product.ProductID,
          quantity,
          product,
          accessories: [],
          installation: false,
          basePrice: product.Price
        }];
      }
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
      
      return { items: newItems, totalItems, totalPrice };
    }

    case CART_ACTIONS.ADD_TO_CART_ENHANCED: {
      const { product, quantity, accessories, installation, installationPrice } = action.payload;
      
      // Generate unique cart item ID based on product + accessories + installation
      const accessoryIds = accessories.map(acc => acc.AccessoryID).sort().join(',');
      const cartItemId = `${product.ProductID}-${accessoryIds}-${installation}`;
      
      const existingItemIndex = state.items.findIndex(item => item.cartItemId === cartItemId);
      
      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item with full configuration - accessories have individual quantities
        const accessoriesWithQuantity = accessories.map(acc => ({
          ...acc,
          quantity: quantity // Initialize with product quantity
        }));
        const accessoryTotal = accessoriesWithQuantity.reduce((sum, acc) => sum + ((acc.Price || 0) * acc.quantity), 0);
        const installationCostPerUnit = installation ? installationPrice : 0;
        
        newItems = [...state.items, {
          cartItemId,
          productId: product.ProductID,
          quantity,
          product,
          accessories: accessoriesWithQuantity,
          installation,
          installationPrice: installationPrice || 0,
          basePrice: product.Price,
          accessoryTotal,
          installationCostPerUnit,
          itemTotalPrice: (product.Price * quantity) + accessoryTotal + (installationCostPerUnit * quantity)
        }];
      }
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
      
      return { items: newItems, totalItems, totalPrice };
    }

    case CART_ACTIONS.REMOVE_FROM_CART: {
      const { productId, cartItemId } = action.payload;
      
      // Remove by cartItemId if provided (for enhanced items), otherwise by productId
      const newItems = state.items.filter(item => 
        cartItemId ? item.cartItemId !== cartItemId : item.productId !== productId
      );
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
      
      return { items: newItems, totalItems, totalPrice };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, cartItemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return cartReducer(state, { 
          type: CART_ACTIONS.REMOVE_FROM_CART, 
          payload: { productId, cartItemId } 
        });
      }
      
      const newItems = state.items.map(item => {
        // Match by cartItemId if provided (for enhanced items), otherwise by productId
        const isMatch = cartItemId ? item.cartItemId === cartItemId : item.productId === productId;
        
        if (isMatch) {
          // Recalculate item total price for enhanced items
          const updatedItem = { ...item, quantity };
          // Always recalculate since accessories now scale with quantity
          updatedItem.itemTotalPrice = calculateItemTotal(updatedItem);
          return updatedItem;
        }
        return item;
      });
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
      
      return { items: newItems, totalItems, totalPrice };
    }

    case CART_ACTIONS.UPDATE_ITEM_ACCESSORIES: {
      const { cartItemId, accessories } = action.payload;
      
      const newItems = state.items.map(item => {
        if (item.cartItemId === cartItemId) {
          // Update accessories and recalculate totals
          const updatedItem = { ...item, accessories };
          const accessoryTotal = accessories.reduce((sum, acc) => {
            const accessoryQuantity = acc.quantity || item.quantity;
            return sum + ((acc.Price || 0) * accessoryQuantity);
          }, 0);
          
          updatedItem.accessoryTotal = accessoryTotal;
          updatedItem.itemTotalPrice = calculateItemTotal(updatedItem);
          
          return updatedItem;
        }
        return item;
      });
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
      
      return { items: newItems, totalItems, totalPrice };
    }

    case CART_ACTIONS.UPDATE_ACCESSORY_QUANTITY: {
      const { cartItemId, accessoryIndex, quantity } = action.payload;
      
      const newItems = state.items.map(item => {
        if (item.cartItemId === cartItemId) {
          const updatedAccessories = [...item.accessories];
          if (updatedAccessories[accessoryIndex]) {
            updatedAccessories[accessoryIndex] = {
              ...updatedAccessories[accessoryIndex],
              quantity: Math.max(0, quantity) // Ensure quantity is not negative
            };
          }
          
          const updatedItem = { ...item, accessories: updatedAccessories };
          const accessoryTotal = updatedAccessories.reduce((sum, acc) => {
            const accessoryQuantity = acc.quantity || item.quantity;
            return sum + ((acc.Price || 0) * accessoryQuantity);
          }, 0);
          
          updatedItem.accessoryTotal = accessoryTotal;
          updatedItem.itemTotalPrice = calculateItemTotal(updatedItem);
          
          return updatedItem;
        }
        return item;
      });
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
      
      return { items: newItems, totalItems, totalPrice };
    }

    case CART_ACTIONS.UPDATE_ITEM_INSTALLATION: {
      const { cartItemId, installation } = action.payload;
      
      const newItems = state.items.map(item => {
        if (item.cartItemId === cartItemId) {
          // Update installation status and recalculate totals
          const updatedItem = { ...item, installation };
          updatedItem.itemTotalPrice = calculateItemTotal(updatedItem);
          
          return updatedItem;
        }
        return item;
      });
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
      
      return { items: newItems, totalItems, totalPrice };
    }

    case CART_ACTIONS.CLEAR_CART:
      return { items: [], totalItems: 0, totalPrice: 0 };

    default:
      return state;
  }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], totalItems: 0, totalPrice: 0 });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('viki15-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsedCart });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('viki15-cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Cart Actions
  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { product, quantity }
    });
  };

  const addToCartEnhanced = (product, quantity = 1, accessories = [], installation = false, installationPrice = 0) => {
    
    
    dispatch({
      type: CART_ACTIONS.ADD_TO_CART_ENHANCED,
      payload: { 
        product, 
        quantity, 
        accessories, 
        installation, 
        installationPrice 
      }
    });
  };

  const removeFromCart = (productId, cartItemId = null) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_FROM_CART,
      payload: { productId, cartItemId }
    });
  };

  const updateQuantity = (productId, quantity, cartItemId = null) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity, cartItemId }
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const updateItemAccessories = (cartItemId, accessories) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_ITEM_ACCESSORIES,
      payload: { cartItemId, accessories }
    });
  };

  const updateAccessoryQuantity = (cartItemId, accessoryIndex, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_ACCESSORY_QUANTITY,
      payload: { cartItemId, accessoryIndex, quantity }
    });
  };

  const updateItemInstallation = (cartItemId, installation) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_ITEM_INSTALLATION,
      payload: { cartItemId, installation }
    });
  };

  const getCartItemQuantity = (productId) => {
    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const getCartItemByItemId = (cartItemId) => {
    return cart.items.find(item => item.cartItemId === cartItemId);
  };

  const getCartItemsForOrder = () => {
    return cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
      accessories: item.accessories || [],
      installation: item.installation || false,
      installationPrice: item.installationPrice || 0,
      totalPrice: calculateItemTotal(item)
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN'
    }).format(price);
  };

  const formatPriceEUR = (price) => {
    const eurPrice = price / 1.96;
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(eurPrice);
  };

  const contextValue = {
    cart,
    addToCart,
    addToCartEnhanced,
    removeFromCart,
    updateQuantity,
    updateItemAccessories,
    updateAccessoryQuantity,
    updateItemInstallation,
    clearCart,
    getCartItemQuantity,
    getCartItemByItemId,
    getCartItemsForOrder,
    formatPrice,
    formatPriceEUR,
    calculateItemTotal
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 