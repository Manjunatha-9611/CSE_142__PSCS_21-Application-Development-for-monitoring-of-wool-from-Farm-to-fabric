import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import firebaseService from '../services/firebaseService.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const SimpleDashboard = ({ user }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    batches: 0,
    orders: 0,
    revenue: 0
  });

  const loadStats = useCallback(async () => {
    if (!user) return;

    try {
      if (user.role === 'farmer') {
        const batches = await firebaseService.getFarmerBatches(user.uid);
        const orders = await firebaseService.getUserOrders('seller');
        const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
          batches: batches.length,
          orders: orders.length,
          revenue: revenue
        });
      } else if (user.role === 'buyer') {
        const orders = await firebaseService.getUserOrders('buyer');
        const spent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
          batches: 0,
          orders: orders.length,
          revenue: spent
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="klwb-main-content">
      <div className="container-fluid">
        {/* Welcome Banner */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="klwb-detail-card">
              <div className="klwb-detail-header">
                <h3 className="klwb-detail-title">
                  <i className="fas fa-tachometer-alt me-3"></i>
                  Welcome, {user?.name || user?.displayName}!
                </h3>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <p className="mb-0">Role: {t(user?.role || 'farmer')} | Your personalized dashboard overview</p>
                <div className="klwb-status-badge klwb-status-approved">
                  <i className="fas fa-user me-2"></i>{user?.role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="row">
          {user?.role === 'farmer' && (
            <>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card red">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-boxes"></i>
                    </div>
                    <h2 className="klwb-kpi-number">{stats.batches}</h2>
                    <p className="klwb-kpi-label">{t('totalBatches')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card green">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h2 className="klwb-kpi-number">{stats.orders}</h2>
                    <p className="klwb-kpi-label">{t('approvedSales')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card cyan">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-sync-alt"></i>
                    </div>
                    <h2 className="klwb-kpi-number">{Math.floor(stats.batches * 0.3)}</h2>
                    <p className="klwb-kpi-label">{t('processing')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card purple">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-rupee-sign"></i>
                    </div>
                    <h2 className="klwb-kpi-number">₹{stats.revenue.toFixed(0)}</h2>
                    <p className="klwb-kpi-label">{t('totalRevenue')}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {user?.role === 'buyer' && (
            <>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card red">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-receipt"></i>
                    </div>
                    <h2 className="klwb-kpi-number">{stats.orders}</h2>
                    <p className="klwb-kpi-label">{t('totalOrders')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card green">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h2 className="klwb-kpi-number">{Math.floor(stats.orders * 0.8)}</h2>
                    <p className="klwb-kpi-label">{t('delivered')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card cyan">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-truck"></i>
                    </div>
                    <h2 className="klwb-kpi-number">{Math.floor(stats.orders * 0.2)}</h2>
                    <p className="klwb-kpi-label">{t('inTransit')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card purple">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-rupee-sign"></i>
                    </div>
                    <h2 className="klwb-kpi-number">₹{stats.revenue.toFixed(0)}</h2>
                    <p className="klwb-kpi-label">{t('totalSpent')}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {user?.role === 'government' && (
            <>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card red">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <h2 className="klwb-kpi-number">1,247</h2>
                    <p className="klwb-kpi-label">{t('applications')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card green">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h2 className="klwb-kpi-number">1,089</h2>
                    <p className="klwb-kpi-label">{t('approved')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card cyan">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <h2 className="klwb-kpi-number">158</h2>
                    <p className="klwb-kpi-label">{t('pending')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card purple">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-rupee-sign"></i>
                    </div>
                    <h2 className="klwb-kpi-number">₹2.4M</h2>
                    <p className="klwb-kpi-label">{t('totalValue')}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {user?.role === 'inspector' && (
            <>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card red">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <h2 className="klwb-kpi-number">24</h2>
                    <p className="klwb-kpi-label">{t('pendingInspection')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card green">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h2 className="klwb-kpi-number">156</h2>
                    <p className="klwb-kpi-label">{t('inspectedToday')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card cyan">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-star"></i>
                    </div>
                    <h2 className="klwb-kpi-number">89</h2>
                    <p className="klwb-kpi-label">{t('gradeABatches')}</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="klwb-kpi-card purple">
                  <div className="klwb-kpi-content">
                    <div className="klwb-kpi-icon">
                      <i className="fas fa-certificate"></i>
                    </div>
                    <h2 className="klwb-kpi-number">1,247</h2>
                    <p className="klwb-kpi-label">{t('totalInspections')}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="row">
          <div className="col-12">
            <div className="klwb-detail-card">
              <div className="klwb-detail-header">
                <h5 className="klwb-detail-title">
                  <i className="fas fa-bolt me-2"></i>{t('quickActions')}
                </h5>
              </div>
              <div className="d-flex gap-3 flex-wrap">
                {user?.role === 'farmer' && (
                  <>
                    <Link to="/traceability" className="klwb-action-btn klwb-btn-view">
                      <i className="fas fa-plus"></i>{t('addBatch')}
                    </Link>
                    <Link to="/marketplace" className="klwb-action-btn klwb-btn-edit">
                      <i className="fas fa-store"></i>{t('marketplace')}
                    </Link>
                    <Link to="/processing" className="klwb-action-btn klwb-btn-view">
                      <i className="fas fa-cogs"></i>{t('processing')}
                    </Link>
                    <Link to="/orders" className="klwb-action-btn klwb-btn-edit">
                      <i className="fas fa-chart-line"></i>{t('sales')}
                    </Link>
                    <Link to="/education" className="klwb-action-btn klwb-btn-view">
                      <i className="fas fa-graduation-cap"></i>{t('training')}
                    </Link>
                  </>
                )}
                {user?.role === 'buyer' && (
                  <>
                    <Link to="/products" className="klwb-action-btn klwb-btn-view">
                      <i className="fas fa-shopping-bag"></i>{t('shopNow')}
                    </Link>
                    <Link to="/cart" className="klwb-action-btn klwb-btn-edit">
                      <i className="fas fa-shopping-cart"></i>{t('cart')}
                    </Link>
                    <Link to="/processing" className="klwb-action-btn klwb-btn-view">
                      <i className="fas fa-cogs"></i>{t('processing')}
                    </Link>
                    <Link to="/orders" className="klwb-action-btn klwb-btn-edit">
                      <i className="fas fa-truck"></i>{t('trackOrders')}
                    </Link>
                    <Link to="/education" className="klwb-action-btn klwb-btn-view">
                      <i className="fas fa-graduation-cap"></i>{t('training')}
                    </Link>
                  </>
                )}
                {user?.role === 'government' && (
                  <>
                    <Link to="/government" className="klwb-action-btn klwb-btn-view">
                      <i className="fas fa-chart-bar"></i>{t('adminPanel')}
                    </Link>
                    <Link to="/market-info" className="klwb-action-btn klwb-btn-edit">
                      <i className="fas fa-certificate"></i>{t('marketInfo')}
                    </Link>
                    <Link to="/education" className="klwb-action-btn klwb-btn-view">
                      <i className="fas fa-graduation-cap"></i>{t('training')}
                    </Link>
                  </>
                )}
                {user?.role === 'inspector' && (
                  <>
                    <Link to="/inspector-quality" className="klwb-action-btn klwb-btn-view">
                      <i className="fas fa-microscope"></i>{t('qualityAssessment')}
                    </Link>
                    <Link to="/traceability" className="klwb-action-btn klwb-btn-edit">
                      <i className="fas fa-search"></i>{t('batchLookup')}
                    </Link>
                    <Link to="/market-info" className="klwb-action-btn klwb-btn-view">
                      <i className="fas fa-chart-line"></i>{t('qualityReports')}
                    </Link>
                    <Link to="/education" className="klwb-action-btn klwb-btn-edit">
                      <i className="fas fa-graduation-cap"></i>{t('training')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;