import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables');
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
    const { orderId, newStatus, adminId, notes } = req.body;

    // Validate required parameters
    if (!orderId || !newStatus) {
      return res.status(400).json({ 
        error: 'Missing required parameters: orderId and newStatus are required' 
      });
    }

    // Validate status values
    const validStatuses = ['new', 'confirmed', 'installation_booked', 'installed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Fetch current status for the order
    console.log(`Fetching current status for order ${orderId}...`);
    const { data: currentOrder, error: fetchError } = await supabase
      .from('payment_and_tracking')
      .select('status, order_id')
      .eq('order_id', orderId)
      .single();

    if (fetchError) {
      console.error('Error fetching current order status:', fetchError);
      return res.status(404).json({ 
        error: 'Order not found or unable to fetch current status',
        details: fetchError.message
      });
    }

    const oldStatus = currentOrder.status;

    // Check if status is actually changing
    if (oldStatus === newStatus) {
      return res.status(400).json({ 
        error: `Order is already in status: ${newStatus}` 
      });
    }

    console.log(`Updating order ${orderId} status: ${oldStatus} → ${newStatus}`);

    // Update payment_and_tracking status
    const { error: updateError } = await supabase
      .from('payment_and_tracking')
      .update({ status: newStatus })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update order status',
        details: updateError.message
      });
    }

    // Insert status change into history
    console.log('Inserting status change into history...');
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert([{
        order_id: orderId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: adminId || null, // UUID of admin (null if system change)
        notes: notes || `Status updated from ${oldStatus} to ${newStatus} by admin`
      }]);

    if (historyError) {
      console.error('Error inserting status history:', historyError);
      // Don't fail the entire request if history insert fails
      console.warn('Status history insert failed, but order status was updated successfully');
    }

    console.log(`Order ${orderId} status successfully updated: ${oldStatus} → ${newStatus}`);

    // Return success response
    return res.status(200).json({
      success: true,
      orderId: orderId,
      oldStatus: oldStatus,
      newStatus: newStatus,
      message: `Order status updated from ${oldStatus} to ${newStatus}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Order status update error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
      success: false
    });
  }
} 