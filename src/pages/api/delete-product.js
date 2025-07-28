import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { id } = req.body;

        console.log('🔍 API received delete request for ID:', id);
        console.log('🔍 ID type:', typeof id);
        console.log('🔍 Full request body:', req.body);

        if (!id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Check if Supabase is configured
        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Supabase configuration missing');
            return res.status(500).json({ message: 'Database configuration error' });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // First, check if the product exists
        const { data: existingProduct, error: fetchError } = await supabase
            .from('products')
            .select('id, image_url')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching product:', fetchError);
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete the product from the database
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting product:', deleteError);
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
                    console.warn('Warning: Could not delete image from storage:', storageError);
                    // Don't fail the request if image deletion fails
                } else {
                    console.log('✅ Image deleted from storage:', filePath);
                }
            } catch (storageError) {
                console.warn('Warning: Error deleting image from storage:', storageError);
                // Don't fail the request if image deletion fails
            }
        }

        console.log('✅ Product deleted successfully:', id);
        return res.status(200).json({ 
            message: 'Product deleted successfully',
            deletedProductId: id
        });

    } catch (error) {
        console.error('Error in delete-product API:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
}
