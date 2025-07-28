import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Set CORS headers for actual requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
      inquiryId, 
      status, 
      adminNotes, 
      adminId 
    } = req.body;



    // Validate required parameters
    if (!inquiryId) {
      return res.status(400).json({ 
        error: 'Missing required parameter: inquiryId is required' 
      });
    }

    // Validate status values
    const validStatuses = ['new', 'read', 'responded', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Fetch current inquiry
    const { data: currentInquiry, error: fetchError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();

    if (fetchError || !currentInquiry) {
      console.error('Error fetching inquiry:', fetchError);
      return res.status(404).json({ 
        error: 'Inquiry not found',
        message: `No inquiry found with ID ${inquiryId}`
      });
    }

    const oldStatus = currentInquiry.status;

    // Prepare update data
    const updateData = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    // Add timestamps for status changes
    if (status === 'responded' && oldStatus !== 'responded') {
      updateData.responded_at = new Date().toISOString();
      updateData.responded_by = adminId || null;
    }



    // Update inquiry
    const { data: updatedInquiry, error: updateError } = await supabase
      .from('inquiries')
      .update(updateData)
      .eq('id', inquiryId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating inquiry:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update inquiry',
        message: updateError.message
      });
    }



    // Return success response
    return res.status(200).json({
      success: true,
      inquiryId: updatedInquiry.id,
      status: updatedInquiry.status,
      message: 'Inquiry updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in update-inquiry-status:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  }
} 