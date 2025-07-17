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
    'cancelled': '#f44336'
  };
  return statusColors[status] || '#666';
}

function getStatusLabel(status) {
  const statusLabels = {
    'new': 'New',
    'confirmed': 'Confirmed',
    'installation_booked': 'Installation Booked',
    'installed': 'Installed',
    'cancelled': 'Cancelled'
  };
  return statusLabels[status] || status;
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
    installationDate: ''
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
      alert('Please select a new status');
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
          installationDate: statusUpdateData.installationDate,
          adminId: 'admin' // You can replace this with actual admin ID
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Order status updated successfully!');
        setStatusUpdateData({ newStatus: '', notes: '', installationDate: '' });
        fetchOrders(); // Refresh the orders list
        setShowOrderDetails(false);
        setSelectedOrder(null);
      } else {
        alert('Error updating order status: ' + data.error);
      }
    } catch (err) {
      alert('Error updating order status: ' + err.message);
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
    setStatusUpdateData({ newStatus: '', notes: '', installationDate: '' });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentOrders = orders.slice(startIndex, endIndex);

  return (
    <div className={styles.ordersManagementSection}>
      <div className={styles.ordersHeader}>
        <h2>📋 Orders Management</h2>
        <p>Manage customer orders, update statuses, and track order progress</p>
      </div>

      {/* Filters */}
      <div className={styles.ordersFilters}>
        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder="Search by name, phone, or order ID..."
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
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="installation_booked">Installation Booked</option>
            <option value="installed">Installed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <button 
            onClick={fetchOrders}
            className={styles.refreshButton}
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
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
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Created</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className={styles.loadingCell}>
                  🔄 Loading orders...
                </td>
              </tr>
            ) : currentOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  {search || statusFilter ? 'No orders match your filters' : 'No orders found'}
                </td>
              </tr>
            ) : (
              currentOrders.map(order => (
                <tr key={order.order_id} className={styles.orderRow}>
                  <td>#{order.order_id}</td>
                  <td>{order.first_name} {order.last_name}</td>
                  <td>{order.phone}</td>
                  <td>{formatDate(order.order_created_at)}</td>
                  <td>{order.payment_method || 'Not specified'}</td>
                  <td>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(order.current_status) }}
                    >
                      {getStatusLabel(order.current_status)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => showOrderDetailsModal(order)}
                      className={styles.viewButton}
                    >
                      👁️ View Details
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
            ‹ Previous
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
            Next ›
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Order Details - #{selectedOrder.order_id}</h3>
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
                  <h4>📋 Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                  <p><strong>Order Date:</strong> {formatDate(selectedOrder.order_created_at)}</p>
                </div>
                
                <div className={styles.infoSection}>
                  <h4>💳 Payment Information</h4>
                  <p><strong>Payment Method:</strong> {selectedOrder.payment_method || 'Not specified'}</p>
                  <p><strong>Current Status:</strong> 
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(selectedOrder.current_status) }}
                    >
                      {getStatusLabel(selectedOrder.current_status)}
                    </span>
                  </p>
                </div>
              </div>

              <div className={styles.statusUpdateSection}>
                <h4>🔄 Update Order Status</h4>
                <div className={styles.statusUpdateForm}>
                  <div className={styles.formGroup}>
                    <label>New Status:</label>
                    <select
                      value={statusUpdateData.newStatus}
                      onChange={(e) => setStatusUpdateData(prev => ({ ...prev, newStatus: e.target.value }))}
                      className={styles.statusSelect}
                    >
                      <option value="">Select new status...</option>
                      <option value="new">New</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="installation_booked">Installation Booked</option>
                      <option value="installed">Installed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Installation Date (if applicable):</label>
                    <input
                      type="datetime-local"
                      value={statusUpdateData.installationDate}
                      onChange={(e) => setStatusUpdateData(prev => ({ ...prev, installationDate: e.target.value }))}
                      className={styles.dateInput}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Notes:</label>
                    <textarea
                      value={statusUpdateData.notes}
                      onChange={(e) => setStatusUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any notes about this status change..."
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
                      {updatingStatus ? '🔄 Updating...' : '✅ Update Status'}
                    </button>
                    <button
                      onClick={closeOrderDetails}
                      className={styles.cancelButton}
                    >
                      Cancel
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