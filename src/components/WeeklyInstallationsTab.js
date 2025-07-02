import React, { useEffect, useState, useContext } from 'react';
import { LanguageContext } from './Layout Components/Header';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const WEEKDAYS = ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя'];
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

export default function WeeklyInstallationsTab() {
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

  useEffect(() => {
    fetchInstallations();
    // eslint-disable-next-line
  }, [currentWeek]);

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
        showToast('Грешка при зареждане на свободните часове');
      }
    } catch (err) {
      showToast('Грешка при зареждане на свободните часове');
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
          order_id: selectedInstallation.orderId,
          new_date: newDate,
          new_time: newTime,
          admin_id: ADMIN_ID,
          reason: 'Преназначен от администратор'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowRescheduleModal(false);
        setSelectedInstallation(null);
        showToast(`Монтажът беше успешно преназначен за ${newDate} в ${newTime}`);
        fetchInstallations(); // Refresh the calendar
      } else {
        showToast(`Грешка: ${data.message || 'Неуспешно преназначаване'}`);
      }
    } catch (err) {
      showToast('Грешка при преназначаване на монтажа');
    } finally {
      setRescheduleLoading(false);
    }
  }

  function startDelete() {
    setShowDetailsModal(false);
    setShowDeleteConfirmation(true);
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
          order_id: selectedInstallation.orderId,
          admin_id: ADMIN_ID,
          reason: 'Отменен от администратор'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowDeleteConfirmation(false);
        setSelectedInstallation(null);
        showToast('Монтажът беше успешно отменен');
        fetchInstallations(); // Refresh the calendar
      } else {
        showToast(`Грешка: ${data.message || 'Неуспешно отменяне'}`);
      }
    } catch (err) {
      showToast('Грешка при отменяне на монтажа');
    } finally {
      setDeleteLoading(false);
    }
  }

  const weekDates = getWeekDates(currentWeek);
  const weekRange = `${weekDates[0].toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })} - ${weekDates[6].toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Монтажи за седмицата</h2>
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
              ← Предишна седмица
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
              Следваща седмица →
            </button>
          </div>
        </div>

        <p>Общо монтажи за седмицата: <strong>{installations.length}</strong></p>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee', borderRadius: '4px' }}>
          Грешка: {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Зареждане на монтажи...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', minWidth: '80px' }}>Час</th>
                {weekDates.map((date, index) => (
                  <th key={index} style={{ padding: '0.75rem', border: '1px solid #ddd', minWidth: '120px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{WEEKDAYS[index]}</div>
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
                          backgroundColor: installation ? '#e8f5e8' : (isPast ? '#f5f5f5' : 'white'),
                          cursor: installation ? 'pointer' : 'default',
                          verticalAlign: 'top',
                          minHeight: '60px',
                          position: 'relative'
                        }}
                        onClick={() => installation && showInstallationDetails(installation)}
                      >
                        {installation ? (
                          <div style={{ fontSize: '0.85em' }}>
                            <div style={{ fontWeight: 'bold', color: '#2d5a27' }}>
                              {installation.customerName}
                            </div>
                            <div style={{ color: '#666', marginTop: '2px' }}>
                              #{installation.orderId}
                            </div>
                            <div style={{ color: '#666', fontSize: '0.8em', marginTop: '2px' }}>
                              {installation.mainProductBrand} {installation.mainProductModel}
                            </div>
                            {installation.totalProducts > 1 && (
                              <div style={{ color: '#888', fontSize: '0.75em' }}>
                                +{installation.totalProducts - 1} други
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
              <h3>Детайли за монтаж</h3>
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
                <strong>Дата и час:</strong> {selectedInstallation.scheduledDate} в {selectedInstallation.timeSlot}
              </div>
              
              <div>
                <strong>Клиент:</strong> {selectedInstallation.customerName}
              </div>
              
              <div>
                <strong>Телефон:</strong> {selectedInstallation.customerPhone}
              </div>
              
              <div>
                <strong>Поръчка №:</strong> {selectedInstallation.orderId}
              </div>
              
              <div>
                <strong>Продукти:</strong>
                <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  {selectedInstallation.productsSummary}
                </div>
              </div>
              
              <div>
                <strong>Общо продукти:</strong> {selectedInstallation.totalProducts}
              </div>

              {selectedInstallation.notes && (
                <div>
                  <strong>Бележки:</strong>
                  <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                    {selectedInstallation.notes}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
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
                  📅 Преназначи
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
                  🗑️ Отмени
                </button>
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
                Затвори
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
              <h3>Преназначаване на монтаж</h3>
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
              <strong>Текущ час:</strong> {selectedInstallation.scheduledDate} в {selectedInstallation.timeSlot}<br/>
              <strong>Клиент:</strong> {selectedInstallation.customerName}<br/>
              <strong>Поръчка:</strong> #{selectedInstallation.orderId}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Изберете нов час:</strong>
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
                          {isCurrentSlot && <div style={{ fontSize: '0.75rem' }}>Текущ</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {rescheduleLoading && (
              <div style={{ textAlign: 'center', margin: '1rem 0', color: '#007bff' }}>
                Преназначаване...
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
                Отказ
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
              ⚠️ Потвърждение за отмяна
            </h3>
            
            <p style={{ marginBottom: '1.5rem' }}>
              Сигурни ли сте, че искате да отмените този монтаж?
            </p>
            
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '1rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              borderLeft: '4px solid #dc3545'
            }}>
              <strong>Дата:</strong> {selectedInstallation.scheduledDate} в {selectedInstallation.timeSlot}<br/>
              <strong>Клиент:</strong> {selectedInstallation.customerName}<br/>
              <strong>Поръчка:</strong> #{selectedInstallation.orderId}
            </div>

            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '0.75rem', 
              backgroundColor: '#fff3cd', 
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              💡 <strong>Забележка:</strong> Поръчката ще се върне в статус "потвърдена" и може да бъде преназначена отново.
            </div>

            {deleteLoading && (
              <div style={{ textAlign: 'center', margin: '1rem 0', color: '#dc3545' }}>
                Отменяне...
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
                Отказ
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
                🗑️ Отмени монтажа
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