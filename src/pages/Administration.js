import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import styles from '../styles/Page Styles/Administration.module.css';
import AdminOrderHistoryTab from '../components/AdminOrderHistoryTab';
import WeeklyInstallationsTab from '../components/WeeklyInstallationsTab';
import OrdersManagementTab from '../components/OrdersManagementTab';

export default function Administration() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const locale = router.locale || 'bg';
    
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
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    
    // Form section state - accordion style
    const [expandedSections, setExpandedSections] = useState(['basic']);
    const [featureInput, setFeatureInput] = useState('');
    // Default values map for all form fields
    const defaultValues = {
        brand: '',
        model: '',
        type: '',
        capacity_btu: '',
        energy_rating: '',
        colour: '',
        price: '',
        previous_price: '',
        stock: '',
        discount: '',
        image_url: '',
        is_featured: false,
        is_bestseller: false,
        is_new: false,
        cop: '',
        scop: '',
        power_consumption: '',
        refrigerant_type: '',
        operating_temp_range: '',
        dimensions: '',
        indoor_dimensions: '',
        outdoor_dimensions: '',
        weight: '',
        noise_level: '',
        air_flow: '',
        room_size_recommendation: '',
        installation_type: '',
        warranty_period: '',
        features: [],
        description: ''
    };

    // Enhanced form validation helpers with smart default detection
    const getSectionProgress = (sectionName) => {
        const sectionConfig = {
            basic: {
                required: ['brand', 'model', 'price', 'type', 'capacity_btu', 'energy_rating', 'colour', 'stock', 'discount', 'image_url'],
                optional: []
            },
            technical: {
                required: ['cop', 'scop', 'power_consumption', 'refrigerant_type', 'operating_temp_range'],
                optional: []
            },
            physical: {
                required: [
                    'indoor_dimensions',
                    'outdoor_dimensions',
                    'indoor_weight',
                    'outdoor_weight',
                    'colour',
                    'refrigerant_type'
                ],
                optional: []
            },
            installation: {
                required: ['room_size_recommendation', 'installation_type', 'warranty_period'],
                optional: []
            },
            features: {
                required: ['features', 'is_featured', 'is_bestseller', 'is_new'],
                optional: []
            },
            description: {
                required: ['description'],
                optional: []
            }
        };

        const config = sectionConfig[sectionName] || { required: [], optional: [] };
        
        let completedRequired = 0;
        let completedOptional = 0;
        let totalRequired = config.required.length;
        let totalOptional = config.optional.length;

        // Helper function to check if a field has meaningful user input
        const hasMeaningfulInput = (fieldName, value) => {
            const defaultValue = defaultValues[fieldName];

            // For number fields, treat any value that is not '', null, or undefined as filled
            if ([
                'indoor_weight',
                'outdoor_weight'
            ].includes(fieldName)) {
                return value !== '' && value !== null && value !== undefined;
            }

            // If value is the same as default, it's not meaningful input
            if (value === defaultValue) {
                return false;
            }

            // Handle different data types
            if (typeof value === 'string') {
                const trimmed = value.trim();
                // Don't count empty strings or placeholder-like text
                if (trimmed === '' || trimmed === defaultValue || 
                    trimmed.toLowerCase().includes('example') ||
                    trimmed.toLowerCase().includes('placeholder') ||
                    trimmed.toLowerCase().includes('e.g.')) {
                    return false;
                }
                return trimmed.length > 0;
            }

            if (Array.isArray(value)) {
                // For arrays, only count if user has added items
                return value.length > 0 && JSON.stringify(value) !== JSON.stringify(defaultValue);
            }

            if (typeof value === 'boolean') {
                // For checkboxes, only count if user has changed from default
                return value !== defaultValue;
            }

            if (typeof value === 'number') {
                // For numbers, don't count NaN
                return !isNaN(value);
            }

            return value !== null && value !== undefined && value !== defaultValue;
        };

        // Count completed required fields
        config.required.forEach(field => {
            if (hasMeaningfulInput(field, formData[field])) {
                completedRequired++;
            }
        });

        // Count completed optional fields
        config.optional.forEach(field => {
            if (hasMeaningfulInput(field, formData[field])) {
                completedOptional++;
            }
        });

        // Debug log for physical section (after hasMeaningfulInput and counts)
        if (sectionName === 'physical') {
            const debugFields = [
                'indoor_dimensions',
                'outdoor_dimensions',
                'indoor_weight',
                'outdoor_weight',
                'colour',
                'refrigerant_type'
            ];
            const debugInfo = debugFields.map(field => ({
                field,
                value: formData[field],
                filled: hasMeaningfulInput(field, formData[field])
            }));
            console.log('Physical section debug:', debugInfo, 'Completed:', completedRequired, 'of', config.required.length);
        }

        const totalCompleted = completedRequired + completedOptional;
        const totalFields = totalRequired + totalOptional;

        return {
            completedRequired,
            completedOptional,
            totalRequired,
            totalOptional,
            totalCompleted,
            totalFields,
            progress: totalFields > 0 ? Math.round((totalCompleted / totalFields) * 100) : 0,
            isComplete: totalRequired === 0 ? totalCompleted === totalFields : completedRequired === totalRequired,
            hasContent: totalCompleted > 0
        };
    };

    const getSectionStatus = (sectionName) => {
        const progress = getSectionProgress(sectionName);
        
        if (progress.isComplete) return 'completed';
        if (progress.hasContent) return 'in_progress';
        return 'pending';
    };

    const getSectionStatusLabel = (sectionName) => {
        const progress = getSectionProgress(sectionName);
        
        if (progress.isComplete) return 'Completed';
        if (progress.hasContent) return 'In progress';
        return 'Not filled';
    };

    const getSectionStatusColor = (sectionName) => {
        const progress = getSectionProgress(sectionName);
        
        if (progress.isComplete) return '🟢';
        if (progress.hasContent) return '🟠';
        return '🔴';
    };

    // Field-level validation helpers with smart default detection
    const isFieldRequired = (fieldName) => {
        // All fields are now required
        return true;
    };

    const hasMeaningfulInput = (fieldName, value) => {
        const defaultValue = defaultValues[fieldName];
        
        // If value is the same as default, it's not meaningful input
        if (value === defaultValue) {
            return false;
        }
        
        // Handle different data types
        if (typeof value === 'string') {
            const trimmed = value.trim();
            // Don't count empty strings or placeholder-like text
            if (trimmed === '' || trimmed === defaultValue || 
                trimmed.toLowerCase().includes('example') ||
                trimmed.toLowerCase().includes('placeholder') ||
                trimmed.toLowerCase().includes('e.g.')) {
                return false;
            }
            return trimmed.length > 0;
        }
        
        if (Array.isArray(value)) {
            // For arrays, only count if user has added items
            return value.length > 0 && JSON.stringify(value) !== JSON.stringify(defaultValue);
        }
        
        if (typeof value === 'boolean') {
            // For checkboxes, only count if user has changed from default
            return value !== defaultValue;
        }
        
        if (typeof value === 'number') {
            // For numbers, don't count 0 or default values
            return value !== 0 && value !== defaultValue && !isNaN(value);
        }
        
        return value !== null && value !== undefined && value !== defaultValue;
    };

    const isFieldValid = (fieldName) => {
        const value = formData[fieldName];
        return hasMeaningfulInput(fieldName, value);
    };

    const getFieldStatus = (fieldName) => {
        return isFieldValid(fieldName) ? 'valid' : 'invalid';
    };

    // Form validation for submission with smart default detection
    const validateFormForSubmission = () => {
        const errors = [];
        const sections = ['basic', 'technical', 'physical', 'installation', 'features', 'description'];
        
        sections.forEach(section => {
            const progress = getSectionProgress(section);
            if (progress.totalRequired > 0 && progress.completedRequired < progress.totalRequired) {
                const sectionNames = {
                    basic: 'Basic Information',
                    technical: 'Technical Performance',
                    physical: 'Physical Characteristics',
                    installation: 'Installation & Warranty',
                    features: 'Features & Promotional',
                    description: 'Description'
                };
                
                // Get specific missing required fields for better error messages
                const missingFields = [];
                const sectionConfig = {
                    basic: ['brand', 'model', 'price', 'type', 'capacity_btu', 'energy_rating', 'colour', 'stock', 'discount', 'image_url'],
                    technical: ['cop', 'scop', 'power_consumption', 'refrigerant_type', 'operating_temp_range'],
                    physical: ['indoor_dimensions', 'outdoor_dimensions', 'indoor_weight', 'outdoor_weight', 'colour', 'refrigerant_type'],
                    installation: ['room_size_recommendation', 'installation_type', 'warranty_period'],
                    features: ['features', 'is_featured', 'is_bestseller', 'is_new'],
                    description: ['description']
                };
                
                const requiredFields = sectionConfig[section] || [];
                requiredFields.forEach(field => {
                    if (!hasMeaningfulInput(field, formData[field])) {
                        const fieldNames = {
                            brand: 'Brand',
                            model: 'Model',
                            price: 'Price',
                            type: 'Type',
                            capacity_btu: 'Capacity (BTU)',
                            energy_rating: 'Energy Rating',
                            colour: 'Color',
                            stock: 'Stock Quantity',
                            discount: 'Discount',
                            image_url: 'Image URL',
                            cop: 'COP',
                            scop: 'SCOP',
                            power_consumption: 'Power Consumption',
                            refrigerant_type: 'Refrigerant Type',
                            operating_temp_range: 'Operating Temperature Range',
                            dimensions: 'Dimensions',
                            weight: 'Weight',
                            noise_level: 'Noise Level',
                            air_flow: 'Air Flow',
                            room_size_recommendation: 'Room Size Recommendation',
                            installation_type: 'Installation Type',
                            warranty_period: 'Warranty Period',
                            features: 'Features',
                            is_featured: 'Featured',
                            is_bestseller: 'Bestseller',
                            is_new: 'New Product',
                            description: 'Description'
                        };
                        missingFields.push(fieldNames[field] || field);
                    }
                });
                
                if (missingFields.length > 0) {
                    errors.push(`${sectionNames[section]} - Missing: ${missingFields.join(', ')}`);
                } else {
                    errors.push(`${sectionNames[section]} - ${progress.totalRequired - progress.completedRequired} required fields missing`);
                }
            }
        });
        
        return errors;
    };

    const handleFormSubmission = () => {
        const errors = validateFormForSubmission();
        
        if (errors.length > 0) {
            setValidationErrors(errors);
            setShowValidationModal(true);
            return false;
        }
        
        return true;
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
        refrigerant_type: '',
        operating_temp_range: '',
        dimensions: '',
        indoor_dimensions: '',
        outdoor_dimensions: '',
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
            refrigerant_type: '',
            operating_temp_range: '',
            dimensions: '',
            indoor_dimensions: '',
            outdoor_dimensions: '',
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
            // Enhanced validation with modal
            if (!handleFormSubmission()) {
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
            indoor_dimensions: product.indoor_dimensions || '',
            outdoor_dimensions: product.outdoor_dimensions || '',
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
            // Enhanced validation with modal
            if (!handleFormSubmission()) {
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
            <>
                {/* Validation Modal */}
                {showValidationModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h3>⚠️ Form Validation Required</h3>
                                <button 
                                    className={styles.modalCloseButton}
                                    onClick={() => setShowValidationModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                <p>You must complete all required fields before submitting:</p>
                                <ul className={styles.validationErrors}>
                                    {validationErrors.map((error, index) => (
                                        <li key={index} className={styles.validationError}>
                                            {error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className={styles.modalFooter}>
                                <button 
                                    className={styles.modalButton}
                                    onClick={() => setShowValidationModal(false)}
                                >
                                    OK, I'll fix it
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
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
        </>
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
                                            <span className={styles.sectionTitle}>
                                                {t('admin.products.sections.basic')} 
                                                <span className={styles.sectionProgress}>
                                                    ({getSectionProgress('basic').totalCompleted}/{getSectionProgress('basic').totalFields})
                                                </span>
                                            </span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatusColor('basic')} {getSectionStatusLabel('basic')}
                                            </span>
                                            <div className={styles.sectionProgressBar}>
                                                <div 
                                                    className={`${styles.sectionProgressFill} ${
                                                        getSectionProgress('basic').progress === 100 ? '' : 
                                                        getSectionProgress('basic').progress > 0 ? 'incomplete' : 'empty'
                                                    }`}
                                                    style={{ width: `${getSectionProgress('basic').progress}%` }}
                                                ></div>
                                            </div>
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
                                                    <div className={`${styles.formGroup} ${styles[getFieldStatus('brand')]}`}>
                                                        <label>
                                                            {t('admin.products.brand')} *:
                                                            <input
                                                                type="text"
                                                                name="brand"
                                                                value={formData.brand}
                                                                onChange={handleChange}
                                                                required
                                                                placeholder={t('admin.products.placeholders.brandExample')}
                                                                className={getFieldStatus('brand') === 'invalid' ? styles.invalidField : ''}
                                                            />
                                                            {getFieldStatus('brand') === 'invalid' && (
                                                                <span className={styles.fieldError}>Required</span>
                                                            )}
                                                        </label>
                                                    </div>
                                                    <div className={`${styles.formGroup} ${styles[getFieldStatus('model')]}`}>
                                                        <label>
                                                            {t('admin.products.model')} *:
                                                            <input
                                                                type="text"
                                                                name="model"
                                                                value={formData.model}
                                                                onChange={handleChange}
                                                                required
                                                                placeholder={t('admin.products.placeholders.modelExample')}
                                                                className={getFieldStatus('model') === 'invalid' ? styles.invalidField : ''}
                                                            />
                                                            {getFieldStatus('model') === 'invalid' && (
                                                                <span className={styles.fieldError}>Required</span>
                                                            )}
                                                        </label>
                                                    </div>
                                                    <div className={`${styles.formGroup} ${styles[getFieldStatus('price')]}`}> 
                                                        <label>
                                                            {t('admin.products.price')} (лв. / BGN):
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <input
                                                                    type="number"
                                                                    name="price"
                                                                    value={formData.price}
                                                                    onChange={handleChange}
                                                                    step="0.01"
                                                                    min="0"
                                                                    required
                                                                    placeholder={t('admin.products.placeholders.priceExample')}
                                                                    className={getFieldStatus('price') === 'invalid' ? styles.invalidField : ''}
                                                                    style={{ maxWidth: 120 }}
                                                                />
                                                                <span style={{ color: '#888', fontSize: '0.95em' }}>
                                                                    €{formData.price && !isNaN(formData.price) ? (parseFloat(formData.price) / 1.96).toFixed(2) : '0.00'}
                                                                </span>
                                                            </div>
                                                            {getFieldStatus('price') === 'invalid' && (
                                                                <span className={styles.fieldError}>Required</span>
                                                            )}
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
                                            <span className={styles.sectionTitle}>
                                                {t('admin.products.sections.technical')} 
                                                <span className={styles.sectionProgress}>
                                                    ({getSectionProgress('technical').totalCompleted}/{getSectionProgress('technical').totalFields})
                                                </span>
                                            </span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatusColor('technical')} {getSectionStatusLabel('technical')}
                                            </span>
                                            <div className={styles.sectionProgressBar}>
                                                <div 
                                                    className={`${styles.sectionProgressFill} ${
                                                        getSectionProgress('technical').progress === 100 ? '' : 
                                                        getSectionProgress('technical').progress > 0 ? 'incomplete' : 'empty'
                                                    }`}
                                                    style={{ width: `${getSectionProgress('technical').progress}%` }}
                                                ></div>
                                            </div>
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
                                                            {t('admin.products.fields.refrigerantType')}:
                                                            <select
                                                                name="refrigerant_type"
                                                                value={formData.refrigerant_type}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="" disabled>{t('admin.products.dropdowns.selectRefrigerant') || 'Select refrigerant type...'}</option>
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
                                            <span className={styles.sectionTitle}>
                                                {t('admin.products.sections.physical')} 
                                                <span className={styles.sectionProgress}>
                                                    ({getSectionProgress('physical').totalCompleted}/{getSectionProgress('physical').totalFields})
                                                </span>
                                            </span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatusColor('physical')} {getSectionStatusLabel('physical')}
                                            </span>
                                            <div className={styles.sectionProgressBar}>
                                                <div 
                                                    className={`${styles.sectionProgressFill} ${
                                                        getSectionProgress('physical').progress === 100 ? '' : 
                                                        getSectionProgress('physical').progress > 0 ? 'incomplete' : 'empty'
                                                    }`}
                                                    style={{ width: `${getSectionProgress('physical').progress}%` }}
                                                ></div>
                                            </div>
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
                                                            {t('admin.products.fields.indoorDimensions')} (W×H×D):
                                                            <input
                                                                type="text"
                                                                name="indoor_dimensions"
                                                                value={formData.indoor_dimensions}
                                                                onChange={handleChange}
                                                                placeholder={t('admin.products.hints.indoorDimensionsHint')}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.outdoorDimensions')} (W×H×D):
                                                            <input
                                                                type="text"
                                                                name="outdoor_dimensions"
                                                                value={formData.outdoor_dimensions}
                                                                onChange={handleChange}
                                                                placeholder={t('admin.products.hints.outdoorDimensionsHint')}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.indoorWeight')} (kg):
                                                            <input
                                                                type="number"
                                                                name="indoor_weight"
                                                                value={formData.indoor_weight}
                                                                onChange={handleChange}
                                                                step="0.1"
                                                                min="0"
                                                                placeholder={t('admin.products.hints.indoorWeightHint')}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            {t('admin.products.fields.outdoorWeight')} (kg):
                                                            <input
                                                                type="number"
                                                                name="outdoor_weight"
                                                                value={formData.outdoor_weight}
                                                                onChange={handleChange}
                                                                step="0.1"
                                                                min="0"
                                                                placeholder={t('admin.products.hints.outdoorWeightHint')}
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
                                            <span className={styles.sectionTitle}>
                                                {t('admin.products.sections.installation')} 
                                                <span className={styles.sectionProgress}>
                                                    ({getSectionProgress('installation').totalCompleted}/{getSectionProgress('installation').totalFields})
                                                </span>
                                            </span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatusColor('installation')} {getSectionStatusLabel('installation')}
                                            </span>
                                            <div className={styles.sectionProgressBar}>
                                                <div 
                                                    className={`${styles.sectionProgressFill} ${
                                                        getSectionProgress('installation').progress === 100 ? '' : 
                                                        getSectionProgress('installation').progress > 0 ? 'incomplete' : 'empty'
                                                    }`}
                                                    style={{ width: `${getSectionProgress('installation').progress}%` }}
                                                ></div>
                                            </div>
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
                                            <span className={styles.sectionTitle}>
                                                {t('admin.products.sections.features')} 
                                                <span className={styles.sectionProgress}>
                                                    ({getSectionProgress('features').totalCompleted}/{getSectionProgress('features').totalFields})
                                                </span>
                                            </span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatusColor('features')} {getSectionStatusLabel('features')}
                                            </span>
                                            <div className={styles.sectionProgressBar}>
                                                <div 
                                                    className={`${styles.sectionProgressFill} ${
                                                        getSectionProgress('features').progress === 100 ? '' : 
                                                        getSectionProgress('features').progress > 0 ? 'incomplete' : 'empty'
                                                    }`}
                                                    style={{ width: `${getSectionProgress('features').progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className={styles.expandIcon}>
                                            {isSectionExpanded('features') ? '▼' : '▶'}
                                        </span>
                                    </div>
                                    
                                    {isSectionExpanded('features') && (
                                        <div className={styles.sectionContent}>
                                            <div className={styles.formCard}>
                                                <h3 className={styles.cardTitle}>🛠️ {t('admin.products.formCards.productFeatures')}</h3>
                                                <div className={styles.featuresManager}>
                                                    <div className={styles.inputRow}>
                                                        <input
                                                            type="text"
                                                            value={featureInput || ''}
                                                            onChange={e => setFeatureInput(e.target.value)}
                                                            placeholder={t('admin.products.placeholders.featureExample')}
                                                            className={styles.featureInput}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && featureInput?.trim()) {
                                                                    e.preventDefault();
                                                                    if (!formData.features.includes(featureInput.trim())) {
                                                                        setFormData(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
                                                                    }
                                                                    setFeatureInput('');
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className={styles.addFeatureButton}
                                                            onClick={() => {
                                                                if (featureInput?.trim() && !formData.features.includes(featureInput.trim())) {
                                                                    setFormData(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
                                                                    setFeatureInput('');
                                                                }
                                                            }}
                                                        >
                                                            {t('admin.products.features.addFeature')}
                                                        </button>
                                                    </div>
                                                    <div className={styles.featuresList}>
                                                        {formData.features.map((feature, idx) => (
                                                            <span key={feature} className={styles.featureTag}>
                                                                {feature}
                                                                <button
                                                                    type="button"
                                                                    className={styles.removeFeatureButton}
                                                                    onClick={() => setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }))}
                                                                    aria-label={t('admin.products.features.removeFeature') || 'Remove feature'}
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.formCard}>
                                                <h3 className={styles.cardTitle}>🎯 {t('admin.products.formCards.promotionalTags')}</h3>
                                                <div className={styles.promoTagsGroup}>
                                                    <div className={styles.formGroup}>
                                                        <span>{t('admin.products.fields.isFeatured')}</span>
                                                        <input
                                                            type="checkbox"
                                                            name="is_featured"
                                                            checked={formData.is_featured}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <span>{t('admin.products.fields.isBestseller')}</span>
                                                        <input
                                                            type="checkbox"
                                                            name="is_bestseller"
                                                            checked={formData.is_bestseller}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <span>{t('admin.products.fields.isNew')}</span>
                                                        <input
                                                            type="checkbox"
                                                            name="is_new"
                                                            checked={formData.is_new}
                                                            onChange={handleChange}
                                                        />
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
                                            <span className={styles.sectionTitle}>
                                                {t('admin.products.sections.description')} 
                                                <span className={styles.sectionProgress}>
                                                    ({getSectionProgress('description').totalCompleted}/{getSectionProgress('description').totalFields})
                                                </span>
                                            </span>
                                            <span className={styles.sectionStatus}>
                                                {getSectionStatusColor('description')} {getSectionStatusLabel('description')}
                                            </span>
                                            <div className={styles.sectionProgressBar}>
                                                <div 
                                                    className={`${styles.sectionProgressFill} ${
                                                        getSectionProgress('description').progress === 100 ? '' : 
                                                        getSectionProgress('description').progress > 0 ? 'incomplete' : 'empty'
                                                    }`}
                                                    style={{ width: `${getSectionProgress('description').progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className={styles.expandIcon}>
                                            {isSectionExpanded('description') ? '▼' : '▶'}
                                        </span>
                                    </div>
                                    
                                    {isSectionExpanded('description') && (
                                        <div className={styles.sectionContent}>
                                            <div className={styles.formCard}>
                                                <h3 className={styles.cardTitle}>📝 {t('admin.products.formCards.productDescription')}</h3>
                                                <div className={styles.formGroup + ' ' + styles.descriptionGroup}>
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
                <OrdersManagementTab />
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

export async function getStaticProps({ locale }) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

 