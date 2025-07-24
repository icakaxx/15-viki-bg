import { createClient } from '@supabase/supabase-js';

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export default async function handler(req, res) {
  console.log('🚀 get-weekly-installations API called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Set CORS headers for actual requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Check environment variables
    console.log('🔍 Checking environment variables...');
    console.log('🔍 NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('🔍 SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error - Supabase credentials not configured' 
      });
    }

    const { startDate, endDate } = req.query;
    console.log('📅 Requested date range:', { startDate, endDate });
    
    if (!startDate || !endDate) {
      console.error('❌ Missing parameters:', { startDate, endDate });
      return res.status(400).json({ 
        error: 'Missing required parameters: startDate and endDate are required' 
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🔍 Querying installations for date range:', { startDate, endDate });

    // Query installation_schedule table first
    const { data: installations, error } = await supabase
      .from('installation_schedule')
      .select(`
        id,
        order_id,
        scheduled_date,
        time_slot,
        end_date,
        end_time_slot,
        notes,
        created_by,
        created_at
      `)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true })
      .order('time_slot', { ascending: true });

    if (error) {
      console.error('❌ Database query error:', error);
      return res.status(500).json({
        error: 'Database query failed',
        message: error.message,
        details: error
      });
    }

    console.log('📊 Raw installations from database:', installations);

    if (!installations || installations.length === 0) {
      console.log('📋 No installations found for the date range');
      return res.status(200).json({
        success: true,
        installations: [],
        count: 0,
        period: {
          startDate,
          endDate
        }
      });
    }

    // Get unique order IDs to fetch order data
    const orderIds = [...new Set(installations.map(inst => inst.order_id))];
    console.log('📋 Order IDs to fetch:', orderIds);

    // Fetch order status data from payment_and_tracking
    const { data: orderStatuses, error: orderStatusError } = await supabase
      .from('orders')
      .select(`
        order_id,
        status
      `)
      .in('order_id', orderIds);

    if (orderStatusError) {
      console.error('❌ Error fetching order status data:', orderStatusError);
      return res.status(500).json({
        error: 'Failed to fetch order status data',
        message: orderStatusError.message,
        details: orderStatusError
      });
    }

    // Fetch customer data from orders
    const { data: customerData, error: customerError } = await supabase
      .from('orders')
      .select(`
        order_id,
        first_name,
        middle_name,
        last_name,
        phone,
        town
      `)
      .in('order_id', orderIds);

    if (customerError) {
      console.error('❌ Error fetching customer data:', customerError);
      return res.status(500).json({
        error: 'Failed to fetch customer data',
        message: customerError.message,
        details: customerError
      });
    }

    console.log('📊 Order status data fetched:', orderStatuses);
    console.log('📊 Customer data fetched:', customerData);

    // Create maps for quick lookup
    const orderStatusMap = {};
    orderStatuses.forEach(order => {
      orderStatusMap[order.order_id] = order;
    });

    const customerMap = {};
    customerData.forEach(customer => {
      customerMap[customer.order_id] = customer;
    });

    // Transform the data to match the frontend expectations
    const transformedInstallations = installations.map(installation => {
      
      // Fix installations with invalid end times (where end time is before start time)
      let endTimeSlot = installation.end_time_slot || installation.time_slot;
      
      if (endTimeSlot <= installation.time_slot && endTimeSlot !== installation.time_slot) {
        console.log('🔧 Fixing installation with invalid end time:', {
          id: installation.id,
          timeSlot: installation.time_slot,
          endTimeSlot: endTimeSlot
        });
        
        // Calculate correct end time (add 1 hour to start time)
        const [startHours, startMinutes] = installation.time_slot.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = startTotalMinutes + 60; // Add 1 hour
        const endHours = Math.floor(endTotalMinutes / 60);
        const endMinutes = endTotalMinutes % 60;
        endTimeSlot = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        
        console.log('✅ Fixed end time to:', endTimeSlot);
      }

      // Get order status and customer data
      const orderStatus = orderStatusMap[installation.order_id];
      const customer = customerMap[installation.order_id];
      
      // Construct customer name from available fields
      let customerName = 'Unknown';
      if (customer) {
        const nameParts = [
          customer.first_name,
          customer.middle_name,
          customer.last_name
        ].filter(part => part && part.trim());
        customerName = nameParts.join(' ').trim() || 'Unknown';
      }

      return {
        id: installation.id,
        orderId: installation.order_id,
        scheduledDate: installation.scheduled_date,
        timeSlot: installation.time_slot,
        endTimeSlot: endTimeSlot,
        notes: installation.notes || '',
        createdBy: installation.created_by,
        createdAt: installation.created_at,
        status: orderStatus?.status || 'pending',
        customerName: customerName,
        customerPhone: customer?.phone || '',
        customerTown: customer?.town || ''
      };
    });

    console.log('📋 Transformed installations:', transformedInstallations.map(inst => ({
      id: inst.id,
      scheduledDate: inst.scheduledDate,
      timeSlot: inst.timeSlot,
      customerName: inst.customerName
    })));

    return res.status(200).json({
      success: true,
      installations: transformedInstallations,
      count: transformedInstallations.length,
      period: {
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('❌ Error in get-weekly-installations:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 