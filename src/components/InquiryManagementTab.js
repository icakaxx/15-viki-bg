import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Page Styles/Administration.module.css';

const ADMIN_ID = 1; // Default admin ID

export default function InquiryManagementTab() {
  const { t } = useTranslation('common');  
  
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [pendingChanges, setPendingChanges] = useState({
    status: null,
    adminNotes: null
  });
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'all',
    inquiryType: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Fetch inquiries
  async function fetchInquiries() {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`/api/get-inquiries?${params}`);
      const data = await response.json();

      if (response.ok) {
        setInquiries(data.inquiries || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      } else {
        setError(data.message || 'Failed to load inquiries');
      }
    } catch (err) {
      setError('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }

  // Load inquiries on component mount and filter changes
  useEffect(() => {
    fetchInquiries();
  }, [filters, pagination.page]);

  // Show toast message
  function showToast(message) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 5000);
  }

  // Handle filter changes
  function handleFilterChange(filterType, value) {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }

  // Handle pagination
  function handlePageChange(newPage) {
    setPagination(prev => ({ ...prev, page: newPage }));
  }

  // Show inquiry details
  function showInquiryDetails(inquiry) {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
    setPendingChanges({
      status: inquiry.status,
      adminNotes: inquiry.admin_notes || ''
    });
  }

  // Update inquiry status
  async function updateInquiryStatus(inquiryId, newStatus, adminNotes = null) {
    try {
      const response = await fetch('/api/update-inquiry-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inquiryId,
          status: newStatus,
          adminNotes,
          adminId: ADMIN_ID
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast(t('inquiryManagement.messages.success.statusUpdated'));
        fetchInquiries(); // Refresh the list
        if (selectedInquiry && selectedInquiry.id === inquiryId) {
          setSelectedInquiry(prev => ({ ...prev, status: newStatus, admin_notes: adminNotes }));
        }
        // Reset pending changes after successful update
        setPendingChanges({
          status: newStatus,
          adminNotes: adminNotes || ''
        });
      } else {
        showToast(t('inquiryManagement.messages.error.updateFailed'));
      }
    } catch (err) {
      showToast(t('inquiryManagement.messages.error.updateFailed'));
    }
  }

  // Post inquiry changes
  async function postInquiryChanges() {
    if (!selectedInquiry) return;
    
    await updateInquiryStatus(
      selectedInquiry.id, 
      pendingChanges.status, 
      pendingChanges.adminNotes
    );
  }

  // Get status badge color
  function getStatusColor(status) {
    switch (status) {
      case 'new': return '#dc3545';
      case 'read': return '#ffc107';
      case 'responded': return '#28a745';
      case 'archived': return '#6c757d';
      default: return '#6c757d';
    }
  }

  // Format date
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Copy email to clipboard
  function copyEmail(email) {
    navigator.clipboard.writeText(email);
    showToast('Email copied to clipboard');
  }

  if (loading && inquiries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>{t('inquiryManagement.loading') || 'Loading inquiries...'}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
        <div>{t('inquiryManagement.messages.error.loadFailed')}: {error}</div>
        <button 
          onClick={fetchInquiries}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
        >
          {t('inquiryManagement.search.retry') || 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.ordersManagementSection}>
      {/* Toast Message */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '1rem',
          borderRadius: '4px',
          zIndex: 1000
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className={styles.ordersHeader}>
        <h2>{t('inquiryManagement.title') || 'Inquiry Management (Fallback)'}</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <strong>{t('inquiryManagement.overview.totalInquiries') || 'Total Inquiries'}:</strong> {pagination.total}
          </div>
          <div>
            <strong>{t('inquiryManagement.overview.newInquiries') || 'New Inquiries'}:</strong> {
              inquiries.filter(inq => inq.status === 'new').length
            }
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.ordersFilters}>
        <div className={styles.filterGroup}>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.statusFilter}
          >
            <option value="all">{t('inquiryManagement.filters.all')}</option>
            <option value="new">{t('inquiryManagement.filters.new')}</option>
            <option value="read">{t('inquiryManagement.filters.unread')}</option>
            <option value="responded">{t('inquiryManagement.filters.responded')}</option>
            <option value="archived">{t('inquiryManagement.filters.archived')}</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            value={filters.inquiryType}
            onChange={(e) => handleFilterChange('inquiryType', e.target.value)}
            className={styles.statusFilter}
          >
            <option value="all">{t('inquiryManagement.filters.byType')}</option>
            <option value="residential">{t('inquiryManagement.filters.types.residential')}</option>
            <option value="commercial">{t('inquiryManagement.filters.types.commercial')}</option>
            <option value="industrial">{t('inquiryManagement.filters.types.industrial')}</option>
            <option value="service">{t('inquiryManagement.filters.types.service')}</option>
            <option value="consultation">{t('inquiryManagement.filters.types.consultation')}</option>
            <option value="other">{t('inquiryManagement.filters.types.other')}</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder={t('inquiryManagement.search.placeholder')}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <button
            onClick={fetchInquiries}
            className={styles.refreshButton}
          >
            {t('admin.orders.refresh')}
          </button>
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
                <th>{t('inquiryManagement.table.columns.dateTime')}</th>
                <th>{t('inquiryManagement.table.columns.customerName')}</th>
                <th>{t('inquiryManagement.table.columns.email')}</th>
                <th>{t('inquiryManagement.table.columns.phone')}</th>
                <th>{t('inquiryManagement.table.columns.inquiryType')}</th>
                <th>{t('inquiryManagement.table.columns.status')}</th>
                <th>{t('inquiryManagement.table.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(inquiry => (
                <tr key={inquiry.id} className={styles.orderRow}>
                  <td>{formatDate(inquiry.created_at)}</td>
                  <td>{inquiry.full_name}</td>
                  <td>
                    <button
                      onClick={() => copyEmail(inquiry.email_address)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#007bff', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      title={t('inquiryManagement.table.actions.copyEmail')}
                    >
                      {inquiry.email_address}
                    </button>
                  </td>
                  <td>{inquiry.phone || '-'}</td>
                  <td>{inquiry.inquiry_type}</td>
                  <td>
                    <span style={{
                      backgroundColor: getStatusColor(inquiry.status),
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}>
                      {t(`inquiryManagement.status.${inquiry.status}`)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => showInquiryDetails(inquiry)}
                        className={styles.viewButton}
                      >
                        {t('inquiryManagement.table.actions.viewDetails')}
                      </button>
                      {inquiry.status === 'new' && (
                        <button
                          onClick={() => updateInquiryStatus(inquiry.id, 'read')}
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            backgroundColor: '#ffc107', 
                            color: '#212529', 
                            border: 'none', 
                            borderRadius: '4px',
                            marginLeft: '0.5rem'
                          }}
                        >
                          {t('inquiryManagement.table.actions.markAsRead')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
            🔄 {t('inquiryManagement.loading') || 'Loading inquiries...'}
          </div>
        ) : inquiries.length === 0 ? (
          <div className={styles.emptyCell}>
            {filters.search || filters.status !== 'all' || filters.inquiryType !== 'all' 
              ? t('inquiryManagement.noInquiriesMatchFilters') || 'No inquiries match your filters'
              : t('inquiryManagement.noInquiries') || 'No inquiries found'
            }
          </div>
        ) : (
          <div className={styles.mobileOrdersList}>
            {inquiries.map(inquiry => (
              <div key={inquiry.id} className={styles.mobileOrderCard}>
                <div className={styles.mobileOrderHeader}>
                  <div className={styles.mobileOrderCustomer}>
                    <strong>{inquiry.full_name}</strong>
                    <span className={styles.mobileOrderPhone}>{inquiry.phone || '-'}</span>
                  </div>
                  <span 
                    style={{
                      backgroundColor: getStatusColor(inquiry.status),
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {t(`inquiryManagement.status.${inquiry.status}`)}
                  </span>
                </div>
                
                <div className={styles.mobileOrderDetails}>
                  <div className={styles.mobileOrderInfo}>
                    <span className={styles.mobileOrderLabel}>{t('inquiryManagement.table.columns.email')}:</span>
                    <button
                      onClick={() => copyEmail(inquiry.email_address)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#007bff', 
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '0.875rem'
                      }}
                      title={t('inquiryManagement.table.actions.copyEmail')}
                    >
                      {inquiry.email_address}
                    </button>
                  </div>
                  <div className={styles.mobileOrderInfo}>
                    <span className={styles.mobileOrderLabel}>{t('inquiryManagement.table.columns.inquiryType')}:</span>
                    <span>{inquiry.inquiry_type}</span>
                  </div>
                  <div className={styles.mobileOrderInfo}>
                    <span className={styles.mobileOrderLabel}>{t('inquiryManagement.table.columns.dateTime')}:</span>
                    <span className={styles.mobileOrderDate}>{formatDate(inquiry.created_at)}</span>
                  </div>
                </div>
                
                <div className={styles.mobileOrderActions}>
                  <button
                    onClick={() => showInquiryDetails(inquiry)}
                    className={styles.viewButton}
                  >
                    {t('inquiryManagement.table.actions.viewDetails')}
                  </button>
                  {inquiry.status === 'new' && (
                    <button
                      onClick={() => updateInquiryStatus(inquiry.id, 'read')}
                      style={{ 
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#ffc107', 
                        color: '#212529', 
                        border: 'none', 
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    >
                      {t('inquiryManagement.table.actions.markAsRead')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={styles.paginationButton}
          >
            {t('admin.orders.history.previousPage') || 'Previous'}
          </button>
          
          <span style={{ padding: '0.5rem 1rem' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className={styles.paginationButton}
          >
            {t('admin.orders.history.nextPage') || 'Next'}
          </button>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {showDetailModal && selectedInquiry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>{t('inquiryManagement.detailView.title')}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5rem', 
                  cursor: 'pointer' 
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Customer Information */}
              <div>
                <h3>{t('inquiryManagement.detailView.customerInfo')}</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{t('inquiryManagement.detailView.fields.fullName')}:</strong> {selectedInquiry.full_name}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{t('inquiryManagement.detailView.fields.email')}:</strong> 
                  <button
                    onClick={() => copyEmail(selectedInquiry.email_address)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#007bff', 
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      marginLeft: '0.5rem'
                    }}
                  >
                    {selectedInquiry.email_address}
                  </button>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{t('inquiryManagement.detailView.fields.phone')}:</strong> {selectedInquiry.phone || '-'}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{t('inquiryManagement.detailView.fields.company')}:</strong> {selectedInquiry.company_organization || '-'}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{t('inquiryManagement.detailView.fields.inquiryType')}:</strong> {selectedInquiry.inquiry_type}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{t('inquiryManagement.detailView.fields.budget')}:</strong> {selectedInquiry.budget || '-'}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{t('inquiryManagement.detailView.fields.submittedAt')}:</strong> {formatDate(selectedInquiry.created_at)}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{t('inquiryManagement.detailView.fields.status')}:</strong>
                  <span style={{
                    backgroundColor: getStatusColor(selectedInquiry.status),
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    marginLeft: '0.5rem'
                  }}>
                    {t(`inquiryManagement.status.${selectedInquiry.status}`)}
                  </span>
                </div>
              </div>

              {/* Admin Actions */}
              <div>
                <h3>{t('inquiryManagement.detailView.adminActions')}</h3>
                
                {/* Status Change */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    <strong>{t('inquiryManagement.detailView.actions.changeStatus')}:</strong>
                  </label>
                  <select
                    value={pendingChanges.status}
                    onChange={(e) => setPendingChanges(prev => ({ ...prev, status: e.target.value }))}
                    style={{ padding: '0.5rem', borderRadius: '4px', width: '100%' }}
                  >
                    <option value="new">{t('inquiryManagement.status.new')}</option>
                    <option value="read">{t('inquiryManagement.status.read')}</option>
                    <option value="responded">{t('inquiryManagement.status.responded')}</option>
                    <option value="archived">{t('inquiryManagement.status.archived')}</option>
                  </select>
                </div>

                {/* Admin Notes */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    <strong>{t('inquiryManagement.detailView.actions.addNotes')}:</strong>
                  </label>
                  <textarea
                    value={pendingChanges.adminNotes}
                    onChange={(e) => setPendingChanges(prev => ({ ...prev, adminNotes: e.target.value }))}
                    style={{ 
                      padding: '0.5rem', 
                      borderRadius: '4px', 
                      width: '100%', 
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                    placeholder="Add admin notes..."
                  />
                </div>

                {/* Post Inquiry Button */}
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    onClick={postInquiryChanges}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {t('inquiryManagement.detailView.actions.postInquiry') || 'Post Inquiry'}
                  </button>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setPendingChanges(prev => ({ ...prev, status: 'read' }))}
                    disabled={pendingChanges.status === 'read'}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: pendingChanges.status === 'read' ? '#6c757d' : '#ffc107', 
                      color: pendingChanges.status === 'read' ? 'white' : '#212529', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: pendingChanges.status === 'read' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {t('inquiryManagement.detailView.actions.markAsRead')}
                  </button>
                  
                  <button
                    onClick={() => setPendingChanges(prev => ({ ...prev, status: 'archived' }))}
                    disabled={pendingChanges.status === 'archived'}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: pendingChanges.status === 'archived' ? '#6c757d' : '#6c757d', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: pendingChanges.status === 'archived' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {t('inquiryManagement.detailView.actions.archive')}
                  </button>
                </div>
              </div>
            </div>

            {/* Message */}
            <div style={{ marginTop: '2rem' }}>
              <h3>{t('inquiryManagement.detailView.inquiryDetails')}</h3>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedInquiry.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 