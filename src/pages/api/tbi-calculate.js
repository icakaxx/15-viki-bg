import { getCalculations, calculateInstallment, calculateTotalDue } from '../../lib/tbiApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, category_id } = req.body;

    const schemes = await getCalculations(amount, category_id);

    if (!Array.isArray(schemes)) {
      return res.status(200).json({ success: true, schemes: [] });
    }

    const filteredSchemes = schemes.filter(scheme => {
      if (!amount) return true;
      const amt = parseFloat(amount);
      const min = parseFloat(scheme.amount_min) || 0;
      const max = parseFloat(scheme.amount_max) || Infinity;
      return amt >= min && amt <= max;
    });

    const enrichedSchemes = filteredSchemes.map(scheme => ({
      ...scheme,
      monthly_payment: amount ? calculateInstallment(amount, scheme) : null,
      total_amount_due: amount ? calculateTotalDue(amount, scheme) : null,
    }));

    return res.status(200).json({ success: true, schemes: enrichedSchemes });
  } catch (error) {
    console.error('TBI calculate error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
