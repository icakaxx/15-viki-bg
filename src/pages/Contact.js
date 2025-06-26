import React, { useState, useRef } from "react";
import styles from '@/styles/Page Styles/Contact.module.css';
import { FaSnowflake, FaFire, FaVideo } from 'react-icons/fa';
import { sendLongContactForm } from "@/lib/api"
import {  useToast } from "@chakra-ui/react"

const Contact = () => {
  const [selected, setSelected] = useState('');
  const formRef = useRef(null);
  const [formValues, setFormValues] = useState({
    email: '',
    phone: '',
    roomSize: '',
    roomType: '',
    insulation: '',
    exposure: '',
    mountType: '',
    heatingType: '',
    targetTemp: '',
    extraField1: '',
    extraField2: '',
  });
  const [formState, setFormState] = useState({ isLoading: false, error: null });
  const [touched, setTouched] = useState({});
  const initState = { isLoading: false, error: null };
  const toast = useToast()

  const handleSelect = (value) => {
    setSelected(value);
    setTimeout(() => {
      const top = formRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: top - 80, behavior: 'smooth' });
    }, 100);
  };

  const onSubmit = async () => {
    setFormState(prev => ({ ...prev, isLoading: true }));
    try {
      await sendLongContactForm(formValues);
      setTouched({});
      setFormState(initState);
      setFormValues({
        email: '',
        phone: '',
        roomSize: '',
        roomType: '',
        insulation: '',
        exposure: '',
        mountType: '',
        heatingType: '',
        targetTemp: '',
        extraField1: '',
        extraField2: '',
      });
      toast({
        title: "Заявката е успешна!/ Successful Request",
        status: 'success',
        duration: 2000,
        position: 'top'
      })
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };

  const renderFields = () => {
    if (selected === 'klimatici') {
      return (
        <>
          <div className={styles.floatingInput}>
            <input
              type="number"
              placeholder=" "
              required
              value={formValues.roomSize}
              onChange={e => setFormValues({ ...formValues, roomSize: e.target.value })}
            />
            <label>Колко кв.м. е помещението ви?</label>
          </div>

          <div className={styles.floatingInput}>
            <select
              required
              value={formValues.roomType}
              onChange={e => setFormValues({ ...formValues, roomType: e.target.value })}
            >
              <option value="" disabled></option>
              <option>Спалня</option>
              <option>Кухня</option>
              <option>Всекидневна</option>
              <option>Баня</option>
              <option>Офис</option>
            </select>
            <label>Вид помещение</label>
          </div>

          <div className={styles.floatingInput}>
            <select
              required
              value={formValues.insulation}
              onChange={e => setFormValues({ ...formValues, insulation: e.target.value })}
            >
              <option value="" disabled></option>
              <option>Да</option>
              <option>Не</option>
            </select>
            <label>Има ли изолация</label>
          </div>

          <div className={styles.floatingInput}>
            <select
              required
              value={formValues.exposure}
              onChange={e => setFormValues({ ...formValues, exposure: e.target.value })}
            >
              <option value="" disabled></option>
              <option>Източно</option>
              <option>Западно</option>
              <option>Южно</option>
              <option>Северно</option>
              <option>Не съм сигурен</option>
            </select>
            <label>С какво изложение е помещението</label>
          </div>

          <div className={styles.floatingInput}>
            <select
              required
              value={formValues.mountType}
              onChange={e => setFormValues({ ...formValues, mountType: e.target.value })}
            >
              <option value="" disabled></option>
              <option>Стена</option>
              <option>Таван</option>
              <option>Не съм сигурен</option>
            </select>
            <label>Имате ли предпочитание за вид монтаж?</label>
          </div>

          <div className={styles.floatingInput}>
            <select
              required
              value={formValues.heatingType}
              onChange={e => setFormValues({ ...formValues, heatingType: e.target.value })}
            >
              <option value="" disabled></option>
              <option>Основно</option>
              <option>Допълнително</option>
            </select>
            <label>Основно или допълнително отопление?</label>
          </div>

          <div className={styles.floatingInput}>
            <input
              type="number"
              placeholder=" "
              required
              value={formValues.targetTemp}
              onChange={e => setFormValues({ ...formValues, targetTemp: e.target.value })}
            />
            <label>Каква температура желаете да поддържа?</label>
          </div>
        </>
      );
    }
    if (selected === 'heatpump' || selected === 'camera') {
      return (
        <>
          <div className={styles.floatingInput}>
            <input
              placeholder=" "
              required
              value={formValues.extraField1}
              onChange={e => setFormValues({ ...formValues, extraField1: e.target.value })}
            />
            <label>Допълнително поле 1</label>
          </div>
          <div className={styles.floatingInput}>
            <input
              placeholder=" "
              required
              value={formValues.extraField2}
              onChange={e => setFormValues({ ...formValues, extraField2: e.target.value })}
            />
            <label>Допълнително поле 2</label>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.options}>
        <div
          onClick={() => handleSelect('klimatici')}
          className={`${styles.option} ${selected === 'klimatici' ? styles.active : ''}`}
        >
          <FaSnowflake size={30} />
          <span>Климатици</span>
        </div>
        <div
          onClick={() => handleSelect('heatpump')}
          className={`${styles.option} ${selected === 'heatpump' ? styles.active : ''}`}
        >
          <FaFire size={30} />
          <span>Термопомпи</span>
        </div>
        <div
          onClick={() => handleSelect('camera')}
          className={`${styles.option} ${selected === 'camera' ? styles.active : ''}`}
        >
          <FaVideo size={30} />
          <span>Камери</span>
        </div>
      </div>
      <div ref={formRef} className={styles.contactDetails}>
        {selected && (
          <div className={styles.formWrapper}>
            <form>
              <div className={styles.floatingInputFullWidth}>
                <input
                  type="email"
                  placeholder=" "
                  required
                  value={formValues.email}
                  onChange={e => setFormValues({ ...formValues, email: e.target.value })}
                />
                <label>Email</label>
              </div>

              <div className={styles.floatingInputFullWidth}>
                <input
                  type="tel"
                  placeholder=" "
                  pattern="[\d+]+"
                  title="Моля, въведете само цифри и +"
                  required
                  value={formValues.phone}
                  onChange={e => setFormValues({ ...formValues, phone: e.target.value })}
                />
                <label>Телефон</label>
              </div>

              {renderFields()}<br />
              <button type="button" onClick={onSubmit} disabled={formState.isLoading}>
                {formState.isLoading ? 'Изпращане...' : 'Изпрати'}
              </button>
              {formState.error && <p style={{ color: 'red' }}>{formState.error}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
