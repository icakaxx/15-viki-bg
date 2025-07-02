import React, { useEffect, useState, useContext } from 'react';
import { LanguageContext } from './Layout Components/Header';

const PAGE_SIZE = 20;

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('bg-BG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminOrderHistoryTab() {
  const { t } = useContext(LanguageContext);
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
      const res = await fetch(`/api/get-installed-orders?${params}`);
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
    <div style={{ padding: '2rem' }}>
      <h2>{t('admin.orders.history.title')}</h2>
      <p>{t('admin.orders.history.description')}</p>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={t('admin.orders.history.searchPlaceholder')}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, padding: '0.5rem' }}
        />
        {/* Date range picker placeholder */}
        <input type="text" placeholder={t('admin.orders.history.dateRangePlaceholder')} disabled style={{ width: 140 }} />
        {/* Product type dropdown placeholder */}
        <select value={productType} onChange={e => setProductType(e.target.value)} disabled style={{ width: 140 }}>
          <option value="">{t('admin.orders.history.productTypePlaceholder')}</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{t('admin.orders.history.installationDate')}</th>
              <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{t('admin.orders.history.customer')}</th>
              <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{t('admin.orders.history.phone')}</th>
              <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{t('admin.orders.history.products')}</th>
              <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{t('admin.orders.history.total')}</th>
              <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{t('admin.orders.history.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>{t('admin.orders.history.loading')}</td></tr>
            ) : error ? (
              <tr><td colSpan={6} style={{ color: 'red', textAlign: 'center' }}>{error}</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>{t('admin.orders.history.noOrders')}</td></tr>
            ) : orders.map(order => (
              <tr key={order.id}>
                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{formatDate(order.installation_date)}</td>
                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{order.customer_name}</td>
                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{order.customer_phone}</td>
                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{order.products_count}</td>
                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{(order.total_price_bgn || 0).toFixed(2)} лв / {(order.total_price_eur || 0).toFixed(2)} €</td>
                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                  {/* Actions placeholder */}
                  <button disabled style={{ opacity: 0.5 }}>{t('admin.orders.history.detailsButton')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹ {t('admin.orders.history.previousPage')}</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{ fontWeight: p === page ? 'bold' : 'normal', minWidth: 32 }}
            disabled={p === page}
          >
            {p}
          </button>
        ))}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{t('admin.orders.history.nextPage')} ›</button>
      </div>
    </div>
  );
} 