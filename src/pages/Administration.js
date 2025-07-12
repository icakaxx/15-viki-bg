import { useState, useEffect, useRef } from 'react';
import { LanguageContext } from '../components/Layout Components/Header';
import { useContext } from 'react';
import styles from '../styles/Page Styles/Administration.module.css';
import AdminOrderHistoryTab from '../components/AdminOrderHistoryTab';
import WeeklyInstallationsTab from '../components/WeeklyInstallationsTab';

export default function Administration() {
    const { t, locale, switchLanguage } = useContext(LanguageContext);
    
    // Debug info
    console.log('Admin Panel - Current locale:', locale);
    console.log('Admin Panel - Test translation:', t('admin.header.title'));
    
    // Authentication state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    
    // Main tabs state
    const [activeTab, setActiveTab] = useState('products');
    
    // Products state
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [sortBy, setSortBy] = useState('updated_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    
    // Form section state - accordion style
    const [expandedSections, setExpandedSections] = useState(['basic']);
    
    // Form validation helpers
    const getSectionStatus = (sectionName) => {
        const requiredFields = {
            basic: ['brand', 'model', 'price'],
            technical: [],
            physical: [],
            installation: [],
            features: [],
            description: []
        };
        
        const fields = requiredFields[sectionName] || [];
        const isComplete = fields.every(field => formData[field] && formData[field].trim() !== '');
        const hasContent = fields.some(field => formData[field] && formData[field].trim() !== '') || 
                          Object.keys(formData).some(key => 
                              !requiredFields.basic.includes(key) && 
                              formData[key] && 
                              (typeof formData[key] === 'string' ? formData[key].trim() !== '' : 
                               Array.isArray(formData[key]) ? formData[key].length > 0 : 
                               formData[key] !== false)
                          );
        
        if (isComplete) return 'completed';
        if (hasContent) return 'in_progress';
        return 'pending';
    };

    const toggleSection = (sectionName) => {
        setExpandedSections(prev => {
            if (prev.includes(sectionName)) {
                return prev.filter(s => s !== sectionName);
            } else {
                return [...prev, sectionName];
            }
        });
    };

    const isSectionExpanded = (sectionName) => {
        return expandedSections.includes(sectionName);
    };
    
    // Form data state
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        type: '',
        capacity_btu: '',
        energy_rating: '',
        colour: '',
        price: '',
        previous_price: '', // Will be auto-calculated
        stock: '',
        discount: '',
        image_url: '',
        is_featured: false,
        is_bestseller: false,
        is_new: false,
        cop: '',
        scop: '',
        power_consumption: '',
        refrigerant_type: 'R32',
        operating_temp_range: '',
        dimensions: '',
        weight: '',
        noise_level: '',
        air_flow: '',
        room_size_recommendation: '',
        installation_type: '',
        warranty_period: '',
        features: [],
        description: ''
    });

    // Calculate final price for preview
    const calculateFinalPrice = () => {
        const price = parseFloat(formData.price) || 0;
        const discount = parseFloat(formData.discount) || 0;
        if (price > 0 && discount > 0) {
            return price - (price * discount / 100);
        }
        return price;
    };

    // Helper function to get proper image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '/images/placeholder-ac.svg';
        
        // If it's already a Supabase URL, use it as is
        if (imageUrl.includes('supabase.co') || imageUrl.includes('supabase.')) {
            return imageUrl;
        }
        
        // If it's a local path that doesn't exist, use placeholder
        if (imageUrl.startsWith('/images/products/')) {
            console.warn('Using placeholder for old local image path:', imageUrl);
            return '/images/placeholder-ac.svg';
        }
        
        // Default fallback
        return imageUrl || '/images/placeholder-ac.svg';
    };
    
    const fileInputRef = useRef(null);
    const formRef = useRef(null);
    
    // Image upload state
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    // Load products from API
    const loadProducts = async () => {
        try {
            console.log('Loading products...');
            const response = await fetch('/api/get-products');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            // Extract products array from API response
            const productsArray = Array.isArray(data.products) ? data.products : [];
            console.log('Raw products array:', productsArray);
            
            // Transform API response to match admin panel expected format
            const transformedProducts = productsArray.map(product => ({
                id: product.ProductID || product.id,
                brand: product.Brand || product.brand,
                model: product.Model || product.model,
                type: product.Type || product.type,
                capacity_btu: product.CapacityBTU || product.capacity_btu,
                energy_rating: product.EnergyRating || product.energy_rating,
                colour: product.Colour || product.colour,
                price: product.Price || product.price,
                previous_price: product.PreviousPrice || product.previous_price,
                stock: product.Stock || product.stock,
                discount: product.Discount || product.discount,
                image_url: product.ImageURL || product.image_url,
                is_featured: product.IsFeatured || product.is_featured,
                is_bestseller: product.IsBestseller || product.is_bestseller,
                is_new: product.IsNew || product.is_new,
                is_archived: product.IsArchived || product.is_archived,
                cop: product.COP || product.cop,
                scop: product.SCOP || product.scop,
                power_consumption: product.PowerConsumption || product.power_consumption,
                refrigerant_type: product.RefrigerantType || product.refrigerant_type,
                operating_temp_range: product.OperatingTempRange || product.operating_temp_range,
                dimensions: product.Dimensions || product.dimensions,
                weight: product.Weight || product.weight,
                noise_level: product.NoiseLevel || product.noise_level,
                air_flow: product.AirFlow || product.air_flow,
                room_size_recommendation: product.RoomSizeRecommendation || product.room_size_recommendation,
                installation_type: product.InstallationType || product.installation_type,
                warranty_period: product.WarrantyPeriod || product.warranty_period,
                features: product.Features || product.features || [],
                description: product.Description || product.description,
                created_at: product.CreatedAt || product.created_at,
                updated_at: product.UpdatedAt || product.updated_at
            }));
            
            console.log('Transformed products:', transformedProducts);
            
            setProducts(transformedProducts);
            setFilteredProducts(transformedProducts);
        } catch (error) {
            console.error('Error loading products:', error);
            // Set empty arrays on error
            setProducts([]);
            setFilteredProducts([]);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            loadProducts();
        }
    }, [isLoggedIn]);
    
    const clearForm = () => {
        setFormData({
            brand: '',
            model: '',
            type: '',
            capacity_btu: '',
            energy_rating: '',
            colour: '',
            price: '',
            previous_price: '', // Will be auto-calculated
            stock: '',
            discount: '',
            image_url: '',
            is_featured: false,
            is_bestseller: false,
            is_new: false,
            cop: '',
            scop: '',
            power_consumption: '',
            refrigerant_type: 'R32',
            operating_temp_range: '',
            dimensions: '',
            weight: '',
            noise_level: '',
            air_flow: '',
            room_size_recommendation: '',
            installation_type: '',
            warranty_period: '',
            features: [],
            description: ''
        });
        setDuplicateWarning(null);
        setExpandedSections(['basic']);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle image upload to Supabase storage
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        
        try {
            // Create a unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            // REAL SUPABASE IMPLEMENTATION:
            // Check if we have Supabase configured
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            
            if (supabaseUrl && supabaseAnonKey) {
                // Use real Supabase Storage
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(supabaseUrl, supabaseAnonKey);
                
                const { data, error } = await supabase.storage
                    .from('images-viki15bg')
                    .upload(`products/${fileName}`, file, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (error) {
                    console.error('Supabase upload error:', error);
                    throw new Error('Failed to upload to Supabase: ' + error.message);
                }
                
                const { data: { publicUrl } } = supabase.storage
                    .from('images-viki15bg')
                    .getPublicUrl(`products/${fileName}`);
                
                // Set image preview
                setImagePreview(publicUrl);
                
                // Update form data with the Supabase public URL
                setFormData(prev => ({
                    ...prev,
                    image_url: publicUrl
                }));
                
                console.log('✅ Image uploaded to Supabase:', publicUrl);
            } else {
                // FALLBACK MOCK IMPLEMENTATION (when Supabase not configured):
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Create a preview URL for the uploaded file
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);
                
                // Mock Supabase URL structure for consistency
                const mockSupabaseUrl = `https://mock.supabase.co/storage/v1/object/public/images-viki15bg/products/${fileName}`;
                
                // Update form data with the mock URL
                setFormData(prev => ({
                    ...prev,
                    image_url: mockSupabaseUrl
                }));
                
                console.log('⚠️ Using mock upload (Supabase not configured):', mockSupabaseUrl);
            }

            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const showAddForm = () => {
        clearForm();
        setIsEditing(false);
        setEditingId(null);
        setShowForm(true);
        setExpandedSections(['basic']);
    };

    const hideForm = () => {
        setShowForm(false);
        clearForm();
        setIsEditing(false);
        setEditingId(null);
    };

    const handleAdd = async () => {
        try {
            // Validate required fields
            if (!formData.brand || !formData.model || !formData.price) {
                alert('Please fill in all required fields: Brand, Model, and Price');
                return;
            }

            // Clean and validate data before sending
            const cleanedData = {
                ...formData,
                // Convert empty strings to null for numeric fields
                price: formData.price ? parseFloat(formData.price) : null,
                previous_price: formData.discount > 0 ? parseFloat(formData.price) : (formData.previous_price ? parseFloat(formData.previous_price) : null),
                stock: formData.stock ? parseInt(formData.stock) : 0,
                discount: formData.discount ? parseFloat(formData.discount) : 0,
                capacity_btu: formData.capacity_btu ? parseInt(formData.capacity_btu) : null,
                cop: formData.cop ? parseFloat(formData.cop) : null,
                scop: formData.scop ? parseFloat(formData.scop) : null,
                power_consumption: formData.power_consumption ? parseFloat(formData.power_consumption) : null,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                noise_level: formData.noise_level ? parseInt(formData.noise_level) : null,
                air_flow: formData.air_flow ? parseInt(formData.air_flow) : null,
                // Convert empty strings to null for text fields
                colour: formData.colour || null,
                type: formData.type || null,
                energy_rating: formData.energy_rating || null,
                image_url: formData.image_url || null,
                dimensions: formData.dimensions || null,
                operating_temp_range: formData.operating_temp_range || null,
                room_size_recommendation: formData.room_size_recommendation || null,
                installation_type: formData.installation_type || null,
                warranty_period: formData.warranty_period || null,
                description: formData.description || null
            };

            console.log('Sending product data:', cleanedData);

            const response = await fetch('/api/add-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedData),
            });

            if (response.ok) {
                loadProducts();
                hideForm();
                alert('Product added successfully!');
            } else {
                const error = await response.json();
                console.error('API Error:', error);
                alert('Error: ' + error.message);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Error adding product: ' + error.message);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            brand: product.brand || '',
            model: product.model || '',
            type: product.type || '',
            capacity_btu: product.capacity_btu ? product.capacity_btu.toString() : '',
            energy_rating: product.energy_rating || '',
            colour: product.colour || '',
            price: product.price ? product.price.toString() : '',
            previous_price: product.previous_price ? product.previous_price.toString() : '', // Keep existing previous_price
            stock: product.stock ? product.stock.toString() : '',
            discount: product.discount ? product.discount.toString() : '',
            image_url: product.image_url || '',
            is_featured: product.is_featured || false,
            is_bestseller: product.is_bestseller || false,
            is_new: product.is_new || false,
            cop: product.cop ? product.cop.toString() : '',
            scop: product.scop ? product.scop.toString() : '',
            power_consumption: product.power_consumption ? product.power_consumption.toString() : '',
            refrigerant_type: product.refrigerant_type || 'R32',
            operating_temp_range: product.operating_temp_range || '',
            dimensions: product.dimensions || '',
            weight: product.weight ? product.weight.toString() : '',
            noise_level: product.noise_level ? product.noise_level.toString() : '',
            air_flow: product.air_flow ? product.air_flow.toString() : '',
            room_size_recommendation: product.room_size_recommendation || '',
            installation_type: product.installation_type || '',
            warranty_period: product.warranty_period || '',
            features: product.features || [],
            description: product.description || ''
        });
        setIsEditing(true);
        setEditingId(product.id);
        setShowForm(true);
        setExpandedSections(['basic']);
        
        // Set image preview if product has an image
        if (product.image_url) {
            setImagePreview(product.image_url);
        }
    };

    const handleSaveEdit = async () => {
        try {
            // Validate required fields
            if (!formData.brand || !formData.model || !formData.price) {
                alert('Please fill in all required fields: Brand, Model, and Price');
                return;
            }

            // Clean and validate data before sending
            const cleanedData = {
                ...formData,
                // Convert empty strings to null for numeric fields
                price: formData.price ? parseFloat(formData.price) : null,
                previous_price: formData.discount > 0 ? parseFloat(formData.price) : (formData.previous_price ? parseFloat(formData.previous_price) : null),
                stock: formData.stock ? parseInt(formData.stock) : 0,
                discount: formData.discount ? parseFloat(formData.discount) : 0,
                capacity_btu: formData.capacity_btu ? parseInt(formData.capacity_btu) : null,
                cop: formData.cop ? parseFloat(formData.cop) : null,
                scop: formData.scop ? parseFloat(formData.scop) : null,
                power_consumption: formData.power_consumption ? parseFloat(formData.power_consumption) : null,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                noise_level: formData.noise_level ? parseInt(formData.noise_level) : null,
                air_flow: formData.air_flow ? parseInt(formData.air_flow) : null,
                // Convert empty strings to null for text fields
                colour: formData.colour || null,
                type: formData.type || null,
                energy_rating: formData.energy_rating || null,
                image_url: formData.image_url || null,
                dimensions: formData.dimensions || null,
                operating_temp_range: formData.operating_temp_range || null,
                room_size_recommendation: formData.room_size_recommendation || null,
                installation_type: formData.installation_type || null,
                warranty_period: formData.warranty_period || null,
                description: formData.description || null
            };

            console.log('Updating product data:', cleanedData);

            const response = await fetch('/api/edit-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: editingId, ...cleanedData }),
            });

            if (response.ok) {
                loadProducts();
                hideForm();
                alert('Product updated successfully!');
            } else {
                const error = await response.json();
                console.error('API Error:', error);
                alert('Error: ' + error.message);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Error updating product: ' + error.message);
        }
    };

    // Basic authentication check
    if (!isLoggedIn) {
        const handleLogin = () => {
            if (usernameInput === '1' && passwordInput === '1') {
                setIsLoggedIn(true);
            } else {
                alert('Incorrect username or password');
            }
        };

        return (
            <div className={styles.loginContainer}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕵️</div>
                <h1>Admin Login</h1>
                <input
                    type="text"
                    placeholder={t('admin.login.username')}
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleLogin();
                        }
                    }}
                />
                <input
                    type="password"
                    placeholder={t('admin.login.password')}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleLogin();
                        }
                    }}
                />
                <button onClick={handleLogin}>
                    {t('admin.login.loginButton')}
                </button>
            </div>
        );
    }

    return (
        <div className={styles.adminPage}>
            <div className={styles.adminHeader}>
                <h1 className={styles.heading}>{t('admin.header.title')}</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => setIsLoggedIn(false)} className={styles.logoutButton}>
                        {t('admin.header.logout')}
                    </button>
                </div>
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
                    onClick={() => setActiveTab('orders')}
                >
                    {t('admin.tabs.orders')}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'orderHistory' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('orderHistory')}
                >
                    {t('admin.tabs.orderHistory')}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'installations' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('installations')}
                >
                    {t('admin.tabs.installations')}
                </button>
            </div>

            {/* Products Management Section */}
            {activeTab === 'products' && (
                <>
                    {/* Accordion Form */}
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

                            {/* Accordion Form Sections */}
                            <div className={styles.accordionContainer}>
                                
                                {/* Basic Information Section */}
                                <div className={styles.accordionSection}>
                                    <div 
                                        className={`${styles.accordionHeader} ${styles[getSectionStatus('basic')]}`}
                                        onClick={() => toggleSection('basic')}
                                    >
                                        <div className={styles.sectionInfo}>
                                            <span className={styles.sectionIcon}>📋</span>
                                            <span className={styles.sectionTitle}>{t('admin.products.sections.basic')}</span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatus('basic') === 'completed' && '✅ ' + t('admin.products.status.completed')}
                                                {getSectionStatus('basic') === 'in_progress' && '🔄 ' + t('admin.products.status.inProgress')}
                                                {getSectionStatus('basic') === 'pending' && '⭕ ' + t('admin.products.status.required')}
                                            </span>
                                        </div>
                                        <span className={styles.expandIcon}>
                                            {isSectionExpanded('basic') ? '▼' : '▶'}
                                        </span>
                                    </div>
                                    
                                    {isSectionExpanded('basic') && (
                                        <div className={styles.sectionContent}>
                                            <div className={styles.formCard}>
                                                <h3 className={styles.cardTitle}>📦 {t('admin.products.formCards.productIdentity')}</h3>
                                                <div className={styles.formGrid}>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.brand')} *:
                                                            <input
                                                                type="text"
                                                                name="brand"
                                                                value={formData.brand}
                                                                onChange={handleChange}
                                                                required
                                                                placeholder={t('admin.products.placeholders.brandExample')}
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
                                                                placeholder={t('admin.products.placeholders.modelExample')}
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
                                                                placeholder={t('admin.products.placeholders.priceExample')}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className={styles.formCard}>
                                                <h3 className={styles.cardTitle}>🏷️ {t('admin.products.formCards.productDetails')}</h3>
                                                <div className={styles.formGrid}>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.type')}:
                                                            <select
                                                                name="type"
                                                                value={formData.type}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">{t('admin.products.dropdowns.selectType')}</option>
                                                                <option value="Split">{t('admin.products.dropdowns.types.split')}</option>
                                                                <option value="Multi-Split">{t('admin.products.dropdowns.types.multiSplit')}</option>
                                                                <option value="Cassette">{t('admin.products.dropdowns.types.cassette')}</option>
                                                                <option value="Ducted">{t('admin.products.dropdowns.types.ducted')}</option>
                                                                <option value="Portable">{t('admin.products.dropdowns.types.portable')}</option>
                                                            </select>
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.capacity')} (BTU):
                                                            <input
                                                                type="number"
                                                                name="capacity_btu"
                                                                value={formData.capacity_btu}
                                                                onChange={handleChange}
                                                                placeholder="e.g. 12000"
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
                                                                <option value="">{t('admin.products.dropdowns.selectRating')}</option>
                                                                <option value="A+++">{t('admin.products.dropdowns.energyRatings.aPlusPlus')}</option>
                                                                <option value="A++">{t('admin.products.dropdowns.energyRatings.aPlus')}</option>
                                                                <option value="A+">{t('admin.products.dropdowns.energyRatings.a')}</option>
                                                                <option value="A">{t('admin.products.dropdowns.energyRatings.b')}</option>
                                                                <option value="B">{t('admin.products.dropdowns.energyRatings.c')}</option>
                                                                <option value="C">{t('admin.products.dropdowns.energyRatings.d')}</option>
                                                            </select>
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.color')}:
                                                            <input
                                                                type="text"
                                                                name="colour"
                                                                value={formData.colour}
                                                                onChange={handleChange}
                                                                placeholder="e.g. White, Black"
                                                            />
                                                        </label>
                                                    </div>

                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.stockQuantity')}:
                                                            <input
                                                                type="number"
                                                                name="stock"
                                                                value={formData.stock}
                                                                onChange={handleChange}
                                                                min="0"
                                                                placeholder={t('admin.products.placeholders.stockExample')}
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
                                                                min="0"
                                                                max="100"
                                                                step="0.1"
                                                                placeholder={t('admin.products.placeholders.discountExample')}
                                                            />
                                                            {formData.price && formData.discount > 0 && (
                                                                <div style={{ 
                                                                    marginTop: '8px', 
                                                                    padding: '8px 12px', 
                                                                    backgroundColor: '#e8f5e8',
                                                                    border: '1px solid #4caf50',
                                                                    borderRadius: '4px',
                                                                    fontSize: '14px',
                                                                    color: '#2e7d32'
                                                                }}>
                                                                    💰 Final Price: €{calculateFinalPrice().toFixed(2)}
                                                                    <small style={{ display: 'block', marginTop: '4px', opacity: 0.8 }}>
                                                                        Original: €{formData.price} - {formData.discount}% discount
                                                                    </small>
                                                                </div>
                                                            )}
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.imageUpload')}:
                                                            <div className={styles.imageUploadContainer}>
                                                                <input
                                                                    type="file"
                                                                    ref={fileInputRef}
                                                                    accept="image/*"
                                                                    onChange={handleImageUpload}
                                                                    disabled={uploading}
                                                                    className={styles.fileInput}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => fileInputRef.current?.click()}
                                                                    disabled={uploading}
                                                                    className={styles.uploadButton}
                                                                >
                                                                    {uploading ? t('admin.products.uploading') : t('admin.products.selectImage')}
                                                                </button>
                                                            </div>
                                                            {imagePreview && (
                                                                <div className={styles.imagePreview}>
                                                                    <img src={imagePreview} alt="Preview" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setImagePreview(null);
                                                                            setFormData(prev => ({ ...prev, image_url: '' }));
                                                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                                                        }}
                                                                        className={styles.removeImageButton}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {formData.image_url && !imagePreview && (
                                                                <div className={styles.currentImage}>
                                                                    <p>{t('admin.products.currentImage')}: {formData.image_url}</p>
                                                                </div>
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Technical Specifications Section */}
                                <div className={styles.accordionSection}>
                                    <div 
                                        className={`${styles.accordionHeader} ${styles[getSectionStatus('technical')]}`}
                                        onClick={() => toggleSection('technical')}
                                    >
                                        <div className={styles.sectionInfo}>
                                            <span className={styles.sectionIcon}>⚡</span>
                                            <span className={styles.sectionTitle}>{t('admin.products.sections.technical')}</span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatus('technical') === 'completed' && '✅ ' + t('admin.products.status.completed')}
                                                {getSectionStatus('technical') === 'in_progress' && '🔄 ' + t('admin.products.status.inProgress')}
                                                {getSectionStatus('technical') === 'pending' && '⚪ ' + t('admin.products.status.optional')}
                                            </span>
                                        </div>
                                        <span className={styles.expandIcon}>
                                            {isSectionExpanded('technical') ? '▼' : '▶'}
                                        </span>
                                    </div>
                                    
                                    {isSectionExpanded('technical') && (
                                        <div className={styles.sectionContent}>
                                            <div className={styles.formCard}>
                                                <h3 className={styles.cardTitle}>📊 {t('admin.products.formCards.performanceMetrics')}</h3>
                                                <div className={styles.formGrid}>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            COP (Coefficient of Performance):
                                                            <input
                                                                type="number"
                                                                name="cop"
                                                                value={formData.cop}
                                                                onChange={handleChange}
                                                                step="0.1"
                                                                min="0"
                                                                max="10"
                                                                placeholder="e.g. 4.2"
                                                            />
                                                            <small>{t('admin.products.hints.copHint')}</small>
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.scop')}:
                                                            <input
                                                                type="number"
                                                                name="scop"
                                                                value={formData.scop}
                                                                onChange={handleChange}
                                                                step="0.1"
                                                                min="0"
                                                                max="10"
                                                                placeholder={t('admin.products.hints.scopHint')}
                                                            />
                                                            <small>{t('admin.products.hints.scopHint')}</small>
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.powerConsumption')} (kW):
                                                            <input
                                                                type="number"
                                                                name="power_consumption"
                                                                value={formData.power_consumption}
                                                                onChange={handleChange}
                                                                step="0.1"
                                                                min="0"
                                                                placeholder={t('admin.products.hints.powerHint')}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            Refrigerant Type:
                                                            <select
                                                                name="refrigerant_type"
                                                                value={formData.refrigerant_type}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="R32">{t('admin.products.dropdowns.refrigerantTypes.r32')}</option>
                                                                <option value="R410A">{t('admin.products.dropdowns.refrigerantTypes.r410a')}</option>
                                                                <option value="R134a">{t('admin.products.dropdowns.refrigerantTypes.r134a')}</option>
                                                                <option value="R290">{t('admin.products.dropdowns.refrigerantTypes.r290')}</option>
                                                            </select>
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.operatingTempRange')}:
                                                            <input
                                                                type="text"
                                                                name="operating_temp_range"
                                                                value={formData.operating_temp_range}
                                                                onChange={handleChange}
                                                                placeholder={t('admin.products.hints.tempRangeHint')}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Physical Characteristics Section */}
                                <div className={styles.accordionSection}>
                                    <div 
                                        className={`${styles.accordionHeader} ${styles[getSectionStatus('physical')]}`}
                                        onClick={() => toggleSection('physical')}
                                    >
                                        <div className={styles.sectionInfo}>
                                            <span className={styles.sectionIcon}>📏</span>
                                            <span className={styles.sectionTitle}>{t('admin.products.sections.physical')}</span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatus('physical') === 'completed' && '✅ ' + t('admin.products.status.completed')}
                                                {getSectionStatus('physical') === 'in_progress' && '🔄 ' + t('admin.products.status.inProgress')}
                                                {getSectionStatus('physical') === 'pending' && '⚪ ' + t('admin.products.status.optional')}
                                            </span>
                                        </div>
                                        <span className={styles.expandIcon}>
                                            {isSectionExpanded('physical') ? '▼' : '▶'}
                                        </span>
                                    </div>
                                    
                                    {isSectionExpanded('physical') && (
                                        <div className={styles.sectionContent}>
                                            <div className={styles.formCard}>
                                                <h3 className={styles.cardTitle}>📐 {t('admin.products.formCards.physicalSpecs')}</h3>
                                                <div className={styles.formGrid}>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.dimensions')} (W×H×D):
                                                            <input
                                                                type="text"
                                                                name="dimensions"
                                                                value={formData.dimensions}
                                                                onChange={handleChange}
                                                                placeholder={t('admin.products.hints.dimensionsHint')}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.weight')} (kg):
                                                            <input
                                                                type="number"
                                                                name="weight"
                                                                value={formData.weight}
                                                                onChange={handleChange}
                                                                step="0.1"
                                                                min="0"
                                                                placeholder={t('admin.products.hints.weightHint')}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.noiseLevel')} (dB):
                                                            <input
                                                                type="number"
                                                                name="noise_level"
                                                                value={formData.noise_level}
                                                                onChange={handleChange}
                                                                min="0"
                                                                max="100"
                                                                placeholder={t('admin.products.hints.noiseHint')}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.airFlow')} (m³/h):
                                                            <input
                                                                type="number"
                                                                name="air_flow"
                                                                value={formData.air_flow}
                                                                onChange={handleChange}
                                                                min="0"
                                                                placeholder={t('admin.products.hints.airFlowHint')}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Installation & Warranty Section */}
                                <div className={styles.accordionSection}>
                                    <div 
                                        className={`${styles.accordionHeader} ${styles[getSectionStatus('installation')]}`}
                                        onClick={() => toggleSection('installation')}
                                    >
                                        <div className={styles.sectionInfo}>
                                            <span className={styles.sectionIcon}>🔧</span>
                                            <span className={styles.sectionTitle}>{t('admin.products.sections.installation')}</span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatus('installation') === 'completed' && '✅ ' + t('admin.products.status.completed')}
                                                {getSectionStatus('installation') === 'in_progress' && '🔄 ' + t('admin.products.status.inProgress')}
                                                {getSectionStatus('installation') === 'pending' && '⚪ ' + t('admin.products.status.optional')}
                                            </span>
                                        </div>
                                        <span className={styles.expandIcon}>
                                            {isSectionExpanded('installation') ? '▼' : '▶'}
                                        </span>
                                    </div>
                                    
                                    {isSectionExpanded('installation') && (
                                        <div className={styles.sectionContent}>
                                            <div className={styles.formCard}>
                                                <h3 className={styles.cardTitle}>🏠 {t('admin.products.formCards.installationDetails')}</h3>
                                                <div className={styles.formGrid}>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.installationType')}:
                                                            <select
                                                                name="installation_type"
                                                                value={formData.installation_type}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">{t('admin.products.dropdowns.selectType')}</option>
                                                                <option value="Wall-mounted">{t('admin.products.dropdowns.installationTypes.wallMounted')}</option>
                                                                <option value="Ceiling-mounted">{t('admin.products.dropdowns.installationTypes.ceilingMounted')}</option>
                                                                <option value="Floor-standing">{t('admin.products.dropdowns.installationTypes.floorStanding')}</option>
                                                                <option value="Ducted">{t('admin.products.dropdowns.installationTypes.ducted')}</option>
                                                                <option value="Cassette">{t('admin.products.dropdowns.installationTypes.cassette')}</option>
                                                            </select>
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.roomSizeRecommendation')} (m²):
                                                            <input
                                                                type="text"
                                                                name="room_size_recommendation"
                                                                value={formData.room_size_recommendation}
                                                                onChange={handleChange}
                                                                placeholder={t('admin.products.hints.roomSizeHint')}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.warrantyPeriod')}:
                                                            <select
                                                                name="warranty_period"
                                                                value={formData.warranty_period}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">{t('admin.products.dropdowns.selectPeriod')}</option>
                                                                <option value="1 year">{t('admin.products.dropdowns.warrantyPeriods.1year')}</option>
                                                                <option value="2 years">{t('admin.products.dropdowns.warrantyPeriods.2years')}</option>
                                                                <option value="3 years">{t('admin.products.dropdowns.warrantyPeriods.3years')}</option>
                                                                <option value="5 years">{t('admin.products.dropdowns.warrantyPeriods.5years')}</option>
                                                                <option value="7 years">{t('admin.products.dropdowns.warrantyPeriods.7years')}</option>
                                                                <option value="10 years">{t('admin.products.dropdowns.warrantyPeriods.10years')}</option>
                                                            </select>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Features & Promotions Section */}
                                <div className={styles.accordionSection}>
                                    <div 
                                        className={`${styles.accordionHeader} ${styles[getSectionStatus('features')]}`}
                                        onClick={() => toggleSection('features')}
                                    >
                                        <div className={styles.sectionInfo}>
                                            <span className={styles.sectionIcon}>⭐</span>
                                            <span className={styles.sectionTitle}>{t('admin.products.sections.features')}</span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatus('features') === 'completed' && '✅ ' + t('admin.products.status.completed')}
                                                {getSectionStatus('features') === 'in_progress' && '🔄 ' + t('admin.products.status.inProgress')}
                                                {getSectionStatus('features') === 'pending' && '⚪ ' + t('admin.products.status.optional')}
                                            </span>
                                        </div>
                                        <span className={styles.expandIcon}>
                                            {isSectionExpanded('features') ? '▼' : '▶'}
                                        </span>
                                    </div>
                                    
                                    {isSectionExpanded('features') && (
                                        <div className={styles.sectionContent}>
                                            <div className={styles.formCard}>
                                                <h3 className={styles.cardTitle}>🎯 {t('admin.products.formCards.promotionalTags')}</h3>
                                                <div className={styles.formGrid}>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                name="is_featured"
                                                                checked={formData.is_featured}
                                                                onChange={handleChange}
                                                            />
                                                            {t('admin.products.fields.isFeatured')}
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                name="is_bestseller"
                                                                checked={formData.is_bestseller}
                                                                onChange={handleChange}
                                                            />
                                                            {t('admin.products.fields.isBestseller')}
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                name="is_new"
                                                                checked={formData.is_new}
                                                                onChange={handleChange}
                                                            />
                                                            {t('admin.products.fields.isNew')}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Description Section */}
                                <div className={styles.accordionSection}>
                                    <div 
                                        className={`${styles.accordionHeader} ${styles[getSectionStatus('description')]}`}
                                        onClick={() => toggleSection('description')}
                                    >
                                        <div className={styles.sectionInfo}>
                                            <span className={styles.sectionIcon}>📝</span>
                                            <span className={styles.sectionTitle}>{t('admin.products.sections.description')}</span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatus('description') === 'completed' && '✅ ' + t('admin.products.status.completed')}
                                                {getSectionStatus('description') === 'in_progress' && '🔄 ' + t('admin.products.status.inProgress')}
                                                {getSectionStatus('description') === 'pending' && '⚪ ' + t('admin.products.status.optional')}
                                            </span>
                                        </div>
                                        <span className={styles.expandIcon}>
                                            {isSectionExpanded('description') ? '▼' : '▶'}
                                        </span>
                                    </div>
                                    
                                    {isSectionExpanded('description') && (
                                        <div className={styles.sectionContent}>
                                            <div className={styles.formCard}>
                                                <h3 className={styles.cardTitle}>📄 {t('admin.products.formCards.productDescription')}</h3>
                                                <div className={styles.formGroup}>
                                                    <label>
                                                        {t('admin.products.fields.description')}:
                                                        <textarea
                                                            name="description"
                                                            value={formData.description}
                                                            onChange={handleChange}
                                                            rows="5"
                                                            placeholder={t('admin.products.placeholders.descriptionExample')}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Form Actions */}
                            <div className={styles.formActions}>
                                <button 
                                    type="button" 
                                    onClick={hideForm}
                                    className={styles.cancelButton}
                                >
                                    {t('admin.products.actions.cancel')}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={isEditing ? handleSaveEdit : handleAdd}
                                    className={styles.saveButton}
                                >
                                    {isEditing ? t('admin.products.actions.updateProduct') : t('admin.products.actions.addProduct')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add Product Button */}
                    {!showForm && (
                        <div className={styles.addProductSection}>
                            <button 
                                onClick={showAddForm}
                                className={styles.addButton}
                            >
                                + {t('admin.products.addNew')}
                            </button>
                        </div>
                    )}

                    {/* Products List */}
                    {!showForm && (
                        <div className={styles.productsSection}>
                            <h3>Products ({products.length})</h3>
                            <div className={styles.productsList}>
                                {products.map(product => (
                                    <div key={product.id} className={styles.productCard}>
                                        <div className={styles.productInfo}>
                                            <h4>{product.brand} {product.model}</h4>
                                            <p>Price: €{product.price}</p>
                                            <p>Type: {product.type || 'Not specified'}</p>
                                        </div>
                                        <div className={styles.productActions}>
                                            <button 
                                                onClick={() => handleEdit(product)}
                                                className={styles.editButton}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className={styles.ordersSection}>
                    <h3>Orders Management</h3>
                    <p>Orders functionality will be implemented here...</p>
                </div>
            )}

            {/* Order History Tab */}
            {activeTab === 'orderHistory' && (
                <AdminOrderHistoryTab />
            )}

            {/* Installations Tab */}
            {activeTab === 'installations' && (
                <WeeklyInstallationsTab />
            )}
        </div>
    );
}

 