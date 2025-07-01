import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate required fields
    const { 
        id,
        brand, 
        model, 
        colour, 
        type, 
        capacity_btu, 
        energy_rating, 
        price,
        previous_price,
        image_url,
        stock,
        discount,
        is_archived
    } = req.body;

    // Server-side validation
    if (!id) {
        return res.status(400).json({ 
            error: 'Missing required field: id' 
        });
    }

    if (!brand || !model || price === undefined) {
        return res.status(400).json({ 
            error: 'Missing required fields: brand, model, price' 
        });
    }

    if (price < 0) {
        return res.status(400).json({ 
            error: 'Price must be greater than or equal to 0' 
        });
    }

    if (previous_price !== null && previous_price !== undefined && previous_price < 0) {
        return res.status(400).json({ 
            error: 'Previous price must be greater than or equal to 0' 
        });
    }

    if (stock !== undefined && stock < 0) {
        return res.status(400).json({ 
            error: 'Stock must be greater than or equal to 0' 
        });
    }

    if (discount !== undefined && (discount < 0 || discount > 100)) {
        return res.status(400).json({ 
            error: 'Discount must be between 0 and 100' 
        });
    }

    // Mock mode - if Supabase is not configured
    if (!supabase) {
        console.log('⚠️  Supabase not configured, simulating product update');
        const mockProduct = {
            id,
            brand,
            model,
            colour,
            type,
            capacity_btu,
            energy_rating,
            price: parseFloat(price),
            previous_price: previous_price ? parseFloat(previous_price) : null,
            image_url,
            stock: stock !== undefined ? parseInt(stock) : 0,
            discount: discount !== undefined ? parseFloat(discount) : 0,
            is_archived: is_archived !== undefined ? is_archived : false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        return res.status(200).json({ 
            message: 'Product updated successfully (mock mode)',
            product: mockProduct 
        });
    }

    try {
        // Check if product exists
        const { data: existingProduct, error: checkError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (checkError) {
            if (checkError.code === 'PGRST116') {
                return res.status(404).json({ 
                    error: 'Product not found',
                    message: `Product with id ${id} does not exist.`
                });
            }
            console.error('Error checking product existence:', checkError);
            return res.status(500).json({ error: 'Database error during product check' });
        }

        // Prepare update data - only include fields that are provided
        const updateData = {};
        
        if (brand !== undefined) updateData.brand = brand;
        if (model !== undefined) updateData.model = model;
        if (colour !== undefined) updateData.colour = colour;
        if (type !== undefined) updateData.type = type;
        if (capacity_btu !== undefined) updateData.capacity_btu = capacity_btu ? parseInt(capacity_btu) : null;
        if (energy_rating !== undefined) updateData.energy_rating = energy_rating;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (previous_price !== undefined) updateData.previous_price = previous_price ? parseFloat(previous_price) : null;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (discount !== undefined) updateData.discount = parseFloat(discount);
        if (is_archived !== undefined) updateData.is_archived = is_archived;

        // The updated_at field will be automatically handled by the database trigger

        // Update the product
        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            console.error('Update error:', error);
            
            // Handle unique constraint violations
            if (error.code === '23505') {
                return res.status(409).json({ 
                    error: 'Product conflict',
                    message: 'A product with these specifications already exists.',
                    details: error.message
                });
            }
            
            return res.status(500).json({ 
                error: 'Database error',
                message: error.message 
            });
        }

        return res.status(200).json({ 
            message: 'Product updated successfully',
            product: data 
        });

    } catch (error) {
        console.error('Unexpected error in edit-product:', error);
        return res.status(500).json({ 
            error: 'Unexpected server error',
            message: error.message 
        });
    }
}
