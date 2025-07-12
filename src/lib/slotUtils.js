import { createClient } from '@supabase/supabase-js';

// Define available time slots (8 AM to 7 PM) in 30-minute intervals
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00'
];

/**
 * Check if multiple consecutive time slots are available for booking
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string[]} timeSlots - Array of time slots in HH:MM format
 * @param {number|null} excludeInstallationId - Installation ID to exclude from conflict check (for rescheduling)
 * @returns {Promise<{available: boolean, unavailableSlots?: string[], reason?: string}>}
 */
export async function areSlotsAvailable(date, timeSlots, excludeInstallationId = null) {
  // Validate input parameters
  if (!date || !timeSlots || timeSlots.length === 0) {
    return { available: false, reason: 'Missing date or time slots' };
  }

  // Validate time slots
  const invalidSlots = timeSlots.filter(slot => !TIME_SLOTS.includes(slot));
  if (invalidSlots.length > 0) {
    return { available: false, reason: `Invalid time slots: ${invalidSlots.join(', ')}` };
  }

  // Check if any slot is in the past
  const slotDate = new Date(date);
  const today = new Date();
  const isToday = date === today.toISOString().split('T')[0];
  const currentTime = today.getHours() * 60 + today.getMinutes();

  const pastSlots = timeSlots.filter(timeSlot => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = hours * 60 + minutes;
    
    return slotDate < new Date(today.toISOString().split('T')[0]) || 
           (isToday && slotTime <= currentTime);
  });

  if (pastSlots.length > 0) {
    return { available: false, reason: 'Cannot book slots in the past', unavailableSlots: pastSlots };
  }

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { available: false, reason: 'Server configuration error' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Build query to check for existing bookings
    let query = supabase
      .from('installation_schedule')
      .select('time_slot')
      .eq('scheduled_date', date)
      .in('time_slot', timeSlots);

    // Exclude specific installation ID if provided (for rescheduling)
    if (excludeInstallationId) {
      query = query.neq('id', excludeInstallationId);
    }

    const { data: existingBookings, error } = await query;

    if (error) {
      console.error('Error checking slot availability:', error);
      return { available: false, reason: 'Failed to check slot availability' };
    }

    if (existingBookings && existingBookings.length > 0) {
      const bookedSlots = existingBookings.map(booking => booking.time_slot);
      return { 
        available: false, 
        reason: 'Some time slots are already booked',
        unavailableSlots: bookedSlots
      };
    }

    return { available: true };

  } catch (error) {
    console.error('Error in areSlotsAvailable:', error);
    return { available: false, reason: 'Internal error checking availability' };
  }
}

/**
 * Check if a specific date/time slot is available for booking (legacy function for backward compatibility)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} timeSlot - Time in HH:MM format (e.g., '09:00')
 * @param {number|null} excludeInstallationId - Installation ID to exclude from conflict check (for rescheduling)
 * @returns {Promise<{available: boolean, reason?: string}>}
 */
export async function isSlotAvailable(date, timeSlot, excludeInstallationId = null) {
  const result = await areSlotsAvailable(date, [timeSlot], excludeInstallationId);
  return {
    available: result.available,
    reason: result.reason
  };
}

/**
 * Generate consecutive time slots starting from a given time
 * @param {string} startTime - Starting time in HH:MM format
 * @param {number} duration - Duration in hours (can be decimal like 1.5 for 1.5 hours)
 * @returns {string[]} Array of consecutive time slots
 */
export function generateConsecutiveSlots(startTime, duration) {
  const slots = [];
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  let currentTime = startHours * 60 + startMinutes; // Convert to minutes
  const endTime = currentTime + (duration * 60); // Duration in minutes
  
  while (currentTime < endTime) {
    const hours = Math.floor(currentTime / 60);
    const minutes = currentTime % 60;
    const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    if (TIME_SLOTS.includes(timeSlot)) {
      slots.push(timeSlot);
    }
    
    currentTime += 30; // Move to next 30-minute slot
  }
  
  return slots;
}

/**
 * Get duration in hours from an array of consecutive time slots
 * @param {string[]} timeSlots - Array of time slots
 * @returns {number} Duration in hours
 */
export function getSlotsDuration(timeSlots) {
  if (!timeSlots || timeSlots.length === 0) return 0;
  return timeSlots.length * 0.5; // Each slot is 30 minutes = 0.5 hours
}

/**
 * Check if time slots are consecutive
 * @param {string[]} timeSlots - Array of time slots in HH:MM format
 * @returns {boolean} True if slots are consecutive
 */
export function areSlotsConsecutive(timeSlots) {
  if (!timeSlots || timeSlots.length <= 1) return true;
  
  // Sort slots first
  const sortedSlots = [...timeSlots].sort();
  
  for (let i = 1; i < sortedSlots.length; i++) {
    const [prevHours, prevMinutes] = sortedSlots[i-1].split(':').map(Number);
    const [currHours, currMinutes] = sortedSlots[i].split(':').map(Number);
    
    const prevTime = prevHours * 60 + prevMinutes;
    const currTime = currHours * 60 + currMinutes;
    
    // Each slot should be 30 minutes apart
    if (currTime - prevTime !== 30) {
      return false;
    }
  }
  
  return true;
}

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date 
 * @returns {string}
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Check if a date is today
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export function isToday(dateStr) {
  return dateStr === formatDate(new Date());
}

/**
 * Check if a date/time slot is in the past
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} timeSlot - Time in HH:MM format
 * @returns {boolean}
 */
export function isPastSlot(dateStr, timeSlot) {
  const slotDate = new Date(dateStr);
  const today = new Date();
  const isTodaySlot = isToday(dateStr);
  const slotHour = parseInt(timeSlot.split(':')[0]);
  const currentHour = today.getHours();

  return slotDate < new Date(today.toISOString().split('T')[0]) || 
         (isTodaySlot && slotHour <= currentHour);
} 