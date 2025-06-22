import { useEffect, useState, useRef } from 'react';
import styles from '../styles/Page Styles/Administration.module.css';
import { createClient } from '@supabase/supabase-js';

const fetchProducts = async () => {
    const res = await fetch('/api/get-products');
    const data = await res.json();
    return data.products || [];
};

const AdministrationProducts = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        Brand: '', Model: '', Colour: '', Type: '',
        CapacityBTU: '', EnergyRating: '', Price: '', PreviousPrice: '', ImageURL: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editProductID, setEditProductID] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const formRef = useRef(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const fileInputRef = useRef(null);
    const [imageFilename, setImageFilename] = useState('');
    const [filters, setFilters] = useState({
        Brand: '', Model: '', Colour: '', Type: '',
        CapacityBTU: '', EnergyRating: '', Price: '', PreviousPrice: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const data = await fetchProducts();
        setProducts(data);
    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };
    const handleClearFilters = () => {
        setFilters({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditProductID(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            Brand: '',
            Model: '',
            Colour: '',
            Type: '',
            CapacityBTU: '',
            EnergyRating: '',
            Price: '',
            PreviousPrice: '',
            ImageURL: '',
        });
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                const nextDirection = prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc';
                return { key: nextDirection ? key : null, direction: nextDirection };
            }
            return { key, direction: 'asc' };
        });
    };

    const filteredProducts = products.filter((p) =>
        Object.entries(filters).every(([key, value]) =>
            value === '' ? true : String(p[key]).toLowerCase().includes(value.toLowerCase())
        )
    );

    const sortedProducts = [...filteredProducts];

    if (sortConfig.key && sortConfig.direction) {
        sortedProducts.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal == null) return 1;
            if (bVal == null) return -1;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return sortConfig.direction === 'asc'
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    }

    const handleAdd = async () => {
        const res = await fetch('/api/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            await loadProducts();
            resetForm();
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setImageFilename('');

    };

    const handleEdit = (product) => {
        setIsEditing(true);
        setEditProductID(product.ProductID);
        setFormData({ ...product });
        formRef.current.scrollIntoView({ behavior: 'smooth' });

    };

    const handleSaveEdit = async () => {
        const res = await fetch('/api/edit-product', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ProductID: editProductID, ...formData }),
        });
        if (res.ok) {
            setIsEditing(false);
            setEditProductID(null);
            resetForm();
            await loadProducts();
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setImageFilename('');

    };

    const handleDelete = async (ProductID) => {
        const res = await fetch('/api/delete-product', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ProductID }),
        });
        if (res.ok) await loadProducts();
    };

    const handleLogin = () => {
        const envUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
        const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        if (usernameInput === envUsername && passwordInput === envPassword) {
            setIsAuthenticated(true);
        } else {
            alert('Грешни данни за вход');
        }
    };

  
    const handleImageUpload = async (e) => {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  const file = e.target.files[0];
  if (!file) return;

  const { data, error } = await supabase
    .storage
    .from('product-images')
    .upload(`product-${Date.now()}`, file);

  if (error) {
    console.error('Image upload error:', error);
    return;
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${data.path}`;
  setFormData((prev) => ({ ...prev, ImageURL: imageUrl }));
};


    if (!isAuthenticated) {
        return (
            <div className={styles.loginContainer}>
                <h1>Вход за Админ Панел</h1>
                <input
                    type="text"
                    placeholder="Потребителско Име"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Парола"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                />
                <button onClick={handleLogin}>Вход</button>
            </div>
        );
    }

    return (
        <div className={styles.adminPage}>
            <h1 className={styles.heading}>Управление на Продукти</h1>

            <div className={styles.formSection} ref={formRef}>
                <h2>{isEditing ? 'Редактирай Продукт' : 'Добави Нов Продукт'}</h2>
                {[
                    { key: 'Brand', label: 'Марка' },
                    { key: 'Model', label: 'Модел' },
                    { key: 'Colour', label: 'Цвят' },
                    { key: 'Type', label: 'Тип' },
                    { key: 'CapacityBTU', label: 'Капацитет (BTU)' },
                    { key: 'EnergyRating', label: 'Енергиен Клас' },
                    { key: 'Price', label: 'Цена (€)' },
                    { key: 'PreviousPrice', label: 'Предишна Цена (€)' },
                ].map(({ key, label }) => (
                    <label key={key}>
                        {label}:
                        <input
                            type={key === 'Price' || key === 'CapacityBTU' ? 'number' : 'text'}
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                        />
                    </label>
                ))}
                <label>
                    Снимка:
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} />
                </label>
                {formData.ImageURL && (
                    <img src={formData.ImageURL} alt="Product" style={{ maxWidth: '100px' }} />
                )}



                <br />

                <button onClick={isEditing ? handleSaveEdit : handleAdd}>
                    {isEditing ? 'Запази' : 'Добави'}
                </button>

                {isEditing && (
                    <button onClick={handleCancelEdit} className={styles.cancelButton}>
                        Отказ
                    </button>
                )}
            </div>
            <div className={styles.bookingsList}>
                <h2>Продукти</h2>
                <div className={styles.filters}>
                    {[
                        { key: 'Brand', label: 'Марка' },
                        { key: 'Model', label: 'Модел' },
                        { key: 'Colour', label: 'Цвят' },
                        { key: 'Type', label: 'Тип' },
                        { key: 'CapacityBTU', label: 'Капацитет (BTU)' },
                        { key: 'EnergyRating', label: 'Енергиен Клас' },
                        { key: 'Price', label: 'Цена (€)' },
                        { key: 'PreviousPrice', label: 'Стара Цена (€)' },
                    ].map(({ key, label }) => (
                        <div key={key} className={styles.inputGroup}>
                            <input
                                type="text"
                                id={key}
                                value={filters[key] || ''}
                                onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
                                required
                            />
                            <label htmlFor={key}>{label}</label>
                        </div>
                    ))}
                </div>
                <button onClick={handleClearFilters} className={styles.clearButton}>
                    Изчисти Филтрите
                </button>

                <table>
                    <thead>
                        <tr>
                            <th className={styles.sortable} onClick={() => handleSort('Brand')}>
                                Марка {sortConfig.key === 'Brand' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
                            </th>
                            <th className={styles.sortable} onClick={() => handleSort('Model')}>
                                Модел {sortConfig.key === 'Model' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
                            </th>
                            <th className={styles.sortable} onClick={() => handleSort('Colour')}>
                                Цвят {sortConfig.key === 'Colour' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
                            </th>
                            <th className={styles.sortable} onClick={() => handleSort('Type')}>
                                Тип {sortConfig.key === 'Type' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
                            </th>
                            <th className={styles.sortable} onClick={() => handleSort('CapacityBTU')}>
                                BTU {sortConfig.key === 'CapacityBTU' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
                            </th>
                            <th className={styles.sortable} onClick={() => handleSort('EnergyRating')}>
                                Клас {sortConfig.key === 'EnergyRating' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
                            </th>
                            <th className={styles.sortable} onClick={() => handleSort('Price')}>
                                Цена (€) {sortConfig.key === 'Price' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
                            </th>
                            <th className={styles.sortable} onClick={() => handleSort('PreviousPrice')}>
                                Стара Цена (€) {sortConfig.key === 'PreviousPrice' && (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '')}
                            </th>
                            <th>Снимка</th>
                            <th>Действия</th>

                        </tr>
                    </thead>
                    <tbody>
                        {sortedProducts.map((p) => (
                            <tr key={p.ProductID}>
                                <td>{p.Brand}</td>
                                <td>{p.Model}</td>
                                <td>{p.Colour}</td>
                                <td>{p.Type}</td>
                                <td>{p.CapacityBTU}</td>
                                <td>{p.EnergyRating}</td>
                                <td>{p.Price}</td>
                                <td>{p.PreviousPrice}</td>
                                <td>{p.ImageURL && <img src={p.ImageURL} style={{ maxWidth: '60px' }} />}</td>
                                <td>
                                    <button onClick={() => handleEdit(p)}>Редактирай</button>
                                    <button onClick={() => handleDelete(p.ProductID)}>Изтрий</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div ></div>
    );
};

export default AdministrationProducts;

// export async function getStaticProps({ locale }) {
//     return {
//         props: {
//             ...(await serverSideTranslations(locale, ['common'])),
//         },
//     };
// }
