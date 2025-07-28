import { createClient } from '@supabase/supabase-js';

// Function to transform database properties to frontend expected format
const transformProduct = (product) => {
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
        // Technical Performance (with defaults for missing columns)
        COP: product.cop || null,
        SCOP: product.scop || null,
        PowerConsumption: product.power_consumption || null,
        OperatingTempRange: product.operating_temp_range || null,
        // Physical Characteristics (with defaults for missing columns)
        IndoorDimensions: product.indoor_dimensions || null,
        OutdoorDimensions: product.outdoor_dimensions || null,
        IndoorWeight: product.indoor_weight || null,
        OutdoorWeight: product.outdoor_weight || null,
        NoiseLevel: product.noise_level || null,
        AirFlow: product.air_flow || null,
        // Features & Usability (with defaults for missing columns)
        WarrantyPeriod: product.warranty_period || null,
        RoomSizeRecommendation: product.room_size_recommendation || null,
        InstallationType: product.installation_type || null,
        Description: product.description || '',
        Features: product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : [],
        // Promotional flags (with defaults for missing columns)
        IsFeatured: product.is_featured || false,
        IsBestseller: product.is_bestseller || false,
        IsNew: product.is_new || false
    };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
try {
  if (!supabaseUrl || !supabaseKey) {
    // Supabase credentials are missing
  } else {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
  }
} catch (error) {
  // Failed to initialize Supabase client
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract query parameters
    const { 
        showArchived = 'false', 
        search = '', 
        sortBy = 'updated_at', 
        sortOrder = 'desc',
        limit = '50',
        offset = '0'
    } = req.query;

    // If Supabase is not configured or failed to initialize
    if (!supabase) {
        return res.status(500).json({ 
            error: 'Database connection not available',
            details: {
                hasUrl: !!supabaseUrl,
                hasKey: !!supabaseKey
            }
        });
    }

    // Use Supabase
    try {
        // Start with basic columns that should always exist
        let query = supabase.from('products').select(`
            id,
            brand,
            model,
            colour,
            capacity_btu,
            energy_rating,
            price,
            previous_price,
            image_url,
            stock,
            discount,
            is_archived,
            created_at,
            updated_at,
            cop,
            scop,
            power_consumption,
            operating_temp_range,
            indoor_dimensions,
            outdoor_dimensions,
            indoor_weight,
            outdoor_weight,
            noise_level,
            air_flow,
            warranty_period,
            room_size_recommendation,
            installation_type,
            description,
            features,
            is_featured,
            is_bestseller,
            is_new
        `)

        // Apply archived filter
        if (showArchived === 'false') {
            query = query.eq('is_archived', false);
        }

        // Apply search filter
        if (search) {
            query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%`);
        }

        // Apply sorting
        const validSortFields = ['brand', 'model', 'price', 'stock', 'discount', 'created_at', 'updated_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'updated_at';
        const order = sortOrder === 'asc' ? true : false;
        query = query.order(sortField, { ascending: order });

        // Apply pagination
        const limitNum = parseInt(limit);
        const offsetNum = parseInt(offset);
        query = query.range(offsetNum, offsetNum + limitNum - 1);

        const { data, error, count } = await query;

    if (error) {
            // Error fetching products from Supabase
        }

        // Get total count for pagination
        let totalQuery = supabase.from('products').select('id', { count: 'exact' });
        if (showArchived === 'false') {
            totalQuery = totalQuery.eq('is_archived', false);
        }
        if (search) {
            totalQuery = totalQuery.or(`brand.ilike.%${search}%,model.ilike.%${search}%`);
        }
        
        const { count: totalCount } = await totalQuery;

        // Transform products to match frontend expectations
        const transformedProducts = (data || []).map(transformProduct);
        
        return res.status(200).json({ 
            products: transformedProducts,
            total: totalCount || 0,
            hasMore: offsetNum + limitNum < (totalCount || 0)
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}