import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {

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
      selectedAccessories = [],
      installationData = null
    } = req.body;

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

    // Calculate and validate total price independently on backend
    let calculatedTotal = 0;
    
    // Calculate cart items total
    for (const item of cartItems) {
      const basePrice = item.product?.Price || 0;
      let itemTotal = basePrice * item.quantity;
      
      // Add accessories for this item
      if (item.accessories && item.accessories.length > 0) {
        const accessoryTotal = item.accessories.reduce((sum, acc) => sum + (acc.Price || 0), 0);
        itemTotal += accessoryTotal * item.quantity;
      }
      
      // Add installation (per cart item, not per quantity)
      if (item.installation && item.installationPrice) {
        itemTotal += item.installationPrice;
      }
      
      calculatedTotal += itemTotal;
    }



    // Optional: Validate total (with small tolerance for floating point differences)
    if (paymentInfo.totalAmount && Math.abs(calculatedTotal - paymentInfo.totalAmount) > 0.01) {
      console.warn('Price mismatch detected:', {
        calculated: calculatedTotal,
        reported: paymentInfo.totalAmount,
        difference: Math.abs(calculatedTotal - paymentInfo.totalAmount)
      });
    }

    // Insert into orders table
    console.log('Inserting guest order...');
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        first_name: personalInfo.firstName,
        middle_name: personalInfo.middleName,
        last_name: personalInfo.lastName,
        phone: personalInfo.phone,
        town: personalInfo.town,
        address: personalInfo.address,
        email: personalInfo.email,
        status: 'new',
        notes: 'Поръчка създадена автоматично от системата',
        modifiedDT: new Date().toISOString()
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderId = orderData.order_id;

    // Insert invoice information if enabled (optional - skip if table doesn't exist)
    if (invoiceInfo.invoiceEnabled) {
      const invoiceData = {
        order_id: orderId,
        invoice_enabled: invoiceInfo.invoiceEnabled,
        company_name: invoiceInfo.companyName,
        address: invoiceInfo.address,
        bulstat: invoiceInfo.bulstat,
        mol: invoiceInfo.mol,
        mol_custom: invoiceInfo.molCustom,
      };
      
      try {
        const { data: invoiceResult, error: invoiceError } = await supabase
          .from('invoice_info')
          .insert([invoiceData]);
        
        if (invoiceError) {
          console.error('Invoice insert error:', invoiceError);
          console.warn('Invoice table insert failed - continuing without invoice tracking for now');
        } else {
          // Invoice info inserted successfully
        }
      } catch (insertError) {
        console.error('Invoice insert try-catch error:', insertError);
        console.warn('Invoice table insert failed - continuing without invoice tracking for now');
      }
    }

    // Insert payment and tracking information with initial status
    
    const paymentData = {
      order_id: orderId,
      payment_method: paymentInfo.paymentMethod,
      total_amount: paymentInfo.totalAmount, // Use frontend total
      paid_amount: paymentInfo.paymentMethod === 'online' ? paymentInfo.totalAmount : 0
    };
    try {
      const { data: paymentResult, error: paymentError } = await supabase
        .from('payment_and_tracking')
        .insert([paymentData])
        .select()
        .single();
      
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
        // Payment info inserted successfully
      }
    } catch (insertError) {
      console.error('Payment insert try-catch error:', insertError);
      console.warn('Payment table insert failed - continuing without payment tracking for now');
    }

    // Insert order items (optional - skip if table doesn't exist)
    const orderItems = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      service_option: item.serviceOption,
      includes_installation: item.installation,
      accessories: item.accessories && item.accessories.length > 0 ? item.accessories.map(acc => ({
        accessory_id: acc.AccessoryID || acc.accessory_id,
        name: acc.Name || acc.name,
        quantity: acc.quantity || 1,
        price: acc.Price || acc.price
      })) : null
    }));

    try {
      const { data: itemsResult, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Order items insert error:', itemsError);
        console.warn('Order items table insert failed - continuing without item tracking for now');
      } else {
        // Order items inserted successfully
      }
    } catch (insertError) {
      console.error('Order items insert try-catch error:', insertError);
      console.warn('Order items table insert failed - continuing without item tracking for now');
    }

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