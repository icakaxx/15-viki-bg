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

  try {
    console.log('Update stock request received:', req.body);

    const { id, stock } = req.body;

    console.log('Updating product:', { id, stock });

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (stock === undefined || stock === null || isNaN(stock)) {
      return res.status(400).json({ error: 'Valid stock quantity is required' });
    }

    const stockValue = parseInt(stock);

    if (stockValue < 0) {
      return res.status(400).json({ error: 'Stock quantity cannot be negative' });
    }

    // Mock mode - if Supabase is not configured
    if (!supabase) {
      console.log('Running in mock mode - Supabase not configured');
      return res.status(200).json({ 
        success: true, 
        message: 'Stock updated successfully (mock mode)',
        product: { id, stock: stockValue }
      });
    }

    // Update only the stock field in the database
    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock: stockValue
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating stock:', error);
      
      // Handle product not found
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Product not found',
          message: `Product with id ${id} does not exist.`
        });
      }
      
      return res.status(500).json({ 
        error: 'Database error',
        message: error.message || 'Failed to update stock'
      });
    }

    console.log('Stock updated successfully:', data);

    return res.status(200).json({ 
      success: true, 
      message: 'Stock updated successfully',
      product: data
    });

  } catch (error) {
    console.error('Error updating product stock:', error);
    return res.status(500).json({ 
      error: 'Unexpected server error',
      message: error.message || 'Unknown error'
    });
  }
}

