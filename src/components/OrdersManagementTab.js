import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Page Styles/Administration.module.css';
import { translateServerMessage } from '../lib/messageTranslator';

const PAGE_SIZE = 10;

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('bg-BG', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusColor(status) {
  const statusColors = {
    'new': '#ff9800',
    'confirmed': '#2196f3',
    'installation_booked': '#9c27b0',
    'installed': '#4caf50',
    'cancelled': '#f44336',
    'returned_from_calendar': '#ff6b35'
  };
  return statusColors[status] || '#666';
}

function getStatusLabel(status, t) {
  const statusLabels = {
    'new': t('admin.orders.status.new'),
    'confirmed': t('admin.orders.status.confirmed'),
    'installation_booked': t('admin.orders.status.installation_booked'),
    'installed': t('admin.orders.status.installed'),
    'cancelled': t('admin.orders.status.cancelled'),
    'returned_from_calendar': t('admin.orders.status.returned_from_calendar')
  };
  return statusLabels[status] || status;
}

function getPaymentMethodLabel(method) {
  const paymentLabels = {
    'cash': 'наложен платеж',
    'office': 'в офис',
    'online': 'с карта'
  };
  return paymentLabels[method] || method || 'Not specified';
}

export default function OrdersManagementTab() {
  const { t } = useTranslation('common');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    newStatus: '',
    notes: '',
    startInstallationDate: '',
    startInstallationHour: '08',
    startInstallationMinute: '00',
    endInstallationDate: '',
    endInstallationHour: '17',
    endInstallationMinute: '00'
  });

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter]);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/get-orders');
      const data = await response.json();
      
      if (response.ok) {
        let filteredOrders = data.orders || [];
        
        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          filteredOrders = filteredOrders.filter(order => 
            order.first_name?.toLowerCase().includes(searchLower) ||
            order.last_name?.toLowerCase().includes(searchLower) ||
            order.phone?.includes(search) ||
            order.order_id?.toString().includes(search)
          );
        }
        
        // Apply status filter
        if (statusFilter) {
          filteredOrders = filteredOrders.filter(order => 
            order.current_status === statusFilter
          );
        }
        
        setOrders(filteredOrders);
        setTotalCount(filteredOrders.length);
      } else {
        setError(data.error || 'Failed to load orders');
        setOrders([]);
        setTotalCount(0);
      }
    } catch (err) {
      setError('Failed to load orders');
      setOrders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (orderId) => {
    if (!statusUpdateData.newStatus) {
      alert(t('admin.orders.errors.selectStatus'));
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await fetch('/api/update-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          newStatus: statusUpdateData.newStatus,
          notes: statusUpdateData.notes,
          startInstallationDate: statusUpdateData.startInstallationDate,
          startInstallationHour: statusUpdateData.startInstallationHour,
          startInstallationMinute: statusUpdateData.startInstallationMinute,
          endInstallationDate: statusUpdateData.endInstallationDate,
          endInstallationHour: statusUpdateData.endInstallationHour,
          endInstallationMinute: statusUpdateData.endInstallationMinute,
          adminId: 'admin' // You can replace this with actual admin ID
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(t('admin.orders.statusUpdated'));
        setStatusUpdateData({ 
          newStatus: '', 
          notes: '', 
          startInstallationDate: '', 
          startInstallationHour: '08',
          startInstallationMinute: '00',
          endInstallationDate: '', 
          endInstallationHour: '17',
          endInstallationMinute: '00'
        });
        fetchOrders(); // Refresh the orders list
        setShowOrderDetails(false);
        setSelectedOrder(null);
      } else {
        alert(t('admin.orders.errors.updateFailed') + ': ' + data.error);
      }
    } catch (err) {
      alert(t('admin.orders.errors.updateFailed') + ': ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const showOrderDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
    setStatusUpdateData({ 
      newStatus: '', 
      notes: '', 
      startInstallationDate: '', 
      startInstallationHour: '08',
      startInstallationMinute: '00',
      endInstallationDate: '', 
      endInstallationHour: '17',
      endInstallationMinute: '00'
    });
  };

  // Helper function to set quick time
  const setQuickTime = (type, hour, minute) => {
    if (type === 'start') {
      setStatusUpdateData(prev => ({
        ...prev,
        startInstallationHour: hour,
        startInstallationMinute: minute
      }));
    } else {
      setStatusUpdateData(prev => ({
        ...prev,
        endInstallationHour: hour,
        endInstallationMinute: minute
      }));
    }
  };

  // Generate hour options (00-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = ['00', '15', '30', '45'];

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentOrders = orders.slice(startIndex, endIndex);

  return (
    <div className={styles.ordersManagementSection}>
      <div className={styles.ordersHeader}>
        <h2>📋 {t('admin.orders.title')}</h2>
        <p>{t('admin.orders.description')}</p>
      </div>

      {/* Filters */}
      <div className={styles.ordersFilters}>
        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder={t('admin.orders.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.statusFilter}
          >
            <option value="">{t('admin.orders.allStatuses')}</option>
            <option value="new">{t('admin.orders.status.new')}</option>
            <option value="confirmed">{t('admin.orders.status.confirmed')}</option>
            <option value="installation_booked">{t('admin.orders.status.installation_booked')}</option>
            <option value="installed">{t('admin.orders.status.installed')}</option>
            <option value="cancelled">{t('admin.orders.status.cancelled')}</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <button 
            onClick={fetchOrders}
            className={styles.refreshButton}
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : `🔄 ${t('admin.orders.refresh')}`}
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.ordersTableContainer}>
        {error && (
          <div className={styles.errorMessage}>
            ❌ {error}
          </div>
        )}
        
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>{t('admin.orders.table.orderId')}</th>
              <th>{t('admin.orders.table.customer')}</th>
              <th>{t('admin.orders.table.phone')}</th>
              <th>{t('admin.orders.table.created')}</th>
              <th>{t('admin.orders.table.paymentMethod')}</th>
              <th>{t('admin.orders.table.totalAmount')}</th>
              <th>{t('admin.orders.table.paidAmount')}</th>
              <th>{t('admin.orders.table.status')}</th>
              <th>{t('admin.orders.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className={styles.loadingCell}>
                  🔄 {t('admin.orders.loading')}
                </td>
              </tr>
            ) : currentOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.emptyCell}>
                  {search || statusFilter ? t('admin.orders.noOrdersMatchFilters') : t('admin.orders.noOrdersFound')}
                </td>
              </tr>
            ) : (
              currentOrders.map(order => (
                <tr key={order.order_id} className={styles.orderRow}>
                  <td>#{order.order_id}</td>
                  <td>{order.first_name} {order.last_name}</td>
                  <td>{order.phone}</td>
                  <td>{formatDate(order.order_created_at)}</td>
                  <td>{getPaymentMethodLabel(order.payment_method)}</td>
                  <td>{order.total_amount ? `${order.total_amount.toFixed(2)} лв.` : '-'}</td>
                  <td>{order.paid_amount ? `${order.paid_amount.toFixed(2)} лв.` : '0.00 лв.'}</td>
                  <td>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(order.current_status) }}
                    >
                      {getStatusLabel(order.current_status, t)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => showOrderDetailsModal(order)}
                      className={styles.viewButton}
                    >
                      👁️ {t('admin.orders.orderDetails')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            className={styles.paginationButton}
          >
            ‹ {t('admin.orders.history.previousPage')}
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), page + 2)
            .map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`${styles.paginationButton} ${p === page ? styles.activePage : ''}`}
                disabled={p === page}
              >
                {p}
              </button>
            ))}
          
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages}
            className={styles.paginationButton}
          >
            {t('admin.orders.history.nextPage')} ›
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{t('admin.orders.orderDetails')} - #{selectedOrder.order_id}</h3>
              <button 
                onClick={closeOrderDetails}
                className={styles.modalCloseButton}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.orderInfo}>
                <div className={styles.infoSection}>
                  <h4>📋 {t('admin.orders.customerInformation')}</h4>
                  <p><strong>{t('admin.orders.modal.name')}:</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p><strong>{t('admin.orders.modal.phone')}:</strong> {selectedOrder.phone}</p>
                  <p><strong>{t('admin.orders.modal.orderDate')}:</strong> {formatDate(selectedOrder.order_created_at)}</p>
                </div>
                
                <div className={styles.infoSection}>
                  <h4>💳 {t('admin.orders.paymentInformation')}</h4>
                  <p><strong>{t('admin.orders.modal.paymentMethod')}:</strong> {getPaymentMethodLabel(selectedOrder.payment_method)}</p>
                  <p><strong>{t('admin.orders.modal.totalAmount')}:</strong> {selectedOrder.total_amount ? `${selectedOrder.total_amount.toFixed(2)} лв.` : '-'}</p>
                  <p><strong>{t('admin.orders.modal.paidAmount')}:</strong> {selectedOrder.paid_amount ? `${selectedOrder.paid_amount.toFixed(2)} лв.` : '0.00 лв.'}</p>
                  <p><strong>{t('admin.orders.modal.currentStatus')}:</strong> 
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(selectedOrder.current_status) }}
                    >
                      {getStatusLabel(selectedOrder.current_status, t)}
                    </span>
                  </p>
                </div>
              </div>

              <div className={styles.statusUpdateSection}>
                <h4>🔄 {t('admin.orders.updateOrderStatus')}</h4>
                <div className={styles.statusUpdateForm}>
                  <div className={styles.formGroup}>
                    <label>{t('admin.orders.newStatus')}:</label>
                    <select
                      value={statusUpdateData.newStatus}
                      onChange={(e) => setStatusUpdateData(prev => ({ ...prev, newStatus: e.target.value }))}
                      className={styles.statusSelect}
                    >
                      <option value="">{t('admin.orders.selectNewStatus')}</option>
                      <option value="new">{t('admin.orders.status.new')}</option>
                      <option value="confirmed">{t('admin.orders.status.confirmed')}</option>
                      <option value="installation_booked">{t('admin.orders.status.installation_booked')}</option>
                      <option value="installed">{t('admin.orders.status.installed')}</option>
                      <option value="cancelled">{t('admin.orders.status.cancelled')}</option>
                    </select>
                  </div>
                  
                  {statusUpdateData.newStatus === 'installation_booked' && (
                    <>
                      <div className={styles.formGroup}>
                        <label>{t('admin.orders.startInstallationDate')}:</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="date"
                            value={statusUpdateData.startInstallationDate}
                            onChange={(e) => setStatusUpdateData(prev => ({ ...prev, startInstallationDate: e.target.value }))}
                            className={styles.dateInput}
                            required
                            style={{ flex: '1', minWidth: '150px' }}
                          />
                          <select
                            value={statusUpdateData.startInstallationHour}
                            onChange={(e) => setStatusUpdateData(prev => ({ ...prev, startInstallationHour: e.target.value }))}
                            className={styles.timeSelect}
                            style={{ width: '80px' }}
                          >
                            {hourOptions.map(hour => (
                              <option key={hour} value={hour}>{hour}</option>
                            ))}
                          </select>
                          <span>:</span>
                          <select
                            value={statusUpdateData.startInstallationMinute}
                            onChange={(e) => setStatusUpdateData(prev => ({ ...prev, startInstallationMinute: e.target.value }))}
                            className={styles.timeSelect}
                            style={{ width: '80px' }}
                          >
                            {minuteOptions.map(minute => (
                              <option key={minute} value={minute}>{minute}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Quick time buttons for start */}
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setQuickTime('start', '08', '00')}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              backgroundColor: statusUpdateData.startInstallationHour === '08' && statusUpdateData.startInstallationMinute === '00' ? '#007bff' : '#fff',
                              color: statusUpdateData.startInstallationHour === '08' && statusUpdateData.startInstallationMinute === '00' ? '#fff' : '#333',
                              cursor: 'pointer'
                            }}
                          >
                            08:00
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickTime('start', '09', '00')}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              backgroundColor: statusUpdateData.startInstallationHour === '09' && statusUpdateData.startInstallationMinute === '00' ? '#007bff' : '#fff',
                              color: statusUpdateData.startInstallationHour === '09' && statusUpdateData.startInstallationMinute === '00' ? '#fff' : '#333',
                              cursor: 'pointer'
                            }}
                          >
                            09:00
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickTime('start', '14', '00')}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              backgroundColor: statusUpdateData.startInstallationHour === '14' && statusUpdateData.startInstallationMinute === '00' ? '#007bff' : '#fff',
                              color: statusUpdateData.startInstallationHour === '14' && statusUpdateData.startInstallationMinute === '00' ? '#fff' : '#333',
                              cursor: 'pointer'
                            }}
                          >
                            14:00
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickTime('start', '15', '00')}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              backgroundColor: statusUpdateData.startInstallationHour === '15' && statusUpdateData.startInstallationMinute === '00' ? '#007bff' : '#fff',
                              color: statusUpdateData.startInstallationHour === '15' && statusUpdateData.startInstallationMinute === '00' ? '#fff' : '#333',
                              cursor: 'pointer'
                            }}
                          >
                            15:00
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>{t('admin.orders.endInstallationDate')}:</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="date"
                            value={statusUpdateData.endInstallationDate}
                            onChange={(e) => setStatusUpdateData(prev => ({ ...prev, endInstallationDate: e.target.value }))}
                            className={styles.dateInput}
                            required
                            style={{ flex: '1', minWidth: '150px' }}
                          />
                          <select
                            value={statusUpdateData.endInstallationHour}
                            onChange={(e) => setStatusUpdateData(prev => ({ ...prev, endInstallationHour: e.target.value }))}
                            className={styles.timeSelect}
                            style={{ width: '80px' }}
                          >
                            {hourOptions.map(hour => (
                              <option key={hour} value={hour}>{hour}</option>
                            ))}
                          </select>
                          <span>:</span>
                          <select
                            value={statusUpdateData.endInstallationMinute}
                            onChange={(e) => setStatusUpdateData(prev => ({ ...prev, endInstallationMinute: e.target.value }))}
                            className={styles.timeSelect}
                            style={{ width: '80px' }}
                          >
                            {minuteOptions.map(minute => (
                              <option key={minute} value={minute}>{minute}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Quick time buttons for end */}
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setQuickTime('end', '17', '00')}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              backgroundColor: statusUpdateData.endInstallationHour === '17' && statusUpdateData.endInstallationMinute === '00' ? '#007bff' : '#fff',
                              color: statusUpdateData.endInstallationHour === '17' && statusUpdateData.endInstallationMinute === '00' ? '#fff' : '#333',
                              cursor: 'pointer'
                            }}
                          >
                            17:00
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickTime('end', '18', '00')}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              backgroundColor: statusUpdateData.endInstallationHour === '18' && statusUpdateData.endInstallationMinute === '00' ? '#007bff' : '#fff',
                              color: statusUpdateData.endInstallationHour === '18' && statusUpdateData.endInstallationMinute === '00' ? '#fff' : '#333',
                              cursor: 'pointer'
                            }}
                          >
                            18:00
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickTime('end', '19', '00')}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              backgroundColor: statusUpdateData.endInstallationHour === '19' && statusUpdateData.endInstallationMinute === '00' ? '#007bff' : '#fff',
                              color: statusUpdateData.endInstallationHour === '19' && statusUpdateData.endInstallationMinute === '00' ? '#fff' : '#333',
                              cursor: 'pointer'
                            }}
                          >
                            19:00
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickTime('end', '20', '00')}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              backgroundColor: statusUpdateData.endInstallationHour === '20' && statusUpdateData.endInstallationMinute === '00' ? '#007bff' : '#fff',
                              color: statusUpdateData.endInstallationHour === '20' && statusUpdateData.endInstallationMinute === '00' ? '#fff' : '#333',
                              cursor: 'pointer'
                            }}
                          >
                            20:00
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  

                  
                  <div className={styles.formGroup}>
                    <label>{t('admin.orders.notes')}:</label>
                    <textarea
                      value={statusUpdateData.notes}
                      onChange={(e) => setStatusUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder={t('admin.orders.notesPlaceholder')}
                      className={styles.notesTextarea}
                      rows="3"
                    />
                  </div>
                  
                  <div className={styles.statusUpdateActions}>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.order_id)}
                      disabled={updatingStatus || !statusUpdateData.newStatus}
                      className={styles.updateStatusButton}
                    >
                      {updatingStatus ? `🔄 ${t('admin.orders.updatingStatus')}` : `✅ ${t('admin.orders.updateStatus')}`}
                    </button>
                    <button
                      onClick={closeOrderDetails}
                      className={styles.cancelButton}
                    >
                      {t('admin.orders.cancel')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 