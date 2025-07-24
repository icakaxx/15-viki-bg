import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  console.log('=== UPDATE ORDER STATUS API CALLED ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Set CORS headers for actual requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    const { orderId, newStatus, adminId, notes, startInstallationDate, startInstallationHour, startInstallationMinute, endInstallationDate, endInstallationHour, endInstallationMinute } = req.body;
    console.log('Request data:', { orderId, newStatus, adminId, notes, startInstallationDate, startInstallationHour, startInstallationMinute, endInstallationDate, endInstallationHour, endInstallationMinute });

    // Validate required parameters
    if (!orderId || !newStatus) {
      return res.status(400).json({ 
        error: 'Missing required parameters: orderId and newStatus are required' 
      });
    }

    // Validate status values
    const validStatuses = ['new', 'confirmed', 'installation_booked', 'installed', 'cancelled', 'returned_from_calendar'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Fetch current status - first check if payment tracking exists
    console.log(`Fetching current status for order ${orderId}...`);
    
    // Check if this is a mock order (orderId >= 1000)
    const isMockOrder = orderId >= 1000;
    console.log(`Order ${orderId} is mock order: ${isMockOrder}`);
    
    let { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status, order_id')
      .eq('order_id', orderId)
      .single();

    let oldStatus = 'new'; // Default status for new orders

    if (fetchError && fetchError.code === 'PGRST116') {
      // No payment tracking record exists yet - this is a new order
      console.log(`No payment tracking found for order ${orderId}, treating as new order`);
      
        // Verify the order exists in orders (only for real orders)
        const { data: guestOrder, error: guestError } = await supabase
          .from('orders')
          .select('order_id')
          .eq('order_id', orderId)
          .single();

        if (guestError) {
          console.error('Error fetching guest order:', guestError);
          return res.status(404).json({ 
            error: 'Order not found, id: ' + orderId,
            details: 'Order does not exist in orders table'
          });
        
      }

      // Create payment tracking record
      const { data: newTracking, error: createError } = await supabase
        .from('orders')
        .insert([{ 
          id: orderId, 
          status: isMockOrder ? 'installation_booked' : 'new', // Mock orders are already booked
          payment_method: isMockOrder ? 'mock' : null,
          modifiedDT: new Date().toISOString()
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
      oldStatus = isMockOrder ? 'installation_booked' : 'new';
    } else if (fetchError) {
      console.error('Error fetching current order status:', fetchError);
      

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

    console.log(`Updating order ${orderId} status: ${oldStatus} → ${newStatus}`);

    // Update payment_and_tracking status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus,notes:notes, modifiedDT: new Date().toISOString() })
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
      status: newStatus,
      changed_by: adminId || null,
      changed_at: new Date().toISOString(),
      notes: notes || `STATUS_CHANGE_MESSAGE:${oldStatus}:${newStatus}`
    };
    
    const { error: historyError } = await supabase
      .from('orders')
      .insert([historyData]);

    if (historyError) {
      console.error('Error inserting status history:', historyError);
      console.warn('Status history insert failed, but order status was updated successfully');
    }

    // If status is being set to 'installation_booked', create installation schedule entries
    if (newStatus === 'installation_booked' && startInstallationDate && endInstallationDate) {
      console.log('Creating installation schedule entries...');
      
      try {
        // Create installation schedule entry using the new time format
        const installationData = {
          order_id: orderId,
          scheduled_date: startInstallationDate, // Already in YYYY-MM-DD format
          time_slot: `${startInstallationHour}:${startInstallationMinute}`,
          end_date: endInstallationDate,
          end_time_slot: `${endInstallationHour}:${endInstallationMinute}`,
          notes: notes || `INSTALLATION_SCHEDULED_MESSAGE:${startInstallationDate}:${startInstallationHour}:${startInstallationMinute}:${endInstallationDate}:${endInstallationHour}:${endInstallationMinute}`,
          created_at: new Date().toISOString()
        };
        
        const { error: installationError } = await supabase
          .from('installation_schedule')
          .insert([installationData]);
        
        if (installationError) {
          console.error('Error creating installation schedule:', installationError);
          console.warn('Installation schedule creation failed, but order status was updated successfully');
        } else {
          console.log('Installation schedule created successfully');
        }
      } catch (dateError) {
        console.error('Error parsing installation dates:', dateError);
        console.warn('Installation schedule creation failed due to date parsing error');
      }
    }

    console.log(`Order ${orderId} status successfully updated: ${oldStatus} → ${newStatus}`);

    // Return success response
    return res.status(200).json({
      success: true,
      orderId: orderId,
      oldStatus: oldStatus,
      newStatus: newStatus,
      message: `STATUS_CHANGE_MESSAGE:${oldStatus}:${newStatus}`,
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