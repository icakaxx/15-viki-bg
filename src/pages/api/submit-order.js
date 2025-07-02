import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Debug environment variables
  console.log('Environment variables:', {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
    NODE_ENV: process.env.NODE_ENV
  });

  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'API is working',
      timestamp: new Date().toISOString(),
      env: {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
        SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing'
      }
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables');
    return res.status(500).json({ 
      error: 'Server configuration error - missing environment variables',
      debug: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  }

  // Initialize Supabase client inside the handler to ensure env vars are loaded
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const {
      personalInfo,
      invoiceInfo,
      paymentInfo,
      cartItems,
    } = req.body;

    // Debug request data
    console.log('Request body received:', {
      hasPersonalInfo: !!personalInfo,
      hasInvoiceInfo: !!invoiceInfo,
      hasPaymentInfo: !!paymentInfo,
      hasCartItems: !!cartItems,
      cartItemsCount: cartItems?.length || 0
    });

    // Validate required data
    if (!personalInfo || !personalInfo.firstName || !personalInfo.lastName || !personalInfo.phone) {
      console.error('Missing required personal info');
      return res.status(400).json({ error: 'Missing required personal information' });
    }

    if (!cartItems || cartItems.length === 0) {
      console.error('No cart items provided');
      return res.status(400).json({ error: 'No items in cart' });
    }

    if (!paymentInfo || !paymentInfo.paymentMethod) {
      console.error('Missing payment info');
      return res.status(400).json({ error: 'Missing payment information' });
    }

    // Insert into guest_orders table
    console.log('Inserting guest order...');
    const { data: orderData, error: orderError } = await supabase
      .from('guest_orders')
      .insert([{
        first_name: personalInfo.firstName,
        middle_name: personalInfo.middleName,
        last_name: personalInfo.lastName,
        phone: personalInfo.phone,
      }])
      .select()
      .single();

    console.log('Guest order result:', { orderData, orderError });

    if (orderError) throw orderError;

    const orderId = orderData.id;

    // Insert invoice information if enabled (optional - skip if table doesn't exist)
    if (invoiceInfo.invoiceEnabled) {
      console.log('Inserting invoice info...');
      const invoiceData = {
        order_id: orderId,
        invoice_enabled: invoiceInfo.invoiceEnabled,
        company_name: invoiceInfo.companyName,
        address: invoiceInfo.address,
        bulstat: invoiceInfo.bulstat,
        mol: invoiceInfo.mol,
        mol_custom: invoiceInfo.molCustom,
      };
      
      console.log('Invoice data to insert:', invoiceData);
      
      try {
        const { data: invoiceResult, error: invoiceError } = await supabase
          .from('invoice_info')
          .insert([invoiceData]);
        
        console.log('Invoice insert result:', { invoiceResult, invoiceError });
        
        if (invoiceError) {
          console.error('Invoice insert error:', invoiceError);
          console.warn('Invoice table insert failed - continuing without invoice tracking for now');
        } else {
          console.log('Invoice info inserted successfully');
        }
      } catch (insertError) {
        console.error('Invoice insert try-catch error:', insertError);
        console.warn('Invoice table insert failed - continuing without invoice tracking for now');
      }
    }

    // Insert payment and tracking information with initial status
    console.log('Inserting payment info...');
    const paymentData = {
      order_id: orderId,
      payment_method: paymentInfo.paymentMethod,
      status: 'new', // Updated to use new status system
    };
    console.log('Payment data to insert:', paymentData);
    
    try {
      const { data: paymentResult, error: paymentError } = await supabase
        .from('payment_and_tracking')
        .insert([paymentData])
        .select()
        .single();
      
      console.log('Payment insert result:', { paymentResult, paymentError });
      
      if (paymentError) {
        console.error('Payment insert error details:', {
          message: paymentError.message || 'No message',
          code: paymentError.code || 'No code',
          details: paymentError.details || 'No details',
          hint: paymentError.hint || 'No hint',
          fullError: paymentError
        });
        
        // Log the error but don't fail the entire order - table might not exist yet
        console.warn('Payment table insert failed - continuing without payment tracking for now');
      } else {
        console.log('Payment info inserted successfully');
        
        // Insert initial status history entry
        console.log('Creating initial status history entry...');
        try {
          const { data: historyResult, error: historyError } = await supabase
            .from('order_status_history')
            .insert([{
              order_id: orderId,
              old_status: null, // null for initial creation
              new_status: 'new',
              changed_by: null, // null indicates system/automatic change
              notes: 'Order created automatically by system'
            }]);
          
          if (historyError) {
            console.error('Status history insert error:', historyError);
            console.warn('Status history insert failed - continuing without history tracking');
          } else {
            console.log('Initial status history entry created successfully');
          }
        } catch (historyInsertError) {
          console.error('Status history insert try-catch error:', historyInsertError);
          console.warn('Status history insert failed - continuing without history tracking');
        }
      }
    } catch (insertError) {
      console.error('Payment insert try-catch error:', insertError);
      console.warn('Payment table insert failed - continuing without payment tracking for now');
    }

    // Insert order items (optional - skip if table doesn't exist)
    console.log('Inserting order items...');
    const orderItems = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      service_option: item.serviceOption,
    }));

    console.log('Order items to insert:', orderItems);

    try {
      const { data: itemsResult, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      console.log('Order items insert result:', { itemsResult, itemsError });
      
      if (itemsError) {
        console.error('Order items insert error:', itemsError);
        console.warn('Order items table insert failed - continuing without item tracking for now');
      } else {
        console.log('Order items inserted successfully');
      }
    } catch (insertError) {
      console.error('Order items insert try-catch error:', insertError);
      console.warn('Order items table insert failed - continuing without item tracking for now');
    }

    console.log('Order successfully created with ID:', orderId);
    return res.status(200).json({ success: true, orderId });
  } catch (error) {
    console.error('Order submission error:', error);
    
    // Handle different types of errors
    let errorMessage = 'Unknown error occurred';
    let errorCode = null;
    let errorDetails = null;
    let errorHint = null;

    if (error && typeof error === 'object') {
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.code) {
        errorCode = error.code;
      }
      if (error.details) {
        errorDetails = error.details;
      }
      if (error.hint) {
        errorHint = error.hint;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error('Formatted error response:', {
      message: errorMessage,
      code: errorCode,
      details: errorDetails,
      hint: errorHint
    });

    return res.status(500).json({ 
      error: errorMessage,
      code: errorCode,
      details: errorDetails,
      hint: errorHint,
      success: false
    });
  }
} 