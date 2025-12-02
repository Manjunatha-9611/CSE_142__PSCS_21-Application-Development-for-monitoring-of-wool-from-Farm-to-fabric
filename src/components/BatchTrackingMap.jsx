import React, { useState, useEffect, useCallback, useMemo } from 'react';
import firebaseService from '../services/firebaseService.jsx';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Route cache in localStorage
const ROUTE_CACHE_KEY = 'wool_tracking_routes';
const ROUTE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Cache helper functions
const getRouteCache = () => {
  try {
    const cache = localStorage.getItem(ROUTE_CACHE_KEY);
    return cache ? JSON.parse(cache) : {};
  } catch {
    return {};
  }
};

const setRouteCache = (key, route) => {
  try {
    const cache = getRouteCache();
    cache[key] = {
      route,
      timestamp: Date.now()
    };
    localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to cache route:', e);
  }
};

const getCachedRoute = (key) => {
  const cache = getRouteCache();
  const item = cache[key];

  if (!item) return null;

  const age = Date.now() - item.timestamp;
  if (age > ROUTE_CACHE_TTL) {
    return null;
  }

  return item.route;
};

const BatchTrackingMap = ({ batchId, onClose }) => {
  const [trackingData, setTrackingData] = useState([]);
  const [batchInfo, setBatchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const loadTrackingData = useCallback(async () => {
    try {
      const data = await firebaseService.getTrackingHistory(batchId);
      setTrackingData(data || []);

      // Generate route if we have multiple points
      if (data && data.length > 1) {
        await generateRoute(data);
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
      setTrackingData([]);
    }
  }, [batchId]);

  const loadBatchInfo = useCallback(async () => {
    try {
      const batch = await firebaseService.getBatch(batchId);
      setBatchInfo(batch);
    } catch (error) {
      console.error('Error loading batch info:', error);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  const generateRoute = async (data) => {
    const validPoints = data.filter(entry => {
      if (!entry.coordinates && !entry.location) return false;
      const coords = entry.coordinates || entry.location;
      if (typeof coords === 'string') {
        const parts = coords.split(',').map(p => parseFloat(p.trim()));
        return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]);
      }
      return coords && coords.lat && coords.lng;
    }).map(entry => {
      const coords = entry.coordinates || entry.location;
      if (typeof coords === 'string') {
        const parts = coords.split(',').map(p => parseFloat(p.trim()));
        return { lat: parts[0], lng: parts[1] };
      }
      return coords;
    });

    if (validPoints.length < 2) {
      setRouteCoordinates([]);
      return;
    }

    // Check cache first
    const cacheKey = validPoints.map(p => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join('|');
    const cachedRoute = getCachedRoute(cacheKey);

    if (cachedRoute) {
      console.log('✓ Using cached route');
      setRouteCoordinates(cachedRoute);
      return;
    }

    setIsLoadingRoute(true);

    try {
      // Use OSRM for better routing (free alternative to Google Maps)
      const routes = [];
      for (let i = 0; i < validPoints.length - 1; i++) {
        const start = validPoints[i];
        const end = validPoints[i + 1];
        try {
          const routeResponse = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
          );
          if (routeResponse.ok) {
            const routeData = await routeResponse.json();
            if (routeData.routes && routeData.routes[0]) {
              const coords = routeData.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
              routes.push(...coords);
            } else {
              // Fallback to straight line
              routes.push([start.lat, start.lng], [end.lat, end.lng]);
            }
          } else {
            // Fallback to straight line
            routes.push([start.lat, start.lng], [end.lat, end.lng]);
          }
        } catch (err) {
          console.warn('Route segment failed, using direct line');
          routes.push([start.lat, start.lng], [end.lat, end.lng]);
        }
      }
      setRouteCoordinates(routes);
      setRouteCache(cacheKey, routes);
      console.log('✓ Route calculated and cached');
    } catch (error) {
      console.warn('Routing failed, using direct lines:', error);
      // Fallback to direct lines
      const directRoute = validPoints.map(p => [p.lat, p.lng]);
      setRouteCoordinates(directRoute);
      setRouteCache(cacheKey, directRoute);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      loadTrackingData();
      loadBatchInfo();

      // Auto-refresh tracking data every 10 seconds
      const refreshInterval = setInterval(() => {
        loadTrackingData();
      }, 10000);

      return () => clearInterval(refreshInterval);
    }
  }, [batchId, loadTrackingData, loadBatchInfo]);



  const getStatusColor = (status) => {
    const colors = {
      'CREATED': 'success',
      'IN_TRANSIT': 'warning',
      'IN_PROCESSING': 'info',
      'IN_STORAGE': 'primary',
      'DELIVERED': 'success',
      'COMPLETED': 'success'
    };
    return colors[status] || 'secondary';
  };

  const getProcessIcon = (process) => {
    const icons = {
      'movement': 'fas fa-truck',
      'processing': 'fas fa-cogs',
      'storage': 'fas fa-warehouse',
      'quality_check': 'fas fa-check-circle',
      'packaging': 'fas fa-box',
      'delivery': 'fas fa-shipping-fast'
    };
    return icons[process] || 'fas fa-circle';
  };

  const formatCoordinates = (coordinates) => {
    if (typeof coordinates === 'string') {
      const parts = coordinates.split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return `${parts[0].toFixed(4)}, ${parts[1].toFixed(4)}`;
      }
      return coordinates;
    }
    if (coordinates && coordinates.lat && coordinates.lng) {
      return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
    }
    return 'Unknown';
  };

  if (loading || isLoadingRoute) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">{isLoadingRoute ? 'Calculating route...' : 'Loading tracking data...'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get coordinates array - handle different coordinate formats
  const validPoints = (trackingData || []).filter(entry => {
    if (!entry.coordinates && !entry.location) return false;
    const coords = entry.coordinates || entry.location;
    if (typeof coords === 'string') {
      const parts = coords.split(',').map(p => parseFloat(p.trim()));
      return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]);
    }
    return coords && coords.lat && coords.lng;
  }).map(entry => {
    const coords = entry.coordinates || entry.location;
    if (typeof coords === 'string') {
      const parts = coords.split(',').map(p => parseFloat(p.trim()));
      return { ...entry, location: { lat: parts[0], lng: parts[1] } };
    }
    return { ...entry, location: coords };
  });

  const mapCenter = validPoints.length ? [validPoints[0].location.lat, validPoints[0].location.lng] : [-33.8688, 151.2093];
  const pathCoordinates = validPoints.map(entry => [entry.location.lat, entry.location.lng]);

  function MapFlyTo({ center }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, 8);
    }, [center, map]);
    return null;
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content" style={{ borderRadius: 'var(--klwb-radius-lg)', overflow: 'hidden' }}>
          <div className="klwb-detail-header">
            <h5 className="klwb-detail-title">
              <i className="fas fa-map-marked-alt me-2"></i>
              Batch Tracking Map - {batchId}
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Batch Info */}
            {batchInfo && (
              <div className="row mb-4">
                <div className="col-12">
                  <div className="klwb-detail-card">
                    <div className="klwb-detail-grid">
                      <div className="klwb-detail-item">
                        <div className="klwb-detail-label">Batch ID</div>
                        <div className="klwb-detail-value">{batchInfo.batchId}</div>
                      </div>
                      <div className="klwb-detail-item">
                        <div className="klwb-detail-label">Wool Type</div>
                        <div className="klwb-detail-value">{batchInfo.woolType || 'N/A'}</div>
                      </div>
                      <div className="klwb-detail-item">
                        <div className="klwb-detail-label">Weight</div>
                        <div className="klwb-detail-value">{batchInfo.weight || 'N/A'} kg</div>
                      </div>
                      <div className="klwb-detail-item">
                        <div className="klwb-detail-label">Status</div>
                        <div className="klwb-detail-value">
                          <span className={`klwb-status-badge klwb-status-${batchInfo.status?.toLowerCase() || 'pending'}`}>
                            {batchInfo.status || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row">
              {/* Tracking Timeline */}
              <div className="col-md-6">
                <div className="klwb-table-container">
                  <div className="klwb-table-header">
                    <h6 className="klwb-table-title">
                      <i className="fas fa-history me-2"></i>
                      Tracking Timeline
                    </h6>
                  </div>
                  <div className="p-3" style={{ maxHeight: '500px', overflowY: 'auto', background: 'var(--klwb-white)' }}>
                    {trackingData.length === 0 ? (
                      <div className="text-center py-4">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No tracking data available</p>
                      </div>
                    ) : (
                      <div className="timeline">
                        {trackingData.map((entry, index) => (
                          <div
                            key={`timeline-${entry.entryId || entry.timestamp || index}`}
                            className={`timeline-item ${selectedEntry?.entryId === entry.entryId ? 'active' : ''}`}
                            onClick={() => setSelectedEntry(entry)}
                            style={{ cursor: 'pointer' }}>
                            <div className="timeline-marker">
                              <i className={getProcessIcon(entry.process)}></i>
                            </div>
                            <div className="timeline-content">
                              <div className="card">
                                <div className="card-body p-3">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="card-title mb-0">
                                      {entry.process ? entry.process.replace('_', ' ').toUpperCase() : 'MOVEMENT'}
                                    </h6>
                                    <small className="text-muted">
                                      {new Date(entry.timestamp).toLocaleString()}
                                    </small>
                                  </div>
                                  <p className="card-text small mb-2">
                                    <strong>Actor:</strong> {entry.actor || 'Unknown'}<br />
                                    <strong>Location:</strong> {formatCoordinates(entry.coordinates || entry.location)}<br />
                                    {entry.notes && (<><strong>Notes:</strong> {entry.notes}</>)}
                                  </p>
                                  <div className="d-flex gap-2">
                                    <span className={`badge bg-${getStatusColor(entry.status)}`}>
                                      {entry.status || 'ACTIVE'}
                                    </span>
                                    <span className="badge bg-secondary">
                                      #{index + 1}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Map Visualization */}
              <div className="col-md-6">
                <div className="klwb-table-container">
                  <div className="klwb-table-header">
                    <h6 className="klwb-table-title">
                      <i className="fas fa-map me-2"></i>
                      Location Map
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="map-container" style={{ height: '400px', backgroundColor: '#f8f9fa', borderRadius: '8px', position: 'relative' }}>
                      <MapContainer
                        center={mapCenter}
                        zoom={8}
                        style={{ height: '100%', width: '100%' }}>
                        <MapFlyTo center={mapCenter} />
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {validPoints.map((entry, idx) => {
                          // Create custom icon based on process type
                          const iconColor = idx === 0 ? 'green' : idx === validPoints.length - 1 ? 'red' : 'blue';
                          const customIcon = new L.Icon({
                            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                          });

                          return (
                            <Marker
                              key={`marker-${entry.entryId || entry.timestamp || idx}`}
                              position={[entry.location.lat, entry.location.lng]}
                              icon={customIcon}
                            >
                              <Popup>
                                <div>
                                  <strong>{entry.process || 'Movement'}</strong><br />
                                  <strong>Time:</strong> {new Date(entry.timestamp).toLocaleString()}<br />
                                  <strong>Location:</strong> {entry.location.lat.toFixed(4)}, {entry.location.lng.toFixed(4)}<br />
                                  <strong>Actor:</strong> {entry.actor || 'Unknown'}<br />
                                  {entry.notes && <span><strong>Notes:</strong> {entry.notes}</span>}
                                </div>
                              </Popup>
                            </Marker>
                          );
                        })}
                        {routeCoordinates.length > 1 && (
                          <Polyline
                            positions={routeCoordinates}
                            color="var(--klwb-primary)"
                            weight={5}
                            opacity={0.9}
                            dashArray="10, 5"
                          />
                        )}

                      </MapContainer>
                    </div>
                    {selectedEntry && (
                      <div className="mt-3 p-3 bg-light rounded">
                        <h6>Selected Entry:</h6>
                        <p className="mb-1">
                          <strong>Process:</strong> {selectedEntry.process}
                        </p>
                        <p className="mb-1">
                          <strong>Location:</strong> {formatCoordinates(selectedEntry.location)}
                        </p>
                        <p className="mb-1">
                          <strong>Actor:</strong> {selectedEntry.actor}
                        </p>
                        <p className="mb-0">
                          <strong>Time:</strong> {new Date(selectedEntry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div className="klwb-detail-card mt-3">
                  <div className="klwb-detail-header">
                    <h6 className="klwb-detail-title">
                      <i className="fas fa-chart-bar me-2"></i>
                      Tracking Statistics
                    </h6>
                  </div>
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="klwb-kpi-card red" style={{ margin: '0', padding: 'var(--klwb-spacing-md)' }}>
                        <div className="klwb-kpi-content">
                          <h4 className="klwb-kpi-number" style={{ fontSize: 'var(--klwb-font-size-xl)' }}>{trackingData.length}</h4>
                          <p className="klwb-kpi-label">Total Scans</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="klwb-kpi-card green" style={{ margin: '0', padding: 'var(--klwb-spacing-md)' }}>
                        <div className="klwb-kpi-content">
                          <h4 className="klwb-kpi-number" style={{ fontSize: 'var(--klwb-font-size-xl)' }}>
                            {trackingData.filter(e => e.status === 'COMPLETED').length}
                          </h4>
                          <p className="klwb-kpi-label">Completed</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="klwb-kpi-card cyan" style={{ margin: '0', padding: 'var(--klwb-spacing-md)' }}>
                        <div className="klwb-kpi-content">
                          <h4 className="klwb-kpi-number" style={{ fontSize: 'var(--klwb-font-size-xl)' }}>
                            {trackingData.filter(e => e.status === 'IN_PROGRESS').length}
                          </h4>
                          <p className="klwb-kpi-label">In Progress</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <div className="klwb-form-actions">
              <button className="klwb-btn-secondary" onClick={onClose}>
                <i className="fas fa-times me-2"></i>Close
              </button>
              <button
                className="klwb-btn-primary"
                onClick={() => window.print()}
              >
                <i className="fas fa-print me-2"></i>Print Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
      .timeline {
        position: relative;
        padding-left: 30px;
      }
      .timeline-item { position: relative; margin-bottom: 20px; }
      .timeline-item::before {
        content: ''; position: absolute; left: -25px; top: 20px; width: 2px; height: calc(100% + 20px); background-color: #dee2e6;
      }
      .timeline-item:last-child::before { display: none; }
      .timeline-marker {
        position: absolute; left: -30px; top: 15px; width: 20px; height: 20px;
        background-color: #007bff; border-radius: 50%; display: flex; align-items: center;
        justify-content: center; color: white; font-size: 10px; z-index: 1;
      }
      .timeline-item.active .timeline-marker { background-color: #28a745; transform: scale(1.2); }
      .timeline-content { margin-left: 10px; }
      .timeline-item.active .card { border-color: #28a745; box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25); }
      `}</style>
    </div>
  );
};

export default BatchTrackingMap;
