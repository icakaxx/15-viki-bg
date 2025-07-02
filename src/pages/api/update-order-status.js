import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  console.log('=== UPDATE ORDER STATUS API CALLED ===');
  
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

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { orderId, newStatus, adminId, notes, installationDate } = req.body;
    console.log('Request data:', { orderId, newStatus, adminId, notes, installationDate });

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

    // Fetch current status - first check if payment tracking exists
    console.log(`Fetching current status for order ${orderId}...`);
    let { data: currentOrder, error: fetchError } = await supabase
      .from('payment_and_tracking')
      .select('status, order_id')
      .eq('order_id', orderId)
      .single();

    let oldStatus = 'new'; // Default status for new orders

    if (fetchError && fetchError.code === 'PGRST116') {
      // No payment tracking record exists yet - this is a new order
      console.log(`No payment tracking found for order ${orderId}, treating as new order`);
      
      // Verify the order exists in guest_orders
      const { data: guestOrder, error: guestError } = await supabase
        .from('guest_orders')
        .select('id')
        .eq('id', orderId)
        .single();

      if (guestError) {
        console.error('Error fetching guest order:', guestError);
        return res.status(404).json({ 
          error: 'Order not found',
          details: 'Order does not exist in guest_orders table'
        });
      }

      // Create payment tracking record
      const { data: newTracking, error: createError } = await supabase
        .from('payment_and_tracking')
        .insert([{ 
          order_id: orderId, 
          status: 'new',
          payment_method: null 
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating payment tracking:', createError);
        return res.status(500).json({ 
          error: 'Failed to create payment tracking record',
          details: createError.message
        });
      }

      currentOrder = newTracking;
      oldStatus = 'new';
    } else if (fetchError) {
      console.error('Error fetching current order status:', fetchError);
      return res.status(404).json({ 
        error: 'Order not found',
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
    const historyData = {
      order_id: orderId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: adminId || null,
      changed_at: installationDate && newStatus === 'installed' 
        ? new Date(installationDate).toISOString() 
        : new Date().toISOString(),
      notes: notes || `Status updated from ${oldStatus} to ${newStatus} by admin`
    };
    
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert([historyData]);

    if (historyError) {
      console.error('Error inserting status history:', historyError);
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
    console.error('=== CATCH BLOCK ERROR ===');
    console.error('Error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
      success: false
    });
  }
} 