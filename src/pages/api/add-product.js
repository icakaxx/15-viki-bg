import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate required fields
    const { 
        brand, 
        model, 
        colour, 
        type, 
        capacity_btu, 
        energy_rating, 
        price,
        previous_price = null,
        image_url = null,
        stock = 0,
        discount = 0,
        // Technical Performance
        cop = null,
        scop = null,
        power_consumption = null,
        refrigerant_type = 'R32',
        operating_temp_range = null,
        // Physical Characteristics
        indoor_dimensions = null,
        outdoor_dimensions = null,
        indoor_weight = null,
        outdoor_weight = null,
        noise_level = null,
        air_flow = null,
        // Features & Usability
        warranty_period = '2 years',
        room_size_recommendation = null,
        installation_type = 'Wall Mount',
        description = null,
        features = []
    } = req.body;

    // Server-side validation
    if (!brand || !model || !price) {
        return res.status(400).json({ 
            error: 'Missing required fields: brand, model, price' 
        });
    }

    if (price < 0) {
        return res.status(400).json({ 
            error: 'Price must be greater than or equal to 0' 
        });
    }

    if (previous_price !== null && previous_price < 0) {
        return res.status(400).json({ 
            error: 'Previous price must be greater than or equal to 0' 
        });
    }

    if (stock < 0) {
        return res.status(400).json({ 
            error: 'Stock must be greater than or equal to 0' 
        });
    }

    if (discount < 0 || discount > 100) {
        return res.status(400).json({ 
            error: 'Discount must be between 0 and 100' 
        });
    }

    // Validate technical performance fields
    if (cop !== null && (cop < 0 || cop > 10)) {
        return res.status(400).json({ 
            error: 'COP must be between 0 and 10' 
        });
    }

    if (scop !== null && (scop < 0 || scop > 10)) {
        return res.status(400).json({ 
            error: 'SCOP must be between 0 and 10' 
        });
    }

    // Validate features array
    if (features && !Array.isArray(features)) {
        return res.status(400).json({ 
            error: 'Features must be an array' 
        });
    }

    // Mock mode - if Supabase is not configured
    if (!supabase) {
        console.log('⚠️  Supabase not configured, simulating product creation');
        const mockProduct = {
            id: Math.floor(Math.random() * 1000) + 100,
            brand,
            model,
            colour,
            type,
            capacity_btu,
            energy_rating,
            price: parseFloat(price),
            previous_price: previous_price ? parseFloat(previous_price) : null,
            image_url,
            stock: parseInt(stock),
            discount: parseFloat(discount),
            is_archived: false,
            // Technical Performance
            cop: cop ? parseFloat(cop) : null,
            scop: scop ? parseFloat(scop) : null,
            power_consumption,
            refrigerant_type,
            operating_temp_range,
            // Physical Characteristics
            indoor_dimensions,
            outdoor_dimensions,
            indoor_weight,
            outdoor_weight,
            noise_level,
            air_flow,
            // Features & Usability
            warranty_period,
            room_size_recommendation,
            installation_type,
            description,
            features,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        return res.status(201).json({ 
            message: 'Product added successfully (mock mode)',
            product: mockProduct 
        });
    }

    try {
        // Server-side duplicate check: brand + model + capacity_btu + type
        if (capacity_btu && type) {
            const { data: existingProducts, error: checkError } = await supabase
                .from('products')
                .select('id, brand, model, capacity_btu, type')
                .eq('brand', brand)
                .eq('model', model)
                .eq('capacity_btu', capacity_btu)
                .eq('type', type)
                .eq('is_archived', false);

            if (checkError) {
                console.error('Error checking for duplicates:', checkError);
                return res.status(500).json({ error: 'Database error during duplicate check' });
            }

            if (existingProducts && existingProducts.length > 0) {
                return res.status(409).json({ 
                    error: 'Product already exists',
                    message: `A product with brand "${brand}", model "${model}", capacity "${capacity_btu} BTU", and type "${type}" already exists.`,
                    existingProduct: existingProducts[0]
                });
            }
        }

        // Insert the new product
        const productData = {
            brand,
            model,
            colour,
            type,
            capacity_btu: capacity_btu ? parseInt(capacity_btu) : null,
            energy_rating,
            price: parseFloat(price),
            previous_price: previous_price ? parseFloat(previous_price) : null,
            image_url,
            stock: parseInt(stock),
            discount: parseFloat(discount),
            is_archived: false,
            // Technical Performance
            cop: cop ? parseFloat(cop) : null,
            scop: scop ? parseFloat(scop) : null,
            power_consumption,
            refrigerant_type,
            operating_temp_range,
            // Physical Characteristics
            indoor_dimensions,
            outdoor_dimensions,
            indoor_weight,
            outdoor_weight,
            noise_level,
            air_flow,
            // Features & Usability
            warranty_period,
            room_size_recommendation,
            installation_type,
            description,
            features: features && features.length > 0 ? JSON.stringify(features) : null
        };

        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select('*')
            .single();

        if (error) {
            console.error('Insert error:', error);
            
            // Handle unique constraint violations
            if (error.code === '23505') {
                return res.status(409).json({ 
                    error: 'Product already exists',
                    message: 'A product with these specifications already exists.',
                    details: error.message
                });
            }
            
            return res.status(500).json({ 
                error: 'Database error',
                message: error.message 
            });
        }

        return res.status(201).json({ 
            message: 'Product added successfully',
            product: data 
        });

    } catch (error) {
        console.error('Unexpected error in add-product:', error);
        return res.status(500).json({ 
            error: 'Unexpected server error',
            message: error.message 
        });
    }
}
