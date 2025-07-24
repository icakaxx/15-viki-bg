import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables for get-order-products');
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

    console.log(`Loading products for order ${orderId}...`);

    // Get installation status from payment_and_tracking
    const { data: paymentData, error: paymentError } = await supabase
      .from('payment_and_tracking')
      .select('includes_installation')
      .eq('order_id', orderId)
      .single();

    if (paymentError) {
      console.error('Error fetching payment data:', paymentError);
      return res.status(404).json({ 
        error: 'Order not found in payment tracking',
        details: paymentError.message
      });
    }

    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        service_option,
        product_id
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return res.status(500).json({ 
        error: 'Failed to fetch order items',
        details: itemsError.message
      });
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(200).json({
        success: true,
        products: [],
        includesInstallation: paymentData.includes_installation || false,
        message: 'No products found for this order'
      });
    }

    // Get product details for each item
    const productsPromises = orderItems.map(async (item) => {
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
        return {
          product_id: item.product_id,
          brand: product.brand,
          model: product.model,
          price: product.price,
          image_url: product.image_url,
          quantity: item.quantity,
          service_option: item.service_option,
          total_price: parseFloat(product.price) * item.quantity
        };
      } else {
        console.warn(`Product not found for ID ${item.product_id}:`, productError);
        return {
          product_id: item.product_id,
          brand: 'Unknown',
          model: 'Product Not Found',
          price: 0,
          image_url: null,
          quantity: item.quantity,
          service_option: item.service_option,
          total_price: 0
        };
      }
    });

    const products = await Promise.all(productsPromises);

    console.log(`Successfully loaded ${products.length} products for order ${orderId}`);

    return res.status(200).json({ 
      success: true,
      products: products,
      includesInstallation: paymentData.includes_installation || false,
      count: products.length
    });

  } catch (error) {
    console.error('Error in get-order-products:', error);
    return res.status(500).json({ 
      error: 'Failed to load order products',
      details: error.message
    });
  }
} 