import { registerApplication } from '../../lib/tbiApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      orderid,
      firstname,
      lastname,
      surname = '',
      email,
      phone,
      deliveryaddress = {},
      items,
      period,
      promo = false,
      successRedirectURL,
      failRedirectURL,
      statusURL,
    } = req.body;

    if (!orderid || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required parameters: orderid, items' });
    }

    const applicationData = {
      orderid: String(orderid),
      firstname: firstname || '',
      lastname: lastname || '',
      surname: surname || '',
      email: email || '',
      phone: phone || '',
      deliveryaddress: {
        country: deliveryaddress.country || 'Bulgaria',
        county: deliveryaddress.county || '',
        city: deliveryaddress.city || '',
        streetname: deliveryaddress.streetname || '',
        streetno: deliveryaddress.streetno || '',
        buildingno: deliveryaddress.buildingno || '',
        entranceno: deliveryaddress.entranceno || '',
        floorno: deliveryaddress.floorno || '',
        apartmentno: deliveryaddress.apartmentno || '',
        postalcode: deliveryaddress.postalcode || '',
      },
      items: items.map(item => ({
        name: String(item.name || '').substring(0, 255),
        description: item.description || '',
        qty: String(item.qty || 1),
        price: String(item.price),
        sku: item.sku || '',
        category: item.category || 0,
        imagelink: item.imagelink || '',
      })),
    };

    if (period) applicationData.period = parseInt(period, 10);
    if (promo) applicationData.promo = true;
    if (successRedirectURL) applicationData.successRedirectURL = successRedirectURL;
    if (failRedirectURL) applicationData.failRedirectURL = failRedirectURL;
    if (statusURL) applicationData.statusURL = statusURL;

    const result = await registerApplication(applicationData);

    if (result.url) {
      return res.status(200).json({
        success: true,
        url: result.url,
        order_id: result.order_id,
        token: result.token,
      });
    }

    return res.status(500).json({ error: 'No redirect URL returned from TBI' });
  } catch (error) {
    console.error('TBI pay error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
