import React, { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Page Styles/Products.module.css';
import inquiryStyles from '../styles/Page Styles/InquiryPage.module.css';
import ConsentFormWrapper from '../components/ConsentFormWrapper';
import { useConsent } from '../components/ConsentProvider';

// Fixed Link import issue
const InquiryPage = () => {
  const { t } = useTranslation('common');
  const { hasConsent } = useConsent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: '',
    budget: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check consent before allowing form submission
    if (!hasConsent) {
      setSubmitStatus('consent_required');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('/api/submit-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.name,
          emailAddress: formData.email,
          phone: formData.phone,
          companyOrganization: formData.company,
          inquiryType: formData.inquiryType,
          budget: formData.budget,
          message: formData.message
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          inquiryType: '',
          budget: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inquiryTypes = [
    t('inquiryPage.form.types.residential'),
    t('inquiryPage.form.types.commercial'), 
    t('inquiryPage.form.types.industrial'),
    t('inquiryPage.form.types.service'),
    t('inquiryPage.form.types.consultation'),
    t('inquiryPage.form.types.other')
  ];

  const budgetRanges = [
    t('inquiryPage.form.budgetRanges.under1000'),
    t('inquiryPage.form.budgetRanges.1000to3000'),
    t('inquiryPage.form.budgetRanges.3000to5000'),
    t('inquiryPage.form.budgetRanges.5000to10000'),
    t('inquiryPage.form.budgetRanges.over10000'),
    t('inquiryPage.form.budgetRanges.unsure')
  ];

  return (
    <>
      <Head>
        <title>{`${t('inquiryPage.title')} - ${t('metaTitle')}`}</title>
        <meta name="description" content={t('inquiryPage.metaDescription')} />
        <meta name="robots" content="index, follow" />
      </Head>
      
      <div className={styles.container}>
       
        {/* Hero Section */}
        <section style={{ marginBottom: '3rem', textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
            {t('inquiryPage.hero.title')}
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
            {t('inquiryPage.hero.subtitle')}
          </p>
        </section>

        <div className={inquiryStyles.inquiryMainGrid}>
          {/* Contact Form */}
          <ConsentFormWrapper>
            <section style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e0e0e0'
            }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: '#333' }}>{t('inquiryPage.form.title')}</h2>
              
              {submitStatus === 'success' && (
                <div style={{
                  background: '#d4edda',
                  border: '1px solid #c3e6cb',
                  color: '#155724',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '2rem'
                }}>
                  ✅ {t('inquiryPage.form.success')}
                </div>
              )}

              {submitStatus === 'consent_required' && (
                <div style={{
                  background: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  color: '#856404',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '2rem'
                }}>
                  ⚠️ За да изпратите запитването, трябва първо да приемете общите условия.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Grid for first 6 fields */}
                <div className={inquiryStyles.inquiryFormGrid}>
                  {/* Row 1: Full Name + Email */}
                  <div>
                    <label className={inquiryStyles.inquiryLabel}>
                      {t('inquiryPage.form.name')} {t('inquiryPage.form.required')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={inquiryStyles.inquiryInput}
                    />
                  </div>
                  <div>
                    <label className={inquiryStyles.inquiryLabel}>
                      {t('inquiryPage.form.email')} {t('inquiryPage.form.required')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={inquiryStyles.inquiryInput}
                    />
                  </div>
                  {/* Row 2: Phone + Company */}
                  <div>
                    <label className={inquiryStyles.inquiryLabel}>
                      {t('inquiryPage.form.phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={inquiryStyles.inquiryInput}
                    />
                  </div>
                  <div>
                    <label className={inquiryStyles.inquiryLabel}>
                      {t('inquiryPage.form.company')}
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className={inquiryStyles.inquiryInput}
                    />
                  </div>
                  {/* Row 3: Inquiry Type + Budget */}
                  <div>
                    <label className={inquiryStyles.inquiryLabel}>
                      {t('inquiryPage.form.inquiryType')} {t('inquiryPage.form.required')}
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      required
                      className={inquiryStyles.inquiryInput}
                    >
                      <option value="">{t('inquiryPage.form.selectInquiryType')}</option>
                      {inquiryTypes.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={inquiryStyles.inquiryLabel}>
                      {t('inquiryPage.form.budget')}
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className={inquiryStyles.inquiryInput}
                    >
                      <option value="">{t('inquiryPage.form.selectBudget')}</option>
                      {budgetRanges.map((range, index) => (
                        <option key={index} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message field - full width */}
                <div style={{ marginTop: '1.5rem' }}>
                  <label className={inquiryStyles.inquiryLabel}>
                    {t('inquiryPage.form.message')} {t('inquiryPage.form.required')}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    className={inquiryStyles.inquiryInput}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !hasConsent}
                  style={{
                    background: hasConsent ? 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)' : '#ccc',
                    color: 'white',
                    padding: '1rem 2rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: hasConsent ? 'pointer' : 'not-allowed',
                    marginTop: '2rem',
                    width: '100%',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isSubmitting ? t('inquiryPage.form.submitting') : t('inquiryPage.form.submit')}
                </button>
                {submitStatus === 'success' && (
                  <div className={inquiryStyles.inquirySuccess}>
                    ✅ {t('inquiryPage.form.success')}
                  </div>
                )}
              </form>
            </section>
          </ConsentFormWrapper>

          {/* Sidebar Info: wrap contact and why choose us */}
          <div className={inquiryStyles.inquirySidebarCol}>
            {/* Contact Info */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e0e0e0',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#333' }}>{t('inquiryPage.contact.title')}</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📞</span>
                  <strong>{t('inquiryPage.contact.phone')}:</strong>
                </div>
                <p style={{ margin: 0, color: '#666', paddingLeft: '1.7rem' }}>+359 888 123 456</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>✉️</span>
                  <strong>{t('inquiryPage.contact.email')}:</strong>
                </div>
                <p style={{ margin: 0, color: '#666', paddingLeft: '1.7rem' }}>info@bgviki15.bg</p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🕐</span>
                  <strong>{t('inquiryPage.contact.hours')}:</strong>
                </div>
                <p style={{ margin: 0, color: '#666', paddingLeft: '1.7rem' }}>
                  {t('inquiryPage.contact.hoursDetails')}
                </p>
              </div>
            </div>

            {/* Why Choose Us */}
            <div style={{
              background: 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('inquiryPage.whyChooseUs.title')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>{t('inquiryPage.whyChooseUs.experience')}</span>
                </li>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>{t('inquiryPage.whyChooseUs.certified')}</span>
                </li>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>{t('inquiryPage.whyChooseUs.freeConsultation')}</span>
                </li>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>{t('inquiryPage.whyChooseUs.warranty')}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>{t('inquiryPage.whyChooseUs.competitive')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section style={{
          background: '#f8f9fa',
          padding: '3rem 2rem',
          borderRadius: '12px',
          textAlign: 'center',
          marginTop: '3rem'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#333' }}>
            {t('inquiryPage.productsCta.title')}
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
            {t('inquiryPage.productsCta.subtitle')}
          </p>
          <a href="/buy" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            {t('inquiryPage.productsCta.button')}
          </a>
        </section>
      </div>
    </>
  );
};

export async function getStaticProps({ locale }) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  
  return {
    props: {
      ...(await serverSideTranslations(locale || 'bg', ['common'])),
    },
  };
}

export default InquiryPage; 