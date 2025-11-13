import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import styles from '../styles/Page Styles/Administration.module.css';
import AdminOrderHistoryTab from '../components/AdminOrderHistoryTab';
import WeeklyInstallationsTab from '../components/WeeklyInstallationsTab';
import OrdersManagementTab from '../components/OrdersManagementTab';
import InquiryManagementTab from '../components/InquiryManagementTab';
import ProductsManagementTab from '../components/ProductsManagementTab';

export default function Administration() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const locale = router.locale || 'bg';

    // Debug info

    // Authentication state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Main tabs state
    const [activeTab, setActiveTab] = useState('products');

    // Check if user is already logged in on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
            if (isAuthenticated) {
                setIsLoggedIn(true);
            }
        }
    }, []);

    // Authentication logic
    const handleLogin = async () => {
        if (!usernameInput.trim() || !passwordInput.trim()) {
            setError({
                message: "Моля, въведете имейл адрес и парола",
                type: "warning"
            });
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Call secure API endpoint for authentication
            const response = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: usernameInput,
                    password: passwordInput,
                    type: 'admin'
                }),
            });

            const result = await response.json();

            // Handle rate limiting (429 Too Many Requests)
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const retryMinutes = retryAfter ? Math.ceil(parseInt(retryAfter) / 60) : 15;
                setError({
                    message: `Твърде много опити за влизане. Моля, изчакайте ${retryMinutes} минути преди да опитате отново.`,
                    type: "error"
                });
                return;
            }

            if (response.ok && result.success) {
                // Store authentication state
                localStorage.setItem('admin_authenticated', 'true');
                localStorage.setItem('admin_login_time', new Date().toISOString());

                // Store Supabase session tokens
                if (result.session?.access_token) {
                    localStorage.setItem('admin_access_token', result.session.access_token);
                }
                if (result.session?.refresh_token) {
                    localStorage.setItem('admin_refresh_token', result.session.refresh_token);
                }

                // Store user information from Supabase
                if (result.user) {
                    localStorage.setItem('admin_user', JSON.stringify(result.user));
                }

                setIsLoggedIn(true);
            } else {
                setError({
                    message: result.error || "Невалиден имейл адрес или парола",
                    type: "error"
                });
            }
        } catch (err) {
            setError({
                message: "Възникна грешка при влизане. Моля, опитайте отново.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Basic authentication check
    if (!isLoggedIn) {
        return (
            <>
                <div className={styles.loginContainer}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕵️</div>
                    <h1>Admin Login</h1>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '5px',
                            backgroundColor: error.type === 'error' ? '#fee' : '#fff3cd',
                            border: `1px solid ${error.type === 'error' ? '#fcc' : '#ffeaa7'}`,
                            color: error.type === 'error' ? '#c33' : '#856404'
                        }}>
                            ⚠️ {error.message}
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder={t('admin.login.username')}
                        value={usernameInput}
                        onChange={(e) => {
                            setUsernameInput(e.target.value);
                            // Clear error when user starts typing
                            if (error) {
                                setError(null);
                            }
                        }}
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
                        onChange={(e) => {
                            setPasswordInput(e.target.value);
                            // Clear error when user starts typing
                            if (error) {
                                setError(null);
                            }
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleLogin();
                            }
                        }}
                    />
                    <button
                        onClick={handleLogin}
                        disabled={isLoading || !usernameInput.trim() || !passwordInput.trim()}
                        style={{
                            opacity: (isLoading || !usernameInput.trim() || !passwordInput.trim()) ? 0.6 : 1,
                            cursor: (isLoading || !usernameInput.trim() || !passwordInput.trim()) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Влизане...' : t('admin.login.loginButton')}
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
                <button
                    className={`${styles.tab} ${activeTab === 'inquiries' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('inquiries')}
                >
                    {t('admin.tabs.inquiries')}
                </button>
            </div>

            {/* Products Tab */}
            {activeTab === 'products' && (
                <ProductsManagementTab />
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

            {/* Inquiries Tab */}
            {activeTab === 'inquiries' && (
                <InquiryManagementTab />
            )}
        </div>
    );
}

export async function getStaticProps({ locale }) {
    const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');

    return {
        props: {
            ...(await serverSideTranslations(locale || 'bg', ['common'])),
        },
    };
}
