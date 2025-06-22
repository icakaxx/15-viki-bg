import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    const { data, error } = await supabase
        .from('Product')
        .select(`
        ProductID,
        Brand,
        Model,
        Colour,
        Type,
        CapacityBTU,
        EnergyRating,
        Price,
        PreviousPrice,
        ImageURL
        `)
        .order('ProductID');

    if (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ products: data });
}
