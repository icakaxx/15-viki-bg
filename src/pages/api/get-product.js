import { createClient } from '@supabase/supabase-js';

const transformProduct = (product) => {
    return {
        id: product.id,
        brand: product.brand,
        model: product.model,
        colour: product.colour,
        capacity_btu: product.capacity_btu,
        energy_rating: product.energy_rating,
        price: product.price,
        previous_price: product.previous_price,
        image_url: product.image_url,
        stock: product.stock,
        discount: product.discount,
        is_archived: product.is_archived,
        created_at: product.created_at,
        updated_at: product.updated_at,
        cop: product.cop,
        scop: product.scop,
        power_consumption: product.power_consumption,
        operating_temp_range: product.operating_temp_range,
        indoor_dimensions: product.indoor_dimensions,
        outdoor_dimensions: product.outdoor_dimensions,
        indoor_weight: product.indoor_weight,
        outdoor_weight: product.outdoor_weight,
        noise_level: product.noise_level,
        air_flow: product.air_flow,
        warranty_period: product.warranty_period,
        room_size_recommendation: product.room_size_recommendation,
        installation_type: product.installation_type,
        description: product.description,
        features: product.features,
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

    if (!supabase) {
        return res.status(500).json({ error: 'Database not configured' });
    }

    try {
        
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const transformedProduct = transformProduct(product);
        return res.status(200).json(transformedProduct);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
} 