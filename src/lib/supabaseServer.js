import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export function getSupabaseServer() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });
    return null;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  return supabaseInstance;
}

export const transformProduct = (product) => {
  return {
    ProductID: product.id,
    Brand: product.brand,
    Model: product.model,
    Colour: product.colour,
    CapacityBTU: product.capacity_btu,
    EnergyRating: product.energy_rating,
    Price: product.price,
    PreviousPrice: product.previous_price,
    ImageURL: product.image_url,
    Stock: product.stock,
    Discount: product.discount,
    IsArchived: product.is_archived,
    CreatedAt: product.created_at,
    UpdatedAt: product.updated_at,
    COP: product.cop || null,
    SCOP: product.scop || null,
    PowerConsumptionCooling: product.power_consumption_cooling || 
                             product.electricity_cooling_kw || 
                             (product.power_consumption ? product.power_consumption : null),
    PowerConsumptionHeating: product.power_consumption_heating || 
                             product.electricity_heating_kw || 
                             null,
    CoolingPowerKw: product.cooling_power_kw || null,
    HeatingPowerKw: product.heating_power_kw || null,
    OperatingTempRange: product.operating_temp_range || null,
    IndoorDimensions: product.indoor_dimensions || null,
    OutdoorDimensions: product.outdoor_dimensions || null,
    NoiseLevel: product.noise_level || null,
    WarrantyPeriod: product.warranty_period || null,
    RoomSizeRecommendation: product.room_size_recommendation || null,
    InstallationType: product.installation_type || null,
    Description: product.description || '',
    Features: product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : [],
    IsFeatured: product.is_featured || false,
    IsBestseller: product.is_bestseller || false,
    IsNew: product.is_new || false
  };
};

export async function fetchProductsServer({ 
  showArchived = false, 
  search = '', 
  sortBy = 'updated_at', 
  sortOrder = 'desc',
  limit = 50,
  offset = 0
} = {}) {
  const supabase = getSupabaseServer();
  
  if (!supabase) {
    console.error('Supabase client not initialized - missing environment variables');
    return {
      products: [],
      total: 0,
      hasMore: false
    };
  }
  
  const columns = `
    id, brand, model, colour, capacity_btu, energy_rating, price, previous_price,
    image_url, stock, discount, is_archived, created_at, updated_at, cop, scop,
    power_consumption_cooling, power_consumption_heating, cooling_power_kw, heating_power_kw,
    operating_temp_range, indoor_dimensions, outdoor_dimensions, noise_level, warranty_period,
    room_size_recommendation, installation_type, description, features,
    is_featured, is_bestseller, is_new
  `;

  let query = supabase.from('products').select(columns);
  let countQuery = supabase.from('products').select('id', { count: 'exact', head: true });

  if (!showArchived) {
    query = query.eq('is_archived', false);
    countQuery = countQuery.eq('is_archived', false);
  }

  if (search) {
    const searchFilter = `brand.ilike.%${search}%,model.ilike.%${search}%`;
    query = query.or(searchFilter);
    countQuery = countQuery.or(searchFilter);
  }

  const validSortFields = ['brand', 'model', 'price', 'stock', 'discount', 'created_at', 'updated_at'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'updated_at';
  const ascending = sortOrder === 'asc';
  
  query = query.order(sortField, { ascending });
  query = query.range(offset, offset + limit - 1);

  const [{ data, error }, { count: totalCount, error: countError }] = await Promise.all([
    query,
    countQuery
  ]);

  if (error) {
    let simpleQuery = supabase.from('products').select('*');
    if (!showArchived) {
      simpleQuery = simpleQuery.eq('is_archived', false);
    }
    if (search) {
      simpleQuery = simpleQuery.or(`brand.ilike.%${search}%,model.ilike.%${search}%`);
    }
    simpleQuery = simpleQuery.order(sortField, { ascending });
    simpleQuery = simpleQuery.range(offset, offset + limit - 1);
    
    const fallbackResult = await simpleQuery;
    if (fallbackResult.error) {
      throw new Error(`Database error: ${fallbackResult.error.message}`);
    }
    
    return {
      products: (fallbackResult.data || []).map(transformProduct),
      total: totalCount || 0,
      hasMore: offset + limit < (totalCount || 0)
    };
  }

  return {
    products: (data || []).map(transformProduct),
    total: totalCount || 0,
    hasMore: offset + limit < (totalCount || 0)
  };
}
