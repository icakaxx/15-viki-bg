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

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    // If Supabase is not configured, return error
    if (!supabase) {
        return res.status(500).json({ 
            error: 'Database not configured',
            message: 'Product data requires database connection'
        });
    }

    // Use Supabase if configured
    try {
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
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Product not found' });
            }
            console.error('Error fetching product from Supabase:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch product',
                message: error.message
            });
        }

        // Transform product to match frontend expectations
        const transformedProduct = transformProduct(data);
        
        return res.status(200).json({ 
            product: transformedProduct
        });

    } catch (error) {
        console.error('Supabase connection error:', error);
        return res.status(500).json({ 
            error: 'Database connection failed',
            message: error.message
        });
    }
} 