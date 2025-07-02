import { createClient } from '@supabase/supabase-js';
import { isSlotAvailable } from '../../lib/slotUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { orderId, scheduledDate, timeSlot, adminId, notes } = req.body;

    // Validate required parameters
    if (!orderId || !scheduledDate || !timeSlot) {
      return res.status(400).json({ 
        error: 'Missing required parameters: orderId, scheduledDate, and timeSlot are required' 
      });
    }

    console.log(`Booking installation for order ${orderId} on ${scheduledDate} at ${timeSlot}`);

    // 1. Check if the time slot is available using shared utility
    const availability = await isSlotAvailable(scheduledDate, timeSlot);
    
    if (!availability.available) {
      return res.status(409).json({ 
        error: 'Time slot not available',
        message: availability.reason || `The slot ${timeSlot} on ${scheduledDate} is no longer available`
      });
    }

    // 2. Verify order exists and is in correct status
    const { data: orderData, error: orderError } = await supabase
      .from('payment_and_tracking')
      .select('status, order_id')
      .eq('order_id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      return res.status(404).json({ 
        error: 'Order not found',
        details: orderError.message
      });
    }

    if (orderData.status !== 'confirmed') {
      return res.status(400).json({ 
        error: 'Invalid order status',
        message: `Order must be 'confirmed' to schedule installation. Current status: ${orderData.status}`
      });
    }

    // 3. Insert installation schedule record
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('installation_schedule')
      .insert([{
        order_id: orderId,
        scheduled_date: scheduledDate,
        time_slot: timeSlot,
        created_by: adminId || null,
        notes: notes || null
      }])
      .select()
      .single();

    if (scheduleError) {
      console.error('Error creating installation schedule:', scheduleError);
      return res.status(500).json({ 
        error: 'Failed to create installation schedule',
        details: scheduleError.message
      });
    }

    // 4. Update order status to 'installation_booked'
    const { error: statusUpdateError } = await supabase
      .from('payment_and_tracking')
      .update({ status: 'installation_booked' })
      .eq('order_id', orderId);

    if (statusUpdateError) {
      console.error('Error updating order status:', statusUpdateError);
      // Try to rollback the installation schedule
      await supabase
        .from('installation_schedule')
        .delete()
        .eq('id', scheduleData.id);
      
      return res.status(500).json({ 
        error: 'Failed to update order status',
        details: statusUpdateError.message
      });
    }

    // 5. Log status change to history
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert([{
        order_id: orderId,
        old_status: 'confirmed',
        new_status: 'installation_booked',
        changed_by: adminId || null,
        changed_at: new Date().toISOString(),
        notes: `Installation scheduled for ${scheduledDate} at ${timeSlot}${notes ? `. Notes: ${notes}` : ''}`
      }]);

    if (historyError) {
      console.error('Error logging status history:', historyError);
      // Don't fail the entire request if history logging fails
    }

    console.log(`Installation successfully booked for order ${orderId}`);

    return res.status(200).json({
      success: true,
      installationId: scheduleData.id,
      orderId: orderId,
      scheduledDate: scheduledDate,
      timeSlot: timeSlot,
      message: `Installation scheduled for ${scheduledDate} at ${timeSlot}`
    });

  } catch (error) {
    console.error('Error in book-installation:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  }
} 