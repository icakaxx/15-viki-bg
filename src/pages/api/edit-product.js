import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { ProductID, Brand, Model, Colour, Type, CapacityBTU, EnergyRating, Price, PreviousPrice, ImageURL } = req.body;

  const { error } = await supabase.from('Product')
    .update({ Brand, Model, Colour, Type, CapacityBTU, EnergyRating, Price, PreviousPrice, ImageURL })
    .eq('ProductID', ProductID);

  if (error) {
    console.error('Edit error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Product updated.' });
}
