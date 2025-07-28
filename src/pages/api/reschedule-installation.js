import { createClient } from '@supabase/supabase-js';
import { isSlotAvailable } from '../../lib/slotUtils';

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Set CORS headers for actual requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { installation_id, order_id, new_date, new_time, admin_id, reason } = req.body;

    // Validate required parameters - prefer installation_id, fallback to order_id
    const searchId = installation_id || order_id;
    const searchField = installation_id ? 'id' : 'order_id';
    
    if (!searchId || !new_date || !new_time) {
      return res.status(400).json({ 
        error: 'Missing required parameters: installation_id (or order_id), new_date, and new_time are required' 
      });
    }

    // Check if this is a mock order (order_id >= 1000)
    const isMockOrder = searchId >= 1000;
    
    if (isMockOrder) {
      return res.status(200).json({
        success: true,
        order_id: searchId,
        installation_id: searchId,
        old_schedule: {
          date: '2025-07-26', // Mock old date
          time: '08:00'       // Mock old time
        },
        new_schedule: {
          date: new_date,
          time: new_time
        },
        message: 'Mock installation rescheduled successfully'
      });
    }

    // 1. Fetch existing installation schedule
    let query = supabase
      .from('installation_schedule')
      .select('id, order_id, scheduled_date, time_slot, end_time_slot')
      .eq(searchField, searchId);

    // If searching by order_id, get the most recent installation
    if (searchField === 'order_id') {
      query = query.order('created_at', { ascending: false }).limit(1);
    }

    const { data: existingInstallation, error: fetchError } = installation_id 
      ? await query.single()  // Use .single() only when searching by installation_id
      : await query.maybeSingle(); // Use .maybeSingle() when searching by order_id

    if (fetchError || !existingInstallation) {
      console.error('Error fetching existing installation:', fetchError);
      return res.status(404).json({ 
        error: 'Installation not found',
        message: `No installation schedule found for ${searchField} ${searchId}`
      });
    }

    const oldDate = existingInstallation.scheduled_date;
    const oldTime = existingInstallation.time_slot;
    const oldEndTime = existingInstallation.end_time_slot || existingInstallation.time_slot;
    const installationId = existingInstallation.id;

    // Fix existing installations with incorrect end times (where end time is before start time)
    if (oldEndTime <= oldTime && oldEndTime !== oldTime) {
      // Calculate correct end time based on duration (default 1 hour)
      const [startHours, startMinutes] = oldTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = startTotalMinutes + 60; // Add 1 hour
      const endHours = Math.floor(endTotalMinutes / 60);
      const endMinutes = endTotalMinutes % 60;
      const correctedEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      
      // Update the installation with correct end time
      const { error: fixError } = await supabase
        .from('installation_schedule')
        .update({ end_time_slot: correctedEndTime })
        .eq('id', installationId);
        
      if (fixError) {
        console.error('Error fixing installation end time:', fixError);
      } else {
        // Fixed installation end time
        existingInstallation.end_time_slot = correctedEndTime;
      }
    }

    // Calculate installation duration
    const { generateConsecutiveSlots, getDurationFromTimeRange } = await import('../../lib/slotUtils');
    const oldTimeSlots = generateConsecutiveSlots(oldTime, getDurationFromTimeRange(oldTime, oldEndTime));
    const installationDuration = getDurationFromTimeRange(oldTime, oldEndTime);

    // Generate new time slots based on the new start time and duration
    const newTimeSlots = generateConsecutiveSlots(new_time, installationDuration);

    console.log('🔧 New slots calculation debug:', {
      new_time,
      installationDuration,
      newTimeSlots
    });

    // Check if actually changing to a different slot
    if (oldDate === new_date && oldTime === new_time) {
      return res.status(400).json({ 
        error: 'No change required',
        message: 'New date and time are the same as current schedule'
      });
    }

    // 2. Check if new time range is available (excluding current installation)
    const { areSlotsAvailable } = await import('../../lib/slotUtils');
    const availability = await areSlotsAvailable(new_date, newTimeSlots, installationId);
    
    if (!availability.available) {
      return res.status(409).json({ 
        error: 'Time range not available',
        message: availability.reason || 'The requested time range is not available',
        unavailableSlots: availability.unavailableSlots || []
      });
    }

    // 3. Calculate new end time - ensure it's after the start time
    let newEndTime = newTimeSlots[newTimeSlots.length - 1] || new_time;
    
    // FIXED: The end time should be the actual end of the installation, not the last slot start time
    if (newTimeSlots.length > 0) {
      // Calculate the actual end time by adding 30 minutes to the last slot
      const lastSlot = newTimeSlots[newTimeSlots.length - 1];
      const [lastHours, lastMinutes] = lastSlot.split(':').map(Number);
      const lastSlotMinutes = lastHours * 60 + lastMinutes;
      const actualEndMinutes = lastSlotMinutes + 30; // Add 30 minutes to get the actual end time
      
      const endHours = Math.floor(actualEndMinutes / 60);
      const endMinutes = actualEndMinutes % 60;
      newEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    } else {
      // Fallback: add the original duration to the new start time
      const [newStartHours, newStartMinutes] = new_time.split(':').map(Number);
      const newStartTotalMinutes = newStartHours * 60 + newStartMinutes;
      const newEndTotalMinutes = newStartTotalMinutes + (installationDuration * 60);
      
      const endHours = Math.floor(newEndTotalMinutes / 60);
      const endMinutes = newEndTotalMinutes % 60;
      newEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }
    
    // Only apply fallback if there's a real problem (this should rarely happen now)
    if (newEndTime <= new_time) {
      // Use the original duration, not hardcoded 1 hour
      const [startHours, startMinutes] = new_time.split(':').map(Number);
      const endTotalMinutes = (startHours * 60 + startMinutes) + (installationDuration * 60);
      const endHours = Math.floor(endTotalMinutes / 60);
      const endMinutes = endTotalMinutes % 60;
      newEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }

    // 4. Update installation schedule
    const { error: updateError } = await supabase
      .from('installation_schedule')
      .update({ 
        scheduled_date: new_date,
        time_slot: new_time,
        end_time_slot: newEndTime
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
      .from('orders')
      .update([{
        order_id: existingInstallation.order_id,
        status: 'installation_booked',
        changed_by: admin_id || null,
        changed_at: new Date().toISOString(),
        notes: historyNotes,
        modifiedDT: new Date().toISOString()
      }]).eq('order_id', existingInstallation.order_id);

    if (historyError) {
      console.error('Error logging reschedule history:', historyError);
      // Don't fail the entire request if history logging fails, but warn
    }

    return res.status(200).json({
      success: true,
      order_id: existingInstallation.order_id,
      installation_id: installationId,
      old_schedule: {
        date: oldDate,
        time: oldTime,
        end_time: oldEndTime,
        duration: installationDuration
      },
      new_schedule: {
        date: new_date,
        time: new_time,
        end_time: newEndTime,
        duration: installationDuration
      },
      message: `Installation rescheduled from ${oldDate} ${oldTime}-${oldEndTime} to ${new_date} ${new_time}-${newEndTime}`,
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