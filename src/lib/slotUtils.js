import { createClient } from '@supabase/supabase-js';

// Define available time slots (9 AM to 5 PM)
export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

/**
 * Check if a specific date/time slot is available for booking
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} timeSlot - Time in HH:MM format (e.g., '09:00')
 * @param {number|null} excludeInstallationId - Installation ID to exclude from conflict check (for rescheduling)
 * @returns {Promise<{available: boolean, reason?: string}>}
 */
export async function isSlotAvailable(date, timeSlot, excludeInstallationId = null) {
  // Validate input parameters
  if (!date || !timeSlot) {
    return { available: false, reason: 'Missing date or time slot' };
  }

  // Validate time slot
  if (!TIME_SLOTS.includes(timeSlot)) {
    return { available: false, reason: 'Invalid time slot' };
  }

  // Check if slot is in the past
  const slotDate = new Date(date);
  const today = new Date();
  const isToday = date === today.toISOString().split('T')[0];
  const slotHour = parseInt(timeSlot.split(':')[0]);
  const currentHour = today.getHours();

  const isPast = slotDate < new Date(today.toISOString().split('T')[0]) || 
                 (isToday && slotHour <= currentHour);

  if (isPast) {
    return { available: false, reason: 'Cannot book slots in the past' };
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
      .select('id')
      .eq('scheduled_date', date)
      .eq('time_slot', timeSlot);

    // Exclude specific installation ID if provided (for rescheduling)
    if (excludeInstallationId) {
      query = query.neq('id', excludeInstallationId);
    }

    const { data: existingBooking, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found (which is what we want)
      console.error('Error checking slot availability:', error);
      return { available: false, reason: 'Failed to check slot availability' };
    }

    if (existingBooking) {
      return { available: false, reason: 'Time slot is already booked' };
    }

    return { available: true };

  } catch (error) {
    console.error('Error in isSlotAvailable:', error);
    return { available: false, reason: 'Internal error checking availability' };
  }
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