import { callDskApi } from '../../lib/dskApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      orderid,
      first_name,
      last_name,
      phone,
      email,
      address,
      addresscity,
      address2,
      address2city,
      postcode,
      price,
      currency = '0',
      type_client = '0',
      items,
    } = req.body;

    if (!orderid || !first_name || !last_name || !phone || !email || !price || !items) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Ensure items is an array (parse if string)
    const itemsArray = typeof items === 'string' ? JSON.parse(items) : items;

    const result = await callDskApi('sendDskPay', {
      orderid: String(orderid),
      first_name,
      last_name,
      phone,
      email,
      address: address || '',
      addresscity: addresscity || '',
      address2: address2 || address || '',
      address2city: address2city || addresscity || '',
      postcode: postcode || '',
      price: String(price),
      currency,
      type_client,
      items: itemsArray,
    });

    if (result.message === 'success') {
      return res.status(200).json({
        success: true,
        url_redirect: result.url_redirect,
      });
    }

    return res.status(400).json({
      success: false,
      error: result.error || 'Credit application failed',
    });
  } catch (error) {
    console.error('DSK pay error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
