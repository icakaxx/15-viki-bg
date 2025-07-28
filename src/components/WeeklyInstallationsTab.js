import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { TIME_SLOTS } from '../lib/slotUtils';
// Weekdays will be handled by translation system instead of this constant
const ADMIN_ID = 1; // Using dev admin ID - you can make this configurable later

function getWeekDates(date) {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day);
  }
  
  return days;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getWeekdayName(index, t) {
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return t(`weekdays.${weekdays[index]}`);
}

// New function to group installations by time range and merge consecutive slots
function getMergedInstallationsForDate(date, installations) {
  const dateStr = formatDate(date);
  const dayInstallations = installations.filter(inst => inst.scheduledDate === dateStr);
  

  
  if (dayInstallations.length === 0) return [];
  
  // Group installations by their time range
  const mergedGroups = [];
  
  dayInstallations.forEach(installation => {
    const startTime = installation.timeSlot;
    const endTime = installation.endTimeSlot || startTime;

 

    // Calculate which time slots this installation covers
    let startIndex = TIME_SLOTS.indexOf(startTime);
    
    // If startTime is not exactly in TIME_SLOTS, find the closest slot
    if (startIndex === -1) {

      
      // Find the closest slot that starts at or after the start time
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      
      for (let i = 0; i < TIME_SLOTS.length; i++) {
        const [slotHours, slotMinutes] = TIME_SLOTS[i].split(':').map(Number);
        const slotTotalMinutes = slotHours * 60 + slotMinutes;
        
        if (slotTotalMinutes >= startTotalMinutes) {
          startIndex = i;

          break;
        }
      }
      
      // If still not found, use the first slot
      if (startIndex === -1) {
        startIndex = 0;

      }
    }

    if (startIndex === -1) {

      return;
    }

    // Calculate duration in minutes
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    
    // Calculate how many 30-minute slots we need
    const requiredSlots = Math.ceil(durationMinutes / 30);
    const actualSlots = Math.max(1, requiredSlots); // At least 1 slot
    
    // Calculate end index based on required slots
    const endIndex = Math.min(startIndex + actualSlots - 1, TIME_SLOTS.length - 1);

 

    const coveredSlots = TIME_SLOTS.slice(startIndex, endIndex + 1);

 

    mergedGroups.push({
      installation,
      startSlot: startTime,
      endSlot: endTime,
      coveredSlots,
      startIndex,
      endIndex,
      rowSpan: endIndex - startIndex + 1
    });
  });
  

  
  return mergedGroups.sort((a, b) => a.startIndex - b.startIndex);
}

// New function to check if a time slot is part of a merged installation
function getInstallationForSlotInMerged(date, timeSlot, mergedInstallations) {
  const dateStr = formatDate(date);
  const dayMerged = mergedInstallations.filter(group => 
    group.installation.scheduledDate === dateStr
  );
  
  for (const group of dayMerged) {
    if (group.coveredSlots.includes(timeSlot)) {
      return group;
    }
  }
  
  return null;
}

