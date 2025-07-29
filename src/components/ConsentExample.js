import React, { useState } from 'react';
import ConsentFormWrapper from './ConsentFormWrapper';
import { useConsent } from './ConsentProvider';
import useFormConsent from '../lib/useFormConsent';
import styles from '../styles/Component Styles/ConsentExample.module.css';

const ConsentExample = () => {
  const { hasConsent, clearConsent } = useConsent();
  const {
    validateConsent,
    getSubmitButtonProps,
    getConsentErrorMessage,
    clearConsentError
  } = useFormConsent();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitStatus('success');
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  const handleSubmitWithConsent = validateConsent(handleSubmit);

  return (
    <div className={styles.exampleContainer}>
      <h2>Пример за използване на системата за съгласие</h2>
      
      {/* Consent Status Display */}
      <div className={styles.statusSection}>
        <h3>Статус на съгласието</h3>
        <div className={styles.statusCard}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Съгласие дадено:</span>
            <span className={`${styles.statusValue} ${hasConsent ? styles.positive : styles.negative}`}>
              {hasConsent ? 'Да' : 'Не'}
            </span>
          </div>
          <button
            onClick={clearConsent}
            className={styles.clearButton}
            disabled={!hasConsent}
          >
            Изчисти съгласие
          </button>
        </div>
      </div>

      {/* Form with Consent Wrapper */}
      <div className={styles.formSection}>
        <h3>Форма с проверка за съгласие</h3>
        <ConsentFormWrapper>
          <form onSubmit={handleSubmitWithConsent} className={styles.exampleForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Име *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Имейл *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Съобщение *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="4"
                className={styles.formTextarea}
              />
            </div>

            {getConsentErrorMessage()}

            {submitStatus === 'success' && (
              <div className={styles.successMessage}>
                ✅ Формата е изпратена успешно!
              </div>
            )}

            <button
              type="submit"
              {...getSubmitButtonProps(isSubmitting)}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Изпращане...' : 'Изпрати'}
            </button>
          </form>
        </ConsentFormWrapper>
      </div>

      {/* Manual Consent Check Example */}
      <div className={styles.manualSection}>
        <h3>Ръчна проверка за съгласие</h3>
        <div className={styles.manualExample}>
          <p>Този пример показва как да проверите съгласието ръчно:</p>
          <pre className={styles.codeExample}>
{`const { hasConsent } = useConsent();

const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!hasConsent) {
    alert('Трябва да приемете условията първо!');
    return;
  }
  
  // Продължете с изпращането
};`}
          </pre>
        </div>
      </div>

      {/* Best Practices */}
      <div className={styles.practicesSection}>
        <h3>Добри практики</h3>
        <ul className={styles.practicesList}>
          <li>✅ Винаги използвайте ConsentFormWrapper за форми</li>
          <li>✅ Проверявайте съгласието преди изпращане</li>
          <li>✅ Показвайте ясни съобщения за грешки</li>
          <li>✅ Използвайте useFormConsent за по-сложни случаи</li>
          <li>✅ Тествайте без и със съгласие</li>
        </ul>
      </div>
    </div>
  );
};

export default ConsentExample; 