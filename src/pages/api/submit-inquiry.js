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
      fullName, 
      emailAddress, 
      phone, 
      companyOrganization, 
      inquiryType, 
      budget, 
      message 
    } = req.body;



    // Validate required fields
    if (!fullName || !emailAddress || !inquiryType || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Full name, email address, inquiry type, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Create inquiry data
    const inquiryData = {
      full_name: fullName.trim(),
      email_address: emailAddress.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      company_organization: companyOrganization ? companyOrganization.trim() : null,
      inquiry_type: inquiryType.trim(),
      budget: budget ? budget.trim() : null,
      message: message.trim(),
      status: 'new',
      created_at: new Date().toISOString()
    };



    // Insert inquiry into database
    const { data: savedInquiry, error: insertError } = await supabase
      .from('inquiries')
      .insert([inquiryData])
      .select()
      .single();

    if (insertError) {
      console.error('Error saving inquiry:', insertError);
      return res.status(500).json({ 
        error: 'Failed to save inquiry',
        message: 'An error occurred while saving your inquiry. Please try again.'
      });
    }



    // Return success response
    return res.status(200).json({
      success: true,
      inquiryId: savedInquiry.id,
      message: 'Inquiry submitted successfully! We will get back to you soon.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in submit-inquiry:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
} 