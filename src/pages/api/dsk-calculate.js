import { callDskApi } from '../../lib/dskApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { price, product_id, initial_payment = '0' } = req.body;

    if (!price || !product_id) {
      return res.status(400).json({ error: 'Missing required parameters: price, product_id' });
    }

    const result = await callDskApi('getCalculationForAllSchemes', {
      price: String(price),
      product_id: String(product_id),
      initial_payment: String(initial_payment),
    });

    return res.status(200).json({ success: true, schemes: result });
  } catch (error) {
    console.error('DSK calculate error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
