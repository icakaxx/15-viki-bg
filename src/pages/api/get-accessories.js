import { createClient } from '@supabase/supabase-js';

// Function to transform database properties to frontend expected format
const transformItem = (row) => ({
    id: row.id,
    Name: row.name,
    Description: '',
    Price: row.price || 0,
    ImageURL: '/images/accessories/default.jpg',
    Category: row.type === 'installation' ? 'Installation' : 'General',
    IsAvailable: row.active !== false,
    CreatedAt: row.created_at,
    type: row.type || 'accessory',
});

// Legacy shape for accessories (AccessoryID used in cart/checkout)
const transformAccessory = (row) => ({
    AccessoryID: row.id,
    Name: row.name,
    Description: '',
    Price: row.price || 0,
    ImageURL: '/images/accessories/default.jpg',
    Category: 'General',
    IsAvailable: row.active !== false,
    CreatedAt: row.created_at,
});

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({
            error: 'Server configuration error - missing environment variables',
            accessories: [],
            installation: null,
        });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        const { data, error } = await supabase
            .from('accessories')
            .select('*')
            .order('price', { ascending: true });

        if (error) {
            return res.status(500).json({
                error: 'Failed to fetch accessories',
                accessories: [],
                installation: null,
            });
        }

        const rows = data || [];
        // type column may not exist yet (migration not run); treat null/undefined as 'accessory'
        const accessoriesRows = rows.filter(r => (r.type || 'accessory') !== 'installation');
        const installationRow = rows.find(r => r.type === 'installation');

        const transformedAccessories = accessoriesRows.map(transformAccessory);
        const installation = installationRow ? transformItem(installationRow) : null;

        return res.status(200).json({
            accessories: transformedAccessories,
            installation,
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Database connection failed',
            accessories: [],
            installation: null,
        });
    }
} 