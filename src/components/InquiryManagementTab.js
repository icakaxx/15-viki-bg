import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';

const ADMIN_ID = 1; // Default admin ID

export default function InquiryManagementTab() {
  const { t } = useTranslation('common');
  
  // Debug translations
  console.log('🔍 Translation debug:', {
    title: t('inquiryManagement.title'),
    tabTitle: t('inquiryManagement.tabTitle'),
    totalInquiries: t('inquiryManagement.overview.totalInquiries'),
    testKey: t('admin.header.title') // Test if other translations work
  });
  
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
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
      } else {
        showToast(t('inquiryManagement.messages.error.updateFailed'));
      }
    } catch (err) {
      showToast(t('inquiryManagement.messages.error.updateFailed'));
    }
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
    <div style={{ padding: '1rem' }}>
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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          {t('inquiryManagement.title') || 'Inquiry Management (Fallback)'}
        </h1>
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
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px' }}
        >
          <option value="all">{t('inquiryManagement.filters.all')}</option>
          <option value="new">{t('inquiryManagement.filters.new')}</option>
          <option value="read">{t('inquiryManagement.filters.unread')}</option>
          <option value="responded">{t('inquiryManagement.filters.responded')}</option>
          <option value="archived">{t('inquiryManagement.filters.archived')}</option>
        </select>

        <select
          value={filters.inquiryType}
          onChange={(e) => handleFilterChange('inquiryType', e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px' }}
        >
          <option value="all">{t('inquiryManagement.filters.byType')}</option>
          <option value="residential">{t('inquiryManagement.filters.types.residential')}</option>
          <option value="commercial">{t('inquiryManagement.filters.types.commercial')}</option>
          <option value="industrial">{t('inquiryManagement.filters.types.industrial')}</option>
          <option value="service">{t('inquiryManagement.filters.types.service')}</option>
          <option value="consultation">{t('inquiryManagement.filters.types.consultation')}</option>
          <option value="other">{t('inquiryManagement.filters.types.other')}</option>
        </select>

        <input
          type="text"
          placeholder={t('inquiryManagement.search.placeholder')}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', minWidth: '200px' }}
        />

        <button
          onClick={fetchInquiries}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {t('admin.orders.refresh')}
        </button>
      </div>

      {/* Inquiries Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                {t('inquiryManagement.table.columns.dateTime')}
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                {t('inquiryManagement.table.columns.customerName')}
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                {t('inquiryManagement.table.columns.email')}
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                {t('inquiryManagement.table.columns.phone')}
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                {t('inquiryManagement.table.columns.inquiryType')}
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                {t('inquiryManagement.table.columns.status')}
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                {t('inquiryManagement.table.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map(inquiry => (
              <tr key={inquiry.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '1rem' }}>
                  {formatDate(inquiry.created_at)}
                </td>
                <td style={{ padding: '1rem' }}>
                  {inquiry.full_name}
                </td>
                <td style={{ padding: '1rem' }}>
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
                <td style={{ padding: '1rem' }}>
                  {inquiry.phone || '-'}
                </td>
                <td style={{ padding: '1rem' }}>
                  {inquiry.inquiry_type}
                </td>
                <td style={{ padding: '1rem' }}>
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
                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => showInquiryDetails(inquiry)}
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      marginRight: '0.5rem'
                    }}
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
                        borderRadius: '4px'
                      }}
                    >
                      {t('inquiryManagement.table.actions.markAsRead')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          marginTop: '2rem' 
        }}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: pagination.page === 1 ? '#6c757d' : '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          <span style={{ padding: '0.5rem 1rem' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: pagination.page === pagination.totalPages ? '#6c757d' : '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
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
                    value={selectedInquiry.status}
                    onChange={(e) => updateInquiryStatus(selectedInquiry.id, e.target.value)}
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
                    value={selectedInquiry.admin_notes || ''}
                    onChange={(e) => updateInquiryStatus(selectedInquiry.id, selectedInquiry.status, e.target.value)}
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

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => updateInquiryStatus(selectedInquiry.id, 'read')}
                    disabled={selectedInquiry.status === 'read'}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: selectedInquiry.status === 'read' ? '#6c757d' : '#ffc107', 
                      color: selectedInquiry.status === 'read' ? 'white' : '#212529', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: selectedInquiry.status === 'read' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {t('inquiryManagement.detailView.actions.markAsRead')}
                  </button>
                  
                  <button
                    onClick={() => updateInquiryStatus(selectedInquiry.id, 'responded')}
                    disabled={selectedInquiry.status === 'responded'}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: selectedInquiry.status === 'responded' ? '#6c757d' : '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: selectedInquiry.status === 'responded' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {t('inquiryManagement.detailView.actions.sendResponse')}
                  </button>
                  
                  <button
                    onClick={() => updateInquiryStatus(selectedInquiry.id, 'archived')}
                    disabled={selectedInquiry.status === 'archived'}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: selectedInquiry.status === 'archived' ? '#6c757d' : '#6c757d', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: selectedInquiry.status === 'archived' ? 'not-allowed' : 'pointer'
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