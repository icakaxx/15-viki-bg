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

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ 
            error: 'Server configuration error - missing environment variables',
            accessories: []
        });
    }

    // Initialize Supabase client inside the handler to ensure env vars are loaded
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

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
            return res.status(500).json({ 
                error: 'Failed to fetch accessories',
                accessories: []
            });
        }

        // Transform accessories to match frontend expectations
        const transformedAccessories = (data || []).map(transformAccessory);
        
        return res.status(200).json({ 
            accessories: transformedAccessories
        });

    } catch (error) {
        return res.status(500).json({ 
            error: 'Database connection failed',
            accessories: []
        });
    }
} 