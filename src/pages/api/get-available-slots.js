import { createClient } from '@supabase/supabase-js';
import { TIME_SLOTS, isPastSlot } from '../../lib/slotUtils';

// Function to normalize time to the nearest TIME_SLOT
function normalizeToSlot(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // Find the closest TIME_SLOT
  let closestSlot = TIME_SLOTS[0];
  let minDifference = Math.abs(totalMinutes - (parseInt(closestSlot.split(':')[0]) * 60 + parseInt(closestSlot.split(':')[1])));
  
  for (const slot of TIME_SLOTS) {
    const [slotHours, slotMinutes] = slot.split(':').map(Number);
    const slotTotalMinutes = slotHours * 60 + slotMinutes;
    const difference = Math.abs(totalMinutes - slotTotalMinutes);
    
    if (difference < minDifference) {
      minDifference = difference;
      closestSlot = slot;
    }
  }
  
  return closestSlot;
}

// Function to book installation slots using the new logic
function bookInstallation(startTime, endTime, date, bookedSlotsSet) {
  const normalizedStart = normalizeToSlot(startTime);
  const normalizedEnd = normalizeToSlot(endTime);

  const startIndex = TIME_SLOTS.indexOf(normalizedStart);
  const endIndex = TIME_SLOTS.indexOf(normalizedEnd);

  if (startIndex === -1 || endIndex === -1) {
    console.error('Start or end time not aligned to TIME_SLOTS:', { startTime, endTime, normalizedStart, normalizedEnd });
    return [];
  }

  const requiredSlots = endIndex - startIndex;

  // Mark the slots as booked
  const markedSlots = [];
  for (let i = 0; i < requiredSlots; i++) {
    const slotToMark = TIME_SLOTS[startIndex + i];
    bookedSlotsSet.add(`${date}_${slotToMark}`);
    markedSlots.push(slotToMark);
  }

  return markedSlots;
}

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

    // Get all booked slots in the date range
    const { data: bookedSlots, error } = await supabase
      .from('installation_schedule')
      .select('scheduled_date, time_slot, end_time_slot')
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
    const bookedSlotsSet = new Set();
    
    bookedSlots.forEach(slot => {
      const startTime = slot.time_slot;
      const endTime = slot.end_time_slot || slot.time_slot;
      
      // Use the new booking logic
      const markedSlots = bookInstallation(startTime, endTime, slot.scheduled_date, bookedSlotsSet);
    });



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