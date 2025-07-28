import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables for get-order-history');
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
    const { orderId } = req.query;

    // Validate required parameters
    if (!orderId) {
      return res.status(400).json({ 
        error: 'Missing required parameter: orderId' 
      });
    }

    // Get order status history
    const { data, error } = await supabase
      .from('order_status_view')
      .select('*')
      .eq('order_id', orderId)
      .order('changed_at', { descending: true });

    if (error) {
      if (error.code === '42P01') {
        return res.status(200).json({ 
          success: true,
          history: [],
          message: 'Order status history table not found - history feature not set up yet'
        });
      } else {
        console.error('Error loading order history:', error);
        return res.status(500).json({ 
          error: 'Failed to load order history',
          details: error.message
        });
      }
    }

    return res.status(200).json({ 
      success: true,
      history: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error in get-order-history:', error);
    return res.status(500).json({ 
      error: 'Failed to load order history',
      details: error.message
    });
  }
} 