export default function WeeklyInstallationsTab({ onInstallationCancelled, onInstallationRescheduled, onInstallationCompleted }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const locale = router.locale || 'bg';
  


  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInstallation, setSelectedInstallation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteOption, setDeleteOption] = useState(null); // 'delete' or 'return'
  const [availableSlots, setAvailableSlots] = useState({});
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Mobile responsiveness state
  const [isMobile, setIsMobile] = useState(false);
  const [currentMobileDay, setCurrentMobileDay] = useState(0); // 0-6 for days of week
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {

    fetchInstallations();
  }, [currentWeek]);

  // Mobile detection effect
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Reset mobile day when week changes
  useEffect(() => {
    setCurrentMobileDay(0);
  }, [currentWeek]);

  // Touch handlers for swipe gestures
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentMobileDay < 6) {
      setCurrentMobileDay(prev => prev + 1);
    }
    if (isRightSwipe && currentMobileDay > 0) {
      setCurrentMobileDay(prev => prev - 1);
    }
  };

  // Mobile day navigation functions
  const navigateMobileDay = (direction) => {
    const newDay = currentMobileDay + direction;
    if (newDay >= 0 && newDay <= 6) {
      setCurrentMobileDay(newDay);
    }
  };

  async function fetchInstallations() {
    setLoading(true);
    setError(null);
    
    try {
      const weekDates = getWeekDates(currentWeek);
      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);



      // Use relative URL to ensure correct port
      const apiUrl = `/api/get-weekly-installations?startDate=${startDate}&endDate=${endDate}`;

      
      const response = await fetch(apiUrl);

      
      const data = await response.json();


      if (response.ok) {
        const fetchedInstallations = data.installations || [];

        setInstallations(fetchedInstallations);
      } else {
        setError(data.error || 'Failed to load installations');
        setInstallations([]);
      }
    } catch (err) {
      setError('Failed to load installations');
      setInstallations([]);
    } finally {
      setLoading(false);
    }
  }

  function getInstallationForSlot(date, timeSlot) {
    const dateStr = formatDate(date);
    const installation = installations.find(inst => 
      inst.scheduledDate === dateStr && inst.timeSlot === timeSlot
    );
    
    // Debug logging
    if (installations.length > 0) {

    }
    
    return installation;
  }

  function navigateWeek(direction) {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  }

  function showInstallationDetails(installation) {
    setSelectedInstallation(installation);
    setShowDetailsModal(true);
  }

  function showToast(message) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 5000);
  }

  // Function to check if a new time range would conflict with existing installations
  function checkTimeRangeConflict(newDate, newStartTime, installationDuration) {
    if (!availableSlots[newDate]) return false;
    

    
    // Calculate the time slots that would be needed for this installation
    const startIndex = TIME_SLOTS.indexOf(newStartTime);
    if (startIndex === -1) return false;
    
    // Calculate the end time based on the installation duration
    const [startHours, startMinutes] = newStartTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = startTotalMinutes + (installationDuration * 60);
    const endHours = Math.floor(endTotalMinutes / 60);
    const endMinutes = endTotalMinutes % 60;
    const calculatedEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    // Find the closest end time slot
    let endIndex = TIME_SLOTS.indexOf(calculatedEndTime);
    if (endIndex === -1) {
      // If exact match not found, find the closest slot
      let closestSlot = TIME_SLOTS[0];
      let minDifference = Math.abs(endTotalMinutes - (parseInt(closestSlot.split(':')[0]) * 60 + parseInt(closestSlot.split(':')[1])));
      
      for (const slot of TIME_SLOTS) {
        const [slotHours, slotMinutes] = slot.split(':').map(Number);
        const slotTotalMinutes = slotHours * 60 + slotMinutes;
        const difference = Math.abs(endTotalMinutes - slotTotalMinutes);
        
        if (difference < minDifference) {
          minDifference = difference;
          closestSlot = slot;
        }
      }
      endIndex = TIME_SLOTS.indexOf(closestSlot);
    }
    
    const requiredSlots = endIndex - startIndex;
    

    
    // Check if any slot in the range is already booked (excluding current appointment)
    for (let i = 0; i < requiredSlots; i++) {
      const slotIndex = startIndex + i;
      if (slotIndex >= TIME_SLOTS.length) break;
      
      const timeSlot = TIME_SLOTS[slotIndex];
      const slot = availableSlots[newDate][timeSlot];
      
      // Skip if this is the current appointment being rescheduled
      const isCurrentAppointment = selectedInstallation && 
        newDate === selectedInstallation.scheduledDate && 
        timeSlot === selectedInstallation.timeSlot;
      

      
      if (slot && slot.booked && !isCurrentAppointment) {

        return true; // Conflict found with another appointment
      }
    }
    

    return false; // No conflicts
  }

  // Function to get installation duration in hours
  function getInstallationDuration(installation) {
    if (!installation.endTimeSlot || installation.endTimeSlot === installation.timeSlot) {
      return 1; // Default 1 hour for single slot
    }
    
    const startTime = installation.timeSlot;
    const endTime = installation.endTimeSlot;
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return Math.max(1, (endTotalMinutes - startTotalMinutes) / 60);
  }

  async function startReschedule() {
    setShowDetailsModal(false);
    setShowRescheduleModal(true);
    
    // Fetch available slots for the next 2 weeks for reschedule overlay
    try {
      const today = new Date();
      const twoWeeksLater = new Date();
      twoWeeksLater.setDate(today.getDate() + 14);
      
      const startDate = formatDate(today);
      const endDate = formatDate(twoWeeksLater);
      
      // Use current window location for API calls
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/get-available-slots?startDate=${startDate}&endDate=${endDate}`;

      
      const response = await fetch(apiUrl);
      const data = await response.json();
      

      
      if (response.ok) {
        setAvailableSlots(data.availableSlots || {});
        
        // Debug: Show which slots are marked as booked for the current date
        if (selectedInstallation) {
          const currentDate = selectedInstallation.scheduledDate;
          const daySlots = data.availableSlots?.[currentDate];

        }
      } else {
        showToast(t('admin.installations.messages.errorLoadingSlots'));
      }
    } catch (err) {

      showToast(t('admin.installations.messages.errorLoadingSlots'));
    }
  }

  async function handleReschedule(newDate, newTime) {
    if (!selectedInstallation) return;
    
    setRescheduleLoading(true);
    
    try {
      // Use current window location for API calls
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/reschedule-installation`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          installation_id: selectedInstallation.id,
          order_id: selectedInstallation.orderId, // Keep as fallback
          new_date: newDate,
          new_time: newTime,
          admin_id: ADMIN_ID,
          reason: t('admin.installations.messages.rescheduleReason')
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowRescheduleModal(false);
        setSelectedInstallation(null);
        
        // Show success message with time range if available
        const installationDuration = getInstallationDuration(selectedInstallation);
        const startIndex = TIME_SLOTS.indexOf(newTime);
        const durationSlots = Math.ceil(installationDuration * 2);
        const endIndex = Math.min(startIndex + durationSlots - 1, TIME_SLOTS.length - 1);
        const newEndTime = TIME_SLOTS[endIndex];
        
        const timeRange = newEndTime !== newTime ? `${newTime}-${newEndTime}` : newTime;
        showToast(t('admin.installations.messages.rescheduleSuccess', { date: newDate, time: timeRange }));
        fetchInstallations(); // Refresh the calendar
        
        // Notify parent component that an installation was rescheduled
        if (onInstallationRescheduled) {
          onInstallationRescheduled();
        }
      } else {
        showToast(t('admin.installations.messages.rescheduleError', { message: data.message || t('admin.installations.messages.rescheduleErrorGeneric') }));
      }
    } catch (err) {
      showToast(t('admin.installations.messages.rescheduleErrorGeneric'));
    } finally {
      setRescheduleLoading(false);
    }
  }

  function startDelete() {
    setShowDetailsModal(false);
    setDeleteOption(null);
    setShowDeleteConfirmation(true);
  }

  async function handleMarkAsInstalled() {
    if (!selectedInstallation) return;
    
    setLoading(true);
    
    try {
      const installationData = {
        orderId: selectedInstallation.orderId,
        newStatus: 'installed',
        adminId: ADMIN_ID,
        notes: `Installation completed on ${selectedInstallation.scheduledDate} at ${selectedInstallation.timeSlot}`,
        installationDate: selectedInstallation.scheduledDate
      };
      

      // Use current window location for API calls
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/update-order-status`;

      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(installationData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowDetailsModal(false);
        setSelectedInstallation(null);
        showToast(t('admin.installations.messages.markAsInstalledSuccess'));
        fetchInstallations(); // Refresh the calendar
        
        // Notify parent component that an installation was completed
        if (onInstallationCompleted) {
          onInstallationCompleted();
        }
      } else {
        showToast(t('admin.installations.messages.markAsInstalledError', { error: data.error || t('admin.installations.messages.markAsInstalledErrorGeneric') }));
      }
    } catch (err) {
      showToast(t('admin.installations.messages.markAsInstalledErrorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteFromDB() {
    if (!selectedInstallation) return;
    
    setDeleteLoading(true);
    
    try {
      // Debug window location - CACHE BUST v2

      
      // Use current window location for API calls (with fallback)
      const baseUrl = window.location.origin || `http://localhost:${window.location.port || '3008'}`;
      const apiUrl = `${baseUrl}/api/cancel-installation`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          installation_id: selectedInstallation.id,
          order_id: selectedInstallation.orderId,
          admin_id: ADMIN_ID,
          reason: t('admin.installations.messages.cancelReason'),
          delete_from_db: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowDeleteConfirmation(false);
        setSelectedInstallation(null);
        setDeleteOption(null);
        showToast(t('admin.installations.messages.deleteFromDBSuccess'));
        fetchInstallations(); // Refresh the calendar
        
        // Notify parent component that an installation was cancelled
        if (onInstallationCancelled) {
          onInstallationCancelled();
        }
      } else {
        showToast(t('admin.installations.messages.cancelError', { message: data.message || t('admin.installations.messages.cancelErrorGeneric') }));
      }
    } catch (err) {
      showToast(t('admin.installations.messages.cancelErrorGeneric'));
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleReturnToOrders() {
    if (!selectedInstallation) return;
    
    setDeleteLoading(true);
    
    try {
      // First, cancel the installation from the calendar

      const baseUrl = window.location.origin;
      const cancelApiUrl = `${baseUrl}/api/cancel-installation`;
      
      const cancelResponse = await fetch(cancelApiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          installation_id: selectedInstallation.id,
          order_id: selectedInstallation.orderId,
          admin_id: ADMIN_ID,
          reason: t('admin.installations.messages.cancelReason')
        })
      });

      if (!cancelResponse.ok) {
        const cancelData = await cancelResponse.json();
        showToast(t('admin.installations.messages.cancelError', { message: cancelData.message || t('admin.installations.messages.cancelErrorGeneric') }));
        return;
      }

      // Then, update the order status to returned_from_calendar
      const orderData = {
        orderId: selectedInstallation.orderId,
        newStatus: 'returned_from_calendar',
        adminId: ADMIN_ID,
        notes: `Installation returned from calendar on ${selectedInstallation.scheduledDate} at ${selectedInstallation.timeSlot}`,
        installationDate: null
      };
      

      const updateApiUrl = `${baseUrl}/api/update-order-status`;
      
      const updateResponse = await fetch(updateApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const updateData = await updateResponse.json();

      if (updateResponse.ok) {
        setShowDeleteConfirmation(false);
        setSelectedInstallation(null);
        setDeleteOption(null);
        showToast(t('admin.installations.messages.returnToOrdersSuccess'));
        fetchInstallations(); // Refresh the calendar
        
        // Notify parent component that an installation was cancelled
        if (onInstallationCancelled) {
          onInstallationCancelled();
        }
      } else {
        showToast(t('admin.installations.messages.cancelError', { message: updateData.error || t('admin.installations.messages.cancelErrorGeneric') }));
      }
    } catch (err) {

      showToast(t('admin.installations.messages.cancelErrorGeneric'));
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedInstallation || !deleteOption) return;
    
    if (deleteOption === 'delete') {
      await handleDeleteFromDB();
    } else if (deleteOption === 'return') {
      await handleReturnToOrders();
    }
  }

  const weekDates = getWeekDates(currentWeek);
  const weekRange = `${weekDates[0].toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })} - ${weekDates[6].toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  // Mobile day view renderer
  const renderMobileDayView = () => {
    const currentDate = weekDates[currentMobileDay];
    const dayName = getWeekdayName(currentMobileDay, t);
    const isToday = formatDate(currentDate) === formatDate(new Date());
    const isPast = currentDate < new Date() && !isToday;

    return (
      <div style={{ padding: '1rem' }}>
        {/* Mobile Day Header */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button
              onClick={() => navigateMobileDay(-1)}
              disabled={currentMobileDay === 0}
              style={{
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: currentMobileDay === 0 ? '#f5f5f5' : 'white',
                cursor: currentMobileDay === 0 ? 'not-allowed' : 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ←
            </button>
            
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isToday ? '#007bff' : '#333' }}>
                {dayName}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                {currentDate.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {isToday && <span style={{ color: '#007bff', marginLeft: '0.5rem' }}>({t('today')})</span>}
              </div>
            </div>
            
            <button
              onClick={() => navigateMobileDay(1)}
              disabled={currentMobileDay === 6}
              style={{
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: currentMobileDay === 6 ? '#f5f5f5' : 'white',
                cursor: currentMobileDay === 6 ? 'not-allowed' : 'pointer',
                fontSize: '1.2rem'
              }}
            >
              →
            </button>
          </div>

          {/* Day position indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            {weekDates.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: index === currentMobileDay ? '#007bff' : '#ddd',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentMobileDay(index)}
              />
            ))}
          </div>
        </div>

        {/* Mobile Time Slots */}
        <div 
          style={{ 
            overflowY: 'auto', 
            maxHeight: 'calc(100vh - 300px)',
            backgroundColor: isPast ? '#f9f9f9' : 'white',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {TIME_SLOTS.map((timeSlot, timeIndex) => {
            const mergedGroup = getInstallationForSlotInMerged(currentDate, timeSlot, getMergedInstallationsForDate(currentDate, installations));
            const isSlotPast = isPast || (isToday && new Date().getHours() * 60 + new Date().getMinutes() > 
              parseInt(timeSlot.split(':')[0]) * 60 + parseInt(timeSlot.split(':')[1]));

            // Only render if this is the starting slot of a merged installation or if it's not part of any merged installation
            if (mergedGroup && mergedGroup.startIndex !== timeIndex) {
              return null;
            }

            return (
              <div
                key={timeSlot}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: mergedGroup 
                    ? (mergedGroup.installation.isCompleted ? '#e3f2fd' : '#fff3e0') 
                    : (isSlotPast ? '#f5f5f5' : 'white'),
                  cursor: mergedGroup ? 'pointer' : 'default',
                  minHeight: mergedGroup && mergedGroup.rowSpan > 1 ? `${70 * mergedGroup.rowSpan}px` : '70px'
                }}
                onClick={() => mergedGroup && showInstallationDetails(mergedGroup.installation)}
              >
                <div style={{ 
                  minWidth: '60px', 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem',
                  color: mergedGroup ? '#333' : '#999'
                }}>
                  {mergedGroup && mergedGroup.startSlot !== mergedGroup.endSlot 
                    ? `${mergedGroup.startSlot}\n-\n${mergedGroup.endSlot}`
                    : timeSlot
                  }
                </div>
                
                <div style={{ flex: 1, marginLeft: '1rem' }}>
                  {mergedGroup ? (
                    <div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        color: mergedGroup.installation.isCompleted ? '#1565c0' : '#f57c00',
                        marginBottom: '0.25rem'
                      }}>
                        {mergedGroup.installation.customerName}
                        {mergedGroup.installation.isCompleted && (
                          <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                            ✅ {t('admin.installations.completedLabel')}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                        📞 {mergedGroup.installation.customerPhone}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                        📍 {mergedGroup.installation.customerTown || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#888' }}>
                        #{mergedGroup.installation.orderId} • {mergedGroup.installation.mainProductBrand} {mergedGroup.installation.mainProductModel}
                        {mergedGroup.installation.totalProducts > 1 && (
                          <span> +{mergedGroup.installation.totalProducts - 1} {t('others')}</span>
                        )}
                      </div>
                      {/* Show time range for merged installations */}
                      {mergedGroup.startSlot !== mergedGroup.endSlot && (
                        <div style={{ 
                          color: '#007bff', 
                          fontSize: '0.8rem', 
                          marginTop: '0.5rem',
                          fontWeight: 'bold',
                          backgroundColor: 'rgba(0,123,255,0.1)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {mergedGroup.startSlot} - {mergedGroup.endSlot}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#999', fontStyle: 'italic' }}>
                      {isSlotPast ? t('admin.installations.pastSlot') : t('admin.installations.available')}
                    </div>
                  )}
                </div>
                
                {mergedGroup && (
                  <div style={{ fontSize: '1.5rem' }}>
                    ▶
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>{t('admin.installations.title')}</h2>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
          }}>
            <button
              onClick={() => navigateWeek(-1)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                minWidth: '120px',
                fontSize: '0.9rem'
              }}
            >
              {t('admin.installations.previousWeek')}
            </button>
            <span style={{ 
              fontWeight: 'bold', 
              textAlign: 'center',
              minWidth: '120px',
              fontSize: '0.9rem'
            }}>
              {weekRange}
            </span>
            <button
              onClick={() => navigateWeek(1)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                minWidth: '120px',
                fontSize: '0.9rem'
              }}
            >
              {t('admin.installations.nextWeek')}
            </button>
          </div>
        </div>

        <p>{t('admin.installations.totalCount')} <strong>{installations.length}</strong></p>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee', borderRadius: '4px' }}>
                          {t('error')} {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {t('admin.installations.loading')}
        </div>
      ) : (
        <>
          {/* Mobile Day View */}
          {isMobile ? (
            renderMobileDayView()
          ) : (
            /* Desktop Week Table */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '0.75rem', border: '1px solid #ddd', minWidth: '80px' }}>{t('admin.installations.timeSlot')}</th>
                    {weekDates.map((date, index) => (
                      <th key={index} style={{ padding: '0.75rem', border: '1px solid #ddd', minWidth: '120px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{getWeekdayName(index, t)}</div>
                          <div style={{ fontSize: '0.9em', color: '#666' }}>
                            {date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((timeSlot, timeIndex) => {
                    // Get merged installations for all days
                    const mergedInstallations = weekDates.map(date => getMergedInstallationsForDate(date, installations));
                    
                    return (
                      <tr key={timeSlot}>
                        <td style={{ 
                          padding: '0.75rem', 
                          border: '1px solid #ddd', 
                          fontWeight: 'bold', 
                          backgroundColor: '#f9f9f9',
                          textAlign: 'center'
                        }}>
                          {timeSlot}
                        </td>
                        {weekDates.map((date, dayIndex) => {
                          const mergedGroup = getInstallationForSlotInMerged(date, timeSlot, mergedInstallations[dayIndex]);
                          const isToday = formatDate(date) === formatDate(new Date());
                          const isPast = date < new Date() && !isToday;
                          
                          // Skip rendering if this slot is part of a merged installation that starts later
                          if (mergedGroup && mergedGroup.startIndex > timeIndex) {
                            return null;
                          }

                          return (
                            <td
                              key={dayIndex}
                              style={{
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                backgroundColor: mergedGroup 
                                  ? (mergedGroup.installation.isCompleted ? '#e3f2fd' : '#e8f5e8') 
                                  : (isPast ? '#f5f5f5' : 'white'),
                                cursor: mergedGroup ? 'pointer' : 'default',
                                verticalAlign: 'top',
                                minHeight: '60px',
                                position: 'relative',
                                ...(mergedGroup && mergedGroup.rowSpan > 1 && {
                                  rowSpan: mergedGroup.rowSpan
                                })
                              }}
                              onClick={() => mergedGroup && showInstallationDetails(mergedGroup.installation)}
                            >
                              {mergedGroup ? (
                                <div style={{ fontSize: '0.85em', position: 'relative' }}>
                                  {mergedGroup.installation.isCompleted && (
                                    <div style={{ 
                                      position: 'absolute', 
                                      top: '-2px', 
                                      right: '-2px', 
                                      backgroundColor: '#17a2b8',
                                      color: 'white',
                                      borderRadius: '50%',
                                      width: '18px',
                                      height: '18px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '10px',
                                      fontWeight: 'bold'
                                    }}>
                                      ✓
                                    </div>
                                  )}
                                  <div style={{ 
                                    fontWeight: 'bold', 
                                    color: mergedGroup.installation.isCompleted ? '#1565c0' : '#2d5a27' 
                                  }}>
                                    {mergedGroup.installation.customerName}
                                    {mergedGroup.installation.isCompleted && (
                                      <span style={{ fontSize: '0.75em', marginLeft: '4px', color: '#17a2b8' }}>
                                        {t('admin.installations.completedLabel')}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ color: '#666', marginTop: '2px', fontSize: '0.8em' }}>
                                    📞 {mergedGroup.installation.customerPhone}
                                  </div>
                                  <div style={{ color: '#666', marginTop: '2px', fontSize: '0.8em' }}>
                                    📍 {mergedGroup.installation.customerTown || 'N/A'}
                                  </div>
                                  <div style={{ color: '#666', marginTop: '2px' }}>
                                    #{mergedGroup.installation.orderId}
                                  </div>
                                  <div style={{ color: '#666', fontSize: '0.8em', marginTop: '2px' }}>
                                    {mergedGroup.installation.mainProductBrand} {mergedGroup.installation.mainProductModel}
                                  </div>
                                  {mergedGroup.installation.totalProducts > 1 && (
                                    <div style={{ color: '#888', fontSize: '0.75em' }}>
                                      +{mergedGroup.installation.totalProducts - 1} {t('others')}
                                    </div>
                                  )}
                                  {/* Show time range for merged installations */}
                                  {mergedGroup.startSlot !== mergedGroup.endSlot && (
                                    <div style={{ 
                                      color: '#007bff', 
                                      fontSize: '0.75em', 
                                      marginTop: '4px',
                                      fontWeight: 'bold',
                                      backgroundColor: 'rgba(0,123,255,0.1)',
                                      padding: '2px 6px',
                                      borderRadius: '3px',
                                      display: 'inline-block'
                                    }}>
                                      {mergedGroup.startSlot} - {mergedGroup.endSlot}
                                    </div>
                                  )}
                                </div>
                              ) : null}
                              {isToday && !mergedGroup && (
                                <div style={{ 
                                  position: 'absolute', 
                                  top: '2px', 
                                  right: '2px', 
                                  width: '8px', 
                                  height: '8px', 
                                  backgroundColor: '#007bff', 
                                  borderRadius: '50%' 
                                }}></div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Installation Details Modal */}
      {showDetailsModal && selectedInstallation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{t('admin.installations.details.title')}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <strong>{t('admin.installations.details.dateTime')}:</strong> {selectedInstallation.scheduledDate} {t('admin.installations.details.at')} {selectedInstallation.timeSlot}
                {selectedInstallation.endDate && selectedInstallation.endTimeSlot && (
                  <span> - {selectedInstallation.endDate} {t('admin.installations.details.at')} {selectedInstallation.endTimeSlot}</span>
                )}
              </div>
              
              <div>
                <strong>{t('admin.installations.details.customer')}:</strong> {selectedInstallation.customerName}
              </div>
              
              <div>
                <strong>{t('admin.installations.details.phone')}:</strong> {selectedInstallation.customerPhone}
              </div>
              
              <div>
                <strong>{t('admin.installations.details.town')}:</strong> {selectedInstallation.customerTown || 'N/A'}
              </div>
              
              <div>
                <strong>{t('admin.installations.details.orderId')}:</strong> {selectedInstallation.orderId}
              </div>
              
              <div>
                <strong>{t('admin.installations.details.status')}:</strong> 
                <span style={{ 
                  marginLeft: '8px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.85em',
                  backgroundColor: selectedInstallation.isCompleted ? '#d4edda' : '#fff3cd',
                  color: selectedInstallation.isCompleted ? '#155724' : '#856404'
                }}>
                  {selectedInstallation.isCompleted ? t('admin.installations.statusLabels.completed') : t('admin.installations.statusLabels.scheduled')}
                </span>
              </div>
              
              <div>
                <strong>{t('admin.installations.details.products')}:</strong>
                <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  {selectedInstallation.productsSummary}
                </div>
              </div>
              
              <div>
                <strong>{t('admin.installations.details.totalProducts')}:</strong> {selectedInstallation.totalProducts}
              </div>

              {selectedInstallation.notes && (
                <div>
                  <strong>{t('admin.installations.details.notes')}:</strong>
                  <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                    {selectedInstallation.notes}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {!selectedInstallation.isCompleted ? (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', width: '100%' }}>
                  <button
                    onClick={handleMarkAsInstalled}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      flex: 1,
                      maxWidth: '200px'
                    }}
                  >
                    {locale === 'bg' ? '✅ Маркирай като инсталиран' : '✅ Mark as Completed'}
                  </button>
                  <button
                    onClick={startReschedule}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      flex: 1,
                      maxWidth: '200px'
                    }}
                  >
                    {locale === 'bg' ? '📅 Премести' : '📅 Reschedule'}
                  </button>
                  <button
                    onClick={startDelete}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      flex: 1,
                      maxWidth: '200px'
                    }}
                  >
                    {locale === 'bg' ? '🗑️ Изтрий' : '🗑️ Delete'}
                  </button>
                </div>
              ) : (
                <div style={{ 
                  padding: '1rem 2rem',
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  borderRadius: '6px',
                  border: '1px solid #c3e6cb',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  {locale === 'bg' ? 'Монтажът е завършен' : 'Installation Completed'}
                </div>
              )}
                          </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedInstallation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{t('admin.installations.reschedule.title')}</h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>{t('admin.installations.reschedule.currentTime')}:</strong> {selectedInstallation.scheduledDate} {t('admin.installations.details.at')} {selectedInstallation.timeSlot}
              {selectedInstallation.endTimeSlot && selectedInstallation.endTimeSlot !== selectedInstallation.timeSlot && (
                <span> - {selectedInstallation.endTimeSlot}</span>
              )}
              <br/>
              <strong>{t('admin.installations.reschedule.customer')}:</strong> {selectedInstallation.customerName}<br/>
              <strong>{t('admin.installations.reschedule.order')}:</strong> #{selectedInstallation.orderId}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>{t('admin.installations.reschedule.chooseNewTime')}:</strong>
              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                {locale === 'bg' ? 'Кликнете върху час, за да започне монтажът от там. Системата ще запази същата продължителност.' : 'Click on a time to start the installation from there. The system will maintain the same duration.'}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gap: '1rem',
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              padding: '1rem',
              borderRadius: '4px'
            }}>
              {Object.keys(availableSlots).map(date => (
                <div key={date} style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                    {new Date(date).toLocaleDateString('bg-BG', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                    {TIME_SLOTS.map(timeSlot => {
                      const slot = availableSlots[date][timeSlot];
                      const isCurrentSlot = date === selectedInstallation.scheduledDate && timeSlot === selectedInstallation.timeSlot;
                      
                      // Check if this would be a conflict for the installation duration
                      const installationDuration = getInstallationDuration(selectedInstallation);
                      const wouldConflict = checkTimeRangeConflict(date, timeSlot, installationDuration);
                      
                      let backgroundColor = '#f8f9fa';
                      let cursor = 'not-allowed';
                      let color = '#6c757d';
                      let borderColor = '#dee2e6';
                      
                      if (isCurrentSlot) {
                        backgroundColor = '#ffc107';
                        color = '#212529';
                        borderColor = '#ffc107';
                      } else if (wouldConflict) {
                        backgroundColor = '#dc3545';
                        color = 'white';
                        borderColor = '#dc3545';
                      } else if (slot?.available) {
                        backgroundColor = '#d4edda';
                        cursor = 'pointer';
                        color = '#155724';
                        borderColor = '#c3e6cb';
                      } else if (slot?.booked) {
                        backgroundColor = '#f8d7da';
                        color = '#721c24';
                        borderColor = '#f5c6cb';
                      }
                      
                      // Calculate the proposed end time for display
                      const startIndex = TIME_SLOTS.indexOf(timeSlot);
                      const durationSlots = Math.ceil(installationDuration * 2);
                      const endIndex = Math.min(startIndex + durationSlots - 1, TIME_SLOTS.length - 1);
                      const proposedEndTime = TIME_SLOTS[endIndex];
                      
                      return (
                        <button
                          key={timeSlot}
                          onClick={() => (slot?.available && !wouldConflict) ? handleReschedule(date, timeSlot) : null}
                          disabled={rescheduleLoading || !slot?.available || isCurrentSlot || wouldConflict}
                          style={{
                            padding: '0.5rem',
                            border: `2px solid ${borderColor}`,
                            borderRadius: '4px',
                            backgroundColor,
                            color,
                            cursor,
                            fontSize: '0.875rem',
                            position: 'relative'
                          }}
                          title={wouldConflict ? 
                            (locale === 'bg' ? 'Конфликт с друг монтаж' : 'Conflicts with another installation') :
                            (slot?.available ? 
                              (locale === 'bg' ? `Премести на ${timeSlot}-${proposedEndTime}` : `Move to ${timeSlot}-${proposedEndTime}`) :
                              (locale === 'bg' ? 'Недостъпно' : 'Unavailable')
                            )
                          }
                        >
                          {timeSlot}
                          {isCurrentSlot && <div style={{ fontSize: '0.75rem' }}>{t('admin.installations.reschedule.currentSlot')}</div>}
                          {wouldConflict && <div style={{ fontSize: '0.75rem' }}>{locale === 'bg' ? 'Конфликт' : 'Conflict'}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {rescheduleLoading && (
              <div style={{ textAlign: 'center', margin: '1rem 0', color: '#007bff' }}>
                {t('admin.installations.reschedule.rescheduling')}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowRescheduleModal(false)}
                disabled={rescheduleLoading}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: rescheduleLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {t('admin.installations.reschedule.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && selectedInstallation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#dc3545' }}>
              ⚠️ {locale === 'bg' ? 'Потвърждение за изтриване' : 'Delete Confirmation'}
            </h3>
            
            <p style={{ marginBottom: '1.5rem' }}>
              {locale === 'bg' ? 'Изберете как да продължите с този монтаж:' : 'Choose how to proceed with this installation:'}
            </p>
            
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '1rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              borderLeft: '4px solid #dc3545'
            }}>
              <strong>{locale === 'bg' ? 'Дата' : 'Date'}:</strong> {selectedInstallation.scheduledDate} {locale === 'bg' ? 'в' : 'at'} {selectedInstallation.timeSlot}<br/>
              <strong>{locale === 'bg' ? 'Клиент' : 'Customer'}:</strong> {selectedInstallation.customerName}<br/>
              <strong>{locale === 'bg' ? 'Поръчка' : 'Order'}:</strong> #{selectedInstallation.orderId}
            </div>

            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '0.75rem', 
              backgroundColor: '#fff3cd', 
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              💡 <strong>{locale === 'bg' ? 'Забележка' : 'Note'}:</strong> {locale === 'bg' ? 'Поръчката ще се върне в статус "потвърдена" и може да бъде преназначена отново.' : 'The order will be returned to "confirmed" status and can be rescheduled again.'}
            </div>

            {deleteLoading && (
              <div style={{ textAlign: 'center', margin: '1rem 0', color: '#dc3545' }}>
                {locale === 'bg' ? 'Обработване...' : 'Processing...'}
              </div>
            )}

            {/* Delete Options */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {/* Option 1: Delete from Database */}
                <button
                  onClick={() => setDeleteOption('delete')}
                  disabled={deleteLoading}
                  style={{
                    padding: '1rem',
                    border: '2px solid',
                    borderColor: deleteOption === 'delete' ? '#dc3545' : '#dee2e6',
                    borderRadius: '8px',
                    backgroundColor: deleteOption === 'delete' ? '#fff5f5' : 'white',
                    cursor: deleteLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {locale === 'bg' ? '🗑️ Изтрий от базата данни' : '🗑️ Delete from Database'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {locale === 'bg' ? 'Напълно изтриване на монтажа от базата данни' : 'Completely delete the installation from database'}
                  </div>
                </button>

                {/* Option 2: Return to Orders */}
                <button
                  onClick={() => setDeleteOption('return')}
                  disabled={deleteLoading}
                  style={{
                    padding: '1rem',
                    border: '2px solid',
                    borderColor: deleteOption === 'return' ? '#007bff' : '#dee2e6',
                    borderRadius: '8px',
                    backgroundColor: deleteOption === 'return' ? '#f0f8ff' : 'white',
                    cursor: deleteLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {locale === 'bg' ? '📋 Върни към поръчките' : '📋 Return to Orders'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {locale === 'bg' ? 'Връщане към управлението на поръчки със статус "Върнат от календара"' : 'Return to order management with status "Returned from calendar"'}
                  </div>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setDeleteOption(null);
                }}
                disabled={deleteLoading}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  flex: 1
                }}
              >
                {locale === 'bg' ? 'Отказ' : 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading || !deleteOption}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: deleteOption ? '#dc3545' : '#6c757d',
                  color: 'white',
                  cursor: (deleteLoading || !deleteOption) ? 'not-allowed' : 'pointer',
                  flex: 1
                }}
              >
                {deleteOption === 'delete' ? '🗑️ ' + (locale === 'bg' ? 'Изтрий от базата данни' : 'Delete from Database') :
                 deleteOption === 'return' ? '📋 ' + (locale === 'bg' ? 'Върни към поръчките' : 'Return to Orders') :
                 (locale === 'bg' ? 'Потвърди' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1002,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
} 