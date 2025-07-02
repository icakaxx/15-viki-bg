import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed. Use PUT or PATCH.' });
    }

    // Validate required fields
    const { id } = req.body;

    // Server-side validation
    if (!id) {
        return res.status(400).json({ 
            error: 'Missing required field: id' 
        });
    }

    // Mock mode - if Supabase is not configured
    if (!supabase) {
        console.log('⚠️  Supabase not configured, simulating product archiving');
        const mockProduct = {
            id,
            is_archived: true,
            updated_at: new Date().toISOString()
        };
        
        return res.status(200).json({ 
            message: 'Product archived successfully (mock mode)',
            product: mockProduct 
        });
    }

    try {
        // Check if product exists and is not already archived
        const { data: existingProduct, error: checkError } = await supabase
            .from('products')
            .select('id, brand, model, is_archived')
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

        if (existingProduct.is_archived) {
            return res.status(400).json({
                error: 'Product already archived',
                message: `Product "${existingProduct.brand} ${existingProduct.model}" is already archived.`
            });
        }

        // Archive the product (soft delete)
        const { data, error } = await supabase
            .from('products')
            .update({ is_archived: true })
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            console.error('Archive error:', error);
            return res.status(500).json({ 
                error: 'Database error',
                message: error.message 
            });
        }

        return res.status(200).json({ 
            message: 'Product archived successfully',
            product: data 
        });

    } catch (error) {
        console.error('Unexpected error in archive-product:', error);
        return res.status(500).json({ 
            error: 'Unexpected server error',
            message: error.message 
        });
    }
} 