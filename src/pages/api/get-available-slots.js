import { createClient } from '@supabase/supabase-js';
import { TIME_SLOTS, isPastSlot } from '../../lib/slotUtils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
    const { startDate, endDate } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required parameters: startDate and endDate are required' 
      });
    }

    console.log(`Fetching available slots from ${startDate} to ${endDate}`);

    // Get all booked slots in the date range
    const { data: bookedSlots, error } = await supabase
      .from('installation_schedule')
      .select('scheduled_date, time_slot')
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate);

    if (error) {
      console.error('Error fetching booked slots:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch booked slots',
        details: error.message
      });
    }

    // Create a set of booked slots for quick lookup
    const bookedSlotsSet = new Set(
      bookedSlots.map(slot => `${slot.scheduled_date}_${slot.time_slot}`)
    );

    // Generate all possible slots in the date range
    const availableSlots = {};
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      availableSlots[dateStr] = {};

      TIME_SLOTS.forEach(timeSlot => {
        const slotKey = `${dateStr}_${timeSlot}`;
        const isBooked = bookedSlotsSet.has(slotKey);
        const isPast = isPastSlot(dateStr, timeSlot);

        availableSlots[dateStr][timeSlot] = {
          available: !isBooked && !isPast,
          booked: isBooked,
          past: isPast
        };
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return res.status(200).json({
      success: true,
      availableSlots,
      timeSlots: TIME_SLOTS,
      bookedCount: bookedSlots.length
    });

  } catch (error) {
    console.error('Error in get-available-slots:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  }
} 