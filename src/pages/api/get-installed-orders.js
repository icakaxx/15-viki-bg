import { createClient } from '@supabase/supabase-js';

/**
 * Example request:
 *   /api/get-installed-orders?page=1&limit=20&search=toshiba&sortBy=installation_date&sortOrder=desc
 *
 * Example response:
 * {
 *   data: [
 *     {
 *       id: 123,
 *       installation_date: '2024-05-01T12:00:00Z',
 *       customer_name: 'Ivan Ivanov',
 *       customer_phone: '+359888123456',
 *       products: [
 *         { brand: 'Toshiba', model: 'RAS-B13J2KVG-E', price: 1200, quantity: 1, service: 'Installation' }
 *       ],
 *       products_count: 1,
 *       total_price_bgn: 1300.00,
 *       total_price_eur: 663.27
 *     }
 *   ],
 *   totalCount: 42
 * }
 */

const EUR_RATE = 1.96; // BGN to EUR
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseIntOrDefault(val, def) {
  const n = parseInt(val, 10);
  return isNaN(n) ? def : n;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate env
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Parse and validate query params
  const page = Math.max(1, parseIntOrDefault(req.query.page, 1));
  const limit = Math.min(MAX_LIMIT, parseIntOrDefault(req.query.limit, DEFAULT_LIMIT));
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();
  const sortBy = req.query.sortBy || 'installation_date';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

  // Only allow certain sort fields
  const validSortFields = ['installation_date', 'total_price', 'customer_name'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'installation_date';

  // Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Compose SQL query for installed orders
  // Note: This uses Supabase RPC for complex joins/aggregations, or you can use a view.
  // For now, use SQL via supabase.rpc if available, else fallback to JS joins (less efficient).

  // --- SQL for reference (not executed directly here):
  // SELECT go.id, go.name, go.phone, ...
  //   MAX(osh.changed_at) as installation_date
  //   SUM(oi.price * oi.quantity) + go.install_fee as total_price
  //   ARRAY_AGG(jsonb_build_object('brand', p.brand, 'model', p.model, 'price', oi.price, 'quantity', oi.quantity, 'service', oi.service)) as products
  // FROM guest_orders go
  // JOIN payment_and_tracking pt ON pt.order_id = go.id AND pt.status = 'installed'
  // JOIN order_status_history osh ON osh.order_id = go.id AND osh.new_status = 'installed'
  // JOIN order_items oi ON oi.order_id = go.id
  // JOIN products p ON p.id = oi.product_id
  // WHERE ...
  // GROUP BY go.id
  // ORDER BY installation_date DESC
  // LIMIT ... OFFSET ...

  // Note: We'll fetch and filter the data using Supabase client instead of raw SQL

  try {
    console.log('📊 Fetching installed orders...');
    
    // First, get orders with 'installed' status
    let query = supabase
      .from('payment_and_tracking')
      .select(`
        order_id,
        guest_orders!inner (
          id,
          first_name,
          middle_name,
          last_name,
          phone,
          created_at
        )
      `)
      .eq('status', 'installed');

    const { data: installedOrders, error: ordersError } = await query;

    if (ordersError) {
      console.error('Error fetching installed orders:', ordersError);
      return res.status(500).json({ 
        error: 'Failed to fetch installed orders',
        details: ordersError.message 
      });
    }

    console.log(`Found ${installedOrders?.length || 0} installed orders`);

    if (!installedOrders || installedOrders.length === 0) {
      return res.status(200).json({
        data: [],
        totalCount: 0
      });
    }

    // Get detailed information for each order
    const ordersWithDetails = await Promise.all(
      installedOrders.map(async (orderData) => {
        const orderId = orderData.order_id;
        const guest = orderData.guest_orders;

        try {
          // Get installation date from order status history
          const { data: statusHistory } = await supabase
            .from('order_status_history')
            .select('changed_at')
            .eq('order_id', orderId)
            .eq('new_status', 'installed')
            .order('changed_at', { ascending: false })
            .limit(1);

          // Get order items and products
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              quantity,
              service_option,
              product_id
            `)
            .eq('order_id', orderId);

          if (itemsError) {
            console.warn(`Error fetching order items for order ${orderId}:`, itemsError);
          }
          
          console.log(`Order ${orderId} has ${orderItems?.length || 0} items`);

          // Get product details for each item
          const products = [];
          let totalPrice = 300; // Base installation fee

          if (orderItems) {
            for (const item of orderItems) {
              console.log(`Looking for product with ID: ${item.product_id}`);
              
              // Try both possible column names for product ID
              let { data: product, error: productError } = await supabase
                .from('products')
                .select('brand, model, price')
                .eq('ProductID', item.product_id)
                .single();

              // If ProductID doesn't work, try 'id'
              if (productError || !product) {
                console.log(`ProductID lookup failed, trying 'id' column...`);
                const result = await supabase
                  .from('products')
                  .select('brand, model, price')
                  .eq('id', item.product_id)
                  .single();
                
                product = result.data;
                productError = result.error;
              }

              if (product && !productError) {
                console.log(`Found product: ${product.brand} ${product.model} - €${product.price}`);
                const itemPrice = parseFloat(product.price) * item.quantity;
                totalPrice += itemPrice;

                products.push({
                  brand: product.brand,
                  model: product.model,
                  price: product.price,
                  quantity: item.quantity,
                  service: item.service_option
                });
              } else {
                console.warn(`Product not found for ID ${item.product_id}:`, productError);
                // Add a placeholder for missing products
                products.push({
                  brand: 'Unknown',
                  model: 'Product Not Found',
                  price: 0,
                  quantity: item.quantity,
                  service: item.service_option
                });
              }
            }
          }

          // Format customer name
          const customerName = `${guest.first_name} ${guest.middle_name || ''} ${guest.last_name}`.trim();

          // Apply search filter
          if (search) {
            const searchLower = search.toLowerCase();
            const matchesSearch = 
              customerName.toLowerCase().includes(searchLower) ||
              guest.phone.toLowerCase().includes(searchLower) ||
              products.some(p => 
                p.brand.toLowerCase().includes(searchLower) ||
                p.model.toLowerCase().includes(searchLower)
              );
            
            if (!matchesSearch) {
              return null; // Filter out this order
            }
          }

          const orderResult = {
            id: orderId,
            installation_date: statusHistory?.[0]?.changed_at || guest.created_at,
            customer_name: customerName,
            customer_phone: guest.phone,
            products: products,
            products_count: products.length,
            total_price_bgn: Math.round(totalPrice * 100) / 100,
            total_price_eur: Math.round((totalPrice / EUR_RATE) * 100) / 100
          };

          console.log(`Order ${orderId} summary: ${products.length} products, total: ${totalPrice} BGN`);
          return orderResult;

        } catch (detailError) {
          console.warn(`Error fetching details for order ${orderId}:`, detailError);
          return null;
        }
      })
    );

    // Filter out null results and apply pagination
    const validOrders = ordersWithDetails.filter(order => order !== null);
    
    // Sort the results
    validOrders.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case 'customer_name':
          aVal = a.customer_name;
          bVal = b.customer_name;
          break;
        case 'total_price':
          aVal = a.total_price_bgn;
          bVal = b.total_price_bgn;
          break;
        default: // installation_date
          aVal = new Date(a.installation_date);
          bVal = new Date(b.installation_date);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const totalCount = validOrders.length;
    const paginatedOrders = validOrders.slice(offset, offset + limit);

    console.log(`Returning ${paginatedOrders.length} orders (${totalCount} total)`);

    return res.status(200).json({
      data: paginatedOrders,
      totalCount: totalCount
    });

  } catch (err) {
    console.error('Error in get-installed-orders:', err);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  }
} 