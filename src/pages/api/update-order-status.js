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
    endInstallationMinute,
    paidAmount
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
    let oldStatus = 'new'; // Default status for new orders
    let currentOrder = null;

    const { data: currentOrderData, error: fetchError } = await supabase
      .from('orders')
      .select('order_id, status')
      .eq('order_id', orderId)
      .single();

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
      currentOrder = currentOrderData;
      oldStatus = currentOrder.status;

    }

    // Prepare update data
    const updateData = {
      status: newStatus,
      notes: notes,
      modifiedDT: new Date().toISOString()
    };



    // Handle installation booking
    if (newStatus === 'installation_booked' && startInstallationDate && endInstallationDate) {


      // Format time slots for the installation_schedule table
      const startTimeSlot = `${startInstallationHour}:${startInstallationMinute}`;
      const endTimeSlot = `${endInstallationHour}:${endInstallationMinute}`;



      // Check if installation schedule already exists for this order
      const { data: existingSchedule, error: scheduleCheckError } = await supabase
        .from('installation_schedule')
        .select('id')
        .eq('order_id', orderId)
        .single();



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



      let scheduleResult;
      if (existingSchedule) {
        // Update existing schedule

        scheduleResult = await supabase
          .from('installation_schedule')
          .update(scheduleData)
          .eq('order_id', orderId)
          .select();
      } else {
        // Insert new schedule

        scheduleResult = await supabase
          .from('installation_schedule')
          .insert([scheduleData])
          .select();
      }


      if (scheduleResult.error) {

        return res.status(500).json({
          error: 'Failed to create/update installation schedule',
          details: scheduleResult.error.message
        });
      }

    } else if (newStatus === 'installation_booked') {

    }

    // Update order status


    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
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

    // Update paid amount if provided
    if (paidAmount !== undefined && paidAmount !== null && paidAmount !== '') {


      // Check if payment record exists
      const { data: existingPayment, error: paymentCheckError } = await supabase
        .from('payment_and_tracking')
        .select('id')
        .eq('order_id', orderId)
        .single();



      const paymentData = {
        order_id: orderId,
        paid_amount: parseFloat(paidAmount),
      };

      let paymentResult;
      if (existingPayment) {
        // Update existing payment record

        paymentResult = await supabase
          .from('payment_and_tracking')
          .update(paymentData)
          .eq('order_id', orderId)
          .select();
      } else {
        // Create new payment record

        paymentResult = await supabase
          .from('payment_and_tracking')
          .insert([paymentData])
          .select();
      }



      if (paymentResult.error) {

        return res.status(500).json({
          error: 'Failed to update payment amount',
          details: paymentResult.error.message
        });
      }


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