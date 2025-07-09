import React, { useEffect, useState, useContext } from 'react';
import { LanguageContext } from './Layout Components/Header';

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
  return t(`common.weekdays.${weekdays[index]}`);
}

export default function WeeklyInstallationsTab({ onInstallationCancelled, onInstallationRescheduled, onInstallationCompleted }) {
  const { t } = useContext(LanguageContext);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInstallation, setSelectedInstallation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
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

      // Use current window location to build the correct URL
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/get-weekly-installations?startDate=${startDate}&endDate=${endDate}`;
      console.log('🔗 Calling API:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📊 Response data:', data);

      if (response.ok) {
        setInstallations(data.installations || []);
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
    return installations.find(inst => 
      inst.scheduledDate === dateStr && inst.timeSlot === timeSlot
    );
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
      
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/get-available-slots?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      
      if (response.ok) {
        setAvailableSlots(data.availableSlots || {});
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
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/reschedule-installation`, {
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
        showToast(t('admin.installations.messages.rescheduleSuccess', { date: newDate, time: newTime }));
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
      
      console.log('🎯 Marking installation as completed with data:', installationData);
      
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/update-order-status`, {
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

  async function handleDelete() {
    if (!selectedInstallation) return;
    
    setDeleteLoading(true);
    
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/cancel-installation`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          installation_id: selectedInstallation.id,
          order_id: selectedInstallation.orderId, // Keep as fallback
          admin_id: ADMIN_ID,
          reason: t('admin.installations.messages.cancelReason')
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowDeleteConfirmation(false);
        setSelectedInstallation(null);
        showToast(t('admin.installations.messages.cancelSuccess'));
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
                {isToday && <span style={{ color: '#007bff', marginLeft: '0.5rem' }}>({t('common.today')})</span>}
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
          {TIME_SLOTS.map(timeSlot => {
            const installation = getInstallationForSlot(currentDate, timeSlot);
            const isSlotPast = isPast || (isToday && new Date().getHours() * 60 + new Date().getMinutes() > 
              parseInt(timeSlot.split(':')[0]) * 60 + parseInt(timeSlot.split(':')[1]));

            return (
              <div
                key={timeSlot}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: installation 
                    ? (installation.isCompleted ? '#e8f5e9' : '#fff3e0') 
                    : (isSlotPast ? '#f5f5f5' : 'white'),
                  cursor: installation ? 'pointer' : 'default',
                  minHeight: '70px'
                }}
                onClick={() => installation && showInstallationDetails(installation)}
              >
                <div style={{ 
                  minWidth: '60px', 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem',
                  color: installation ? '#333' : '#999'
                }}>
                  {timeSlot}
                </div>
                
                <div style={{ flex: 1, marginLeft: '1rem' }}>
                  {installation ? (
                    <div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        color: installation.isCompleted ? '#2e7d32' : '#f57c00',
                        marginBottom: '0.25rem'
                      }}>
                        {installation.customerName}
                        {installation.isCompleted && (
                          <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                            ✅ {t('admin.installations.completedLabel')}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                        📞 {installation.customerPhone}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                        📍 {installation.customerTown || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#888' }}>
                        #{installation.orderId} • {installation.mainProductBrand} {installation.mainProductModel}
                        {installation.totalProducts > 1 && (
                          <span> +{installation.totalProducts - 1} {t('common.others')}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#999', fontStyle: 'italic' }}>
                      {isSlotPast ? t('admin.installations.pastSlot') : t('admin.installations.available')}
                    </div>
                  )}
                </div>
                
                {installation && (
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>{t('admin.installations.title')}</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => navigateWeek(-1)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              {t('admin.installations.previousWeek')}
            </button>
            <span style={{ fontWeight: 'bold' }}>{weekRange}</span>
            <button
              onClick={() => navigateWeek(1)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer'
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
          {t('common.error')} {error}
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
                  {TIME_SLOTS.map(timeSlot => (
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
                        const installation = getInstallationForSlot(date, timeSlot);
                        const isToday = formatDate(date) === formatDate(new Date());
                        const isPast = date < new Date() && !isToday;

                        return (
                          <td
                            key={dayIndex}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #ddd',
                              backgroundColor: installation 
                                ? (installation.isCompleted ? '#d1ecf1' : '#e8f5e8') 
                                : (isPast ? '#f5f5f5' : 'white'),
                              cursor: installation ? 'pointer' : 'default',
                              verticalAlign: 'top',
                              minHeight: '60px',
                              position: 'relative'
                            }}
                            onClick={() => installation && showInstallationDetails(installation)}
                          >
                            {installation ? (
                              <div style={{ fontSize: '0.85em', position: 'relative' }}>
                                {installation.isCompleted && (
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
                                  color: installation.isCompleted ? '#0c5460' : '#2d5a27' 
                                }}>
                                  {installation.customerName}
                                  {installation.isCompleted && (
                                    <span style={{ fontSize: '0.75em', marginLeft: '4px', color: '#17a2b8' }}>
                                      {t('admin.installations.completedLabel')}
                                    </span>
                                  )}
                                </div>
                                <div style={{ color: '#666', marginTop: '2px', fontSize: '0.8em' }}>
                                  📞 {installation.customerPhone}
                                </div>
                                <div style={{ color: '#666', marginTop: '2px', fontSize: '0.8em' }}>
                                  📍 {installation.customerTown || 'N/A'}
                                </div>
                                <div style={{ color: '#666', marginTop: '2px' }}>
                                  #{installation.orderId}
                                </div>
                                <div style={{ color: '#666', fontSize: '0.8em', marginTop: '2px' }}>
                                  {installation.mainProductBrand} {installation.mainProductModel}
                                </div>
                                {installation.totalProducts > 1 && (
                                  <div style={{ color: '#888', fontSize: '0.75em' }}>
                                    +{installation.totalProducts - 1} {t('common.others')}
                                  </div>
                                )}
                              </div>
                            ) : null}
                            {isToday && !installation && (
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
                  ))}
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

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {!selectedInstallation.isCompleted && (
                  <>
                    <button
                      onClick={handleMarkAsInstalled}
                      style={{
                        padding: '0.5rem 1.5rem',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      ✅ {t('admin.installations.actions.markAsCompleted')}
                    </button>
                    <button
                      onClick={startReschedule}
                      style={{
                        padding: '0.5rem 1.5rem',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      📅 {t('admin.installations.actions.reschedule')}
                    </button>
                    <button
                      onClick={startDelete}
                      style={{
                        padding: '0.5rem 1.5rem',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      ��️ {t('admin.installations.actions.cancel')}
                    </button>
                  </>
                )}
                {selectedInstallation.isCompleted && (
                  <div style={{ 
                    padding: '0.5rem 1.5rem',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    borderRadius: '4px',
                    border: '1px solid #c3e6cb'
                  }}>
                    ✅ {t('admin.installations.actions.completed')}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {t('admin.installations.actions.close')}
              </button>
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
              <strong>{t('admin.installations.reschedule.currentTime')}:</strong> {selectedInstallation.scheduledDate} {t('admin.installations.details.at')} {selectedInstallation.timeSlot}<br/>
              <strong>{t('admin.installations.reschedule.customer')}:</strong> {selectedInstallation.customerName}<br/>
              <strong>{t('admin.installations.reschedule.order')}:</strong> #{selectedInstallation.orderId}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>{t('admin.installations.reschedule.chooseNewTime')}:</strong>
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
                      
                      let backgroundColor = '#f8f9fa';
                      let cursor = 'not-allowed';
                      let color = '#6c757d';
                      
                      if (isCurrentSlot) {
                        backgroundColor = '#ffc107';
                        color = '#212529';
                      } else if (slot?.available) {
                        backgroundColor = '#d4edda';
                        cursor = 'pointer';
                        color = '#155724';
                      } else if (slot?.booked) {
                        backgroundColor = '#f8d7da';
                        color = '#721c24';
                      }
                      
                      return (
                        <button
                          key={timeSlot}
                          onClick={() => slot?.available ? handleReschedule(date, timeSlot) : null}
                          disabled={rescheduleLoading || !slot?.available || isCurrentSlot}
                          style={{
                            padding: '0.5rem',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            backgroundColor,
                            color,
                            cursor,
                            fontSize: '0.875rem'
                          }}
                        >
                          {timeSlot}
                          {isCurrentSlot && <div style={{ fontSize: '0.75rem' }}>{t('admin.installations.reschedule.currentSlot')}</div>}
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
              ⚠️ {t('admin.installations.confirmCancel.title')}
            </h3>
            
            <p style={{ marginBottom: '1.5rem' }}>
              {t('admin.installations.confirmCancel.message')}
            </p>
            
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '1rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              borderLeft: '4px solid #dc3545'
            }}>
              <strong>{t('admin.installations.confirmCancel.details.date')}:</strong> {selectedInstallation.scheduledDate} {t('admin.installations.details.at')} {selectedInstallation.timeSlot}<br/>
              <strong>{t('admin.installations.confirmCancel.details.customer')}:</strong> {selectedInstallation.customerName}<br/>
              <strong>{t('admin.installations.confirmCancel.details.order')}:</strong> #{selectedInstallation.orderId}
            </div>

            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '0.75rem', 
              backgroundColor: '#fff3cd', 
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              💡 <strong>{t('admin.installations.confirmCancel.note')}:</strong> {t('admin.installations.confirmCancel.noteMessage')}
            </div>

            {deleteLoading && (
              <div style={{ textAlign: 'center', margin: '1rem 0', color: '#dc3545' }}>
                {t('admin.installations.confirmCancel.cancelling')}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
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
                {t('admin.installations.confirmCancel.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  flex: 1
                }}
              >
                🗑️ {t('admin.installations.confirmCancel.confirm')}
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