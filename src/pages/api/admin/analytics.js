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

  // If Supabase is not configured, return error
  if (!supabase) {
    return res.status(500).json({ 
      error: 'Database not configured',
      message: 'Analytics require database connection'
    });
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
    } catch (err) {
      console.error('Error fetching accessory usage:', err);
    }

    // 2. Installation Statistics
    console.log('🔧 Fetching installation statistics...');
    try {
      const { data: installationData, error: installationError } = await supabase
        .from('payment_and_tracking')
        .select('includes_installation');

      if (!installationError && installationData) {
        analyticsData.installationStats = installationData.reduce(
          (acc, item) => {
            if (item.includes_installation) {
              acc.withInstallation++;
            } else {
              acc.withoutInstallation++;
            }
            return acc;
          },
          { withInstallation: 0, withoutInstallation: 0 }
        );
      }
    } catch (err) {
      console.error('Error fetching installation stats:', err);
    }

    // 3. Top Selling by BTU
    console.log('⚡ Fetching top selling by BTU...');
    try {
      const { data: btuData, error: btuError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          products!inner(capacity_btu)
        `);

      if (!btuError && btuData) {
        const btuSales = {};
        btuData.forEach(item => {
          const btu = item.products.capacity_btu;
          btuSales[btu] = (btuSales[btu] || 0) + item.quantity;
        });

        analyticsData.topSellingByBTU = Object.entries(btuSales)
          .map(([capacity_btu, total_sold]) => ({ 
            capacity_btu: parseInt(capacity_btu), 
            total_sold 
          }))
          .sort((a, b) => b.total_sold - a.total_sold)
          .slice(0, 10);
      }
    } catch (err) {
      console.error('Error fetching BTU sales:', err);
    }

    // 4. Top Selling by Energy Rating
    console.log('🌟 Fetching top selling by energy rating...');
    try {
      const { data: energyData, error: energyError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          products!inner(energy_rating)
        `);

      if (!energyError && energyData) {
        const energySales = {};
        energyData.forEach(item => {
          const rating = item.products.energy_rating;
          energySales[rating] = (energySales[rating] || 0) + item.quantity;
        });

        analyticsData.topSellingByEnergyRating = Object.entries(energySales)
          .map(([energy_rating, total_sold]) => ({ energy_rating, total_sold }))
          .sort((a, b) => b.total_sold - a.total_sold);
      }
    } catch (err) {
      console.error('Error fetching energy rating sales:', err);
    }

    // 5. Sales Over Time (weekly)
    console.log('📅 Fetching sales over time...');
    try {
      const { data: timeData, error: timeError } = await supabase
        .from('orders')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (!timeError && timeData) {
        // Group by week
        const weeklyData = {};
        timeData.forEach(order => {
          const date = new Date(order.created_at);
          // Get Monday of the week
          const monday = new Date(date);
          monday.setDate(date.getDate() - date.getDay() + 1);
          const weekKey = monday.toISOString().split('T')[0];
          
          weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
        });

        analyticsData.salesOverTime = Object.entries(weeklyData)
          .map(([period, order_count]) => ({ period, order_count }))
          .sort((a, b) => a.period.localeCompare(b.period))
          .slice(-8); // Last 8 weeks
      }
    } catch (err) {
      console.error('Error fetching sales over time:', err);
    }

    // 6. Total Orders and Revenue
    console.log('💰 Calculating totals...');
    try {
      // Total orders
      const { count: totalOrdersCount, error: ordersCountError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (!ordersCountError) {
        analyticsData.totalOrders = totalOrdersCount || 0;
      }

      // Total revenue (from payment_and_tracking if available)
      const { data: revenueData, error: revenueError } = await supabase
        .from('payment_and_tracking')
        .select('total_amount');

      if (!revenueError && revenueData) {
        analyticsData.totalRevenue = revenueData.reduce(
          (sum, payment) => sum + (payment.total_amount || 0), 
          0
        );
      } else {
        // Fallback: calculate from order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            quantity,
            products!inner(price)
          `);

        if (!itemsError && itemsData) {
          analyticsData.totalRevenue = itemsData.reduce(
            (sum, item) => sum + (item.products.price * item.quantity), 
            0
          );
        }
      }
    } catch (err) {
      console.error('Error calculating totals:', err);
    }

    console.log('✅ Analytics data compiled successfully');
    console.log('📊 Results:', {
      accessoryUsageCount: analyticsData.accessoryUsage.length,
      totalOrders: analyticsData.totalOrders,
      totalRevenue: analyticsData.totalRevenue,
      btuCategoriesCount: analyticsData.topSellingByBTU.length,
      energyRatingsCount: analyticsData.topSellingByEnergyRating.length,
      timePeriodsCount: analyticsData.salesOverTime.length
    });

    return res.status(200).json(analyticsData);

  } catch (error) {
    console.error('Analytics API error:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch analytics data',
      message: error.message
    });
  }
} 