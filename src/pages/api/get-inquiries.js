import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Set CORS headers for actual requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables');
    return res.status(500).json({ 
      error: 'Server configuration error - missing environment variables'
    });
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { 
      status, 
      inquiryType, 
      search, 
      page = 1, 
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    console.log('Fetching inquiries with filters:', {
      status,
      inquiryType,
      search,
      page,
      limit,
      sortBy,
      sortOrder
    });

    // Build query
    let query = supabase
      .from('inquiries')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (inquiryType && inquiryType !== 'all') {
      query = query.eq('inquiry_type', inquiryType);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email_address.ilike.%${search}%,company_organization.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: inquiries, error, count } = await query;

    if (error) {
      console.error('Error fetching inquiries:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch inquiries',
        message: error.message
      });
    }

    console.log(`Fetched ${inquiries?.length || 0} inquiries`);

    // Return success response
    return res.status(200).json({
      success: true,
      inquiries: inquiries || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: {
        status,
        inquiryType,
        search
      }
    });

  } catch (error) {
    console.error('Error in get-inquiries:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  }
} 