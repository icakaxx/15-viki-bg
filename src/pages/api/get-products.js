import { createClient } from '@supabase/supabase-js';

// Function to transform database properties to frontend expected format
const transformProduct = (product) => {
    return {
        ProductID: product.id,
        Brand: product.brand,
        Model: product.model,
        Colour: product.colour,
        CapacityBTU: product.capacity_btu, // Now supports text
        EnergyRating: product.energy_rating, // Now supports A+, A++
        Price: product.price,
        PreviousPrice: product.previous_price,
        ImageURL: product.image_url,
        Stock: product.stock,
        Discount: product.discount,
        IsArchived: product.is_archived,
        CreatedAt: product.created_at,
        UpdatedAt: product.updated_at,
        // Technical Performance (with defaults for missing columns)
        // Support both old and new column names
        COP: product.cop || null,
        SCOP: product.scop || null,
        // Try new column names first, then fall back to old ones
        PowerConsumptionCooling: product.power_consumption_cooling || 
                                 product.electricity_cooling_kw || 
                                 (product.power_consumption ? product.power_consumption : null),
        PowerConsumptionHeating: product.power_consumption_heating || 
                                 product.electricity_heating_kw || 
                                 null,
        OperatingTempRange: product.operating_temp_range || null,
        // Physical Characteristics (with defaults for missing columns)
        IndoorDimensions: product.indoor_dimensions || null,
        OutdoorDimensions: product.outdoor_dimensions || null,
        NoiseLevel: product.noise_level || null, // Now text field
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

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ 
            error: 'Server configuration error - missing environment variables',
            details: {
                url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        });
    }

    // Initialize Supabase client inside the handler to ensure env vars are loaded
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: { persistSession: false }
        }
    );

    // Use Supabase
    try {
        // Start with basic columns that should always exist
        // Try to select columns - if new columns don't exist, we'll catch the error and use old ones
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
            power_consumption_cooling,
            power_consumption_heating,
            operating_temp_range,
            indoor_dimensions,
            outdoor_dimensions,
            noise_level,
            warranty_period,
            room_size_recommendation,
            installation_type,
            description,
            features,
            is_featured,
            is_bestseller,
            is_new
        `)
        
        // Try to add new power consumption columns if they exist
        // We'll handle this in the transform function instead

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
        const limitNum = parseInt(limit) || 50;
        const offsetNum = parseInt(offset) || 0;
        
        // Get total count first (before pagination)
        let totalQuery = supabase.from('products').select('id', { count: 'exact', head: true });
        if (showArchived === 'false') {
            totalQuery = totalQuery.eq('is_archived', false);
        }
        if (search) {
            totalQuery = totalQuery.or(`brand.ilike.%${search}%,model.ilike.%${search}%`);
        }
        
        const { count: totalCount, error: countError } = await totalQuery;
        
        if (countError) {
            console.error('Error getting count:', countError);
            // Don't fail the request if count fails, just log it
        }

        // Now get the actual data with pagination
        query = query.range(offsetNum, offsetNum + limitNum - 1);

        let { data, error } = await query;

        // If error occurs, it might be due to missing columns
        // Try a fallback with select('*') which will work if table exists
        if (error) {
            console.warn('Error with column-specific query, trying with select(*):', error.message);
            // Retry with select all
            let simpleQuery = supabase.from('products').select('*');
            if (showArchived === 'false') {
                simpleQuery = simpleQuery.eq('is_archived', false);
            }
            if (search) {
                simpleQuery = simpleQuery.or(`brand.ilike.%${search}%,model.ilike.%${search}%`);
            }
            simpleQuery = simpleQuery.order(sortField, { ascending: order });
            simpleQuery = simpleQuery.range(offsetNum, offsetNum + limitNum - 1);
            
            const retryResult = await simpleQuery;
            if (!retryResult.error) {
                console.log('Fallback query successful, got', retryResult.data?.length || 0, 'products');
                data = retryResult.data;
                error = null;
            } else {
                console.error('Fallback query also failed:', retryResult.error);
            }
        }

        if (error) {
            console.error('Error fetching products from Supabase:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return res.status(500).json({ 
                error: 'Database error', 
                details: error.message,
                code: error.code,
                hint: error.hint
            });
        }

        console.log('Raw data from Supabase:', data?.length || 0, 'products');
        console.log('Total count:', totalCount);

        // Transform products to match frontend expectations
        const transformedProducts = (data || []).map(transformProduct);
        
        console.log('Transformed products:', transformedProducts.length);
        
        return res.status(200).json({ 
            products: transformedProducts,
            total: totalCount || 0,
            hasMore: offsetNum + limitNum < (totalCount || 0)
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}