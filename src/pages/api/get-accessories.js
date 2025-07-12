import { createClient } from '@supabase/supabase-js';

// Function to transform database properties to frontend expected format
const transformAccessory = (accessory) => {
    return {
        AccessoryID: accessory.id,
        Name: accessory.name,
        Description: '', // No description column in database
        Price: accessory.price || 0,
        ImageURL: '/images/accessories/default.jpg',
        Category: 'General',
        IsAvailable: accessory.active !== false,
        CreatedAt: accessory.created_at
    };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('🛠️ Get-accessories API called');

    // Check if Supabase is configured
    if (!supabase) {
        console.error('❌ Supabase not configured');
        return res.status(500).json({ 
            error: 'Database not configured',
            accessories: []
        });
    }

    try {
        const { data, error } = await supabase
            .from('accessories')
            .select(`
                id,
                name,
                price,
                active,
                created_at
            `)
            .order('price', { ascending: true });

        if (error) {
            console.error('❌ Error fetching accessories from Supabase:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch accessories',
                accessories: []
            });
        }

        // Transform accessories to match frontend expectations
        const transformedAccessories = (data || []).map(transformAccessory);
        
        console.log('✅ Successfully fetched', transformedAccessories.length, 'accessories from database');
        console.log('📋 Accessories:', transformedAccessories.map(acc => ({ 
            id: acc.AccessoryID, 
            name: acc.Name, 
            price: acc.Price 
        })));
        
        return res.status(200).json({ 
            accessories: transformedAccessories
        });

    } catch (error) {
        console.error('❌ Database connection error:', error);
        return res.status(500).json({ 
            error: 'Database connection failed',
            accessories: []
        });
    }
} 