import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    console.log('📊 Fetching analytics data from Supabase...');
    
    // Initialize results
    const analyticsData = {
      accessoryUsage: [],
      installationStats: { withInstallation: 0, withoutInstallation: 0 },
      topSellingByBTU: [],
      topSellingByEnergyRating: [],
      salesOverTime: [],
      totalOrders: 0,
      totalRevenue: 0
    };

    // 1. Accessory Usage
    console.log('📈 Fetching accessory usage...');
    try {
      const { data: accessoryData, error: accessoryError } = await supabase
        .rpc('get_accessory_usage');

      if (accessoryError) {
        console.warn('Accessory usage query failed:', accessoryError);
        // Fallback query
        const { data: fallbackAccessoryData, error: fallbackAccessoryError } = await supabase
          .from('order_accessories')
          .select(`
            accessory_id,
            accessories!inner(name)
          `);

        if (!fallbackAccessoryError && fallbackAccessoryData) {
          // Process the fallback data
          const accessoryCount = {};
          fallbackAccessoryData.forEach(item => {
            const name = item.accessories.name;
            accessoryCount[name] = (accessoryCount[name] || 0) + 1;
          });
          
          analyticsData.accessoryUsage = Object.entries(accessoryCount)
            .map(([name, times_used]) => ({ name, times_used }))
            .sort((a, b) => b.times_used - a.times_used);
        }
      } else if (accessoryData) {
        analyticsData.accessoryUsage = accessoryData;
      }
    } catch (error) {
      console.error('Error fetching accessory usage:', error);
    }

    // 2. Installation Stats
    console.log('🏠 Fetching installation statistics...');
    try {
      const { data: installationData, error: installationError } = await supabase
        .from('orders')
        .select('installation_required');

      if (!installationError && installationData) {
        const withInstallation = installationData.filter(order => order.installation_required).length;
        const withoutInstallation = installationData.length - withInstallation;
        
        analyticsData.installationStats = {
          withInstallation,
          withoutInstallation
        };
      }
    } catch (error) {
      console.error('Error fetching installation stats:', error);
    }

    // 3. Top Selling by BTU
    console.log('🔥 Fetching top selling by BTU...');
    try {
      const { data: btuData, error: btuError } = await supabase
        .from('orders')
        .select(`
          order_products!inner(
            products!inner(capacity_btu)
          )
        `);

      if (!btuError && btuData) {
        const btuCount = {};
        btuData.forEach(order => {
          order.order_products.forEach(op => {
            const btu = op.products.capacity_btu;
            btuCount[btu] = (btuCount[btu] || 0) + 1;
          });
        });
        
        analyticsData.topSellingByBTU = Object.entries(btuCount)
          .map(([capacity_btu, total_sold]) => ({ 
            capacity_btu: parseInt(capacity_btu), 
            total_sold 
          }))
          .sort((a, b) => b.total_sold - a.total_sold);
      }
    } catch (error) {
      console.error('Error fetching BTU data:', error);
    }

    // 4. Top Selling by Energy Rating
    console.log('⚡ Fetching top selling by energy rating...');
    try {
      const { data: energyData, error: energyError } = await supabase
        .from('orders')
        .select(`
          order_products!inner(
            products!inner(energy_rating)
          )
        `);

      if (!energyError && energyData) {
        const energyCount = {};
        energyData.forEach(order => {
          order.order_products.forEach(op => {
            const rating = op.products.energy_rating;
            energyCount[rating] = (energyCount[rating] || 0) + 1;
          });
        });
        
        analyticsData.topSellingByEnergyRating = Object.entries(energyCount)
          .map(([energy_rating, total_sold]) => ({ energy_rating, total_sold }))
          .sort((a, b) => b.total_sold - a.total_sold);
      }
    } catch (error) {
      console.error('Error fetching energy rating data:', error);
    }

    // 5. Sales Over Time
    console.log('📅 Fetching sales over time...');
    try {
      const { data: salesData, error: salesError } = await supabase
        .from('orders')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (!salesError && salesData) {
        const salesByDate = {};
        salesData.forEach(order => {
          const date = order.created_at.split('T')[0]; // YYYY-MM-DD
          salesByDate[date] = (salesByDate[date] || 0) + 1;
        });
        
        analyticsData.salesOverTime = Object.entries(salesByDate)
          .map(([period, order_count]) => ({ period, order_count }))
          .sort((a, b) => new Date(a.period) - new Date(b.period));
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }

    // 6. Total Orders and Revenue
    console.log('💰 Fetching total orders and revenue...');
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('total_amount');

      if (!orderError && orderData) {
        analyticsData.totalOrders = orderData.length;
        analyticsData.totalRevenue = orderData.reduce((sum, order) => 
          sum + (order.total_amount || 0), 0
        );
      }
    } catch (error) {
      console.error('Error fetching order totals:', error);
    }

    console.log('✅ Analytics data fetched successfully');
    return res.status(200).json(analyticsData);

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      details: error.message
    });
  }
} 