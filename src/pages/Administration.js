import { useEffect, useState, useRef, useContext } from 'react';
import styles from '../styles/Page Styles/Administration.module.css';
import { LanguageContext } from '../components/Layout Components/Header';



const AdministrationProducts = () => {
    const { t } = useContext(LanguageContext);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        brand: '', model: '', colour: '', type: '',
        capacity_btu: '', energy_rating: '', price: '', previous_price: '', image_url: '',
        stock: '0', discount: '0'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editProductId, setEditProductId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');

    // Check authentication status on component mount
    useEffect(() => {
        const authStatus = localStorage.getItem('adminAuthenticated');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
        setIsAuthLoading(false);
    }, []);
    
    // Product management state
    const formRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showArchived, setShowArchived] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('updated_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    
    // NEW: Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // NEW: Form visibility state
    const [showForm, setShowForm] = useState(false);

    // Order management state
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [orderHistory, setOrderHistory] = useState({});
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'

    useEffect(() => {
        if (activeTab === 'products') {
        loadProducts();
        } else if (activeTab === 'orders') {
            loadOrders();
        }
    }, [activeTab, showArchived, searchTerm, sortBy, sortOrder, currentPage, pageSize]);
    
    // Reset to first page when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, showArchived, sortBy, sortOrder]);

    const loadProducts = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const offset = (currentPage - 1) * pageSize;
            const params = new URLSearchParams({
                showArchived: showArchived.toString(),
                search: searchTerm,
                sortBy,
                sortOrder,
                limit: pageSize.toString(),
                offset: offset.toString()
            });
            
            const response = await fetch(`/api/get-products?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                setProducts(data.products || []);
                setTotalProducts(data.total || 0);
                setTotalPages(Math.ceil((data.total || 0) / pageSize));
            } else {
                setError(data.error || 'Failed to load products');
                setProducts([]);
                setTotalProducts(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setError('Failed to load products');
            setProducts([]);
            setTotalProducts(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    // Order management functions
    const loadOrders = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('Admin: Loading orders via API...');
            
            const response = await fetch('/api/get-orders');
            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log('Admin: Orders loaded successfully:', result.orders);
                setOrders(result.orders || []);
            } else {
                console.error('Admin: Failed to load orders:', result.error);
                setError(result.error || 'Failed to load orders');
                setOrders([]);
            }
        } catch (error) {
            console.error('Admin: Error loading orders:', error);
            setError('Failed to load orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        setUpdatingStatus(orderId);
        
        try {
            const response = await fetch('/api/update-order-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderId,
                    newStatus: newStatus,
                    adminId: null, // TODO: Add proper admin authentication
                    notes: `Status changed to ${newStatus} by admin`
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Update local state
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.order_id === orderId 
                            ? { ...order, current_status: newStatus }
                            : order
                    )
                );
                
                // Clear any cached history for this order to force refresh
                setOrderHistory(prev => {
                    const updated = { ...prev };
                    delete updated[orderId];
                    return updated;
                });
                
                console.log(`Order ${orderId} status updated to ${newStatus}`);
                alert(t ? t('admin.orders.statusUpdated') : 'Status updated successfully');
            } else {
                console.error('Failed to update order status:', result.error);
                const errorMsg = t ? t('admin.orders.errors.updateFailed') : 'Failed to update order status';
                alert(`${errorMsg}: ${result.error}`);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            const errorMsg = t ? t('admin.orders.errors.updateFailed') : 'Failed to update order status';
            alert(errorMsg);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const loadOrderHistory = async (orderId) => {
        if (orderHistory[orderId]) {
            return; // Already loaded
        }

        try {
            console.log('Loading order history for order:', orderId);
            
            const response = await fetch(`/api/get-order-history?orderId=${orderId}`);
            const result = await response.json();

            if (response.ok && result.success) {
                console.log(`Successfully loaded ${result.count} history entries for order ${orderId}`);
                setOrderHistory(prev => ({
                    ...prev,
                    [orderId]: result.history || []
                }));
            } else {
                console.error('Error loading order history:', result.error);
                // Set empty history on error
                setOrderHistory(prev => ({
                    ...prev,
                    [orderId]: []
                }));
            }
        } catch (error) {
            console.error('Error loading order history:', error);
            // Set empty history on error
            setOrderHistory(prev => ({
                ...prev,
                [orderId]: []
            }));
        }
    };

    const toggleOrderHistory = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
            loadOrderHistory(orderId);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#6c757d';
            case 'confirmed': return '#007bff';
            case 'installation_booked': return '#fd7e14';
            case 'installed': return '#28a745';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusLabel = (status) => {
        // Try to get translation first
        const translationKey = `admin.orders.status.${status}`;
        const translatedValue = t(translationKey);
        
        // If translation failed (returns the key), use hardcoded fallbacks
        if (translatedValue === translationKey) {
            const fallbacks = {
                'new': 'Нова',
                'confirmed': 'Потвърдена',
                'installation_booked': 'Насрочен монтаж',
                'installed': 'Инсталирана',
                'cancelled': 'Отказана'
            };
            return fallbacks[status] || status;
        }
        
        return translatedValue;
    };

    // Product management helper functions
    const calculateDiscountedPrice = (price, discount) => {
        if (!price || !discount) return price;
        return (parseFloat(price) * (1 - parseFloat(discount) / 100)).toFixed(2);
    };

    const isLowStock = (stock) => {
        return parseInt(stock) < 5;
    };
    
    // NEW: Pagination helper functions
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    
    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };
    
    // NEW: Form visibility helpers
    const showAddForm = () => {
        setShowForm(true);
        setIsEditing(false);
        setEditProductId(null);
        clearForm();
        // Scroll to form after a brief delay to allow rendering
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };
    
    const hideForm = () => {
        setShowForm(false);
        setIsEditing(false);
        setEditProductId(null);
        clearForm();
    };

    const clearForm = () => {
        setFormData({
            brand: '', model: '', colour: '', type: '',
            capacity_btu: '', energy_rating: '', price: '', previous_price: '', image_url: '',
            stock: '0', discount: '0'
        });
        setDuplicateWarning(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setDuplicateWarning(null); // Clear warning when user changes input
    };

    const handleCancelEdit = () => {
        hideForm();
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    const handleAdd = async () => {
        setLoading(true);
        setDuplicateWarning(null);
        
        try {
            const response = await fetch('/api/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
            
            const result = await response.json();
            
            if (response.ok) {
                hideForm();
                await loadProducts();
                alert(t('admin.products.addSuccess'));
            } else if (response.status === 409) {
                // Duplicate product
                setDuplicateWarning(result.message || t('admin.products.duplicateError'));
            } else {
                alert(t('admin.products.addError') + ': ' + (result.error || result.message));
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert(t('admin.products.addError'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setShowForm(true);
        setIsEditing(true);
        setEditProductId(product.ProductID);
        // Map PascalCase API response to lowercase form field names
        setFormData({
            brand: product.Brand || '',
            model: product.Model || '',
            colour: product.Colour || '',
            type: product.Type || '',
            capacity_btu: product.CapacityBTU || '',
            energy_rating: product.EnergyRating || '',
            price: product.Price || '',
            previous_price: product.PreviousPrice || '',
            image_url: product.ImageURL || '',
            stock: product.Stock || '',
            discount: product.Discount || ''
        });
        setDuplicateWarning(null);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSaveEdit = async () => {
        setLoading(true);
        setDuplicateWarning(null);
        
        try {
            const response = await fetch('/api/edit-product', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editProductId, ...formData }),
        });
            
            const result = await response.json();
            
            if (response.ok) {
                hideForm();
                await loadProducts();
                alert(t('admin.products.editSuccess'));
            } else if (response.status === 409) {
                // Duplicate product
                setDuplicateWarning(result.message || t('admin.products.duplicateError'));
            } else {
                alert(t('admin.products.editError') + ': ' + (result.error || result.message));
            }
        } catch (error) {
            console.error('Error editing product:', error);
            alert(t('admin.products.editError'));
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async (productId, productName) => {
        if (!confirm(t('admin.products.confirmArchive').replace('{product}', productName))) {
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await fetch('/api/archive-product', {
                method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: productId }),
            });
            
            const result = await response.json();
            
            if (response.ok) {
                await loadProducts();
                
                // Check if current page is now empty and adjust if needed
                const newTotal = totalProducts - 1;
                const newTotalPages = Math.ceil(newTotal / pageSize);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                }
                
                alert(t('admin.products.archiveSuccess'));
            } else {
                alert(t('admin.products.archiveError') + ': ' + (result.error || result.message));
            }
        } catch (error) {
            console.error('Error archiving product:', error);
            alert(t('admin.products.archiveError'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        const envUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
        const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        if (usernameInput === '1' && passwordInput === '1') {
            setIsAuthenticated(true);
            localStorage.setItem('adminAuthenticated', 'true');
        } else {
            alert(t('admin.login.invalidCredentials'));
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('adminAuthenticated');
        setUsernameInput('');
        setPasswordInput('');
    };

    const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

        // For now, just set the file name as placeholder
        // In production, you would upload to Supabase Storage or another service
        const fileName = `/images/${file.name}`;
        setFormData((prev) => ({ ...prev, image_url: fileName }));
        
        // Optional: Real file upload to Supabase Storage
        /*
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .storage
    .from('product-images')
            .upload(`product-${Date.now()}-${file.name}`, file);

  if (error) {
    console.error('Image upload error:', error);
    return;
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${data.path}`;
        setFormData((prev) => ({ ...prev, image_url: imageUrl }));
        */
    };


    // Show loading state until authentication check is complete
    if (isAuthLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingText}>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.loginContainer}>
                <h1>{t('admin.login.title')}</h1>
                <input
                    type="text"
                    placeholder={t('admin.login.username')}
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                />
                <input
                    type="password"
                    placeholder={t('admin.login.password')}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                />
                <button onClick={handleLogin}>{t('admin.login.loginButton')}</button>
            </div>
        );
    }

    return (
        <div className={styles.adminPage}>
            <div className={styles.adminHeader}>
                <h1 className={styles.heading}>{t('admin.header.title')}</h1>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    {t('admin.header.logout')}
                </button>
            </div>
            
            {/* Tab Navigation */}
            <div className={styles.tabNavigation}>
                <button 
                    className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    {t('admin.tabs.products')}
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''}`}
                    onClick={() => {
                        console.log('Admin: Switching to orders tab');
                        setActiveTab('orders');
                    }}
                >
                    {t('admin.tabs.orders')}
                    </button>
            </div>

            {/* Products Management Section */}
            {activeTab === 'products' && (
                <>
                    {/* Search and Controls */}
                    <div className={styles.controlsSection}>
                        <div className={styles.searchControls}>
                            <input
                                type="text"
                                placeholder={t('admin.products.search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={showArchived}
                                    onChange={(e) => setShowArchived(e.target.checked)}
                                />
                                {t('admin.products.showArchived')}
                            </label>
                        </div>
                        <div className={styles.sortControls}>
                            <label>
                                {t('admin.products.sortBy')}:
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className={styles.sortSelect}
                                >
                                    <option value="updated_at">Updated</option>
                                    <option value="brand">Brand</option>
                                    <option value="model">Model</option>
                                    <option value="price">Price</option>
                                    <option value="stock">Stock</option>
                                    <option value="discount">Discount</option>
                                </select>
                                <select 
                                    value={sortOrder} 
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className={styles.sortSelect}
                                >
                                    <option value="desc">↓ Descending</option>
                                    <option value="asc">↑ Ascending</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    {/* Add/Edit Product Form - Now conditionally shown */}
                    {showForm && (
                        <div className={styles.formSection} ref={formRef}>
                            <div className={styles.formHeader}>
                                <h2>{isEditing ? t('admin.products.edit') : t('admin.products.addNew')}</h2>
                                <button 
                                    onClick={hideForm}
                                    className={styles.closeFormButton}
                                    aria-label="Close form"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            {duplicateWarning && (
                                <div className={styles.warningMessage}>
                                    ⚠️ {duplicateWarning}
                                </div>
                            )}

                            <div className={styles.formGrid}>
                                {/* Required Fields */}
                                <div className={styles.formGroup}>
                                    <label>
                                        {t('admin.products.brand')} *:
                                        <input
                                            type="text"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>
                                        {t('admin.products.model')} *:
                                        <input
                                            type="text"
                                            name="model"
                                            value={formData.model}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>
                                        {t('admin.products.price')} * (€):
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </label>
                                </div>

                                {/* Optional Fields */}
                                <div className={styles.formGroup}>
                                    <label>
                                        {t('admin.products.color')}:
                                        <input
                                            type="text"
                                            name="colour"
                                            value={formData.colour}
                                            onChange={handleChange}
                                        />
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>
                                        {t('admin.products.type')}:
                                        <input
                                            type="text"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                        />
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>
                                        {t('admin.products.capacity')}:
                                        <input
                                            type="number"
                                            name="capacity_btu"
                                            value={formData.capacity_btu}
                                            onChange={handleChange}
                                            min="0"
                                        />
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>
                                        {t('admin.products.energyRating')}:
                                        <select
                                            name="energy_rating"
                                            value={formData.energy_rating}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select...</option>
                                            <option value="A+++">A+++</option>
                                            <option value="A++">A++</option>
                                            <option value="A+">A+</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                        </select>
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>
                                        {t('admin.products.previousPrice')} (€):
                                        <input
                                            type="number"
                                            name="previous_price"
                                            value={formData.previous_price}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                        />
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>
                                        {t('admin.products.stock')}:
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            min="0"
                                        />
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>
                                        {t('admin.products.discount')} (%):
                                        <input
                                            type="number"
                                            name="discount"
                                            value={formData.discount}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            max="100"
                                        />
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>
                                        {t('admin.products.image')}:
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleImageUpload} 
                                            accept="image/*"
                                        />
                                    </label>
                                    {formData.image_url && (
                                        <div className={styles.imagePreview}>
                                            <img src={formData.image_url} alt="Product" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Live Price Preview */}
                            {formData.price && formData.discount > 0 && (
                                <div className={styles.pricePreview}>
                                    <span className={styles.originalPrice}>€{formData.price}</span>
                                    <span className={styles.discountedPricePreview}>
                                        {t('admin.products.discountedPrice')}: €{calculateDiscountedPrice(formData.price, formData.discount)}
                                    </span>
                                    <span className={styles.discountBadge}>-{formData.discount}%</span>
                                </div>
                            )}

                            <div className={styles.formActions}>
                                <button 
                                    onClick={isEditing ? handleSaveEdit : handleAdd}
                                    disabled={loading}
                                    className={styles.primaryButton}
                                >
                                    {loading ? t('admin.products.loading') : 
                                     isEditing ? t('admin.products.save') : t('admin.products.add')}
                                </button>

                                <button 
                                    onClick={handleCancelEdit} 
                                    className={styles.secondaryButton}
                                    disabled={loading}
                                >
                                    {t('admin.products.cancel')}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Products List */}
                    <div className={styles.productsList}>
                        <div className={styles.listHeader}>
                            <h2>{t('admin.products.title')}</h2>
                            <div className={styles.listActions}>
                                <button 
                                    onClick={showAddForm}
                                    className={styles.addActionButton}
                                    aria-label="Add new product"
                                >
                                    ➕ {t('admin.products.add')}
                                </button>
                            </div>
                            {error && (
                                <div className={styles.errorMessage}>
                                    ❌ {error}
                                </div>
                            )}
                        </div>
                        
                        {/* Pagination Info */}
                        <div className={styles.paginationInfo}>
                            <span>
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} products
                            </span>
                            <div className={styles.pageSizeControl}>
                                <label>
                                    Per page:
                                    <select 
                                        value={pageSize} 
                                        onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                        className={styles.pageSizeSelect}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        {loading ? (
                            <div className={styles.loadingMessage}>
                                🔄 {t('admin.products.loading')}
                            </div>
                        ) : products.length === 0 ? (
                            <div className={styles.emptyMessage}>
                                📦 {t('admin.products.noProducts')}
                            </div>
                        ) : (
                            <>
                                <div className={styles.tableContainer}>
                                    <table className={styles.productsTable}>
                                        <thead>
                                            <tr>
                                                <th className={styles.sortable} onClick={() => handleSort('brand')}>
                                                    {t('admin.products.brand')} {sortBy === 'brand' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th className={styles.sortable} onClick={() => handleSort('model')}>
                                                    {t('admin.products.model')} {sortBy === 'model' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th>{t('admin.products.color')}</th>
                                                <th>{t('admin.products.type')}</th>
                                                <th className={styles.sortable} onClick={() => handleSort('price')}>
                                                    {t('admin.products.price')} {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th className={styles.sortable} onClick={() => handleSort('stock')}>
                                                    {t('admin.products.stock')} {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th className={styles.sortable} onClick={() => handleSort('discount')}>
                                                    {t('admin.products.discount')} {sortBy === 'discount' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th>{t('admin.products.image')}</th>
                                                <th>{t('admin.products.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product) => (
                                                <tr key={product.ProductID} className={product.IsArchived ? styles.archivedRow : ''}>
                                                    <td>
                                                        {product.Brand}
                                                        {product.IsArchived && <span className={styles.archivedBadge}>{t('admin.products.archived')}</span>}
                                                    </td>
                                                    <td>{product.Model}</td>
                                                    <td>{product.Colour}</td>
                                                    <td>{product.Type}</td>
                                                    <td>
                                                        <div className={styles.priceCell}>
                                                            {product.Discount > 0 ? (
                                                                <>
                                                                    <span className={styles.originalPrice}>€{product.Price}</span>
                                                                    <span className={styles.discountedPrice}>
                                                                        €{calculateDiscountedPrice(product.Price, product.Discount)}
                                                                    </span>
                                                                    <span className={styles.discountBadge}>-{product.Discount}%</span>
                                                                </>
                                                            ) : (
                                                                <span>€{product.Price}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.stockCell}>
                                                            <span className={isLowStock(product.Stock) ? styles.lowStock : ''}>
                                                                {product.Stock}
                                                            </span>
                                                            {isLowStock(product.Stock) && (
                                                                <span className={styles.lowStockBadge}>{t('admin.products.lowStock')}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>{product.Discount}%</td>
                                                    <td>
                                                        {product.ImageURL && (
                                                            <img 
                                                                src={product.ImageURL} 
                                                                alt={`${product.Brand} ${product.Model}`}
                                                                className={styles.productImage}
                                                            />
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className={styles.actionButtons}>
                                                            <button 
                                                                onClick={() => handleEdit(product)}
                                                                className={styles.editButton}
                                                            >
                                                                {t('admin.products.editButton')}
                                                            </button>
                                                            {!product.IsArchived && (
                                                                <button 
                                                                    onClick={() => handleArchive(product.ProductID, `${product.Brand} ${product.Model}`)}
                                                                    className={styles.archiveButton}
                                                                >
                                                                    {t('admin.products.archiveButton')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className={styles.paginationControls}>
                                        <button 
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={styles.paginationButton}
                                        >
                                            ‹ Previous
                                        </button>
                                        
                                        <div className={styles.pageNumbers}>
                                            {/* Show first page */}
                                            {currentPage > 3 && (
                                                <>
                                                    <button 
                                                        onClick={() => handlePageChange(1)}
                                                        className={styles.pageButton}
                                                    >
                                                        1
                                                    </button>
                                                    {currentPage > 4 && <span className={styles.pageEllipsis}>...</span>}
                                                </>
                                            )}
                                            
                                            {/* Show current page and surrounding pages */}
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                                if (pageNum <= totalPages) {
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`${styles.pageButton} ${currentPage === pageNum ? styles.activePage : ''}`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })}
                                            
                                            {/* Show last page */}
                                            {currentPage < totalPages - 2 && (
                                                <>
                                                    {currentPage < totalPages - 3 && <span className={styles.pageEllipsis}>...</span>}
                                                    <button 
                                                        onClick={() => handlePageChange(totalPages)}
                                                        className={styles.pageButton}
                                                    >
                                                        {totalPages}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        
                                        <button 
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={styles.paginationButton}
                                        >
                                            Next ›
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Orders Management Section */}
            {activeTab === 'orders' && (
                <div className={styles.ordersSection}>
                    <h2>{t('admin.orders.title')}</h2>
                    
                    {error && (
                        <div className={styles.errorMessage}>
                            ❌ {error}
                        </div>
                    )}
                    
                    {loading ? (
                        <div className={styles.loadingMessage}>
                            🔄 {t('admin.products.loading')}
                        </div>
                    ) : orders.length === 0 ? (
                        <p>{t('admin.orders.noOrders')}</p>
                    ) : (
                        <div className={styles.ordersContainer}>
                            {orders.map((order) => (
                                <div key={order.order_id} className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <div className={styles.orderInfo}>
                                            <h3>{t('admin.orders.orderNumber')}{order.order_id}</h3>
                                            <p><strong>{order.first_name} {order.last_name}</strong></p>
                                            <p>{t('admin.orders.phone')}: {order.phone}</p>
                                            <p>{t('admin.orders.created')}: {order.order_created_at ? new Date(order.order_created_at).toLocaleString('bg-BG') : t('admin.orders.unknownDate')}</p>
                                            <p>{t('admin.orders.payment')}: {order.payment_method}</p>
                                        </div>
                                        
                                        <div className={styles.statusControls}>
                                            <div className={styles.currentStatus}>
                                                <span 
                                                    className={styles.statusBadge}
                                                    style={{ backgroundColor: getStatusColor(order.current_status) }}
                                                >
                                                    {getStatusLabel(order.current_status)}
                                                </span>
                                            </div>
                                            
                                            <select
                                                value={order.current_status}
                                                onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                                                disabled={updatingStatus === order.order_id}
                                                className={styles.statusSelect}
                                            >
                                                <option value="new">{t('admin.orders.status.new')}</option>
                                                <option value="confirmed">{t('admin.orders.status.confirmed')}</option>
                                                <option value="installation_booked">{t('admin.orders.status.installation_booked')}</option>
                                                <option value="installed">{t('admin.orders.status.installed')}</option>
                                                <option value="cancelled">{t('admin.orders.status.cancelled')}</option>
                                            </select>
                                            
                                            {updatingStatus === order.order_id && (
                                                <span className={styles.updating}>{t('admin.orders.updating')}</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className={styles.orderActions}>
                                        <button
                                            onClick={() => toggleOrderHistory(order.order_id)}
                                            className={styles.historyButton}
                                        >
                                            {expandedOrderId === order.order_id ? t('admin.orders.hideHistory') : t('admin.orders.showHistory')}
                                        </button>
                                    </div>
                                    
                                    {/* Order History Section */}
                                    {expandedOrderId === order.order_id && (
                                        <div className={styles.orderHistory}>
                                            <h4>{t('admin.orders.statusHistory')}</h4>
                                            {orderHistory[order.order_id] && orderHistory[order.order_id].length > 0 ? (
                                                <div className={styles.historyList}>
                                                    {orderHistory[order.order_id].map((historyItem, index) => (
                                                        <div key={historyItem.id || index} className={styles.historyItem}>
                                                                                                        <div className={styles.historyTimestamp}>
                                                {historyItem.changed_at ? new Date(historyItem.changed_at).toLocaleString('bg-BG') : t('admin.orders.unknownDate')}
                                            </div>
                                                            <div className={styles.historyChange}>
                                                                {historyItem.old_status ? (
                                                                    <span>
                                                                        {getStatusLabel(historyItem.old_status)} → {getStatusLabel(historyItem.new_status)}
                                                                    </span>
                                                                ) : (
                                                                    <span>{t('admin.orders.initialStatus')}: {getStatusLabel(historyItem.new_status)}</span>
                                                                )}
                                                            </div>
                                                            {historyItem.notes && (
                                                                <div className={styles.historyNotes}>
                                                                    {historyItem.notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p>{t('admin.orders.noHistory')}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
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
