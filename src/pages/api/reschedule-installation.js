import { createClient } from '@supabase/supabase-js';
import { isSlotAvailable } from '../../lib/slotUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { order_id, new_date, new_time, admin_id, reason } = req.body;

    // Validate required parameters
    if (!order_id || !new_date || !new_time) {
      return res.status(400).json({ 
        error: 'Missing required parameters: order_id, new_date, and new_time are required' 
      });
    }

    console.log(`Rescheduling installation for order ${order_id} to ${new_date} at ${new_time}`);

    // 1. Fetch existing installation schedule
    const { data: existingInstallation, error: fetchError } = await supabase
      .from('installation_schedule')
      .select('id, order_id, scheduled_date, time_slot')
      .eq('order_id', order_id)
      .single();

    if (fetchError) {
      console.error('Error fetching existing installation:', fetchError);
      return res.status(404).json({ 
        error: 'Installation not found',
        message: `No installation schedule found for order ${order_id}`
      });
    }

    const oldDate = existingInstallation.scheduled_date;
    const oldTime = existingInstallation.time_slot;
    const installationId = existingInstallation.id;

    // Check if actually changing to a different slot
    if (oldDate === new_date && oldTime === new_time) {
      return res.status(400).json({ 
        error: 'No change required',
        message: 'New date and time are the same as current schedule'
      });
    }

    // 2. Check if new slot is available (excluding current installation)
    const availability = await isSlotAvailable(new_date, new_time, installationId);
    
    if (!availability.available) {
      return res.status(409).json({ 
        error: 'Slot not available',
        message: availability.reason || 'The requested time slot is not available'
      });
    }

    // 3. Update installation schedule
    const { error: updateError } = await supabase
      .from('installation_schedule')
      .update({ 
        scheduled_date: new_date,
        time_slot: new_time,
        updated_at: new Date().toISOString()
      })
      .eq('id', installationId);

    if (updateError) {
      console.error('Error updating installation schedule:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update installation schedule',
        details: updateError.message
      });
    }

    // 4. Log status change to history (status stays the same, but we log the reschedule)
    const historyNotes = `Rescheduled from ${oldDate} ${oldTime} → ${new_date} ${new_time}${reason ? `. Reason: ${reason}` : ''}`;
    
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert([{
        order_id: order_id,
        old_status: 'installation_booked',
        new_status: 'installation_booked',
        changed_by: admin_id || null,
        changed_at: new Date().toISOString(),
        notes: historyNotes
      }]);

    if (historyError) {
      console.error('Error logging reschedule history:', historyError);
      // Don't fail the entire request if history logging fails, but warn
    }

    console.log(`Installation successfully rescheduled for order ${order_id}: ${oldDate} ${oldTime} → ${new_date} ${new_time}`);

    return res.status(200).json({
      success: true,
      order_id: order_id,
      installation_id: installationId,
      old_schedule: {
        date: oldDate,
        time: oldTime
      },
      new_schedule: {
        date: new_date,
        time: new_time
      },
      message: `Installation rescheduled from ${oldDate} ${oldTime} to ${new_date} ${new_time}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in reschedule-installation:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  }
} 