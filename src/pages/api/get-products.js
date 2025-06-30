import { createClient } from '@supabase/supabase-js';

// Function to transform database properties to frontend expected format
const transformProduct = (product) => {
    return {
        ProductID: product.id,
        Brand: product.brand,
        Model: product.model,
        Colour: product.colour,
        Type: product.type,
        CapacityBTU: product.capacity_btu,
        EnergyRating: product.energy_rating,
        Price: product.price,
        PreviousPrice: product.previous_price,
        ImageURL: product.image_url,
        Stock: product.stock,
        Discount: product.discount,
        IsArchived: product.is_archived,
        CreatedAt: product.created_at,
        UpdatedAt: product.updated_at
    };
};

// Mock data for testing when Supabase is not configured
const mockProducts = [
    {
        id: 1,
        brand: "Daikin",
        model: "FTXS35K",
        colour: "White",
        type: "Split",
        capacity_btu: 12000,
        energy_rating: "A++",
        price: 899.00,
        previous_price: 999.00,
        image_url: "/images/daikin-ftxs35k.jpg",
        stock: 15,
        discount: 10.00,
        is_archived: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
    },
    {
        id: 2,
        brand: "Mitsubishi",
        model: "MSZ-LN35VG",
        colour: "White",
        type: "Split",
        capacity_btu: 12000,
        energy_rating: "A+++",
        price: 1099.00,
        previous_price: 1199.00,
        image_url: "/images/mitsubishi-msz-ln35vg.jpg",
        stock: 8,
        discount: 8.33,
        is_archived: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
    },
    {
        id: 3,
        brand: "LG",
        model: "ArtCool Gallery",
        colour: "Black",
        type: "Split",
        capacity_btu: 9000,
        energy_rating: "A++",
        price: 749.00,
        previous_price: 849.00,
        image_url: "/images/lg-artcool-gallery.jpg",
        stock: 12,
        discount: 11.78,
        is_archived: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
    },
    {
        id: 4,
        brand: "Gree",
        model: "Fairy",
        colour: "White",
        type: "Split",
        capacity_btu: 9000,
        energy_rating: "A++",
        price: 549.00,
        previous_price: 649.00,
        image_url: "/images/gree-fairy.jpg",
        stock: 20,
        discount: 15.41,
        is_archived: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
    },
    {
        id: 5,
        brand: "Samsung",
        model: "WindFree",
        colour: "White",
        type: "Split",
        capacity_btu: 12000,
        energy_rating: "A+++",
        price: 999.00,
        previous_price: 1099.00,
        image_url: "/images/samsung-windfree.jpg",
        stock: 5,
        discount: 9.10,
        is_archived: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
    }
];

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

    // Extract query parameters
    const { 
        showArchived = 'false', 
        search = '', 
        sortBy = 'updated_at', 
        sortOrder = 'desc',
        limit = '50',
        offset = '0'
    } = req.query;

    // If Supabase is not configured, return filtered mock data
    if (!supabase) {
        console.log('⚠️  Supabase not configured, using mock data');
        
        let filteredProducts = mockProducts;
        
        // Apply archived filter
        if (showArchived === 'false') {
            filteredProducts = filteredProducts.filter(p => !p.is_archived);
        }
        
        // Apply search filter
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.brand.toLowerCase().includes(searchTerm) ||
                p.model.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply sorting
        filteredProducts.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (sortOrder === 'desc') {
                return bVal > aVal ? 1 : -1;
            } else {
                return aVal > bVal ? 1 : -1;
            }
        });
        
        // Apply pagination
        const limitNum = parseInt(limit);
        const offsetNum = parseInt(offset);
        const paginatedProducts = filteredProducts.slice(offsetNum, offsetNum + limitNum);
        
        // Transform products to match frontend expectations
        const transformedProducts = paginatedProducts.map(transformProduct);
        
        return res.status(200).json({ 
            products: transformedProducts,
            total: filteredProducts.length,
            hasMore: offsetNum + limitNum < filteredProducts.length
        });
    }

    // Use Supabase if configured
    try {
        let query = supabase.from('products').select(`
            id,
            brand,
            model,
            colour,
            type,
            capacity_btu,
            energy_rating,
            price,
            previous_price,
            image_url,
            stock,
            discount,
            is_archived,
            created_at,
            updated_at
        `);

        // Apply archived filter
        if (showArchived === 'false') {
            query = query.eq('is_archived', false);
        }

        // Apply search filter
        if (search) {
            query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%`);
        }

        // Apply sorting
        const validSortFields = ['brand', 'model', 'price', 'stock', 'discount', 'created_at', 'updated_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'updated_at';
        const order = sortOrder === 'asc' ? true : false;
        query = query.order(sortField, { ascending: order });

        // Apply pagination
        const limitNum = parseInt(limit);
        const offsetNum = parseInt(offset);
        query = query.range(offsetNum, offsetNum + limitNum - 1);

        const { data, error, count } = await query;

    if (error) {
            console.error('Error fetching products from Supabase:', error);
            // Fallback to mock data on error
            const filteredMockProducts = mockProducts.filter(p => 
                showArchived === 'true' || !p.is_archived
            );
            const transformedMockProducts = filteredMockProducts.slice(0, parseInt(limit)).map(transformProduct);
            return res.status(200).json({ 
                products: transformedMockProducts,
                total: filteredMockProducts.length,
                hasMore: false,
                fallback: true
            });
        }

        // Get total count for pagination
        let totalQuery = supabase.from('products').select('id', { count: 'exact' });
        if (showArchived === 'false') {
            totalQuery = totalQuery.eq('is_archived', false);
        }
        if (search) {
            totalQuery = totalQuery.or(`brand.ilike.%${search}%,model.ilike.%${search}%`);
        }
        
        const { count: totalCount } = await totalQuery;

        // Transform products to match frontend expectations
        const transformedProducts = (data || []).map(transformProduct);
        
        return res.status(200).json({ 
            products: transformedProducts,
            total: totalCount || 0,
            hasMore: offsetNum + limitNum < (totalCount || 0)
        });

    } catch (error) {
        console.error('Supabase connection error:', error);
        // Fallback to mock data on connection error
        const filteredMockProducts = mockProducts.filter(p => 
            showArchived === 'true' || !p.is_archived
        );
        const transformedMockProducts = filteredMockProducts.slice(0, parseInt(limit)).map(transformProduct);
        return res.status(200).json({ 
            products: transformedMockProducts,
            total: filteredMockProducts.length,
            hasMore: false,
            fallback: true
        });
    }
}
