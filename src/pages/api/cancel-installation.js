import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  // Accept both DELETE and PATCH methods for cancellation
  if (req.method !== 'DELETE' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed. Use DELETE or PATCH.' });
  }
  
  // Set CORS headers for actual requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { installation_id, order_id, admin_id, reason } = req.body;

    // Validate required parameters - prefer installation_id, fallback to order_id
    const searchId = installation_id || order_id;
    const searchField = installation_id ? 'id' : 'order_id';

    if (!searchId) {
      return res.status(400).json({ 
        error: 'Missing required parameter: installation_id (or order_id) is required' 
      });
    }

    // 1. Fetch existing installation schedule
    let query = supabase
      .from('installation_schedule')
      .select('id, order_id, scheduled_date, time_slot, notes')
      .eq(searchField, searchId);

    // If searching by order_id, get the most recent installation
    if (searchField === 'order_id') {
      query = query.order('created_at', { ascending: false }).limit(1);
    }

    const { data: existingInstallation, error: fetchError } = installation_id 
      ? await query.single()  // Use .single() only when searching by installation_id
      : await query.maybeSingle(); // Use .maybeSingle() when searching by order_id

    if (fetchError || !existingInstallation) {
      console.error('Error fetching existing installation:', fetchError);
      return res.status(404).json({ 
        error: 'Installation not found',
        message: `No installation schedule found for ${searchField} ${searchId}`
      });
    }

    const cancelledDate = existingInstallation.scheduled_date;
    const cancelledTime = existingInstallation.time_slot;
    const installationId = existingInstallation.id;

    // 2. Verify order exists and get current status
    const { data: orderData, error: orderError } = await supabase
      .from('payment_and_tracking')
      .select('status')
      .eq('order_id', existingInstallation.order_id)
      .single();

    if (orderError) {
      console.error('Error fetching order status:', orderError);
      return res.status(404).json({ 
        error: 'Order not found in payment tracking',
        details: orderError.message
      });
    }

    const currentStatus = orderData.status;

    // 3. Delete installation schedule record
    const { error: deleteError } = await supabase
      .from('installation_schedule')
      .delete()
      .eq('id', installationId);

    if (deleteError) {
      console.error('Error deleting installation schedule:', deleteError);
      return res.status(500).json({ 
        error: 'Failed to cancel installation schedule',
        details: deleteError.message
      });
    }

    // 4. Revert order status back to 'confirmed' (policy decision)
    const newStatus = 'confirmed';
    const { error: statusUpdateError } = await supabase
      .from('orders')
      .update({ status: newStatus, modifiedDT: new Date().toISOString() })
      .eq('order_id', existingInstallation.order_id);

    if (statusUpdateError) {
      console.error('Error updating order status:', statusUpdateError);
      // Try to restore the installation schedule if status update fails
      await supabase
        .from('installation_schedule')
        .insert([{
          id: installationId,
          order_id: existingInstallation.order_id,
          scheduled_date: cancelledDate,
          time_slot: cancelledTime,
          notes: existingInstallation.notes
        }]);
      
      return res.status(500).json({ 
        error: 'Failed to update order status',
        details: statusUpdateError.message
      });
    }

    // 5. Log cancellation to history
    const historyNotes = `Installation cancelled. Was scheduled for ${cancelledDate} at ${cancelledTime}${reason ? `. Reason: ${reason}` : ''}`;
    
    const { error: historyError } = await supabase
      .from('orders')
      .update([{
        order_id: existingInstallation.order_id,
        status: newStatus,
        changed_by: admin_id || null,
        changed_at: new Date().toISOString(),
        notes: historyNotes
      }]).eq('order_id', existingInstallation.order_id);

    if (historyError) {
      console.error('Error logging cancellation history:', historyError);
      // Don't fail the entire request if history logging fails, but warn
    }

    console.log(`Installation successfully cancelled for order ${existingInstallation.order_id}. Schedule was: ${cancelledDate} ${cancelledTime}`);

    return res.status(200).json({
      success: true,
      order_id: existingInstallation.order_id,
      installation_id: installationId,
      cancelled_schedule: {
        date: cancelledDate,
        time: cancelledTime
      },
      status_change: {
        from: currentStatus,
        to: newStatus
      },
      message: `Installation cancelled. Order status reverted from ${currentStatus} to ${newStatus}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in cancel-installation:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  }
} 