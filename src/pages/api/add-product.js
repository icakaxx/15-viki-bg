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

  const {
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
  } = req.body;

  // Validate required fields
  if (!brand || !model || !capacity_btu || !energy_rating || !price) {
    return res.status(400).json({ 
      error: 'Missing required fields: brand, model, capacity_btu, energy_rating, and price are required' 
    });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    console.log('Adding new product:', { brand, model, capacity_btu, energy_rating, price });

    const productData = {
      brand,
      model,
      colour: colour || 'White',
      capacity_btu,
      energy_rating,
      price,
      previous_price: previous_price || null,
      image_url: image_url || null,
      stock: stock || 0,
      discount: discount || 0,
      cop: cop || null,
      scop: scop || null,
      power_consumption: power_consumption || null,
      operating_temp_range: operating_temp_range || null,
      indoor_dimensions: indoor_dimensions || null,
      outdoor_dimensions: outdoor_dimensions || null,
      indoor_weight: indoor_weight || null,
      outdoor_weight: outdoor_weight || null,
      noise_level: noise_level || null,
      air_flow: air_flow || null,
      warranty_period: warranty_period || null,
      room_size_recommendation: room_size_recommendation || null,
      installation_type: installation_type || null,
      description: description || null,
      features: features || null,
      is_featured: is_featured || false,
      is_bestseller: is_bestseller || false,
      is_new: is_new || false,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return res.status(500).json({ 
        error: 'Failed to add product',
        details: error.message
      });
    }

    console.log('✅ Product added successfully:', newProduct.id);

    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: newProduct
    });

  } catch (error) {
    console.error('Unexpected error adding product:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}
