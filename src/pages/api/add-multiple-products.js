import { createClient } from '@supabase/supabase-js';

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

  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ 
      error: 'Products array is required and must not be empty' 
    });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    console.log(`Adding ${products.length} products`);

    // Validate all products before insertion
    const validatedProducts = products.map((product, index) => {
      const { brand, model, capacity_btu, energy_rating, price } = product;
      
      if (!brand || !model || !capacity_btu || !energy_rating || !price) {
        throw new Error(`Product ${index + 1} missing required fields: brand, model, capacity_btu, energy_rating, and price are required`);
      }

      return {
        brand,
        model,
        colour: product.colour || 'White',
        capacity_btu,
        energy_rating,
        price,
        previous_price: product.previous_price || null,
        image_url: product.image_url || null,
        stock: product.stock || 0,
        discount: product.discount || 0,
        cop: product.cop || null,
        scop: product.scop || null,
        power_consumption: product.power_consumption || null,
        operating_temp_range: product.operating_temp_range || null,
        indoor_dimensions: product.indoor_dimensions || null,
        outdoor_dimensions: product.outdoor_dimensions || null,
        indoor_weight: product.indoor_weight || null,
        outdoor_weight: product.outdoor_weight || null,
        noise_level: product.noise_level || null,
        air_flow: product.air_flow || null,
        warranty_period: product.warranty_period || null,
        room_size_recommendation: product.room_size_recommendation || null,
        installation_type: product.installation_type || null,
        description: product.description || null,
        features: product.features || null,
        is_featured: product.is_featured || false,
        is_bestseller: product.is_bestseller || false,
        is_new: product.is_new || false,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    const { data: newProducts, error } = await supabase
      .from('products')
      .insert(validatedProducts)
      .select();

    if (error) {
      console.error('Error adding products:', error);
      return res.status(500).json({ 
        error: 'Failed to add products',
        details: error.message
      });
    }

    console.log('✅ Products added successfully:', newProducts.length);

    return res.status(201).json({
      success: true,
      message: 'Products added successfully',
      products: newProducts,
      count: newProducts.length
    });

  } catch (error) {
    console.error('Unexpected error adding products:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
} 