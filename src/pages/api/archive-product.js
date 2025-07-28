import { createClient } from '@supabase/supabase-js';

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

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    console.log(`Archiving product with ID: ${id}`);

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, is_archived')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching product:', fetchError);
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (existingProduct.is_archived) {
      return res.status(400).json({ error: 'Product is already archived' });
    }

    // Archive the product
    const { data: archivedProduct, error: updateError } = await supabase
      .from('products')
      .update({ 
        is_archived: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error archiving product:', updateError);
      return res.status(500).json({ 
        error: 'Failed to archive product',
        details: updateError.message
      });
    }

    console.log('✅ Product archived successfully:', id);

    return res.status(200).json({
      success: true,
      message: 'Product archived successfully',
      product: archivedProduct
    });

  } catch (error) {
    console.error('Unexpected error archiving product:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
} 