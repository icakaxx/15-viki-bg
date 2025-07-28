import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { searchId, newDate, newTime } = req.body;

  if (!searchId || !newDate || !newTime) {
    return res.status(400).json({ 
      error: 'Search ID, new date, and new time are required' 
    });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    console.log(`Rescheduling installation for order: ${searchId} to ${newDate} ${newTime}`);

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_id, status')
      .eq('order_id', searchId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if installation schedule exists
    const { data: existingSchedule, error: scheduleError } = await supabase
      .from('installation_schedule')
      .select('id, scheduled_date, time_slot')
      .eq('order_id', searchId)
      .single();

    if (scheduleError && scheduleError.code !== 'PGRST116') {
      console.error('Error fetching installation schedule:', scheduleError);
      return res.status(500).json({ 
        error: 'Failed to fetch installation schedule',
        details: scheduleError.message
      });
    }

    let oldDate = null;
    let oldTime = null;

    if (existingSchedule) {
      oldDate = existingSchedule.scheduled_date;
      oldTime = existingSchedule.time_slot;

      // Update existing schedule
      const { error: updateError } = await supabase
        .from('installation_schedule')
        .update({
          scheduled_date: newDate,
          time_slot: newTime,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', searchId);

      if (updateError) {
        console.error('Error updating installation schedule:', updateError);
        return res.status(500).json({ 
          error: 'Failed to update installation schedule',
          details: updateError.message
        });
      }
    } else {
      // Create new schedule
      const { error: createError } = await supabase
        .from('installation_schedule')
        .insert([{
          order_id: searchId,
          scheduled_date: newDate,
          time_slot: newTime,
          created_at: new Date().toISOString()
        }]);

      if (createError) {
        console.error('Error creating installation schedule:', createError);
        return res.status(500).json({ 
          error: 'Failed to create installation schedule',
          details: createError.message
        });
      }
    }

    console.log(`✅ Installation rescheduled successfully for order ${searchId}`);

    return res.status(200).json({
      success: true,
      message: 'Installation rescheduled successfully',
      orderId: searchId,
      oldSchedule: oldDate && oldTime ? { date: oldDate, time: oldTime } : null,
      newSchedule: { date: newDate, time: newTime }
    });

  } catch (error) {
    console.error('Unexpected error rescheduling installation:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
} 