import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Page Styles/Administration.module.css';

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
  const [showOrderProducts, setShowOrderProducts] = useState(false);
  const [showCombinedModal, setShowCombinedModal] = useState(false);
  const [orderProducts, setOrderProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [includesInstallation, setIncludesInstallation] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    newStatus: '',
    notes: '',
    startInstallationDate: '',
    startInstallationHour: '08',
    startInstallationMinute: '00',
    endInstallationDate: '',
    endInstallationHour: '17',
    endInstallationMinute: '00',
    paidAmount: '' // Added paid amount field
  });

  const canSubmitOrderUpdate =
    Boolean(statusUpdateData.newStatus) ||
    (statusUpdateData.paidAmount !== '' && !isNaN(parseFloat(statusUpdateData.paidAmount)));

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
            order.order_id?.toString().includes(search) ||
            order.notes?.toLowerCase().includes(searchLower)
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

  const handleOrderUpdate = async (orderId) => {
    const hasNewStatus = Boolean(statusUpdateData.newStatus);
    const hasPaidAmount =
      statusUpdateData.paidAmount !== '' && !isNaN(parseFloat(statusUpdateData.paidAmount));

    if (!hasNewStatus && !hasPaidAmount) {
      alert('Моля, изберете нов статус или въведете платена сума за обновяване.');
      return;
    }

    if (statusUpdateData.paidAmount !== '' && isNaN(parseFloat(statusUpdateData.paidAmount))) {
      alert('Моля, въведете валидна сума за плащане');
      return;
    }

    setUpdatingStatus(true);
    try {
      const payload = {
        orderId,
        adminId: 'admin', // You can replace this with actual admin ID
        notes: statusUpdateData.notes,
      };

      if (hasNewStatus) {
        Object.assign(payload, {
          newStatus: statusUpdateData.newStatus,
          startInstallationDate: statusUpdateData.startInstallationDate,
          startInstallationHour: statusUpdateData.startInstallationHour,
          startInstallationMinute: statusUpdateData.startInstallationMinute,
          endInstallationDate: statusUpdateData.endInstallationDate,
          endInstallationHour: statusUpdateData.endInstallationHour,
          endInstallationMinute: statusUpdateData.endInstallationMinute,
        });
      } else if (selectedOrder?.current_status) {
        payload.newStatus = selectedOrder.current_status;
      }

      if (hasPaidAmount) {
        payload.paidAmount = parseFloat(statusUpdateData.paidAmount);
        if (!payload.notes) {
          payload.notes = 'Обновена платена сума';
        }
      }

      console.log('handleOrderUpdate: sending payload', payload);

      const response = await fetch('/api/update-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('handleOrderUpdate: response received', {
        status: response.status,
        statusText: response.statusText,
      });

      const data = await response.json();
      console.log('handleOrderUpdate: response body', data);

      if (response.ok) {
        const successMessage = hasNewStatus && hasPaidAmount
          ? 'Статусът и платената сума са обновени успешно.'
          : hasNewStatus
            ? t('admin.orders.statusUpdated')
            : `Платената сума е обновена успешно на ${parseFloat(statusUpdateData.paidAmount).toFixed(2)} лв.`;
        alert(successMessage);

        fetchOrders(); // Refresh the orders list

        if (hasNewStatus) {
          setStatusUpdateData({
            newStatus: '',
            notes: '',
            startInstallationDate: '',
            startInstallationHour: '08',
            startInstallationMinute: '00',
            endInstallationDate: '',
            endInstallationHour: '17',
            endInstallationMinute: '00',
            paidAmount: '',
          });
          setShowOrderDetails(false);
          setSelectedOrder(null);
        } else {
          setStatusUpdateData(prev => ({
            ...prev,
            paidAmount: '',
          }));
        }
      } else {
        alert(t('admin.orders.errors.updateFailed') + ': ' + data.error);
      }
    } catch (err) {
      console.error('handleOrderUpdate: request failed', err);
      alert(t('admin.orders.errors.updateFailed') + ': ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const showOrderDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
    setStatusUpdateData({ 
      notes: order.notes,
      newStatus: order.current_status,
      startInstallationDate: '',
      startInstallationHour: '08',
      startInstallationMinute: '00',
      endInstallationDate: '',
      endInstallationHour: '17',
      endInstallationMinute: '00',
      paidAmount: order.paid_amount ? order.paid_amount.toString() : '' // Initialize with current paid amount
    });
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
      endInstallationMinute: '00',
      paidAmount: '' // Reset paid amount
    });
  };

  const showOrderProductsModal = async (order) => {
    setSelectedOrder(order);
    setShowOrderProducts(true);
    setLoadingProducts(true);
    
    try {
      const response = await fetch(`/api/get-order-products?orderId=${order.order_id}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrderProducts(data.products || []);
        setIncludesInstallation(data.includesInstallation || false);
      } else {
        setOrderProducts([]);
        setIncludesInstallation(false);
      }
    } catch (err) {
      setOrderProducts([]);
      setIncludesInstallation(false);
    } finally {
      setLoadingProducts(false);
    }
  };

  const closeOrderProducts = () => {
    setShowOrderProducts(false);
    setSelectedOrder(null);
    setOrderProducts([]);
    setIncludesInstallation(false);
  };

  // Show combined modal (desktop view)
  const showCombinedOrderModal = async (order) => {
    setSelectedOrder(order);
    setShowCombinedModal(true);
    setStatusUpdateData({ 
      notes: order.notes,
      newStatus: order.current_status,
      startInstallationDate: '',
      startInstallationHour: '08',
      startInstallationMinute: '00',
      endInstallationDate: '',
      endInstallationHour: '17',
      endInstallationMinute: '00',
      paidAmount: order.paid_amount ? order.paid_amount.toString() : '' // Initialize with current paid amount
    });
    
    // Load products for the combined view
    setLoadingProducts(true);
    try {
      const response = await fetch(`/api/get-order-products?orderId=${order.order_id}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrderProducts(data.products || []);
        setIncludesInstallation(data.includesInstallation || false);
      } else {
        setOrderProducts([]);
        setIncludesInstallation(false);
      }
    } catch (err) {
      setOrderProducts([]);
      setIncludesInstallation(false);
    } finally {
      setLoadingProducts(false);
    }
  };

  const closeCombinedModal = () => {
    setShowCombinedModal(false);
    setSelectedOrder(null);
    setOrderProducts([]);
    setIncludesInstallation(false);
    setStatusUpdateData({ 
      newStatus: '', 
      notes: '', 
      startInstallationDate: '', 
      startInstallationHour: '08',
      startInstallationMinute: '00',
      endInstallationDate: '', 
      endInstallationHour: '17',
      endInstallationMinute: '00',
      paidAmount: '' // Reset paid amount
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
        
        {/* Desktop Table View */}
        <div className={styles.desktopOnly}>
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
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => showCombinedOrderModal(order)}
                          className={styles.viewButton}
                          style={{ width: '120px' }}
                        >
                          👁️ {t('admin.orders.orderDetails')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className={styles.mobileOnly}>
          {loading ? (
            <div className={styles.loadingCell}>
              🔄 {t('admin.orders.loading')}
            </div>
          ) : currentOrders.length === 0 ? (
            <div className={styles.emptyCell}>
              {search || statusFilter ? t('admin.orders.noOrdersMatchFilters') : t('admin.orders.noOrdersFound')}
            </div>
          ) : (
            <div className={styles.mobileOrdersList}>
              {currentOrders.map(order => (
                <div key={order.order_id} className={styles.mobileOrderCard}>
                  <div className={styles.mobileOrderHeader}>
                    <div className={styles.mobileOrderCustomer}>
                      <strong>{order.first_name} {order.last_name}</strong>
                      <span className={styles.mobileOrderPhone}>{order.phone}</span>
                    </div>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(order.current_status) }}
                    >
                      {getStatusLabel(order.current_status, t)}
                    </span>
                  </div>
                  
                  <div className={styles.mobileOrderDetails}>
                    <div className={styles.mobileOrderInfo}>
                      <span className={styles.mobileOrderLabel}>{t('admin.orders.table.paymentMethod')}:</span>
                      <span>{getPaymentMethodLabel(order.payment_method)}</span>
                    </div>
                    <div className={styles.mobileOrderInfo}>
                      <span className={styles.mobileOrderLabel}>{t('admin.orders.table.totalAmount')}:</span>
                      <span>{order.total_amount ? `${order.total_amount.toFixed(2)} лв.` : '-'}</span>
                    </div>
                    <div className={styles.mobileOrderInfo}>
                      <span className={styles.mobileOrderLabel}>{t('admin.orders.table.paidAmount')}:</span>
                      <span>{order.paid_amount ? `${order.paid_amount.toFixed(2)} лв.` : '0.00 лв.'}</span>
                    </div>
                  </div>
                  
                  <div className={styles.mobileOrderActions}>
                    <button
                      onClick={() => showOrderDetailsModal(order)}
                      className={styles.viewButton}
                    >
                      👁️ {t('admin.orders.orderDetails')}
                    </button>
                    <button
                      onClick={() => showOrderProductsModal(order)}
                      className={styles.viewButton}
                    >
                      📦 {t('admin.orders.products.button')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
                  <p><strong>{t('admin.orders.modal.town')}:</strong> {selectedOrder.town || '-'}</p>
                  <p><strong>{t('admin.orders.modal.address')}:</strong> {selectedOrder.address || '-'}</p>
                  <p><strong>{t('admin.orders.modal.email')}:</strong> {selectedOrder.email || '-'}</p>
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

              <h4>🔄 {t('admin.orders.updateOrderStatus')}</h4>
              <>
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

                  <div className={styles.formGroup}>
                    <label>Платена сума (лв.):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={statusUpdateData.paidAmount}
                      onChange={(e) => setStatusUpdateData(prev => ({ ...prev, paidAmount: e.target.value }))}
                      placeholder="Въведете платена сума"
                      className={styles.priceInput}
                    />
                  </div>
                  
                  <div className={styles.statusUpdateActions}>
                    <button
                      onClick={() => handleOrderUpdate(selectedOrder.order_id)}
                      disabled={updatingStatus || !canSubmitOrderUpdate}
                      className={styles.updateStatusButton}
                    >
                        {updatingStatus ? '🔄 Обновяване...' : '✅ Обновяване'}
                        </button>
                    <button
                      onClick={closeOrderDetails}
                      className={styles.cancelButton}
                    >
                      {t('admin.orders.cancel')}
                    </button>
                  </div>
              </>
            </div>
          </div>
        </div>
      )}

      {/* Order Products Modal */}
      {showOrderProducts && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{t('admin.orders.products.title')} - #{selectedOrder.order_id}</h3>
              <button 
                onClick={closeOrderProducts}
                className={styles.modalCloseButton}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.productsSection}>
                {loadingProducts ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    🔄 {t('admin.orders.products.loading')}
                  </div>
                ) : orderProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    {t('admin.orders.products.noProducts')}
                  </div>
                ) : (
                  <div>
                    <div className={styles.productsTable}>
                      {orderProducts.map((product, index) => (
                        <React.Fragment key={index}>
                          {/* Main Product Row */}
                          <div className={styles.productRow}>
                            <div className={styles.productImage}>
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={`${product.brand} ${product.model}`}
                                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              ) : (
                                <div style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  backgroundColor: '#f0f0f0', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  borderRadius: '4px',
                                  fontSize: '20px'
                                }}>
                                  📦
                                </div>
                              )}
                            </div>
                            <div className={styles.productInfo}>
                              <strong>{product.brand} {product.model}</strong>
                            </div>
                            <div className={styles.productQuantity}>
                              {t('admin.orders.products.quantity')}: {product.quantity}
                            </div>
                            <div className={styles.productPrice}>
                              <div>{product.price ? `${parseFloat(product.price).toFixed(2)} лв.` : '-'}</div>
                              <div style={{ fontSize: '0.85em', color: '#666' }}>
                                {product.price ? `${(parseFloat(product.price) / 1.95583).toFixed(2)} €` : '-'}
                              </div>
                            </div>
                            <div className={styles.productTotal}>
                              <div>{product.total_price ? `${product.total_price.toFixed(2)} лв.` : '-'}</div>
                              <div style={{ fontSize: '0.85em', color: '#666' }}>
                                {product.total_price ? `${(product.total_price / 1.95583).toFixed(2)} €` : '-'}
                              </div>
                            </div>
                          </div>

                          {/* Accessory Rows */}
                          {product.accessories && product.accessories.length > 0 && 
                            product.accessories.map((accessory, accIndex) => {
                              const accessoryTotal = (accessory.price || 0) * (accessory.quantity || 1);
                              return (
                                <div key={`${index}-acc-${accIndex}`} className={`${styles.productRow} ${styles.accessoryRow}`}>
                                  <div className={`${styles.productInfo} ${styles.accessoryInfo}`}>
                                    <span>{t(`productDetail.accessoryNames.${accessory.name}`) || accessory.name}</span>
                                  </div>
                                  <div className={styles.productQuantity}>
                                    {t('admin.orders.products.quantity')}: {accessory.quantity || 1}
                                  </div>
                                  <div className={styles.productPrice}>
                                    <div>{accessory.price ? `${parseFloat(accessory.price).toFixed(2)} лв.` : '-'}</div>
                                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                                      {accessory.price ? `${(parseFloat(accessory.price) / 1.95583).toFixed(2)} €` : '-'}
                                    </div>
                                  </div>
                                  <div className={styles.productTotal}>
                                    <div>{accessoryTotal ? `${accessoryTotal.toFixed(2)} лв.` : '-'}</div>
                                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                                      {accessoryTotal ? `${(accessoryTotal / 1.95583).toFixed(2)} €` : '-'}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          }

                          {/* Installation Row */}
                          {product.includes_installation && (
                            <div className={styles.productRow} style={{
                              backgroundColor: '#e8f5e8',
                              paddingLeft: '2rem',
                              borderLeft: '3px solid #4caf50',
                              fontSize: '0.9rem'
                            }}>
                              <div className={styles.productInfo} style={{ gridColumn: '2 / 3' }}>
                                <span>{t('admin.orders.products.installation')}</span>
                              </div>
                              <div className={styles.productQuantity}>
                                {t('admin.orders.products.quantity')}: {product.quantity}
                              </div>
                              <div className={styles.productPrice}>
                                <div>300.00 лв.</div>
                                <div style={{ fontSize: '0.85em', color: '#666' }}>
                                  {(300 / 1.95583).toFixed(2)} €
                                </div>
                              </div>
                              <div className={styles.productTotal}>
                                <div>{(300 * product.quantity).toFixed(2)} лв.</div>
                                <div style={{ fontSize: '0.85em', color: '#666' }}>
                                  {((300 / 1.95583) * product.quantity).toFixed(2)} €
                                </div>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className={styles.totalRow}>
                      <div className={styles.totalLabel}>
                        <strong>{t('admin.orders.products.total')}:</strong>
                      </div>
                      <div className={styles.totalAmount}>
                        <div>
                          <strong>{(() => {
                            const productTotal = orderProducts.reduce((sum, product) => sum + (product.total_price || 0), 0);
                            const accessoryTotal = orderProducts.reduce((sum, product) => {
                              if (product.accessories && product.accessories.length > 0) {
                                return sum + product.accessories.reduce((accSum, acc) => accSum + ((acc.price || 0) * (acc.quantity || 1)), 0);
                              }
                              return sum;
                            }, 0);
                            const installationTotal = orderProducts.reduce((sum, product) => {
                              if (product.includes_installation) {
                                return sum + (300 * product.quantity);
                              }
                              return sum;
                            }, 0);
                            return (productTotal + accessoryTotal + installationTotal).toFixed(2);
                          })()} лв.</strong>
                        </div>
                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                          <strong>{(() => {
                            const productTotal = orderProducts.reduce((sum, product) => sum + (product.total_price || 0), 0);
                            const accessoryTotal = orderProducts.reduce((sum, product) => {
                              if (product.accessories && product.accessories.length > 0) {
                                return sum + product.accessories.reduce((accSum, acc) => accSum + ((acc.price || 0) * (acc.quantity || 1)), 0);
                              }
                              return sum;
                            }, 0);
                            const installationTotal = orderProducts.reduce((sum, product) => {
                              if (product.includes_installation) {
                                return sum + ((300 / 1.95583) * product.quantity);
                              }
                              return sum;
                            }, 0);
                            return ((productTotal + accessoryTotal + installationTotal) / 1.95583).toFixed(2);
                          })()} €</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combined Modal (Desktop View) */}
      {showCombinedModal && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.combinedModal}`}>
            <div className={styles.modalHeader}>
              <h3>{t('admin.orders.orderDetails')} - #{selectedOrder.order_id}</h3>
              <button 
                onClick={closeCombinedModal}
                className={styles.modalCloseButton}
              >
                ×
              </button>
            </div>
            
            <div className={styles.combinedModalBody}>
              {/* Left Side - Order Details */}
              <div className={styles.orderDetailsPanel}>
                <div className={styles.orderInfo}>
                  <div className={styles.infoSection}>
                    <h4>📋 {t('admin.orders.customerInformation')}</h4>
                    <p><strong>{t('admin.orders.modal.name')}:</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                    <p><strong>{t('admin.orders.modal.phone')}:</strong> {selectedOrder.phone}</p>
                    <p><strong>{t('admin.orders.modal.town')}:</strong> {selectedOrder.town || '-'}</p>
                    <p><strong>{t('admin.orders.modal.address')}:</strong> {selectedOrder.address || '-'}</p>
                    <p><strong>{t('admin.orders.modal.email')}:</strong> {selectedOrder.email || '-'}</p>
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

                    <div className={styles.formGroup}>
                      <label>Платена сума (лв.):</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={statusUpdateData.paidAmount}
                        onChange={(e) => setStatusUpdateData(prev => ({ ...prev, paidAmount: e.target.value }))}
                        placeholder="Въведете платена сума"
                        className={styles.priceInput}
                      />
                    </div>
                    
                    <div className={styles.statusUpdateActions}>
                      <button
                        onClick={() => handleOrderUpdate(selectedOrder.order_id)}
                        disabled={updatingStatus || !canSubmitOrderUpdate}
                        className={styles.updateStatusButton}
                      >
                        {updatingStatus ? '🔄 Обновяване...' : '✅ Обновяване'}
                      </button>
                    </div>
              </div>

              {/* Right Side - Products */}
              <div className={styles.productsPanel}>
                <h4>📦 {t('admin.orders.products.title')}</h4>
                <div className={styles.productsSection}>
                  {loadingProducts ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      🔄 {t('admin.orders.products.loading')}
                    </div>
                  ) : orderProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      {t('admin.orders.products.noProducts')}
                    </div>
                  ) : (
                    <div>
                      <div className={styles.productsTable}>
                        {orderProducts.map((product, index) => (
                          <React.Fragment key={index}>
                            {/* Main Product Row */}
                            <div className={styles.productRow}>
                              <div className={styles.productImage}>
                                {product.image_url ? (
                                  <img 
                                    src={product.image_url} 
                                    alt={`${product.brand} ${product.model}`}
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                  />
                                ) : (
                                  <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    backgroundColor: '#f0f0f0', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    borderRadius: '4px',
                                    fontSize: '16px'
                                  }}>
                                    📦
                                  </div>
                                )}
                              </div>
                              <div className={styles.productInfo}>
                                <strong style={{ fontSize: '0.9rem' }}>{product.brand} {product.model}</strong>
                              </div>
                              <div className={styles.productQuantity}>
                                <small>{t('admin.orders.products.quantity')}: {product.quantity}</small>
                              </div>
                              <div className={styles.productPrice}>
                                <div style={{ fontSize: '0.85rem' }}>{product.price ? `${parseFloat(product.price).toFixed(2)} лв.` : '-'}</div>
                              </div>
                              <div className={styles.productTotal}>
                                <div style={{ fontSize: '0.85rem' }}>{product.total_price ? `${product.total_price.toFixed(2)} лв.` : '-'}</div>
                              </div>
                            </div>

                            {/* Accessory Rows */}
                            {product.accessories && product.accessories.length > 0 && 
                              product.accessories.map((accessory, accIndex) => {
                                const accessoryTotal = (accessory.price || 0) * (accessory.quantity || 1);
                                return (
                                  <div key={`${index}-acc-${accIndex}`} className={`${styles.productRow} ${styles.accessoryRow}`}>
                                    <div className={`${styles.productInfo} ${styles.accessoryInfo}`}>
                                      <span>{t(`productDetail.accessoryNames.${accessory.name}`) || accessory.name}</span>
                                    </div>
                                    <div className={styles.productQuantity}>
                                      <small>{t('admin.orders.products.quantity')}: {accessory.quantity || 1}</small>
                                    </div>
                                    <div className={styles.productPrice}>
                                      <div style={{ fontSize: '0.75rem' }}>{accessory.price ? `${parseFloat(accessory.price).toFixed(2)} лв.` : '-'}</div>
                                    </div>
                                    <div className={styles.productTotal}>
                                      <div style={{ fontSize: '0.75rem' }}>{accessoryTotal ? `${accessoryTotal.toFixed(2)} лв.` : '-'}</div>
                                    </div>
                                  </div>
                                );
                              })
                            }

                            {/* Installation Row */}
                            {product.includes_installation && (
                              <div className={styles.productRow} style={{
                                backgroundColor: '#e8f5e8',
                                paddingLeft: '1rem',
                                borderLeft: '2px solid #4caf50',
                                fontSize: '0.8rem'
                              }}>
                                <div className={styles.productInfo} style={{ gridColumn: '1 / 3' }}>
                                  <span>{t('admin.orders.products.installation')}</span>
                                </div>
                                <div className={styles.productQuantity}>
                                  <small>{t('admin.orders.products.quantity')}: {product.quantity}</small>
                                </div>
                                <div className={styles.productPrice}>
                                  <div style={{ fontSize: '0.75rem' }}>300.00 лв.</div>
                                </div>
                                <div className={styles.productTotal}>
                                  <div style={{ fontSize: '0.75rem' }}>{(300 * product.quantity).toFixed(2)} лв.</div>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className={styles.totalRow}>
                        <div className={styles.totalLabel}>
                          <strong style={{ fontSize: '0.9rem' }}>{t('admin.orders.products.total')}:</strong>
                        </div>
                        <div className={styles.totalAmount}>
                          <div>
                            <strong style={{ fontSize: '0.9rem' }}>{(() => {
                              const productTotal = orderProducts.reduce((sum, product) => sum + (product.total_price || 0), 0);
                              const accessoryTotal = orderProducts.reduce((sum, product) => {
                                if (product.accessories && product.accessories.length > 0) {
                                  return sum + product.accessories.reduce((accSum, acc) => accSum + ((acc.price || 0) * (acc.quantity || 1)), 0);
                                }
                                return sum;
                              }, 0);
                              const installationTotal = orderProducts.reduce((sum, product) => {
                                if (product.includes_installation) {
                                  return sum + (300 * product.quantity);
                                }
                                return sum;
                              }, 0);
                              return (productTotal + accessoryTotal + installationTotal).toFixed(2);
                            })()} лв.</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 