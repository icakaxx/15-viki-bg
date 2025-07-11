import React, { useContext, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { LanguageContext } from '../components/Layout Components/Header';
import styles from '../styles/Page Styles/BuyPage.module.css';

const InquiryPage = () => {
  const { t } = useContext(LanguageContext);
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
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        inquiryType: '',
        budget: '',
        message: ''
      });
    }, 2000);
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
        <h1 className={styles.title}>{t('inquiryPage.title')}</h1>
        
        {/* Hero Section */}
        <section style={{ marginBottom: '3rem', textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
            {t('inquiryPage.hero.title')}
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
            {t('inquiryPage.hero.subtitle')}
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Contact Form */}
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

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    {t('inquiryPage.form.name')} {t('inquiryPage.form.required')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    {t('inquiryPage.form.email')} {t('inquiryPage.form.required')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    {t('inquiryPage.form.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    {t('inquiryPage.form.company')}
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    {t('inquiryPage.form.inquiryType')} {t('inquiryPage.form.required')}
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">{t('inquiryPage.form.selectType')}</option>
                    {inquiryTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                    {t('inquiryPage.form.budget')}
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">{t('inquiryPage.form.selectBudget')}</option>
                    {budgetRanges.map((range, index) => (
                      <option key={index} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  {t('inquiryPage.form.message')} {t('inquiryPage.form.required')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder={t('inquiryPage.form.messagePlaceholder')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? '#ccc' : 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  width: '100%'
                }}
              >
                {isSubmitting ? t('inquiryPage.form.submitting') : t('inquiryPage.form.submit')}
              </button>
            </form>
          </section>

          {/* Sidebar Info */}
          <section>
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
          </section>
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
          <Link href="/buy" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            {t('inquiryPage.productsCta.button')}
          </Link>
        </section>
      </div>
    </>
  );
};

export default InquiryPage; 