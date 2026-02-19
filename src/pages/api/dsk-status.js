import { callDskApi } from '../../lib/dskApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderid } = req.body;

    if (!orderid) {
      return res.status(400).json({ error: 'Missing required parameter: orderid' });
    }

    const result = await callDskApi('getDskPayStatus', {
      orderid: String(orderid),
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('DSK status error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
