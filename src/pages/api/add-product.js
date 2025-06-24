import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { Brand, Model, Colour, Type, CapacityBTU, EnergyRating, Price, PreviousPrice, ImageURL } = req.body;

    const { data: maxIdData, error: maxIdError } = await supabase
        .from('Product')
        .select('ProductID')
        .order('ProductID', { ascending: false })
        .limit(1);

    if (maxIdError) {
        console.error('Error fetching max ProductID:', maxIdError);
        return res.status(500).json({ error: maxIdError.message });
    }

    const nextProductID = maxIdData.length > 0 ? maxIdData[0].ProductID + 1 : 1;

    const { error } = await supabase.from('Product').insert([
        { ProductID: nextProductID, Brand, Model, Colour, Type, CapacityBTU, EnergyRating, Price, PreviousPrice, ImageURL }
    ]);

    if (error) {
        console.error('Add error:', error);
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Product added.' });
}
