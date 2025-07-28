import { createClient } from '@supabase/supabase-js';
import { areSlotsAvailable, isSlotAvailable } from '../../lib/slotUtils';

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
    const { orderId, scheduledDate, timeSlots, timeSlot, duration, adminId, notes } = req.body;

    // Support both new (timeSlots array) and legacy (single timeSlot) formats
    const slotsToBook = timeSlots || [timeSlot];
    
    // Remove any duplicate slots that might have been sent
    const uniqueSlots = [...new Set(slotsToBook)];
    
    const installationDuration = duration || 1; // Default 1 hour for backward compatibility

    // Validate required parameters
    if (!orderId || !scheduledDate || (!timeSlots && !timeSlot)) {
      return res.status(400).json({ 
        error: 'Missing required parameters: orderId, scheduledDate, and timeSlots (or timeSlot) are required' 
      });
    }

    // Validate that we have at least one slot
    if (uniqueSlots.length === 0) {
      return res.status(400).json({ 
        error: 'No time slots provided',
        message: 'At least one time slot must be selected for the installation.' 
      });
    }

    // 1. Check if all time slots are available
    const availability = await areSlotsAvailable(scheduledDate, uniqueSlots);
    
    if (!availability.available) {
      return res.status(409).json({ 
        error: 'Time slots not available',
        message: availability.reason || `Some slots are no longer available: ${availability.unavailableSlots?.join(', ')}`,
        unavailableSlots: availability.unavailableSlots
      });
    }

    // 2. Verify order exists and is in correct status
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('status, order_id')
      .eq('order_id', orderId)
      .single();

    if (orderError) {
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

    // 3. Insert installation schedule records for each time slot
    const scheduleInserts = uniqueSlots.map(slot => ({
      order_id: orderId,
      scheduled_date: scheduledDate,
      time_slot: slot,
      duration: installationDuration,
      created_by: adminId || null,
      notes: notes || null
    }));
    
    let { data: scheduleData, error: scheduleError } = await supabase
      .from('installation_schedule')
      .insert(scheduleInserts)
      .select();

    // If insertion failed due to missing duration column, try without duration
    if (scheduleError && scheduleError.message && scheduleError.message.includes("duration")) {
      
      const scheduleInsertsWithoutDuration = uniqueSlots.map(slot => ({
        order_id: orderId,
        scheduled_date: scheduledDate,
        time_slot: slot,
        created_by: adminId || null,
        notes: notes || null
      }));
      
      const result = await supabase
        .from('installation_schedule')
        .insert(scheduleInsertsWithoutDuration)
        .select();
        
      scheduleData = result.data;
      scheduleError = result.error;
      
      if (!scheduleError) {
      }
    }

    if (scheduleError) {
      // Handle specific constraint violations
      if (scheduleError.code === '23505') { // Unique constraint violation
        return res.status(409).json({ 
          error: 'Time slot conflict',
          message: 'One or more selected time slots are no longer available. Please refresh the calendar and try again.',
          details: 'Another installation was booked in the selected time slot while you were making your selection.',
          debugInfo: {
            errorCode: scheduleError.code,
            conflictingSlots: uniqueSlots
          }
        });
      }
      
      // Handle foreign key constraint violations  
      if (scheduleError.code === '23503') {
        return res.status(400).json({ 
          error: 'Invalid order reference',
          message: 'The specified order does not exist.',
          details: scheduleError.message
        });
      }
      
      // Generic database error
      return res.status(500).json({ 
        error: 'Failed to create installation schedule',
        details: scheduleError.message,
        debugInfo: {
          errorCode: scheduleError.code,
          errorHint: scheduleError.hint,
          scheduleInserts: scheduleInserts
        }
      });
    }

    // 4. Update order status to 'installation_booked'
    const { error: statusUpdateError } = await supabase
      .from('orders')
      .update({ status: 'installation_booked', modifiedDT: new Date().toISOString() })
      .eq('order_id', orderId);

    if (statusUpdateError) {
      // Try to rollback the installation schedule
      const scheduleIds = scheduleData.map(s => s.id);
      await supabase
        .from('installation_schedule')
        .delete()
        .in('id', scheduleIds);
      
      return res.status(500).json({ 
        error: 'Failed to update order status',
        details: statusUpdateError.message
      });
    }

    // 5. Log status change to history
    const timeRange = uniqueSlots.length > 1 
      ? `${uniqueSlots[0]} - ${uniqueSlots[uniqueSlots.length-1]}` 
      : uniqueSlots[0];
    
    const { error: historyError } = await supabase
      .from('orders')
      .insert([{
        order_id: orderId,
        status: 'installation_booked',
        changed_by: adminId || null,
        changed_at: new Date().toISOString(),
        notes: `INSTALLATION_SCHEDULED_MESSAGE:${scheduledDate}:${timeRange}:${installationDuration}${notes ? `:${notes}` : ''}`
      }]);

    if (historyError) {
      // Don't fail the entire request if history logging fails
    }

    return res.status(200).json({
      success: true,
      installationIds: scheduleData.map(s => s.id),
      orderId: orderId,
      scheduledDate: scheduledDate,
      timeSlots: uniqueSlots,
      duration: installationDuration,
      message: `INSTALLATION_SCHEDULED_MESSAGE:${scheduledDate}:${timeRange}:${installationDuration}`
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  }
} 