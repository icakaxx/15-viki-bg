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
        // Technical Performance
        COP: product.cop,
        SCOP: product.scop,
        PowerConsumption: product.power_consumption,
        OperatingTempRange: product.operating_temp_range,
        // Physical Characteristics
        IndoorDimensions: product.indoor_dimensions,
        OutdoorDimensions: product.outdoor_dimensions,
        IndoorWeight: product.indoor_weight,
        OutdoorWeight: product.outdoor_weight,
        NoiseLevel: product.noise_level,
        AirFlow: product.air_flow,
        // Features & Usability
        Warranty: product.warranty_period,
        WarrantyPeriod: product.warranty_period,
        RoomSizeRecommendation: product.room_size_recommendation,
        InstallationType: product.installation_type,
        Description: product.description || `Premium ${product.brand} ${product.model} air conditioner with ${product.energy_rating} energy efficiency rating.`,
        Features: product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : [],
        // Promotional flags
        IsFeatured: product.is_featured || false,
        IsBestseller: product.is_bestseller || false,
        IsNew: product.is_new || false
    };
};

export default async function handler(req, res) {
    console.log('[API] /api/get-product called with ID:', req.query.id);
    
    if (req.method !== 'GET') {
        console.log('[API] Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        console.log('[API] No product ID provided');
        return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('[API] Environment check - URL:', hasUrl, 'KEY:', hasKey);
    
    if (!hasUrl || !hasKey) {
        console.error('[API] Missing environment variables!');
        return res.status(500).json({ 
            error: 'Server configuration error - missing environment variables',
            debug: {
                url: hasUrl,
                key: hasKey
            }
        });
    }

    console.log('[API] Initializing Supabase client...');
    // Initialize Supabase client inside the handler to ensure env vars are loaded
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Use Supabase if configured
    try {
        console.log('[API] Querying database for product ID:', id);
        const { data, error } = await supabase
            .from('products')
            .select(`
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
            .eq('id', id)
            .single();

        if (error) {
            console.error('[API] Supabase query error:', error.code, error.message);
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Product not found' });
            }
            return res.status(500).json({ error: 'Database error', details: error.message });
        }

        if (!data) {
            console.error('[API] No data returned for product ID:', id);
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log('[API] Product fetched successfully:', data.id, data.brand, data.model);
        // Transform product to match frontend expectations
        const transformedProduct = transformProduct(data);
        
        console.log('[API] Returning product data');
        return res.status(200).json({ 
            product: transformedProduct
        });

    } catch (error) {
        console.error('[API] FATAL ERROR:', error);
        console.error('[API] Error stack:', error.stack);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
} 