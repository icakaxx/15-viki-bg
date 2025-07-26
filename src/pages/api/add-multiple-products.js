import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

// Sample AC products with varied specifications
const newProducts = [
    {
        brand: "Daikin",
        model: "Perfera FTXM35R",
        colour: "White",
        capacity_btu: 12000,
        energy_rating: "A+++",
        price: 1299.00,
        previous_price: 1499.00,
        image_url: "https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg//split-1-scaled-1--1752223766691-l81dcv.jpg",
        stock: 12,
        discount: 13.34,
        cop: 4.2,
        scop: 4.8,
        power_consumption: 1.1,
        operating_temp_range: "-15°C to +50°C",
        indoor_dimensions: "295×790×220 mm",
        outdoor_dimensions: "550×780×285 mm",
        indoor_weight: 8.5,
        outdoor_weight: 28,
        noise_level: "19",
        air_flow: 12,
        warranty_period: "3 years",
        room_size_recommendation: "35-50 m²",
        installation_type: "Wall Mount",
        description: "Premium inverter air conditioner with advanced features and ultra-quiet operation",
        features: ["WiFi Control", "Inverter Technology", "Heat Pump", "Eco Mode", "Sleep Mode", "Auto Restart"]
    },
    {
        brand: "Mitsubishi",
        model: "Diamond Premium MSZ-AP35VG",
        colour: "White",
        capacity_btu: 12000,
        energy_rating: "A+++",
        price: 1599.00,
        previous_price: 1799.00,
        image_url: "https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg//split-1-scaled-1--1752223766691-l81dcv.jpg",
        stock: 8,
        discount: 11.12,
        cop: 4.5,
        scop: 5.1,
        power_consumption: 1.0,
        operating_temp_range: "-20°C to +55°C",
        indoor_dimensions: "295×790×220 mm",
        outdoor_dimensions: "550×780×285 mm",
        indoor_weight: 8.8,
        outdoor_weight: 30,
        noise_level: "18",
        air_flow: 13,
        warranty_period: "5 years",
        room_size_recommendation: "35-50 m²",
        installation_type: "Wall Mount",
        description: "Premium diamond series with advanced filtration and ultra-low noise",
        features: ["WiFi Control", "Inverter Technology", "Heat Pump", "Eco Mode", "Diamond Filter", "Auto Restart"]
    },
    {
        brand: "LG",
        model: "ArtCool Mirror LS-Q126C",
        colour: "Mirror Black",
        capacity_btu: 12000,
        energy_rating: "A+++",
        price: 1399.00,
        previous_price: 1599.00,
        image_url: "https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg//split-1-scaled-1--1752223766691-l81dcv.jpg",
        stock: 15,
        discount: 12.51,
        cop: 4.3,
        scop: 4.9,
        power_consumption: 1.05,
        operating_temp_range: "-15°C to +50°C",
        indoor_dimensions: "295×790×220 mm",
        outdoor_dimensions: "550×780×285 mm",
        indoor_weight: 8.2,
        outdoor_weight: 27,
        noise_level: "20",
        air_flow: 12,
        warranty_period: "3 years",
        room_size_recommendation: "35-50 m²",
        installation_type: "Wall Mount",
        description: "Stylish mirror finish design with advanced air purification",
        features: ["WiFi Control", "Inverter Technology", "Heat Pump", "Eco Mode", "Air Purification", "Auto Restart"]
    },
    {
        brand: "Samsung",
        model: "WindFree Premium AR12TXCJAK",
        colour: "White",
        capacity_btu: 12000,
        energy_rating: "A+++",
        price: 1199.00,
        previous_price: 1399.00,
        image_url: "https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg//split-1-scaled-1--1752223766691-l81dcv.jpg",
        stock: 10,
        discount: 14.30,
        cop: 4.1,
        scop: 4.7,
        power_consumption: 1.15,
        operating_temp_range: "-15°C to +50°C",
        indoor_dimensions: "295×790×220 mm",
        outdoor_dimensions: "550×780×285 mm",
        indoor_weight: 8.0,
        outdoor_weight: 26,
        noise_level: "21",
        air_flow: 12,
        warranty_period: "3 years",
        room_size_recommendation: "35-50 m²",
        installation_type: "Wall Mount",
        description: "WindFree technology for gentle, draft-free cooling",
        features: ["WiFi Control", "Inverter Technology", "Heat Pump", "WindFree Mode", "Eco Mode", "Auto Restart"]
    },
    {
        brand: "Gree",
        model: "U-Crown Pro GWH12AC-K6DNA1A",
        colour: "White",
        capacity_btu: 12000,
        energy_rating: "A++",
        price: 899.00,
        previous_price: 1099.00,
        image_url: "https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg//split-1-scaled-1--1752223766691-l81dcv.jpg",
        stock: 20,
        discount: 18.20,
        cop: 3.9,
        scop: 4.5,
        power_consumption: 1.2,
        operating_temp_range: "-15°C to +50°C",
        indoor_dimensions: "295×790×220 mm",
        outdoor_dimensions: "550×780×285 mm",
        indoor_weight: 7.8,
        outdoor_weight: 25,
        noise_level: "22",
        air_flow: 11,
        warranty_period: "2 years",
        room_size_recommendation: "35-50 m²",
        installation_type: "Wall Mount",
        description: "Reliable and efficient cooling with smart features",
        features: ["WiFi Control", "Inverter Technology", "Heat Pump", "Eco Mode", "Sleep Mode", "Auto Restart"]
    },
    {
        brand: "Panasonic",
        model: "Premium XE Series CS-XE12PKEW",
        colour: "White",
        capacity_btu: 12000,
        energy_rating: "A+++",
        price: 1349.00,
        previous_price: 1549.00,
        image_url: "https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg//split-1-scaled-1--1752223766691-l81dcv.jpg",
        stock: 6,
        discount: 12.91,
        cop: 4.4,
        scop: 5.0,
        power_consumption: 1.02,
        operating_temp_range: "-20°C to +55°C",
        indoor_dimensions: "295×790×220 mm",
        outdoor_dimensions: "550×780×285 mm",
        indoor_weight: 8.6,
        outdoor_weight: 29,
        noise_level: "19",
        air_flow: 12,
        warranty_period: "5 years",
        room_size_recommendation: "35-50 m²",
        installation_type: "Wall Mount",
        description: "Premium series with nanoe-G air purification technology",
        features: ["WiFi Control", "Inverter Technology", "Heat Pump", "Eco Mode", "Nanoe-G", "Auto Restart"]
    },
    {
        brand: "Toshiba",
        model: "SHRM-i Series RAS-12SKVP-E",
        colour: "White",
        capacity_btu: 12000,
        energy_rating: "A+++",
        price: 1149.00,
        previous_price: 1349.00,
        image_url: "https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg//split-1-scaled-1--1752223766691-l81dcv.jpg",
        stock: 14,
        discount: 14.83,
        cop: 4.0,
        scop: 4.6,
        power_consumption: 1.1,
        operating_temp_range: "-15°C to +50°C",
        indoor_dimensions: "295×790×220 mm",
        outdoor_dimensions: "550×780×285 mm",
        indoor_weight: 8.1,
        outdoor_weight: 27,
        noise_level: "20",
        air_flow: 12,
        warranty_period: "3 years",
        room_size_recommendation: "35-50 m²",
        installation_type: "Wall Mount",
        description: "Reliable performance with advanced inverter technology",
        features: ["WiFi Control", "Inverter Technology", "Heat Pump", "Eco Mode", "Sleep Mode", "Auto Restart"]
    },
    {
        brand: "Hitachi",
        model: "Premium RAS-X12CKX",
        colour: "White",
        capacity_btu: 12000,
        energy_rating: "A+++",
        price: 1249.00,
        previous_price: 1449.00,
        image_url: "https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg//split-1-scaled-1--1752223766691-l81dcv.jpg",
        stock: 9,
        discount: 13.80,
        cop: 4.2,
        scop: 4.8,
        power_consumption: 1.08,
        operating_temp_range: "-15°C to +50°C",
        indoor_dimensions: "295×790×220 mm",
        outdoor_dimensions: "550×780×285 mm",
        indoor_weight: 8.3,
        outdoor_weight: 28,
        noise_level: "19",
        air_flow: 12,
        warranty_period: "3 years",
        room_size_recommendation: "35-50 m²",
        installation_type: "Wall Mount",
        description: "Premium cooling with advanced air purification and quiet operation",
        features: ["WiFi Control", "Inverter Technology", "Heat Pump", "Eco Mode", "Air Purification", "Auto Restart"]
    }
];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Mock mode - if Supabase is not configured
    if (!supabase) {
        console.log('⚠️  Supabase not configured, simulating multiple product creation');
        const mockProducts = newProducts.map((product, index) => ({
            ...product,
            id: Math.floor(Math.random() * 1000) + 200 + index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));
        
        return res.status(201).json({ 
            message: 'Products added successfully (mock mode)',
            products: mockProducts,
            count: mockProducts.length
        });
    }

    try {
        const addedProducts = [];
        const errors = [];

        for (const product of newProducts) {
            try {
                // Check for duplicates
                const { data: existingProducts, error: checkError } = await supabase
                    .from('products')
                    .select('id, brand, model, capacity_btu')
                    .eq('brand', product.brand)
                    .eq('model', product.model)
                    .eq('capacity_btu', product.capacity_btu)
                    .eq('is_archived', false);

                if (checkError) {
                    console.error('Error checking for duplicates:', checkError);
                    errors.push(`Error checking duplicates for ${product.brand} ${product.model}: ${checkError.message}`);
                    continue;
                }

                if (existingProducts && existingProducts.length > 0) {
                    errors.push(`Product ${product.brand} ${product.model} already exists`);
                    continue;
                }

                // Insert the product
                const { data: insertedProduct, error: insertError } = await supabase
                    .from('products')
                    .insert([product])
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error inserting product:', insertError);
                    errors.push(`Error adding ${product.brand} ${product.model}: ${insertError.message}`);
                } else {
                    addedProducts.push(insertedProduct);
                }
            } catch (error) {
                console.error('Error processing product:', error);
                errors.push(`Error processing ${product.brand} ${product.model}: ${error.message}`);
            }
        }

        return res.status(201).json({
            message: `Successfully added ${addedProducts.length} products`,
            products: addedProducts,
            count: addedProducts.length,
            errors: errors.length > 0 ? errors : null
        });

    } catch (error) {
        console.error('Error adding products:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
} 