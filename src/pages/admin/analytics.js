import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import Layout from '../../components/Layout';
import styles from '../../styles/Page Styles/Administration.module.css';

const AnalyticsPage = () => {
  const { t } = useTranslation('common');
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    accessoryUsage: [],
    installationStats: { withInstallation: 0, withoutInstallation: 0 },
    topSellingByBTU: [],
    topSellingByEnergyRating: [],
    salesOverTime: [],
    totalOrders: 0,
    totalRevenue: 0
  });

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load analytics');
      }
      
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format percentage
  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <Head>
          <title>{t('admin.analytics.title')} - {t('metaTitle')}</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.loading}>
            {t('admin.analytics.loading')}...
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Head>
          <title>{t('admin.analytics.title')} - {t('metaTitle')}</title>
        </Head>
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>{t('error')}</h2>
            <p>{error}</p>
            <button onClick={fetchAnalytics} className={styles.button}>
              {t('retry')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const totalInstallations = analytics.installationStats.withInstallation + analytics.installationStats.withoutInstallation;

  return (
    <Layout>
      <Head>
        <title>{t('admin.analytics.title')} - {t('metaTitle')}</title>
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>{t('admin.analytics.title')}</h1>

        {/* Overview Cards */}
        <div className={styles.analyticsGrid}>
          <div className={styles.analyticsCard}>
            <div className={styles.cardIcon}>📊</div>
            <div className={styles.cardContent}>
              <h3>{t('admin.analytics.totalOrders')}</h3>
              <div className={styles.cardValue}>{analytics.totalOrders}</div>
            </div>
          </div>

          <div className={styles.analyticsCard}>
            <div className={styles.cardIcon}>💰</div>
            <div className={styles.cardContent}>
              <h3>{t('admin.analytics.totalRevenue')}</h3>
              <div className={styles.cardValue}>{formatCurrency(analytics.totalRevenue)}</div>
            </div>
          </div>

          <div className={styles.analyticsCard}>
            <div className={styles.cardIcon}>🔧</div>
            <div className={styles.cardContent}>
              <h3>{t('admin.analytics.installationRate')}</h3>
              <div className={styles.cardValue}>
                {formatPercentage(analytics.installationStats.withInstallation, totalInstallations)}
              </div>
            </div>
          </div>

          <div className={styles.analyticsCard}>
            <div className={styles.cardIcon}>🛠️</div>
            <div className={styles.cardContent}>
              <h3>{t('admin.analytics.accessoryOrders')}</h3>
              <div className={styles.cardValue}>
                {analytics.accessoryUsage.reduce((sum, item) => sum + item.times_used, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Installation Statistics */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('admin.analytics.installationStats')}</h2>
          <div className={styles.chartContainer}>
            <div className={styles.pieChart}>
              <div className={styles.pieChartLegend}>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendColor} ${styles.withInstallation}`}></div>
                  <span>{t('admin.analytics.withInstallation')}: {analytics.installationStats.withInstallation}</span>
                  <span className={styles.percentage}>
                    ({formatPercentage(analytics.installationStats.withInstallation, totalInstallations)})
                  </span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendColor} ${styles.withoutInstallation}`}></div>
                  <span>{t('admin.analytics.withoutInstallation')}: {analytics.installationStats.withoutInstallation}</span>
                  <span className={styles.percentage}>
                    ({formatPercentage(analytics.installationStats.withoutInstallation, totalInstallations)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accessory Usage */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('admin.analytics.accessoryUsage')}</h2>
          <div className={styles.tableContainer}>
            {analytics.accessoryUsage.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('admin.analytics.accessoryName')}</th>
                    <th>{t('admin.analytics.timesOrdered')}</th>
                    <th>{t('admin.analytics.percentage')}</th>
                    <th>{t('admin.analytics.chart')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.accessoryUsage.map((accessory, index) => {
                    const totalAccessoryOrders = analytics.accessoryUsage.reduce((sum, item) => sum + item.times_used, 0);
                    const percentage = (accessory.times_used / totalAccessoryOrders) * 100;
                    
                    return (
                      <tr key={index}>
                        <td>{accessory.name}</td>
                        <td>{accessory.times_used}</td>
                        <td>{Math.round(percentage)}%</td>
                        <td>
                          <div className={styles.barChart}>
                            <div 
                              className={styles.bar} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className={styles.noData}>
                {t('admin.analytics.noAccessoryData')}
              </div>
            )}
          </div>
        </div>

        {/* Top Selling by BTU */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('admin.analytics.topSellingByBTU')}</h2>
          <div className={styles.tableContainer}>
            {analytics.topSellingByBTU.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('admin.analytics.btuCapacity')}</th>
                    <th>{t('admin.analytics.unitsSold')}</th>
                    <th>{t('admin.analytics.chart')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topSellingByBTU.map((item, index) => {
                    const maxSold = Math.max(...analytics.topSellingByBTU.map(i => i.total_sold));
                    const percentage = (item.total_sold / maxSold) * 100;
                    
                    return (
                      <tr key={index}>
                        <td>{item.capacity_btu?.toLocaleString()} BTU</td>
                        <td>{item.total_sold}</td>
                        <td>
                          <div className={styles.barChart}>
                            <div 
                              className={styles.bar} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className={styles.noData}>
                {t('admin.analytics.noBTUData')}
              </div>
            )}
          </div>
        </div>

        {/* Top Selling by Energy Rating */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('admin.analytics.topSellingByEnergyRating')}</h2>
          <div className={styles.tableContainer}>
            {analytics.topSellingByEnergyRating.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('admin.analytics.energyRating')}</th>
                    <th>{t('admin.analytics.unitsSold')}</th>
                    <th>{t('admin.analytics.chart')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topSellingByEnergyRating.map((item, index) => {
                    const maxSold = Math.max(...analytics.topSellingByEnergyRating.map(i => i.total_sold));
                    const percentage = (item.total_sold / maxSold) * 100;
                    
                    return (
                      <tr key={index}>
                        <td>
                          <span className={styles.energyRating}>{item.energy_rating}</span>
                        </td>
                        <td>{item.total_sold}</td>
                        <td>
                          <div className={styles.barChart}>
                            <div 
                              className={styles.bar} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className={styles.noData}>
                {t('admin.analytics.noEnergyRatingData')}
              </div>
            )}
          </div>
        </div>

        {/* Sales Over Time */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('admin.analytics.salesOverTime')}</h2>
          <div className={styles.timeChart}>
            {analytics.salesOverTime.length > 0 ? (
              <div className={styles.lineChartContainer}>
                {analytics.salesOverTime.map((period, index) => {
                  const maxOrders = Math.max(...analytics.salesOverTime.map(p => p.order_count));
                  const heightPercentage = (period.order_count / maxOrders) * 100;
                  
                  return (
                    <div key={index} className={styles.chartColumn}>
                      <div 
                        className={styles.chartBar}
                        style={{ height: `${heightPercentage}%` }}
                        title={`${period.period}: ${period.order_count} orders`}
                      ></div>
                      <div className={styles.chartLabel}>
                        {formatDate(period.period)}
                      </div>
                      <div className={styles.chartValue}>
                        {period.order_count}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.noData}>
                {t('admin.analytics.noTimeData')}
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className={styles.actions}>
          <button onClick={fetchAnalytics} className={styles.button}>
            {t('admin.analytics.refresh')}
          </button>
        </div>
      </div>
    </Layout>
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

export default AnalyticsPage; 