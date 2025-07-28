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

// Mock single product for testing when Supabase is not configured
const mockProducts = [
    {
        id: 1,
        brand: "Daikin",
        model: "FTXS35K",
        colour: "White",
        capacity_btu: 12000,
        energy_rating: "A++",
        price: 899.00,
        previous_price: 999.00,
        image_url: "https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg/daikin-ftxs35k.jpg",
        stock: 15,
        discount: 10.00,
        is_archived: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        cop: 4.2,
        scop: 4.0,
        power_consumption: "2.1 kW",
        operating_temp_range: "-15°C to 46°C",
        indoor_dimensions: "795 x 295 x 203 mm",
        outdoor_dimensions: "795 x 295 x 203 mm",
        indoor_weight: "9.5 kg",
        outdoor_weight: "9.5 kg",
        noise_level: "19-22 dB",
        air_flow: "540 m³/h",
        warranty_period: "5 years",
        room_size_recommendation: "35-50 m²",
        installation_type: "Wall-mounted",
        description: "Premium inverter air conditioner with advanced filtration system and Wi-Fi connectivity.",
        features: ["Wi-Fi Control", "Advanced Filtration", "Quiet Operation", "Energy Efficient"]
    },
    {
        id: 2,
        brand: "Mitsubishi",
        model: "MSZ-LN35VG",
        colour: "White",
        capacity_btu: 12000,
        energy_rating: "A+++",
        price: 1099.00,
        previous_price: 1199.00,
        image_url: "https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg/mitsubishi-msz-ln35vg.jpg",
        stock: 8,
        discount: 8.33,
        is_archived: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        cop: 4.5,
        scop: 4.3,
        power_consumption: "1.9 kW",
        operating_temp_range: "-20°C to 50°C",
        indoor_dimensions: "799 x 295 x 225 mm",
        outdoor_dimensions: "799 x 295 x 225 mm",
        indoor_weight: "10.0 kg",
        outdoor_weight: "10.0 kg",
        noise_level: "17-20 dB",
        air_flow: "600 m³/h",
        warranty_period: "5 years",
        room_size_recommendation: "30-45 m²",
        installation_type: "Wall-mounted",
        description: "Ultra-quiet premium air conditioner with intelligent eye sensor and plasma quad filtration.",
        features: ["Plasma Quad Filter", "Intelligent Eye", "Ultra Quiet", "Smart Defrost"]
    }
];

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

    // If Supabase is not configured, return mock data
    if (!supabase) {
        
        const mockProduct = mockProducts.find(p => p.id === parseInt(id));
        
        if (!mockProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const transformedProduct = transformProduct(mockProduct);
        
        return res.status(200).json({ 
            product: transformedProduct
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
            
            // Fallback to mock data
            const mockProduct = mockProducts.find(p => p.id === parseInt(id));
            if (!mockProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            const transformedProduct = transformProduct(mockProduct);
            return res.status(200).json({ 
                product: transformedProduct,
                fallback: true
            });
        }

        // Transform product to match frontend expectations
        const transformedProduct = transformProduct(data);
        
        return res.status(200).json({ 
            product: transformedProduct
        });

    } catch (error) {
        console.error('Supabase connection error:', error);
        
        // Fallback to mock data on connection error
        const mockProduct = mockProducts.find(p => p.id === parseInt(id));
        if (!mockProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const transformedProduct = transformProduct(mockProduct);
        return res.status(200).json({ 
            product: transformedProduct,
            fallback: true
        });
    }
} 