import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables for get-orders');
    return res.status(500).json({ 
      error: 'Server configuration error - missing environment variables'
    });
  }

  // Initialize Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('API: Loading orders...');
    
    // First try to use the order_status_view if it exists
    let { data, error } = await supabase
      .from('order_status_view')
      .select('*')
      .neq('current_status', 'installed')
      .order('order_created_at', { ascending: false });

    // If view doesn't exist, fall back to manual join
    if (error && error.code === '42P01') {
      console.log('API: Order status view not found, using manual join...');
      
      // Get orders with payment info using manual join, excluding installed orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          order_id,
          first_name,
          last_name,
          phone,
          town,
          address,
          email,
          created_at,
          status,
          notes,
          payment_and_tracking!inner (
            payment_method,
            total_amount,
            paid_amount
          )
        `)
        .neq('orders.status', 'installed')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('API: Error loading orders with manual join:', ordersError);
        return res.status(500).json({ 
          error: 'Failed to load orders',
          details: ordersError.message
        });
      }

      // Transform the data to match expected format
      data = ordersData?.map(order => ({
        order_id: order.order_id,
        first_name: order.first_name,
        last_name: order.last_name,
        phone: order.phone,
        town: order.town,
        address: order.address,
        email: order.email,
        order_created_at: order.created_at,
        payment_method: order.payment_and_tracking?.[0]?.payment_method || 'unknown',
        current_status: order.status || 'new',
        total_amount: order.payment_and_tracking?.[0]?.total_amount || 0,
        paid_amount: order.payment_and_tracking?.[0]?.paid_amount || 0,
        notes: order.notes
      })) || [];

      console.log('API: Orders loaded via manual join:', data.map(order => ({
        order_id: order.order_id,
        name: `${order.first_name} ${order.last_name}`,
        status: order.current_status,
        total_amount: `${order.total_amount} BGN`,
        paid_amount: `${order.paid_amount} BGN`
      })));
    } else if (error) {
      console.error('API: Error loading orders:', error);
      return res.status(500).json({ 
        error: 'Failed to load orders',
        details: error.message
      });
    } else {
      console.log('API: Orders loaded via view:', data.map(order => ({
        order_id: order.order_id,
        name: `${order.first_name} ${order.last_name}`,
        status: order.current_status,
        total_amount: `${order.total_amount} BGN`,
        paid_amount: `${order.paid_amount} BGN`,
        notes: order.notes
      })));
    }

    return res.status(200).json({ 
      success: true,
      orders: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('API: Error in get-orders:', error);
    return res.status(500).json({ 
      error: 'Failed to load orders',
      details: error.message
    });
  }
} 