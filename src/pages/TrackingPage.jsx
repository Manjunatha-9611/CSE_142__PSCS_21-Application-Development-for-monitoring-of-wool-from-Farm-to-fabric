import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import firebaseService from '../services/firebaseService.jsx';

const TrackingPage = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadTrackingData();
  }, [batchId]);

  const loadTrackingData = async () => {
    try {
      const batchData = await firebaseService.getBatch(batchId);
      const history = await firebaseService.getTrackingHistory(batchId);

      setBatch(batchData);
      setTrackingHistory(history);

      // Calculate current step based on status
      const statusSteps = {
        'CREATED': 0,
        'REGISTERED': 0,
        'PENDING_QUALITY_CHECK': 1,
        'QUALITY_CHECK': 1,
        'QUALITY_VERIFIED': 1,
        'QUALITY_CERTIFIED': 1,
        'CERTIFIED': 1,
        'IN_TRANSIT': 2,
        'DISTRIBUTION': 2,
        'SHIPPED': 2,
        'PROCESSING': 3,
        'IN_PROCESSING': 3,
        'DELIVERED': 4,
        'COMPLETED': 4,
        'SOLD': 4
      };
      setCurrentStep(statusSteps[batchData?.status] || 0);
    } catch (error) {
      console.error('Error loading tracking data:', error);
    }
    setLoading(false);
  };

  const trackingSteps = [
    {
      id: 'registered',
      title: 'Batch Registered',
      icon: 'fas fa-clipboard-check',
      description: 'Wool batch created and registered in system'
    },
    {
      id: 'quality',
      title: 'Quality Verified',
      icon: 'fas fa-certificate',
      description: 'Quality assessment completed'
    },
    {
      id: 'transit',
      title: 'In Transit',
      icon: 'fas fa-truck',
      description: 'Batch is being transported'
    },
    {
      id: 'processing',
      title: 'Processing',
      icon: 'fas fa-cogs',
      description: 'Batch is being processed'
    },
    {
      id: 'delivered',
      title: 'Delivered',
      icon: 'fas fa-check-circle',
      description: 'Batch delivered successfully'
    }
  ];

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: 'var(--klwb-spacing-xl)' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <h5>Loading tracking information...</h5>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="container-fluid" style={{ padding: 'var(--klwb-spacing-xl)' }}>
        <div className="klwb-detail-card">
          <div className="text-center py-5">
            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <h5>Batch Not Found</h5>
            <p>The tracking ID you entered could not be found.</p>
            <button className="klwb-btn-primary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: 'var(--klwb-spacing-xl) var(--klwb-spacing-lg)' }}>
      {/* Header */}
      <div className="klwb-detail-card mb-4">
        <div className="klwb-detail-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="klwb-detail-title">
                <i className="fas fa-route me-2"></i>
                Track Your Wool Batch
              </h2>
              <p className="mb-0 text-muted">Real-time tracking for batch ID: <strong>{batchId}</strong></p>
            </div>
            <button className="klwb-btn-secondary" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left me-2"></i>Back
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left Column - Tracking Progress */}
        <div className="col-lg-8 mb-4">
          {/* Current Status Banner */}
          <div className="klwb-detail-card mb-4" style={{ background: 'linear-gradient(135deg, var(--klwb-primary) 0%, var(--klwb-primary-light) 100%)', color: 'white' }}>
            <div className="p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h4 className="mb-2" style={{ color: 'white' }}>
                    <i className={`${trackingSteps[currentStep]?.icon} me-2`}></i>
                    {trackingSteps[currentStep]?.title}
                  </h4>
                  <p className="mb-0" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {trackingSteps[currentStep]?.description}
                  </p>
                </div>
                <div className="col-md-4 text-end">
                  <div className="display-6" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {Math.round(((currentStep + 1) / trackingSteps.length) * 100)}%
                  </div>
                  <small style={{ color: 'rgba(255,255,255,0.8)' }}>Complete</small>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="klwb-detail-card mb-4">
            <div className="klwb-detail-header">
              <h5 className="klwb-detail-title">
                <i className="fas fa-list-ol me-2"></i>
                Tracking Progress
              </h5>
            </div>
            <div className="p-4">
              <div className="tracking-timeline">
                {trackingSteps.map((step, index) => (
                  <div key={step.id} className={`tracking-step ${index <= currentStep ? 'completed' : 'pending'}`}>
                    <div className="step-marker">
                      <i className={step.icon}></i>
                    </div>
                    <div className="step-content">
                      <h6 className="step-title">{step.title}</h6>
                      <p className="step-description">{step.description}</p>
                      {index <= currentStep && (
                        <small className="text-success">
                          <i className="fas fa-check me-1"></i>Completed
                        </small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tracking History */}
          <div className="klwb-detail-card">
            <div className="klwb-detail-header">
              <h5 className="klwb-detail-title">
                <i className="fas fa-history me-2"></i>
                Tracking History ({trackingHistory.length})
              </h5>
            </div>
            <div className="p-4">
              {trackingHistory.length > 0 ? (
                <div className="tracking-history">
                  {trackingHistory.map((entry, index) => (
                    <div key={index} className="history-item">
                      <div className="history-marker">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      <div className="history-content">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{typeof entry.location === 'string' ? entry.location : 'Location Update'}</h6>
                            <p className="mb-1 text-muted">{entry.process || 'Location Update'}</p>
                            <small className="text-muted">
                              <i className="fas fa-clock me-1"></i>
                              {new Date(entry.timestamp?.seconds ? entry.timestamp.seconds * 1000 : entry.timestamp).toLocaleString()}
                            </small>
                          </div>
                          <span className={`klwb-status-badge klwb-status-${entry.status === 'IN_TRANSIT' ? 'processing' : 'approved'}`}>
                            {entry.status}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="mt-2 mb-0 small">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-route fa-3x text-muted mb-3"></i>
                  <h6 className="text-muted">No tracking history available</h6>
                  <p className="text-muted">Tracking updates will appear here as the batch moves through the supply chain.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Batch Details & Map */}
        <div className="col-lg-4">
          {/* Batch Information */}
          <div className="klwb-detail-card mb-4">
            <div className="klwb-detail-header">
              <h6 className="klwb-detail-title">
                <i className="fas fa-info-circle me-2"></i>
                Batch Information
              </h6>
            </div>
            <div className="p-3">
              <div className="batch-info">
                <div className="info-row">
                  <span className="info-label">Batch ID:</span>
                  <span className="info-value">{batch.batchId}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Farmer:</span>
                  <span className="info-value">{batch.farmerName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Wool Type:</span>
                  <span className="info-value">{batch.woolType}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Weight:</span>
                  <span className="info-value">{batch.weight} kg</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Origin:</span>
                  <span className="info-value">{batch.location}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Created:</span>
                  <span className="info-value">
                    {new Date(batch.createdAt?.seconds ? batch.createdAt.seconds * 1000 : batch.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Map */}
          <div className="klwb-detail-card">
            <div className="klwb-detail-header">
              <h6 className="klwb-detail-title">
                <i className="fas fa-map me-2"></i>
                Live Tracking Map
              </h6>
            </div>
            <div className="p-0">
              <div style={{ borderRadius: '0 0 var(--klwb-radius-lg) var(--klwb-radius-lg)', overflow: 'hidden' }}>
                {(() => {
                  // Extract coordinates from tracking history
                  const locations = trackingHistory.map((entry, idx) => {
                    if (entry.coordinates) {
                      let lat, lng, locationName;

                      if (typeof entry.coordinates === 'string') {
                        const parts = entry.coordinates.split(',').map(p => parseFloat(p.trim()));
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                          lat = parts[0];
                          lng = parts[1];
                        }
                      } else if (entry.coordinates.lat && entry.coordinates.lng) {
                        lat = entry.coordinates.lat;
                        lng = entry.coordinates.lng;
                      }

                      // Ensure location is always a string
                      if (typeof entry.location === 'string') {
                        locationName = entry.location;
                      } else {
                        locationName = `Location ${idx + 1}`;
                      }

                      if (lat && lng) {
                        return { lat, lng, location: locationName };
                      }
                    }
                    return null;
                  }).filter(Boolean);

                  if (locations.length === 0) {
                    return (
                      <div style={{ height: '400px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="text-center">
                          <i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                          <h6 className="text-muted">No Location Data</h6>
                          <p className="text-muted small">No tracking coordinates available for this batch</p>
                        </div>
                      </div>
                    );
                  }

                  // Calculate bounding box for all locations
                  const lats = locations.map(l => l.lat);
                  const lngs = locations.map(l => l.lng);
                  const minLat = Math.min(...lats) - 0.01;
                  const maxLat = Math.max(...lats) + 0.01;
                  const minLng = Math.min(...lngs) - 0.01;
                  const maxLng = Math.max(...lngs) + 0.01;

                  // Use center point as marker
                  const centerLat = (minLat + maxLat) / 2;
                  const centerLng = (minLng + maxLng) / 2;

                  return (
                    <div>
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${centerLat},${centerLng}`}
                        width="100%"
                        height="300"
                        style={{ border: 'none' }}
                        title="Dynamic Tracking Map"
                      ></iframe>
                      <div className="p-2" style={{ background: 'var(--klwb-light)', fontSize: '0.8rem' }}>
                        <strong>Tracked Locations ({locations.length}):</strong>
                        {locations.map((loc, idx) => (
                          <div key={idx} className="d-flex justify-content-between">
                            <span>{loc.location || 'Location ' + (idx + 1)}</span>
                            <small className="text-muted">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="klwb-detail-card mt-4">
            <div className="klwb-detail-header">
              <h6 className="klwb-detail-title">
                <i className="fas fa-tools me-2"></i>
                Quick Actions
              </h6>
            </div>
            <div className="p-3">
              <div className="d-grid gap-2">
                <button className="klwb-btn-primary" onClick={() => window.print()}>
                  <i className="fas fa-print me-2"></i>Print Tracking Details
                </button>
                <button className="klwb-btn-secondary" onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  alert('Tracking link copied to clipboard!');
                }}>
                  <i className="fas fa-share me-2"></i>Share Tracking Link
                </button>
                <button className="klwb-btn-secondary" onClick={() => navigate('/traceability')}>
                  <i className="fas fa-search me-2"></i>Track Another Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .tracking-timeline {
          position: relative;
        }
        
        .tracking-step {
          display: flex;
          align-items: flex-start;
          margin-bottom: 2rem;
          position: relative;
        }
        
        .tracking-step:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 24px;
          top: 48px;
          width: 2px;
          height: calc(100% + 8px);
          background: var(--klwb-gray-light);
        }
        
        .tracking-step.completed:not(:last-child)::after {
          background: var(--klwb-success);
        }
        
        .step-marker {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
          background: var(--klwb-gray-light);
          color: var(--klwb-gray);
          border: 3px solid var(--klwb-gray-light);
        }
        
        .tracking-step.completed .step-marker {
          background: var(--klwb-success);
          color: white;
          border-color: var(--klwb-success);
        }
        
        .step-content {
          flex: 1;
          padding-top: 8px;
        }
        
        .step-title {
          margin-bottom: 0.5rem;
          color: var(--klwb-primary);
        }
        
        .step-description {
          margin-bottom: 0.5rem;
          color: var(--klwb-text-muted);
        }
        
        .tracking-history {
          position: relative;
        }
        
        .history-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          position: relative;
        }
        
        .history-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 12px;
          top: 32px;
          width: 2px;
          height: calc(100% + 8px);
          background: var(--klwb-gray-light);
        }
        
        .history-marker {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
          background: var(--klwb-primary);
          color: white;
          font-size: 0.8rem;
        }
        
        .history-content {
          flex: 1;
        }
        
        .batch-info .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--klwb-gray-lighter);
        }
        
        .batch-info .info-row:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: 500;
          color: var(--klwb-text-muted);
        }
        
        .info-value {
          font-weight: 600;
          color: var(--klwb-primary);
        }
      `}</style>
    </div>
  );
};

export default TrackingPage;