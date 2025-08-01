import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ 
      error: 'Server configuration error - missing environment variables'
    });
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { orderId } = req.query;

    // Validate required parameters
    if (!orderId) {
      return res.status(400).json({ 
        error: 'Missing required parameter: orderId' 
      });
    }

    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        service_option,
        product_id,
        accessories,
        includes_installation
      `)
      .eq('order_id', orderId);



    if (itemsError) {
      return res.status(500).json({ 
        error: 'Failed to fetch order items',
        details: itemsError.message
      });
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(200).json({
        success: true,
        products: [],
        includesInstallation: false,
        message: 'No products found for this order'
      });
    }

    // Check if any order item includes installation
    const includesInstallation = orderItems.some(item => item.includes_installation);

    // Get product details for each item
    const productsPromises = orderItems.map(async (item, index) => {
      // Try both possible column names for product ID
      let { data: product, error: productError } = await supabase
        .from('products')
        .select('brand, model, price, image_url')
        .eq('ProductID', item.product_id)
        .single();

      // If ProductID doesn't work, try 'id'
      if (productError || !product) {
        const result = await supabase
          .from('products')
          .select('brand, model, price, image_url')
          .eq('id', item.product_id)
          .single();
        
        product = result.data;
        productError = result.error;
      }

      if (product && !productError) {
        // Handle accessories - might be stored as JSON string or null
        let accessories = item.accessories;
        if (accessories === null || accessories === undefined) {
          accessories = [];
        } else if (typeof accessories === 'string') {
          try {
            accessories = JSON.parse(accessories);
          } catch (e) {
            accessories = [];
          }
        }
        
        // Handle includes_installation - might be stored as string or boolean
        let includesInstallation = item.includes_installation;
        if (includesInstallation === null || includesInstallation === undefined) {
          includesInstallation = false;
        } else if (typeof includesInstallation === 'string') {
          includesInstallation = includesInstallation.toLowerCase() === 'true' || includesInstallation === '1';
        }
        
        return {
          product_id: item.product_id,
          brand: product.brand,
          model: product.model,
          price: product.price,
          image_url: product.image_url,
          quantity: item.quantity,
          service_option: item.service_option,
          accessories: accessories,
          includes_installation: includesInstallation,
          total_price: parseFloat(product.price) * item.quantity
        };
      } else {
        // Handle accessories - might be stored as JSON string or null
        let accessories = item.accessories;
        if (accessories === null || accessories === undefined) {
          accessories = [];
        } else if (typeof accessories === 'string') {
          try {
            accessories = JSON.parse(accessories);
          } catch (e) {
            accessories = [];
          }
        }
        
        // Handle includes_installation - might be stored as string or boolean
        let includesInstallation = item.includes_installation;
        if (includesInstallation === null || includesInstallation === undefined) {
          includesInstallation = false;
        } else if (typeof includesInstallation === 'string') {
          includesInstallation = includesInstallation.toLowerCase() === 'true' || includesInstallation === '1';
        }
        
        return {
          product_id: item.product_id,
          brand: 'Unknown',
          model: 'Product Not Found',
          price: 0,
          image_url: null,
          quantity: item.quantity,
          service_option: item.service_option,
          accessories: accessories,
          includes_installation: includesInstallation,
          total_price: 0
        };
      }
    });

    const products = await Promise.all(productsPromises);

    return res.status(200).json({ 
      success: true,
      products: products,
      includesInstallation: includesInstallation,
      count: products.length
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to load order products',
      details: error.message
    });
  }
} 