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
        UpdatedAt: product.updated_at,
        // Technical Performance (with defaults for missing columns)
        COP: product.cop || null,
        SCOP: product.scop || null,
        PowerConsumption: product.power_consumption || null,
        RefrigerantType: product.refrigerant_type || 'R32',
        OperatingTempRange: product.operating_temp_range || null,
        // Physical Characteristics (with defaults for missing columns)
        IndoorDimensions: product.indoor_dimensions || null,
        OutdoorDimensions: product.outdoor_dimensions || null,
        IndoorWeight: product.indoor_weight || null,
        OutdoorWeight: product.outdoor_weight || null,
        NoiseLevel: product.noise_level || null,
        AirFlow: product.air_flow || null,
        // Features & Usability (with defaults for missing columns)
        WarrantyPeriod: product.warranty_period || null,
        RoomSizeRecommendation: product.room_size_recommendation || null,
        InstallationType: product.installation_type || null,
        Description: product.description || '',
        Features: product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : [],
        // Promotional flags (with defaults for missing columns)
        IsFeatured: product.is_featured || false,
        IsBestseller: product.is_bestseller || false,
        IsNew: product.is_new || false
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
        is_featured: true,
        is_bestseller: false,
        is_new: false,
        cop: 4.5,
        scop: 4.2,
        power_consumption: 850,
        refrigerant_type: "R32",
        operating_temp_range: "-15°C to 46°C",
        indoor_dimensions: "780 x 250 x 295 mm",
        outdoor_dimensions: "780 x 540 x 285 mm",
        indoor_weight: 8.5,
        outdoor_weight: 28.0,
        noise_level: 19,
        air_flow: 450,
        room_size_recommendation: "25-35 m²",
        installation_type: "Wall-mounted",
        warranty_period: "5 years",
        description: "High-efficiency split air conditioner with advanced features",
        features: ["WiFi Control", "Sleep Mode", "Auto Restart", "Anti-fungus"],
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
        is_featured: false,
        is_bestseller: true,
        is_new: false,
        cop: 5.2,
        scop: 4.8,
        power_consumption: 780,
        refrigerant_type: "R32",
        operating_temp_range: "-20°C to 50°C",
        indoor_dimensions: "800 x 260 x 300 mm",
        outdoor_dimensions: "800 x 550 x 290 mm",
        indoor_weight: 9.0,
        outdoor_weight: 30.0,
        noise_level: 18,
        air_flow: 480,
        room_size_recommendation: "25-40 m²",
        installation_type: "Wall-mounted",
        warranty_period: "7 years",
        description: "Premium split air conditioner with ultra-high efficiency",
        features: ["Inverter Technology", "Eco Mode", "Quiet Operation", "Dual Filter"],
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
        is_featured: false,
        is_bestseller: false,
        is_new: true,
        cop: 4.8,
        scop: 4.5,
        power_consumption: 650,
        refrigerant_type: "R32",
        operating_temp_range: "-10°C to 43°C",
        indoor_dimensions: "750 x 240 x 280 mm",
        outdoor_dimensions: "750 x 520 x 270 mm",
        indoor_weight: 7.5,
        outdoor_weight: 25.0,
        noise_level: 20,
        air_flow: 380,
        room_size_recommendation: "20-30 m²",
        installation_type: "Wall-mounted",
        warranty_period: "3 years",
        description: "Stylish gallery air conditioner with artistic design",
        features: ["Gallery Design", "Smart Control", "Energy Saving", "Auto Clean"],
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
        is_featured: true,
        is_bestseller: true,
        is_new: false,
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
        is_featured: false,
        is_bestseller: false,
        is_new: true,
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
        // Start with basic columns that should always exist
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
            updated_at,
            cop,
            scop,
            power_consumption,
            refrigerant_type,
            operating_temp_range,
            indoor_dimensions,
            outdoor_dimensions,
            indoor_weight,
            outdoor_weight,
            noise_level,
            air_flow,
            warranty_period,
            room_size_recommendation,
            installation_type,
            description,
            features,
            is_featured,
            is_bestseller,
            is_new
        `)

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
