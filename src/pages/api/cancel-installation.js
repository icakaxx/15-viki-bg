import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { searchId } = req.body;

  if (!searchId) {
    return res.status(400).json({ error: 'Search ID is required' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    console.log(`Cancelling installation for order: ${searchId}`);

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_id, status')
      .eq('order_id', searchId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        modifiedDT: new Date().toISOString()
      })
      .eq('order_id', searchId);

    if (updateError) {
      console.error('Error cancelling installation:', updateError);
      return res.status(500).json({ 
        error: 'Failed to cancel installation',
        details: updateError.message
      });
    }

    // Remove from installation schedule if exists
    const { error: scheduleError } = await supabase
      .from('installation_schedule')
      .delete()
      .eq('order_id', searchId);

    if (scheduleError) {
      console.warn('Error removing from installation schedule:', scheduleError);
      // Don't fail the request if schedule deletion fails
    }

    console.log(`✅ Installation cancelled successfully for order ${searchId}`);

    return res.status(200).json({
      success: true,
      message: 'Installation cancelled successfully',
      orderId: searchId
    });

  } catch (error) {
    console.error('Unexpected error cancelling installation:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
} 