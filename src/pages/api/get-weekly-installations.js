import { createClient } from '@supabase/supabase-js';

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export default async function handler(req, res) {

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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: 'Server configuration error - Supabase credentials not configured'
      });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters: startDate and endDate are required'
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

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
      return res.status(500).json({
        error: 'Database query failed',
        message: error.message,
        details: error
      });
    }

    if (!installations || installations.length === 0) {
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

    // Fetch order status data
    const { data: orderStatuses, error: orderStatusError } = await supabase
      .from('orders')
      .select(`
        order_id,
        status
      `)
      .in('order_id', orderIds);

    if (orderStatusError) {
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
      return res.status(500).json({
        error: 'Failed to fetch customer data',
        message: customerError.message,
        details: customerError
      });
    }

    // Fetch order items for all installations' orders
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`order_id, product_id, quantity, service_option, accessories, includes_installation`)
      .in('order_id', orderIds);

    if (itemsError) {
      return res.status(500).json({
        error: 'Failed to fetch order items',
        message: itemsError.message,
        details: itemsError
      });
    }

    // Gather unique product IDs
    const productIds = [...new Set((orderItems || []).map(item => item.product_id))];

    // Fetch product details
    let productsMapById = {};
    let productsMapByLegacyId = {};
    if (productIds.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, brand, model, image_url, price')
        .in('id', productIds);

      productsMapById = (products || []).reduce((acc, p) => {
        acc[p.id] = { brand: p.brand, model: p.model, image_url: p.image_url, price: p.price };
        return acc;
      }, {});

      // Fallback for schemas that use legacy ProductID column
      const missingIds = productIds.filter(pid => !productsMapById[pid]);
      if (missingIds.length > 0) {
        const legacyResult = await supabase
          .from('products')
          .select('ProductID, brand, model, image_url, price')
          .in('ProductID', missingIds);

        if (!legacyResult.error && Array.isArray(legacyResult.data)) {
          productsMapByLegacyId = (legacyResult.data || []).reduce((acc, p) => {
            acc[p.ProductID] = { brand: p.brand, model: p.model, image_url: p.image_url, price: p.price };
            return acc;
          }, {});
        }
      }
    }

    // Create maps for quick lookup
    const orderStatusMap = {};
    orderStatuses.forEach(order => {
      orderStatusMap[order.order_id] = order;
    });

    const customerMap = {};
    customerData.forEach(customer => {
      customerMap[customer.order_id] = customer;
    });

    const itemsByOrderId = {};
    (orderItems || []).forEach(item => {
      if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
      itemsByOrderId[item.order_id].push(item);
    });

    // Transform the data to match the frontend expectations
    const transformedInstallations = installations.map(installation => {

      // Fix installations with invalid end times (where end time is before start time)
      let endTimeSlot = installation.end_time_slot || installation.time_slot;

      if (endTimeSlot <= installation.time_slot && endTimeSlot !== installation.time_slot) {

        // Calculate correct end time (add 1 hour to start time)
        const [startHours, startMinutes] = installation.time_slot.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = startTotalMinutes + 60; // Add 1 hour
        const endHours = Math.floor(endTotalMinutes / 60);
        const endMinutes = endTotalMinutes % 60;
        endTimeSlot = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

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

      // Derive product info for summary display
      const items = (itemsByOrderId[installation.order_id] || []).map(it => {
        // Normalize accessories
        let accessories = it.accessories;
        if (accessories === null || accessories === undefined) {
          accessories = [];
        } else if (typeof accessories === 'string') {
          try { accessories = JSON.parse(accessories); } catch (_) { accessories = []; }
        }
        // Normalize includes_installation
        let includesInstallation = it.includes_installation;
        if (includesInstallation === null || includesInstallation === undefined) {
          includesInstallation = false;
        } else if (typeof includesInstallation === 'string') {
          includesInstallation = includesInstallation.toLowerCase() === 'true' || includesInstallation === '1';
        }
        return { ...it, accessories, includes_installation: includesInstallation };
      });
      const totalProducts = items.length;
      const main = items[0]
        ? (productsMapById[items[0].product_id] || productsMapByLegacyId[items[0].product_id] || {})
        : {};
      const productsSummary = items.length > 0
        ? items.map(i => {
          const p = productsMapById[i.product_id] || productsMapByLegacyId[i.product_id] || { brand: 'Unknown', model: '' };
          return `${p.brand || 'Unknown'} ${p.model || ''} × ${i.quantity || 1}`.trim();
        }).join('\n')
        : (req.headers['accept-language'] || '').startsWith('bg') ? 'Няма продукти' : 'No products';

      // Build detailed products array for UI rendering (image, accessories, etc.)
      const detailedProducts = items.map(i => {
        const p = productsMapById[i.product_id] || productsMapByLegacyId[i.product_id] || {};
        const price = p.price ? parseFloat(p.price) : null;
        const quantity = i.quantity || 1;
        return {
          product_id: i.product_id,
          brand: p.brand || 'Unknown',
          model: p.model || '',
          image_url: p.image_url || null,
          price,
          quantity,
          total_price: price != null ? price * quantity : null,
          accessories: Array.isArray(i.accessories) ? i.accessories : [],
          includes_installation: !!i.includes_installation,
          service_option: i.service_option || null,
        };
      });

      return {
        id: installation.id,
        orderId: installation.order_id,
        scheduledDate: installation.scheduled_date,
        timeSlot: installation.time_slot,
        endTimeSlot: endTimeSlot,
        endDate: installation.end_date || null,
        notes: installation.notes || '',
        createdBy: installation.created_by,
        createdAt: installation.created_at,
        status: orderStatus?.status || 'pending',
        isCompleted: (orderStatus?.status || '').toLowerCase() === 'installed',
        customerName: customerName,
        customerPhone: customer?.phone || '',
        customerTown: customer?.town || '',
        mainProductBrand: main.brand || '',
        mainProductModel: main.model || '',
        totalProducts: totalProducts,
        productsSummary: productsSummary,
        products: detailedProducts
      };
    });

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
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 