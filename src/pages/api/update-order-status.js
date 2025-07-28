import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, newStatus, notes, adminId } = req.body;

  if (!orderId || !newStatus) {
    return res.status(400).json({ 
      error: 'Order ID and new status are required' 
    });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    
    // Fetch current status
    
    let { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status, order_id')
      .eq('order_id', orderId)
      .single();

    let oldStatus = 'new'; // Default status for new orders

    if (fetchError && fetchError.code === 'PGRST116') {
      // No order record exists yet - this is a new order
      
      // Verify the order exists in orders (only for real orders)
      const { data: guestOrder, error: guestError } = await supabase
        .from('orders')
        .select('order_id')
        .eq('order_id', orderId)
        .single();

      if (guestError) {
        return res.status(404).json({ 
          error: 'Order not found, id: ' + orderId,
          details: 'Order does not exist in orders table'
        });
      }

      // Create order record
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert([{ 
          order_id: orderId, 
          status: 'new',
          modifiedDT: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ 
          error: 'Failed to create order record',
          details: createError.message
        });
      }

      currentOrder = newOrder;
      oldStatus = 'new';
    } else if (fetchError) {
      return res.status(404).json({ 
        error: 'Order not found, id: ' + orderId,
        details: fetchError.message
      });
    } else {
      oldStatus = currentOrder.status;
    }

    // Check if status is actually changing
    if (oldStatus === newStatus) {
      return res.status(400).json({ 
        error: `Order is already in status: ${newStatus}` 
      });
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus, notes: notes, modifiedDT: new Date().toISOString() })
      .eq('order_id', orderId);

    if (updateError) {
      return res.status(500).json({ 
        error: 'Failed to update order status',
        details: updateError.message
      });
    }

    // Insert status change into history
    const historyData = {
      order_id: orderId,
      status: newStatus,
      changed_by: adminId || null,
      changed_at: new Date().toISOString(),
      notes: notes || null
    };

    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert([historyData]);

    if (historyError) {
      // Don't fail the request if history insertion fails
    }

    return res.status(200).json({
      success: true,
      orderId: orderId,
      oldStatus: oldStatus,
      newStatus: newStatus,
      message: `Order status updated from ${oldStatus} to ${newStatus}`
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
} 