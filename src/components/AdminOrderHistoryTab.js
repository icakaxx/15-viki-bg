import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Page Styles/Administration.module.css';

const PAGE_SIZE = 20;

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('bg-BG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminOrderHistoryTab() {
  const { t } = useTranslation('common');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('installation_date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Date filtering states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal state for order details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [orderProducts, setOrderProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Status update state
  const [statusUpdateData, setStatusUpdateData] = useState({
    newStatus: '',
    notes: ''
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [page, search, sortBy, sortOrder, startDate, endDate]);



  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
        search,
        sortBy,
        sortOrder
      });
      
      // Add date filters if they exist
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      

      
      // Force the correct port based on current server
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/get-installed-orders?${params}`;
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.data || []);
        setTotalCount(data.totalCount || 0);
      } else {
        setError(data.error || t('admin.orders.history.error'));
        setOrders([]);
        setTotalCount(0);
      }
    } catch (err) {
      setError(t('admin.orders.history.error'));
      setOrders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
    fetchOrderProducts(order.order_id);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
    setOrderProducts([]);
    setStatusUpdateData({ newStatus: '', notes: '' });
  };

  const updateOrderStatus = async () => {
    if (!statusUpdateData.newStatus) {
      alert('Моля, изберете нов статус');
      return;
    }

    setUpdatingStatus(true);
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/update-order-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.order_id,
          newStatus: statusUpdateData.newStatus,
          notes: statusUpdateData.notes,
          adminId: 'admin'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Статусът е обновен успешно от ${result.oldStatus} на ${result.newStatus}`);
        // Refresh the orders list
        fetchOrders();
        // Close modal
        closeDetailsModal();
      } else {
        alert(`Грешка при обновяване на статуса: ${result.error}`);
      }
    } catch (error) {
      alert(`Грешка при обновяване на статуса: ${error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  async function fetchOrderProducts(orderId) {
    setProductsLoading(true);
    try {
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/get-order-products?orderId=${orderId}`;
      
      const res = await fetch(apiUrl);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setOrderProducts(data.products || []);
      } else {
        console.error('Failed to fetch order products:', data.error);
        setOrderProducts([]);
      }
    } catch (err) {
      console.error('Error fetching order products:', err);
      setOrderProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className={styles.ordersManagementSection}>
      <div className={styles.ordersHeader}>
        <h2>{t('admin.orders.history.title')}</h2>
        <p>{t('admin.orders.history.description')}</p>
      </div>

      {/* Filter Bar */}
      <div className={styles.ordersFilters}>
        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder={t('admin.orders.history.searchPlaceholder')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className={styles.searchInput}
          />
        </div>
        <div className={`${styles.filterGroup} ${styles.dateFilterGroup}`}>
          <label className={styles.filterLabel}>Период:</label>
          <input 
            type="date" 
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setPage(1); }}
            className={styles.dateInput}
            placeholder="От дата"
          />
          <span className={styles.dateSeparator}>-</span>
          <input 
            type="date" 
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setPage(1); }}
            className={styles.dateInput}
            placeholder="До дата"
          />
          {(startDate || endDate) && (
            <button 
              onClick={clearDateFilters}
              className={styles.clearFilterButton}
              title="Изчисти филтри"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={styles.desktopOnly}>
        <div className={styles.ordersTableContainer}>
          {error && (
            <div className={styles.errorMessage}>
              ❌ {error}
            </div>
          )}
          
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>{t('admin.orders.history.installationDate')}</th>
                <th>{t('admin.orders.history.customer')}</th>
                <th>{t('admin.orders.history.phone')}</th>
                <th>{t('admin.orders.history.products')}</th>
                <th>{t('admin.orders.history.total')}</th>
                <th>{t('admin.orders.history.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.loadingCell}>
                    🔄 {t('admin.orders.history.loading')}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    {search ? t('admin.orders.history.noOrdersMatchFilters') : t('admin.orders.history.noOrders')}
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.order_id} className={styles.orderRow}>
                    <td>{formatDate(order.installation_date)}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.customer_phone}</td>
                    <td>{order.products_count}</td>
                    <td>{(order.total_price_bgn || 0).toFixed(2)} лв / {(order.total_price_eur || 0).toFixed(2)} €</td>
                    <td>
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className={styles.viewButton}
                      >
                        {t('admin.orders.history.detailsButton')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileOnly}>
        {error && (
          <div className={styles.errorMessage}>
            ❌ {error}
          </div>
        )}
        
        {loading ? (
          <div className={styles.loadingCell}>
            🔄 {t('admin.orders.history.loading')}
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyCell}>
            {search ? t('admin.orders.history.noOrdersMatchFilters') : t('admin.orders.history.noOrders')}
          </div>
        ) : (
          <div className={styles.mobileOrdersList}>
            {orders.map(order => (
              <div key={order.order_id} className={styles.mobileOrderCard}>
                <div className={styles.mobileOrderHeader}>
                  <div className={styles.mobileOrderCustomer}>
                    <strong>{order.customer_name}</strong>
                    <span className={styles.mobileOrderPhone}>{order.customer_phone}</span>
                  </div>
                  <span className={styles.mobileOrderDate}>
                    {formatDate(order.installation_date)}
                  </span>
                </div>
                
                <div className={styles.mobileOrderDetails}>
                  <div className={styles.mobileOrderInfo}>
                    <span className={styles.mobileOrderLabel}>{t('admin.orders.history.products')}:</span>
                    <span>{order.products_count}</span>
                  </div>
                  <div className={styles.mobileOrderInfo}>
                    <span className={styles.mobileOrderLabel}>{t('admin.orders.history.total')}:</span>
                    <span>{(order.total_price_bgn || 0).toFixed(2)} лв / {(order.total_price_eur || 0).toFixed(2)} €</span>
                  </div>
                </div>
                
                <div className={styles.mobileOrderActions}>
                  <button 
                    onClick={() => handleViewDetails(order)}
                    className={styles.viewButton}
                  >
                    {t('admin.orders.history.detailsButton')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
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
      {showDetailsModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={closeDetailsModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Детайли за поръчка #{selectedOrder.order_id}</h3>
              <button onClick={closeDetailsModal} className={styles.closeButton}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.orderDetailRow}>
                <strong>Клиент:</strong> {selectedOrder.customer_name}
              </div>
              <div className={styles.orderDetailRow}>
                <strong>Телефон:</strong> {selectedOrder.customer_phone}
              </div>
              <div className={styles.orderDetailRow}>
                <strong>Дата на инсталация:</strong> {formatDate(selectedOrder.installation_date)}
              </div>
              <div className={styles.orderDetailRow}>
                <strong>Брой продукти:</strong> {selectedOrder.products_count}
              </div>
              <div className={styles.orderDetailRow}>
                <strong>Обща сума:</strong> {(selectedOrder.total_price_bgn || 0).toFixed(2)} лв / {(selectedOrder.total_price_eur || 0).toFixed(2)} €
              </div>
              <div className={styles.orderDetailRow}>
                <strong>Платена сума:</strong> {selectedOrder.paid_amount ? `${selectedOrder.paid_amount.toFixed(2)} лв` : 'Не е платена'}
              </div>
              <div className={styles.orderDetailRow}>
                <strong>Изчислена сума:</strong> {(() => {
                  const productTotal = orderProducts.reduce((sum, product) => sum + (parseFloat(product.price) * product.quantity), 0);
                  const accessoryTotal = orderProducts.reduce((sum, product) => {
                    if (product.accessories && Array.isArray(product.accessories)) {
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
                  const calculatedTotal = productTotal + accessoryTotal + installationTotal;
                  return `${calculatedTotal.toFixed(2)} лв / ${(calculatedTotal / 1.95583).toFixed(2)} €`;
                })()}
              </div>
              
              <div className={styles.productsSection}>
                <h4>Продукти в поръчката:</h4>
                {productsLoading ? (
                  <div className={styles.loadingProducts}>Зареждане на продукти...</div>
                ) : orderProducts.length > 0 ? (
                  <div className={styles.productsList}>
                    {orderProducts.map((product, index) => (
                      <div key={index} className={styles.productItem}>
                        <div className={styles.productInfo}>
                          <div className={styles.productBrandModel}>
                            <strong>{product.brand} {product.model}</strong>
                          </div>
                          <div className={styles.productDetails}>
                            <span>Количество: {product.quantity}</span>
                            <span>Цена: {product.price} лв</span>
                            <span>Общо: {(parseFloat(product.price) * product.quantity).toFixed(2)} лв</span>
                          </div>
                          {product.includes_installation && (
                            <div className={styles.installationSection}>
                              <div className={styles.installationInfo}>
                                <strong>Включена инсталация</strong>
                                <span>Цена: 300.00 лв</span>
                                <span>Общо: {(300 * product.quantity).toFixed(2)} лв</span>
                              </div>
                            </div>
                          )}
                          {product.accessories && Array.isArray(product.accessories) && product.accessories.length > 0 && (
                            <div className={styles.accessoriesList}>
                              <strong>Аксесоари:</strong>
                              <ul>
                                {product.accessories.map((accessory, accIndex) => {
                                  const accessoryTotal = (accessory.price || 0) * (accessory.quantity || 1);
                                  return (
                                    <li key={accIndex} className={styles.accessoryItem}>
                                      <div className={styles.accessoryName}>
              {accessory.name || accessory.Name || 'Unknown Accessory'}                                      </div>
                                      <div className={styles.accessoryDetails}>
                                        <span>Количество: {accessory.quantity || 1}</span>
                                        <span>Цена: {(accessory.price || 0).toFixed(2)} лв</span>
                                        <span>Общо: {accessoryTotal.toFixed(2)} лв</span>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                                     </div>
                 ) : (
                   <div className={styles.noProducts}>Няма намерени продукти за тази поръчка.</div>
                 )}
                 
                 {/* Total breakdown */}
                 {orderProducts.length > 0 && (
                   <div className={styles.totalBreakdown}>
                     <h4>Разбивка на сумата:</h4>
                     <div className={styles.breakdownRow}>
                       <span>Продукти:</span>
                       <span>{(() => {
                         const productTotal = orderProducts.reduce((sum, product) => sum + (parseFloat(product.price) * product.quantity), 0);
                         return `${productTotal.toFixed(2)} лв`;
                       })()}</span>
                     </div>
                     <div className={styles.breakdownRow}>
                       <span>Аксесоари:</span>
                       <span>{(() => {
                         const accessoryTotal = orderProducts.reduce((sum, product) => {
                           if (product.accessories && Array.isArray(product.accessories)) {
                             return sum + product.accessories.reduce((accSum, acc) => accSum + ((acc.price || 0) * (acc.quantity || 1)), 0);
                           }
                           return sum;
                         }, 0);
                         return `${accessoryTotal.toFixed(2)} лв`;
                       })()}</span>
                     </div>
                     <div className={styles.breakdownRow}>
                       <span>Инсталация:</span>
                       <span>{(() => {
                         const installationTotal = orderProducts.reduce((sum, product) => {
                           if (product.includes_installation) {
                             return sum + (300 * product.quantity);
                           }
                           return sum;
                         }, 0);
                         return `${installationTotal.toFixed(2)} лв`;
                       })()}</span>
                     </div>
                     <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
                       <strong>Общо:</strong>
                       <strong>{(() => {
                         const productTotal = orderProducts.reduce((sum, product) => sum + (parseFloat(product.price) * product.quantity), 0);
                         const accessoryTotal = orderProducts.reduce((sum, product) => {
                           if (product.accessories && Array.isArray(product.accessories)) {
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
                         const calculatedTotal = productTotal + accessoryTotal + installationTotal;
                         return `${calculatedTotal.toFixed(2)} лв`;
                       })()}</strong>
                     </div>
                   </div>
                 )}
               </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeDetailsModal} className={styles.closeModalButton}>
                Затвори
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 