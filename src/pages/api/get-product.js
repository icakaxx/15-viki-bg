import { createClient } from '@supabase/supabase-js';

// Function to transform database properties to frontend expected format
const transformProduct = (product) => {
    return {
        ProductID: product.id,
        Brand: product.brand ?? null,
        Model: product.model ?? null,
        Colour: product.colour ?? null,
        CapacityBTU: product.capacity_btu ?? null, // Now supports text like "9000 BTU"
        EnergyRating: product.energy_rating ?? null, // Now supports A+, A++, etc.
        Price: product.price ?? null,
        PreviousPrice: product.previous_price ?? null,
        ImageURL: product.image_url ?? null,
        Stock: product.stock ?? null,
        Discount: product.discount ?? null,
        IsArchived: product.is_archived ?? false,
        CreatedAt: product.created_at ?? null,
        UpdatedAt: product.updated_at ?? null,
        // Technical Performance - ensure null instead of undefined
        COP: product.cop ?? null,
        SCOP: product.scop ?? null,
        PowerConsumptionCooling: product.power_consumption_cooling ?? 
                                product.electricity_cooling_kw ?? 
                                null,
        PowerConsumptionHeating: product.power_consumption_heating ?? 
                                product.electricity_heating_kw ?? 
                                null,
        OperatingTempRange: product.operating_temp_range ?? null,
        // Physical Characteristics
        IndoorDimensions: product.indoor_dimensions ?? null,
        OutdoorDimensions: product.outdoor_dimensions ?? null,
        NoiseLevel: product.noise_level ?? null, // Now text field
        // Features & Usability
        Warranty: product.warranty_period ?? null,
        WarrantyPeriod: product.warranty_period ?? null,
        RoomSizeRecommendation: product.room_size_recommendation ?? null,
        InstallationType: product.installation_type ?? null,
        Description: product.description || `Premium ${product.brand} ${product.model} air conditioner with ${product.energy_rating} energy efficiency rating.`,
        Features: product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : [],
        // Promotional flags
        IsFeatured: product.is_featured ?? false,
        IsBestseller: product.is_bestseller ?? false,
        IsNew: product.is_new ?? false
    };
};

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('get-product API: Missing environment variables');
        return res.status(500).json({ 
            error: 'Server configuration error - missing environment variables',
            debug: {
                url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        });
    }

    // Initialize Supabase client inside the handler to ensure env vars are loaded
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

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
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Product not found' });
            }
            console.error(`get-product API: Database error for ID ${id}:`, error.message);
            return res.status(500).json({ error: 'Database error', details: error.message });
        }

        if (!data) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Transform product to match frontend expectations
        const transformedProduct = transformProduct(data);
        
        return res.status(200).json({ 
            product: transformedProduct
        });

    } catch (error) {
        console.error('get-product API: Fatal error:', error.message);
        console.error('Stack trace:', error.stack);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
} 