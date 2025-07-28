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

  // Placeholder states for future filters
  const [dateRange, setDateRange] = useState([null, null]);
  const [productType, setProductType] = useState('');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [page, search, sortBy, sortOrder]);

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
        <div className={styles.filterGroup}>
          {/* Date range picker placeholder */}
          <input 
            type="text" 
            placeholder={t('admin.orders.history.dateRangePlaceholder')} 
            disabled 
            className={styles.searchInput}
            style={{ width: '140px' }}
          />
        </div>
        <div className={styles.filterGroup}>
          {/* Product type dropdown placeholder */}
          <select 
            value={productType} 
            onChange={e => setProductType(e.target.value)} 
            disabled 
            className={styles.statusFilter}
            style={{ width: '140px' }}
          >
            <option value="">{t('admin.orders.history.productTypePlaceholder')}</option>
          </select>
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
                  <tr key={order.id} className={styles.orderRow}>
                    <td>{formatDate(order.installation_date)}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.customer_phone}</td>
                    <td>{order.products_count}</td>
                    <td>{(order.total_price_bgn || 0).toFixed(2)} лв / {(order.total_price_eur || 0).toFixed(2)} €</td>
                    <td>
                      {/* Actions placeholder */}
                      <button disabled style={{ opacity: 0.5 }} className={styles.viewButton}>
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
              <div key={order.id} className={styles.mobileOrderCard}>
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
                  <button disabled style={{ opacity: 0.5 }} className={styles.viewButton}>
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
    </div>
  );
} 