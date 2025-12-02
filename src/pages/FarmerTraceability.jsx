import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import firebaseService from '../services/firebaseService.jsx';
import enhancedQRService from '../services/enhancedQRService.jsx';
import BatchQRScanner from '../components/BatchQRScanner.jsx';
import BatchTrackingMap from '../components/BatchTrackingMap.jsx';
import WoolQualityForm from '../components/WoolQualityForm.jsx';
import OrderTrackingSteps from '../components/OrderTrackingSteps.jsx';
import WoolQualityDetails from '../components/WoolQualityDetails.jsx';



const FarmerTraceability = ({ user }) => {
  const [myBatches, setMyBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showTrackingMap, setShowTrackingMap] = useState(false);
  const [selectedBatchForTracking, setSelectedBatchForTracking] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showQualityForm, setShowQualityForm] = useState(false);

  const [newBatch, setNewBatch] = useState({
    batchName: '',
    farmerName: user?.name || '',
    farmerId: user?.id || '',
    weight: '',
    woolType: 'Merino',
    location: '',
    coordinates: '',
    shearingDate: '',
    description: '',
    price: '',
    isListed: false,
    micron: '',
    stapleLength: '',
    strength: 'Moderate',
    crimp: 'Moderate',
    elasticity: 'Good',
    fineness: 'Moderately soft',
    color: '',
    moisture: '',
    moisture: '',
    yield: '',
    imageFile: null,
    imageUrl: ''
  });

  const [trackingEntry, setTrackingEntry] = useState({
    location: '',
    process: '',
    status: 'IN_TRANSIT',
    notes: '',
    coordinates: ''
  });

  const loadFarmerBatches = useCallback(async () => {
    setLoading(true);
    try {
      const farmerId = user?.uid;
      if (!farmerId) {
        setLoading(false);
        return;
      }

      const batches = await firebaseService.getFarmerBatches(farmerId);
      setMyBatches(batches || []);
    } catch (error) {
      console.error('Error loading batches:', error);
      setMyBatches([]);
    }
    setLoading(false);
  }, [user?.uid]);

  useEffect(() => {
    const farmerId = user?.uid || user?.id;
    const farmerName = user?.name || user?.displayName || 'Unknown';

    if (farmerId && farmerName) {
      setNewBatch(prev => ({
        ...prev,
        farmerName: farmerName,
        farmerId: farmerId
      }));
      loadFarmerBatches();
    }
  }, [user?.uid, user?.id, user?.name, user?.displayName, loadFarmerBatches]);

  const handleCreateBatch = async () => {
    if (!newBatch.batchName || !newBatch.weight || !newBatch.location || !newBatch.micron || !newBatch.stapleLength) {
      alert('Please fill in all required fields including quality data');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (newBatch.imageFile) {
        try {
          imageUrl = await firebaseService.uploadImage(newBatch.imageFile, `batches/${Date.now()}_${newBatch.imageFile.name}`);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Continue without image
        }
      }

      const batchData = {
        batchName: newBatch.batchName,
        farmerName: user?.name || user?.displayName || 'Unknown',
        farmerId: user?.uid,
        weight: parseFloat(newBatch.weight),
        woolType: newBatch.woolType,
        location: newBatch.location,
        coordinates: newBatch.coordinates || '0,0',
        shearingDate: newBatch.shearingDate,
        description: newBatch.description,
        price: parseFloat(newBatch.price) || 0,
        isListed: newBatch.isListed,
        imageUrl: imageUrl
      };

      const batch = await firebaseService.createBatch(batchData);

      // Store quality data with batch (no scoring/grading)
      const qualityData = {
        micron: parseFloat(newBatch.micron),
        stapleLength: parseFloat(newBatch.stapleLength),
        strength: newBatch.strength || 'Moderate',
        crimp: newBatch.crimp || 'Moderate',
        elasticity: newBatch.elasticity || 'Good',
        fineness: newBatch.fineness || 'Moderately soft',
        color: newBatch.color || '',
        moisture: parseFloat(newBatch.moisture) || 0,
        yield: parseFloat(newBatch.yield) || 0,
        vegetableMatter: newBatch.vegetableMatter || '',
        submittedAt: new Date().toISOString()
      };

      console.log('Storing quality data:', qualityData);
      await firebaseService.updateBatch(batch.batchId, { qualityData });

      // Update the local batch object immediately
      const updatedBatch = { ...batch, qualityData };
      setMyBatches(prev => prev.map(b => b.batchId === batch.batchId ? updatedBatch : b));

      // Also reload from server
      loadFarmerBatches();

      // Generate QR code for the batch
      try {
        const qrResult = await enhancedQRService.generateBatchQR({
          batchId: batch.batchId,
          farmerId: user?.uid,
          farmerName: user?.name || user?.displayName || 'Unknown',
          weight: parseFloat(newBatch.weight),
          createdAt: new Date().toISOString()
        });

        // Update batch with QR code
        await firebaseService.updateBatch(batch.batchId, {
          qrCode: qrResult.qrCode,
          qrData: qrResult.qrData
        });

        console.log('QR code generated for batch:', batch.batchId);
      } catch (qrError) {
        console.warn('QR code generation failed:', qrError);
        // Continue without QR code
      }

      setNewBatch({
        batchName: '',
        farmerName: user?.name || '',
        farmerId: user?.uid || '',
        weight: '',
        woolType: 'Merino',
        location: '',
        coordinates: '',
        shearingDate: '',
        description: '',
        price: '',
        isListed: false,
        micron: '',
        stapleLength: '',
        strength: 'Moderate',
        crimp: 'Moderate',
        elasticity: 'Good',
        fineness: 'Moderately soft',
        color: '',
        moisture: '',
        color: '',
        moisture: '',
        yield: '',
        imageFile: null,
        imageUrl: ''
      });

      setShowAddBatch(false);
      alert('Batch created successfully!');
      loadFarmerBatches();
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleSelectBatch = async (batch) => {
    console.log('Selected batch:', batch);
    setSelectedBatch(batch);

    try {
      const history = await firebaseService.getTrackingHistory(batch.batchId);
      setTrackingHistory(history);
    } catch (error) {
      console.error('Error loading tracking history:', error);
    }
  };

  const handleQRScanSuccess = () => {
    // Reload batches to update status
    loadFarmerBatches();
  };

  const handleViewTrackingMap = (batchId) => {
    setSelectedBatchForTracking(batchId);
    setShowTrackingMap(true);
  };



  const handleAddTracking = async () => {
    if (!selectedBatch || !trackingEntry.location) {
      alert('Please select a batch and enter location');
      return;
    }

    setLoading(true);
    try {
      await firebaseService.addTrackingEntry(selectedBatch.batchId, {
        ...trackingEntry,
        actor: user?.name || 'Unknown',
        coordinates: trackingEntry.coordinates.split(',').map(coord => parseFloat(coord.trim()))
      });

      const history = await firebaseService.getTrackingHistory(selectedBatch.batchId);
      setTrackingHistory(history);

      // Reset form
      setTrackingEntry({
        location: '',
        process: '',
        status: 'IN_TRANSIT',
        notes: '',
        coordinates: ''
      });

      setShowTrackingForm(false);
      alert('Tracking entry added successfully!');
    } catch (error) {
      console.error('Error adding tracking:', error);
      alert('Failed to add tracking entry');
    }
    setLoading(false);
  };



  const downloadQRCode = (batch) => {
    if (batch.qrCode) {
      enhancedQRService.downloadQRCode(batch.qrCode, `batch-${batch.batchId}-qr.png`);
    }
  };

  const printQRCode = (batch) => {
    if (batch.qrCode) {
      enhancedQRService.printQRCode(batch.qrCode, batch);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'REGISTERED': 'primary',
      'IN_TRANSIT': 'warning',
      'PROCESSING': 'info',
      'QUALITY_VERIFIED': 'success',
      'SOLD': 'success',
      'QUALITY_REJECTED': 'danger',
      'PENDING_QUALITY_CHECK': 'secondary'
    };
    return colors[status] || 'secondary';
  };



  return (
    <div className="klwb-main-content">
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="klwb-detail-card">
              <div className="klwb-detail-header">
                <h3 className="klwb-detail-title">
                  <i className="fas fa-seedling me-3"></i>
                  Farmer Traceability Dashboard
                </h3>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <p className="mb-0">Manage your wool batches with blockchain tracking and QR codes</p>
                <div className="d-flex gap-2">
                  <button className="klwb-btn-primary" onClick={() => setShowAddBatch(true)}>
                    <i className="fas fa-plus me-2"></i>Add Batch
                  </button>
                  <button className="klwb-btn-secondary" onClick={() => setShowQRScanner(true)}>
                    <i className="fas fa-qrcode me-2"></i>Scan QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="klwb-kpi-card red">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-boxes"></i>
                </div>
                <h2 className="klwb-kpi-number">{myBatches.length}</h2>
                <p className="klwb-kpi-label">Total Batches</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="klwb-kpi-card cyan">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-truck"></i>
                </div>
                <h2 className="klwb-kpi-number">{myBatches.filter(b => b.status === 'IN_TRANSIT').length}</h2>
                <p className="klwb-kpi-label">In Transit</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="klwb-kpi-card green">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-certificate"></i>
                </div>
                <h2 className="klwb-kpi-number">{myBatches.filter(b => b.status === 'QUALITY_VERIFIED' || b.status === 'QUALITY_CERTIFIED' || b.qualityStatus === 'INSPECTED').length}</h2>
                <p className="klwb-kpi-label">Quality Verified</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="klwb-kpi-card purple">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <h2 className="klwb-kpi-number">{myBatches.filter(b => b.status === 'SOLD').length}</h2>
                <p className="klwb-kpi-label">Sold</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Batches Table */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="klwb-table-container">
              <div className="klwb-table-header">
                <h5 className="klwb-table-title">
                  <i className="fas fa-list me-2"></i>My Wool Batches ({myBatches.length})
                </h5>
                <input
                  type="text"
                  className="klwb-search-box"
                  placeholder="Search batches..."
                />
              </div>
              <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="loading-spinner mx-auto mb-3"></div>
                    <p className="mt-2">Loading batches...</p>
                  </div>
                ) : myBatches.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No batches yet</h5>
                    <p className="text-muted">Create your first wool batch to get started</p>
                  </div>
                ) : (
                  <table className="klwb-table" style={{ minWidth: '800px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '150px' }}>Lot ID</th>
                        <th style={{ minWidth: '120px' }}>Farmer Name</th>
                        <th style={{ minWidth: '100px' }}>Weight (kg)</th>
                        <th style={{ minWidth: '110px' }}>Wool Type</th>
                        <th style={{ minWidth: '120px' }}>Status</th>
                        <th style={{ minWidth: '130px' }}>Created Date</th>
                        <th style={{ minWidth: '100px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myBatches.map((batch, index) => (
                        <tr key={`batch-${batch.batchId || batch.id || index}`} className={selectedBatch?.batchId === batch.batchId ? 'table-active' : ''}>
                          <td>
                            <strong>{batch.batchId}</strong>
                            {batch.qrCode && <i className="fas fa-qrcode text-success ms-2" title="QR Code Available"></i>}
                          </td>
                          <td>{batch.farmerName}</td>
                          <td>{batch.weight} kg</td>
                          <td>{batch.woolType || 'Merino'}</td>
                          <td>
                            <span className={`klwb-status-badge klwb-status-${(batch.status === 'QUALITY_VERIFIED' || batch.status === 'QUALITY_CERTIFIED' || batch.qualityStatus === 'INSPECTED') ? 'approved' : batch.status === 'QUALITY_REJECTED' ? 'rejected' : batch.status === 'IN_TRANSIT' ? 'processing' : 'pending'}`}>
                              {batch.status === 'REGISTERED' || batch.status === 'PENDING_QUALITY_CHECK' ? 'Pending Quality Check' :
                                (batch.status === 'QUALITY_VERIFIED' || batch.status === 'QUALITY_CERTIFIED' || batch.qualityStatus === 'INSPECTED') ? 'Quality Verified' :
                                  batch.status === 'QUALITY_REJECTED' ? 'Rejected' :
                                    batch.status === 'IN_TRANSIT' ? 'Processing' : batch.status}
                            </span>
                          </td>
                          <td>{batch.createdAt ? new Date(batch.createdAt.seconds ? batch.createdAt.seconds * 1000 : batch.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="klwb-action-btn klwb-btn-view"
                                onClick={() => handleSelectBatch(batch)}
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <Link
                                to={`/tracking/${batch.batchId}`}
                                className="klwb-action-btn klwb-btn-view"
                                title="Track Batch"
                              >
                                <i className="fas fa-route"></i>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Batch Details Section */}
        {selectedBatch && (
          <div className="row">
            {/* Tracking Progress */}
            <div className="col-lg-4 mb-4">
              <div className="klwb-detail-card h-100">
                <div className="klwb-detail-header">
                  <h6 className="klwb-detail-title">
                    <i className="fas fa-route me-2"></i>
                    Tracking Progress
                  </h6>
                </div>
                <div className="p-3">
                  <OrderTrackingSteps batch={selectedBatch} trackingHistory={trackingHistory} />
                </div>
              </div>
            </div>

            {/* Batch Details */}
            <div className="col-lg-4 mb-4">
              <WoolQualityDetails batch={selectedBatch} />
            </div>

            {/* Quick Actions */}
            <div className="col-lg-4 mb-4">
              <div className="klwb-detail-card h-100">
                <div className="klwb-detail-header">
                  <h6 className="klwb-detail-title">
                    <i className="fas fa-tools me-2"></i>
                    Quick Actions
                  </h6>
                </div>
                <div className="p-3">
                  <div className="d-grid gap-2">
                    {selectedBatch && !selectedBatch.qualityData && (
                      <button className="klwb-btn-primary" onClick={() => setShowQualityForm(true)}>
                        <i className="fas fa-microscope me-2"></i>Add Quality Data
                      </button>
                    )}
                    {selectedBatch.qrCode && (
                      <>
                        <button className="klwb-btn-secondary" onClick={() => downloadQRCode(selectedBatch)}>
                          <i className="fas fa-download me-2"></i>Download QR Code
                        </button>
                        <button className="klwb-btn-secondary" onClick={() => printQRCode(selectedBatch)}>
                          <i className="fas fa-print me-2"></i>Print QR Code
                        </button>
                        <Link to={`/tracking/${selectedBatch.batchId}`} className="klwb-btn-primary">
                          <i className="fas fa-route me-2"></i>Open Tracking Page
                        </Link>
                      </>
                    )}
                    <button className="klwb-btn-secondary" onClick={() => setShowTrackingForm(true)}>
                      <i className="fas fa-plus me-2"></i>Add Tracking Entry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedBatch && (
          <div className="row">
            <div className="col-12">
              <div className="klwb-detail-card">
                <div className="text-center py-5">
                  <i className="fas fa-mouse-pointer fa-3x text-muted mb-3"></i>
                  <h6 className="text-muted">Select a batch to view details</h6>
                  <p className="text-muted">Click on any batch from the table above to see tracking progress, quality details, and available actions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showQualityForm && selectedBatch && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="klwb-detail-header">
                  <h5 className="klwb-detail-title">Add Quality Record</h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowQualityForm(false)}></button>
                </div>
                <div className="modal-body">
                  <WoolQualityForm batchId={selectedBatch.batchId} onSave={async () => {
                    setShowQualityForm(false);
                    await loadFarmerBatches();
                    const freshBatch = await firebaseService.getBatch(selectedBatch.batchId);
                    if (freshBatch) setSelectedBatch(freshBatch);
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Batch Modal */}
      {showAddBatch && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-plus me-2"></i>Add New Wool Batch
                </h5>
                <button className="btn-close" onClick={() => setShowAddBatch(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="klwb-form-group">
                      <label className="klwb-form-label required">Batch Name</label>
                      <input
                        type="text"
                        className="klwb-form-control"
                        placeholder="e.g., Premium Merino Batch 2024"
                        value={newBatch.batchName}
                        onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
                      />
                    </div>
                    <div className="klwb-form-group">
                      <label className="klwb-form-label">Batch Image</label>
                      <input
                        type="file"
                        className="klwb-form-control"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            setNewBatch({ ...newBatch, imageFile: e.target.files[0] });
                          }
                        }}
                      />
                    </div>
                    <div className="klwb-form-group">
                      <label className="klwb-form-label required">Weight (kg)</label>
                      <input
                        type="number"
                        className="klwb-form-control"
                        value={newBatch.weight}
                        onChange={(e) => setNewBatch({ ...newBatch, weight: e.target.value })}
                      />
                    </div>
                    <div className="klwb-form-group">
                      <label className="klwb-form-label">Wool Type</label>
                      <select
                        className="klwb-form-control"
                        value={newBatch.woolType}
                        onChange={(e) => setNewBatch({ ...newBatch, woolType: e.target.value })}
                      >
                        <option value="Merino">Merino</option>
                        <option value="Romney">Romney</option>
                        <option value="Corriedale">Corriedale</option>
                        <option value="Leicester">Leicester</option>
                      </select>
                    </div>
                    <div className="klwb-form-group">
                      <label className="klwb-form-label required">Farm Location</label>
                      <input
                        type="text"
                        className="klwb-form-control"
                        value={newBatch.location}
                        onChange={(e) => setNewBatch({ ...newBatch, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="klwb-form-group">
                      <label className="klwb-form-label">Coordinates (lat, lng)</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="klwb-form-control"
                          placeholder="e.g., -33.8688, 151.2093"
                          value={newBatch.coordinates}
                          onChange={(e) => setNewBatch({ ...newBatch, coordinates: e.target.value })}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
                                  setNewBatch({ ...newBatch, coordinates: coords });
                                },
                                (error) => alert('Unable to get location: ' + error.message),
                                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                              );
                            }
                          }}
                        >
                          <i className="fas fa-map-marker-alt"></i>
                        </button>
                      </div>
                    </div>
                    <div className="klwb-form-group">
                      <label className="klwb-form-label">Shearing Date</label>
                      <input
                        type="date"
                        className="klwb-form-control"
                        value={newBatch.shearingDate}
                        onChange={(e) => setNewBatch({ ...newBatch, shearingDate: e.target.value })}
                      />
                    </div>
                    <div className="klwb-form-group">
                      <label className="klwb-form-label">Price per kg (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="klwb-form-control"
                        value={newBatch.price}
                        onChange={(e) => setNewBatch({ ...newBatch, price: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="klwb-form-group">
                  <label className="klwb-form-label">Description</label>
                  <textarea
                    className="klwb-form-control"
                    rows="3"
                    value={newBatch.description}
                    onChange={(e) => setNewBatch({ ...newBatch, description: e.target.value })}
                  ></textarea>
                </div>

                {/* Quality Data Section */}
                <div className="border-top pt-3 mt-3">
                  <h6 className="text-primary mb-3">
                    <i className="fas fa-microscope me-2"></i>Wool Quality Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="klwb-form-group">
                        <label className="klwb-form-label required">Micron (μm)</label>
                        <input type="number" step="0.1" className="klwb-form-control"
                          value={newBatch.micron || ''}
                          onChange={(e) => setNewBatch({ ...newBatch, micron: e.target.value })} required />
                      </div>
                      <div className="klwb-form-group">
                        <label className="klwb-form-label required">Staple Length (mm)</label>
                        <input type="number" className="klwb-form-control"
                          value={newBatch.stapleLength || ''}
                          onChange={(e) => setNewBatch({ ...newBatch, stapleLength: e.target.value })} required />
                      </div>
                      <div className="klwb-form-group">
                        <label className="klwb-form-label">Strength</label>
                        <select className="klwb-form-control" value={newBatch.strength || 'Moderate'}
                          onChange={(e) => setNewBatch({ ...newBatch, strength: e.target.value })}>
                          <option value="Weak">Weak</option>
                          <option value="Moderate">Moderate</option>
                          <option value="High">High</option>
                          <option value="Very high">Very high</option>
                        </select>
                      </div>
                      <div className="klwb-form-group">
                        <label className="klwb-form-label">Crimp Characteristics</label>
                        <select className="klwb-form-control" value={newBatch.crimp || 'Moderate'}
                          onChange={(e) => setNewBatch({ ...newBatch, crimp: e.target.value })}>
                          <option value="Tight">Tight</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Looser">Looser</option>
                        </select>
                      </div>
                      <div className="klwb-form-group">
                        <label className="klwb-form-label">Elasticity</label>
                        <select className="klwb-form-control" value={newBatch.elasticity || 'Good'}
                          onChange={(e) => setNewBatch({ ...newBatch, elasticity: e.target.value })}>
                          <option value="High">High</option>
                          <option value="Good">Good</option>
                          <option value="Less elastic">Less elastic</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="klwb-form-group">
                        <label className="klwb-form-label">Fineness</label>
                        <select className="klwb-form-control" value={newBatch.fineness || 'Moderately soft'}
                          onChange={(e) => setNewBatch({ ...newBatch, fineness: e.target.value })}>
                          <option value="Soft and smooth">Soft and smooth</option>
                          <option value="Moderately soft">Moderately soft</option>
                          <option value="Rougher texture">Rougher texture</option>
                        </select>
                      </div>
                      <div className="klwb-form-group">
                        <label className="klwb-form-label">Color</label>
                        <input className="klwb-form-control" value={newBatch.color || ''}
                          onChange={(e) => setNewBatch({ ...newBatch, color: e.target.value })} />
                      </div>
                      <div className="klwb-form-group">
                        <label className="klwb-form-label">Moisture (%)</label>
                        <input type="number" step="0.1" className="klwb-form-control"
                          value={newBatch.moisture || ''}
                          onChange={(e) => setNewBatch({ ...newBatch, moisture: e.target.value })} />
                      </div>
                      <div className="klwb-form-group">
                        <label className="klwb-form-label">Yield (%)</label>
                        <input type="number" step="0.1" className="klwb-form-control"
                          value={newBatch.yield || ''}
                          onChange={(e) => setNewBatch({ ...newBatch, yield: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-check mt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={newBatch.isListed}
                    onChange={(e) => setNewBatch({ ...newBatch, isListed: e.target.checked })}
                  />
                  <label className="form-check-label">List in marketplace</label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddBatch(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleCreateBatch} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Tracking Modal */}
      {showTrackingForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Tracking Entry</h5>
                <button className="btn-close" onClick={() => setShowTrackingForm(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={trackingEntry.location}
                    onChange={(e) => setTrackingEntry({ ...trackingEntry, location: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Process/Activity</label>
                  <select
                    className="form-select"
                    value={trackingEntry.process}
                    onChange={(e) => setTrackingEntry({ ...trackingEntry, process: e.target.value })}
                  >
                    <option value="">Select process...</option>
                    <option value="Transport">Transport</option>
                    <option value="Storage">Storage</option>
                    <option value="Processing">Processing</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={trackingEntry.status}
                    onChange={(e) => setTrackingEntry({ ...trackingEntry, status: e.target.value })}
                  >
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="STORED">Stored</option>
                    <option value="QUALITY_CHECK">Quality Check</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Coordinates (lat, lng)</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., -33.8688, 151.2093"
                      value={trackingEntry.coordinates}
                      onChange={(e) => setTrackingEntry({ ...trackingEntry, coordinates: e.target.value })}
                    />
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
                              setTrackingEntry({ ...trackingEntry, coordinates: coords });
                            },
                            (error) => alert('Unable to get location: ' + error.message),
                            {
                              enableHighAccuracy: true,
                              timeout: 10000,
                              maximumAge: 60000
                            }
                          );
                        }
                      }}
                    >
                      <i className="fas fa-map-marker-alt"></i>
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={trackingEntry.notes}
                    onChange={(e) => setTrackingEntry({ ...trackingEntry, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowTrackingForm(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleAddTracking} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced QR Scanner Modal */}
      {showQRScanner && (
        <BatchQRScanner
          onScanSuccess={handleQRScanSuccess}
          onClose={() => setShowQRScanner(false)}
          user={user}
        />
      )}

      {/* Batch Tracking Map Modal */}
      {showTrackingMap && selectedBatchForTracking && (
        <BatchTrackingMap
          batchId={selectedBatchForTracking}
          onClose={() => {
            setShowTrackingMap(false);
            setSelectedBatchForTracking(null);
          }}
        />
      )}

      <style>{`
        .timeline-sm {
          position: relative;
          padding-left: 20px;
        }
        
        .timeline-sm::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #dee2e6;
        }
        
        .timeline-item-sm {
          position: relative;
          margin-bottom: 15px;
        }
        
        .timeline-marker-sm {
          position: absolute;
          left: -16px;
          top: 2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
        }
        
        .timeline-content-sm {
          margin-left: 10px;
        }
      `}</style>
    </div>
  );
};

export default FarmerTraceability;