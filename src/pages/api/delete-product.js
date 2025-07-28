import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // First, check if the product exists
        const { data: existingProduct, error: fetchError } = await supabase
            .from('products')
            .select('id, image_url')
            .eq('id', id)
            .single();

        if (fetchError) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete the product from the database
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return res.status(500).json({ message: 'Failed to delete product from database' });
        }

        // If the product had an image, try to delete it from storage
        if (existingProduct.image_url && existingProduct.image_url.includes('supabase.co')) {
            try {
                // Extract the file path from the URL
                const urlParts = existingProduct.image_url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                const filePath = `products/${fileName}`;

                // Delete from Supabase Storage
                const { error: storageError } = await supabase.storage
                    .from('images-viki15bg')
                    .remove([filePath]);

                if (storageError) {
                    // Don't fail the request if image deletion fails
                } else {
                }
            } catch (storageError) {
                // Don't fail the request if image deletion fails
            }
        }

        return res.status(200).json({ 
            message: 'Product deleted successfully',
            deletedProductId: id
        });

    } catch (error) {
        return res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
}
