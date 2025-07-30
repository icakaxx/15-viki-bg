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

  const { 
    orderId, 
    newStatus, 
    notes, 
    adminId,
    startInstallationDate,
    startInstallationHour,
    startInstallationMinute,
    endInstallationDate,
    endInstallationHour,
    endInstallationMinute
  } = req.body;

  if (!orderId || !newStatus) {
    return res.status(400).json({ 
      error: 'Order ID and new status are required' 
    });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    console.log('=== UPDATE ORDER STATUS API CALL ===');
    console.log('Request body:', req.body);
    console.log('Order ID:', orderId);
    console.log('New Status:', newStatus);
    console.log('Installation data:', {
      startInstallationDate,
      startInstallationHour,
      startInstallationMinute,
      endInstallationDate,
      endInstallationHour,
      endInstallationMinute
    });

    // Fetch current status
    console.log('Fetching current order status...');
    let { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status, order_id')
      .eq('order_id', orderId)
      .single();

    console.log('Fetch result:', { currentOrder, fetchError });

    let oldStatus = 'new'; // Default status for new orders

    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('No order found in orders table, creating new record...');
      // No order record exists yet - this is a new order

      // Verify the order exists in orders (only for real orders)
      const { data: guestOrder, error: guestError } = await supabase
        .from('orders')
        .select('order_id')
        .eq('order_id', orderId)
        .single();

      if (guestError) {
        console.error('Guest order fetch error:', guestError);
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
        console.error('Create order error:', createError);
        return res.status(500).json({ 
          error: 'Failed to create order record',
          details: createError.message
        });
      }

      currentOrder = newOrder;
      oldStatus = 'new';
    } else if (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(404).json({ 
        error: 'Order not found, id: ' + orderId,
        details: fetchError.message
      });
    } else {
      oldStatus = currentOrder.status;
      console.log('Current order status:', oldStatus);
    }

    // Check if status is actually changing
    if (oldStatus === newStatus) {
      return res.status(400).json({ 
        error: `Order is already in status: ${newStatus}` 
      });
    }


    // Prepare update data
    const updateData = { 
      status: newStatus, 
      notes: notes, 
      modifiedDT: new Date().toISOString() 
    };

    console.log('Initial update data:', updateData);

    // Handle installation booking
    if (newStatus === 'installation_booked' && startInstallationDate && endInstallationDate) {
      console.log('Processing installation booking...');
      
      // Format time slots for the installation_schedule table
      const startTimeSlot = `${startInstallationHour}:${startInstallationMinute}`;
      const endTimeSlot = `${endInstallationHour}:${endInstallationMinute}`;
      
      console.log('Time slots:', { startTimeSlot, endTimeSlot });
      
      // Check if installation schedule already exists for this order
      const { data: existingSchedule, error: scheduleCheckError } = await supabase
        .from('installation_schedule')
        .select('id')
        .eq('order_id', orderId)
        .single();
      
      console.log('Existing schedule check:', { existingSchedule, scheduleCheckError });
      
             const scheduleData = {
         order_id: orderId,
         scheduled_date: startInstallationDate,
         time_slot: startTimeSlot,
         end_date: endInstallationDate,
         end_time_slot: endTimeSlot,
         notes: notes || null
       };
       
       // Only add created_by if it's a valid UUID
       if (adminId && adminId !== 'admin' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(adminId)) {
         scheduleData.created_by = adminId;
       }
      
      console.log('Schedule data to insert/update:', scheduleData);
      
      let scheduleResult;
      if (existingSchedule) {
        // Update existing schedule
        console.log('Updating existing installation schedule...');
        scheduleResult = await supabase
          .from('installation_schedule')
          .update(scheduleData)
          .eq('order_id', orderId)
          .select();
      } else {
        // Insert new schedule
        console.log('Creating new installation schedule...');
        scheduleResult = await supabase
          .from('installation_schedule')
          .insert([scheduleData])
          .select();
      }
      
      console.log('Schedule operation result:', scheduleResult);
      
      if (scheduleResult.error) {
        console.error('Installation schedule error:', scheduleResult.error);
        return res.status(500).json({ 
          error: 'Failed to create/update installation schedule',
          details: scheduleResult.error.message
        });
      }
      
      console.log('✅ Installation schedule created/updated successfully');
    } else if (newStatus === 'installation_booked') {
      console.log('Installation booking requested but missing date data:', {
        startInstallationDate,
        endInstallationDate
      });
    }

    // Update order status
    console.log('Final update data:', updateData);
    console.log('Updating order in database...');
    
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('order_id', orderId);

    console.log('Update result:', { updateError });

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

    console.log('Inserting status history...');
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert([historyData]);

    console.log('History insert result:', { historyError });

    if (historyError) {
      console.error('History insertion failed:', historyError);
      // Don't fail the request if history insertion fails
    }


    console.log('✅ Order status update completed successfully');
    return res.status(200).json({
      success: true,
      orderId: orderId,
      oldStatus: oldStatus,
      newStatus: newStatus,
      message: `Order status updated from ${oldStatus} to ${newStatus}`
    });

  } catch (error) {
    console.error('❌ Unexpected error in update-order-status:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}