import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  console.log('🚀 get-weekly-installations API called');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables
    console.log('🔍 Checking environment variables...');
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('✅ Environment variables found');
    console.log('🔧 Creating Supabase client...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('✅ Supabase client created successfully');

    const { startDate, endDate } = req.query;

    // Add more detailed logging
    console.log('🔍 API get-weekly-installations called');
    console.log('📅 Query params:', req.query);
    console.log('🌐 Request URL:', req.url);

    // Validate required parameters
    if (!startDate || !endDate) {
      console.error('❌ Missing parameters:', { startDate, endDate });
      return res.status(400).json({ 
        error: 'Missing required parameters: startDate and endDate are required' 
      });
    }

    console.log(`📊 Fetching installations from ${startDate} to ${endDate}`);

    // Fetch installations with customer and product data
    const { data: installations, error } = await supabase
      .from('installation_schedule')
      .select(`
        id,
        order_id,
        scheduled_date,
        time_slot,
        notes,
        created_at,
        guest_orders!inner (
          id,
          first_name,
          middle_name,
          last_name,
          phone
        )
      `)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true })
      .order('time_slot', { ascending: true });

    if (error) {
      console.error('Error fetching installations:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch installations',
        details: error.message
      });
    }

    // Get product details for each order
    const installationsWithProducts = await Promise.all(
      installations.map(async (installation) => {
        try {
          // Get order items and products (using explicit join instead of foreign key)
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              quantity,
              service_option,
              product_id
            `)
            .eq('order_id', installation.order_id);

          // Get product details separately for each order item
          let orderItemsWithProducts = [];
          if (orderItems && !itemsError) {
            for (const item of orderItems) {
              const { data: product, error: productError } = await supabase
                .from('products')
                .select('brand, model, type, price')
                .eq('ProductID', item.product_id)
                .single();

              if (!productError && product) {
                orderItemsWithProducts.push({
                  quantity: item.quantity,
                  service_option: item.service_option,
                  products: product
                });
              }
            }
          }

          if (itemsError) {
            console.warn(`Error fetching items for order ${installation.order_id}:`, itemsError);
          }

          // Format customer name
          const customer = installation.guest_orders;
          const customerName = `${customer.first_name} ${customer.middle_name || ''} ${customer.last_name}`.trim();

          // Format products summary
          const products = orderItemsWithProducts || [];
          const productsSummary = products.map(item => 
            `${item.products.brand} ${item.products.model} (${item.quantity}x)`
          ).join(', ');

          const mainProduct = products[0]?.products;

          return {
            id: installation.id,
            orderId: installation.order_id,
            scheduledDate: installation.scheduled_date,
            timeSlot: installation.time_slot,
            notes: installation.notes,
            customerName,
            customerPhone: customer.phone,
            productCount: products.length,
            productsSummary,
            mainProductBrand: mainProduct?.brand,
            mainProductModel: mainProduct?.model,
            totalProducts: products.reduce((sum, item) => sum + item.quantity, 0)
          };
        } catch (itemError) {
          console.warn(`Error processing installation ${installation.id}:`, itemError);
          
          // Return installation with basic info even if product fetch fails
          const customer = installation.guest_orders;
          const customerName = `${customer.first_name} ${customer.middle_name || ''} ${customer.last_name}`.trim();
          
          return {
            id: installation.id,
            orderId: installation.order_id,
            scheduledDate: installation.scheduled_date,
            timeSlot: installation.time_slot,
            notes: installation.notes,
            customerName,
            customerPhone: customer.phone,
            productCount: 0,
            productsSummary: 'Error loading products',
            mainProductBrand: 'Unknown',
            mainProductModel: 'Unknown',
            totalProducts: 0
          };
        }
      })
    );

    console.log(`Found ${installationsWithProducts.length} installations for the week`);

    return res.status(200).json({
      success: true,
      installations: installationsWithProducts,
      count: installationsWithProducts.length,
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