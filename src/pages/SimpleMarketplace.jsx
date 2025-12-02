import React, { useState, useEffect } from 'react';
import firebaseService from '../services/firebaseService.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import landImage from '../assests/land.jpg';

const SimpleMarketplace = ({ user }) => {
  const { t } = useLanguage();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const availableBatches = await firebaseService.getAllAvailableBatches();
      setBatches(availableBatches);
    } catch (error) {
      console.error('Error loading batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (batch) => {
    if (!user) {
      alert(t('loginToPurchase'));
      return;
    }

    try {
      const orderData = {
        items: [{
          batchId: batch.batchId,
          name: batch.batchName || `${batch.woolType} Wool`,
          price: batch.price,
          quantity: 1,
          total: batch.price
        }],
        totalAmount: batch.price,
        paymentMethod: 'Card',
        shippingAddress: 'Default Address'
      };

      await firebaseService.createOrder(orderData);
      alert(t('orderSuccess'));
      loadBatches(); // Refresh batches
    } catch (error) {
      console.error('Error placing order:', error);
      alert(t('orderFailed'));
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: 'var(--klwb-spacing-xl)' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3"></div>
          <h5>{t('loadingMarketplace')}</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: 'var(--klwb-spacing-xl) var(--klwb-spacing-lg)' }}>
      <div className="klwb-detail-card mb-4">
        <div className="klwb-detail-header">
          <h2 className="klwb-detail-title">
            <i className="fas fa-store me-2"></i>
            {t('marketplaceTitle')}
          </h2>
          <p className="mb-0 text-muted">{t('marketplaceSubtitle')}</p>
        </div>
      </div>

      <div className="klwb-detail-card">
        <div className="klwb-detail-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="klwb-detail-title">
              <i className="fas fa-boxes me-2"></i>
              {t('availableBatches')} ({batches.length})
            </h5>
            <span className="klwb-status-badge klwb-status-approved">
              <i className="fas fa-check-circle me-1"></i>
              {t('allVerified')}
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="row">
            {batches.map(batch => (
              <div key={batch.id} className="col-lg-4 col-md-6 mb-4">
                <div className="klwb-detail-card h-100">
                  <div className="position-relative">
                    <div className="text-center p-4" style={{ background: 'var(--klwb-gray-lighter)', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img
                        src={batch.imageUrl || landImage}
                        alt={batch.batchName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    {user?.role === 'farmer' && batch.farmerId === user.uid && (
                      <span className="position-absolute top-0 end-0 m-2 klwb-status-badge klwb-status-approved">
                        {t('yourBatch')}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h6 className="mb-2" style={{ color: 'var(--klwb-primary)' }}>
                      {batch.batchName || `Premium ${batch.woolType} Wool`}
                    </h6>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted small">{t('farmer')}:</span>
                        <span className="small">{batch.farmerName}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted small">{t('type')}:</span>
                        <span className="small">{batch.woolType}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted small">{t('weight')}:</span>
                        <span className="small">{batch.weight} kg</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted small">{t('location')}:</span>
                        <span className="small">{batch.location}</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="h6 mb-0" style={{ color: 'var(--klwb-success)' }}>
                        ₹{batch.price}/kg
                      </span>
                      <small className="text-muted">
                        {t('total')}: ₹{(batch.price * batch.weight).toFixed(0)}
                      </small>
                    </div>
                    {user?.role === 'buyer' && (
                      <button
                        className="klwb-btn-primary w-100"
                        onClick={() => handlePurchase(batch)}
                      >
                        <i className="fas fa-shopping-cart me-2"></i>
                        {t('purchaseBatch')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {batches.length === 0 && (
        <div className="klwb-detail-card">
          <div className="text-center py-5">
            <i className="fas fa-store-slash fa-4x mb-3" style={{ color: 'var(--klwb-gray)' }}></i>
            <h5 style={{ color: 'var(--klwb-text-muted)' }}>{t('noBatchesFound')}</h5>
            <p style={{ color: 'var(--klwb-text-muted)' }}>{t('checkBackLater')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMarketplace;