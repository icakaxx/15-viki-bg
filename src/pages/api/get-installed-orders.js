import { createClient } from '@supabase/supabase-js';

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

  try {
    
    // First, get orders with 'installed' status
    let query = supabase
    .from('orders')
    .select(`
      order_id,
      first_name,
      middle_name,
      last_name,
      phone,
      created_at,
      installation_schedule!inner(scheduled_date)
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
        const guest = orderData.first_name + ' ' + orderData.middle_name + ' ' + orderData.last_name;
        const phone = orderData.phone;
        const installation_date = orderData.installation_schedule[0]?.scheduled_date;

        try {
          // Get installation date from order status history
          const { data: statusHistory } = await supabase
            .from('orders')
            .select('changed_at')
            .eq('order_id', orderId)
            .eq('status', 'installed')
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
          

          // Get product details for each item
          const products = [];
          let totalPrice = 300; // Base installation fee

          if (orderItems) {
            for (const item of orderItems) {
              
              // Try both possible column names for product ID
              let { data: product, error: productError } = await supabase
                .from('products')
                .select('brand, model, price')
                .eq('ProductID', item.product_id)
                .single();

              // If ProductID doesn't work, try 'id'
              if (productError || !product) {
                const result = await supabase
                  .from('products')
                  .select('brand, model, price')
                  .eq('id', item.product_id)
                  .single();
                
                product = result.data;
                productError = result.error;
              }

              if (product && !productError) {
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
          const customerName = guest;

          // Apply search filter
          if (search) {
            const searchLower = search.toLowerCase();
            const matchesSearch = 
              customerName.toLowerCase().includes(searchLower) ||
              (guest && guest.phone && guest.phone.toLowerCase().includes(searchLower)) ||
              products.some(p => 
                p.brand.toLowerCase().includes(searchLower) ||
                p.model.toLowerCase().includes(searchLower)
              );
            
            if (!matchesSearch) {
              return null; // Filter out this order
            }
          }

          const orderResult = {
            order_id: orderId,
            installation_date: installation_date,
            customer_name: customerName,
            customer_phone:phone,
            products: products,
            products_count: products.length,
            total_price_bgn: Math.round(totalPrice * 100) / 100,
            total_price_eur: Math.round((totalPrice / EUR_RATE) * 100) / 100
          };

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