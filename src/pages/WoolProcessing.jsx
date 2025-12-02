import React, { useState, useEffect } from 'react';
import firebaseService from '../services/firebaseService';

const WoolProcessing = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [processingRecords, setProcessingRecords] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [storageRecords, setStorageRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [trackingForm, setTrackingForm] = useState({
    batchId: '',
    processType: '',
    startDate: '',
    endDate: '',
    temperature: '',
    humidity: '',
    chemicalsUsed: '',
    notes: ''
  });

  const [serviceForm, setServiceForm] = useState({
    serviceType: '',
    woolType: '',
    quantity: '',
    urgency: 'normal',
    specialRequirements: ''
  });

  const [storageForm, setStorageForm] = useState({
    batchId: '',
    location: '',
    temperature: '',
    humidity: '',
    conditions: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!user?.uid) return;
      
      const [records, requests, storage] = await Promise.all([
        firebaseService.getUserProcessingRecords(user.uid),
        firebaseService.getUserProcessingRequests(user.uid),
        firebaseService.getUserStorageRecords(user.uid)
      ]);
      setProcessingRecords(records);
      setServiceRequests(requests);
      setStorageRecords(storage);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await firebaseService.saveProcessingRecord(trackingForm, user.uid);
      setTrackingForm({
        batchId: '',
        processType: '',
        startDate: '',
        endDate: '',
        temperature: '',
        humidity: '',
        chemicalsUsed: '',
        notes: ''
      });
      await loadData();
      alert('Processing record saved successfully!');
    } catch (error) {
      console.error('Error saving processing record:', error);
      alert('Error saving processing record');
    }
    setLoading(false);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await firebaseService.createProcessingRequest(serviceForm);
      setServiceForm({
        serviceType: '',
        woolType: '',
        quantity: '',
        urgency: 'normal',
        specialRequirements: ''
      });
      await loadData();
      alert('Service request submitted successfully!');
    } catch (error) {
      console.error('Error submitting service request:', error);
      alert('Error submitting service request');
    }
    setLoading(false);
  };

  const handleStorageSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await firebaseService.saveStorageRecord(storageForm, user.uid);
      setStorageForm({
        batchId: '',
        location: '',
        temperature: '',
        humidity: '',
        conditions: '',
        notes: ''
      });
      await loadData();
      alert('Storage record saved successfully!');
    } catch (error) {
      console.error('Error saving storage record:', error);
      alert('Error saving storage record');
    }
    setLoading(false);
  };

  const processTypes = [
    'Washing', 'Carding', 'Combing', 'Spinning', 'Dyeing', 'Weaving', 'Finishing'
  ];

  const serviceTypes = [
    'Custom Spinning', 'Dyeing Service', 'Weaving', 'Quality Testing', 'Blending'
  ];

  return (
    <div className="container-fluid" style={{padding: 'var(--klwb-spacing-xl) var(--klwb-spacing-lg)'}}>
      <div className="klwb-detail-card mb-4">
        <div className="klwb-detail-header">
          <h2 className="klwb-detail-title">
            <i className="fas fa-industry me-2"></i>
            Karnataka Wool Processing & Storage Management
          </h2>
          <p className="mb-0 text-muted">Complete workflow from storage to finished products</p>
        </div>
      </div>
      
      <div className="klwb-detail-card">
        {/* Navigation Tabs */}
        <div className="klwb-detail-header">
          <div className="d-flex gap-2">
            <button
              className={`klwb-btn-${activeTab === 'overview' ? 'primary' : 'secondary'} btn-sm`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-tachometer-alt me-2"></i>
              Overview
            </button>
            <button
              className={`klwb-btn-${activeTab === 'storage' ? 'primary' : 'secondary'} btn-sm`}
              onClick={() => setActiveTab('storage')}
            >
              <i className="fas fa-warehouse me-2"></i>
              Storage
            </button>
            <button
              className={`klwb-btn-${activeTab === 'processing' ? 'primary' : 'secondary'} btn-sm`}
              onClick={() => setActiveTab('processing')}
            >
              <i className="fas fa-cogs me-2"></i>
              Processing
            </button>
            <button
              className={`klwb-btn-${activeTab === 'services' ? 'primary' : 'secondary'} btn-sm`}
              onClick={() => setActiveTab('services')}
            >
              <i className="fas fa-handshake me-2"></i>
              Services
            </button>
          </div>
        </div>

        <div className="p-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <div className="row mb-4">
                      <div className="col-md-3 mb-3">
                        <div className="klwb-kpi-card red">
                          <div className="klwb-kpi-content">
                            <div className="klwb-kpi-icon">
                              <i className="fas fa-warehouse"></i>
                            </div>
                            <h2 className="klwb-kpi-number">{storageRecords.length}</h2>
                            <p className="klwb-kpi-label">Storage Records</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="klwb-kpi-card green">
                          <div className="klwb-kpi-content">
                            <div className="klwb-kpi-icon">
                              <i className="fas fa-cogs"></i>
                            </div>
                            <h2 className="klwb-kpi-number">{processingRecords.length}</h2>
                            <p className="klwb-kpi-label">Processing Records</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="klwb-kpi-card cyan">
                          <div className="klwb-kpi-content">
                            <div className="klwb-kpi-icon">
                              <i className="fas fa-handshake"></i>
                            </div>
                            <h2 className="klwb-kpi-number">{serviceRequests.length}</h2>
                            <p className="klwb-kpi-label">Service Requests</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="klwb-kpi-card purple">
                          <div className="klwb-kpi-content">
                            <div className="klwb-kpi-icon">
                              <i className="fas fa-check-circle"></i>
                            </div>
                            <h2 className="klwb-kpi-number">{processingRecords.filter(r => r.endDate).length}</h2>
                            <p className="klwb-kpi-label">Completed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="klwb-detail-card">
                          <div className="klwb-detail-header">
                            <h6 className="klwb-detail-title">
                              <i className="fas fa-clock me-2"></i>
                              Recent Processing Activities
                            </h6>
                          </div>
                          <div className="p-3">
                            {processingRecords.length === 0 ? (
                              <p className="text-muted">No processing activities yet</p>
                            ) : (
                              processingRecords.slice(0, 5).map((record, index) => (
                                <div key={index} className="d-flex align-items-center justify-content-between mb-2 p-2 bg-light rounded">
                                  <div>
                                    <div className="badge bg-primary me-2">{record.processType}</div>
                                    <small className="fw-bold">{record.batchId}</small>
                                  </div>
                                  <span className={`badge ${record.endDate ? 'bg-success' : 'bg-warning'}`}>
                                    {record.endDate ? 'Complete' : 'In Progress'}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="klwb-detail-card">
                          <div className="klwb-detail-header">
                            <h6 className="klwb-detail-title">
                              <i className="fas fa-thermometer-half me-2"></i>
                              Storage Conditions
                            </h6>
                          </div>
                          <div className="p-3">
                            {storageRecords.length === 0 ? (
                              <p className="text-muted">No storage records yet</p>
                            ) : (
                              storageRecords.slice(0, 5).map((record, index) => (
                                <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                                  <div>
                                    <strong>{record.batchId}</strong>
                                    <br />
                                    <small className="text-muted">{record.location}</small>
                                  </div>
                                  <div className="text-end">
                                    <span className="badge bg-info">{record.temperature}°C</span>
                                    <span className="badge bg-secondary ms-1">{record.humidity}%</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Storage Tab */}
                {activeTab === 'storage' && (
                  <div>
                    <div className="row">
                      <div className="col-md-6">
                        <h4 className="mb-4">
                          <i className="fas fa-plus-circle me-2 text-primary"></i>
                          Add Storage Record
                        </h4>
                        <form onSubmit={handleStorageSubmit}>
                          <div className="mb-3">
                            <label className="form-label">Batch ID</label>
                            <input
                              type="text"
                              className="form-control"
                              value={storageForm.batchId}
                              onChange={(e) => setStorageForm({...storageForm, batchId: e.target.value})}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Storage Location</label>
                            <input
                              type="text"
                              className="form-control"
                              value={storageForm.location}
                              onChange={(e) => setStorageForm({...storageForm, location: e.target.value})}
                              required
                            />
                          </div>
                          <div className="row">
                            <div className="col-6 mb-3">
                              <label className="form-label">Temperature (°C)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={storageForm.temperature}
                                onChange={(e) => setStorageForm({...storageForm, temperature: e.target.value})}
                                required
                              />
                            </div>
                            <div className="col-6 mb-3">
                              <label className="form-label">Humidity (%)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={storageForm.humidity}
                                onChange={(e) => setStorageForm({...storageForm, humidity: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Storage Conditions</label>
                            <select
                              className="form-select"
                              value={storageForm.conditions}
                              onChange={(e) => setStorageForm({...storageForm, conditions: e.target.value})}
                              required
                            >
                              <option value="">Select Conditions</option>
                              <option value="Dry">Dry</option>
                              <option value="Climate Controlled">Climate Controlled</option>
                              <option value="Ventilated">Ventilated</option>
                              <option value="Sealed">Sealed</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Notes</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={storageForm.notes}
                              onChange={(e) => setStorageForm({...storageForm, notes: e.target.value})}
                            ></textarea>
                          </div>
                          <button type="submit" className="btn btn-primary" disabled={loading}>
                            <i className="fas fa-save me-2"></i>
                            {loading ? 'Saving...' : 'Save Storage Record'}
                          </button>
                        </form>
                      </div>
                      <div className="col-md-6">
                        <h4 className="mb-4">
                          <i className="fas fa-list me-2 text-success"></i>
                          Storage Records
                        </h4>
                        <div style={{maxHeight: '500px', overflowY: 'auto'}}>
                          {storageRecords.length === 0 ? (
                            <div className="alert alert-info">
                              <i className="fas fa-info-circle me-2"></i>
                              No storage records found.
                            </div>
                          ) : (
                            storageRecords.map((record, index) => (
                              <div key={index} className="card mb-3 border-primary">
                                <div className="card-header bg-primary text-white">
                                  <h6 className="mb-0">{record.batchId}</h6>
                                </div>
                                <div className="card-body">
                                  <div className="row">
                                    <div className="col-6">
                                      <small className="text-muted">Temperature</small>
                                      <div className="fw-bold">{record.temperature}°C</div>
                                    </div>
                                    <div className="col-6">
                                      <small className="text-muted">Humidity</small>
                                      <div className="fw-bold">{record.humidity}%</div>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <small className="text-muted">Location: {record.location}</small>
                                    <br />
                                    <small className="text-muted">Conditions: {record.conditions}</small>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing Tab */}
                {activeTab === 'processing' && (
                  <div>
                    <div className="row">
                      <div className="col-md-6">
                        <h4 className="mb-4">
                          <i className="fas fa-clipboard-list me-2 text-primary"></i>
                          Track Processing Steps
                        </h4>
                        <form onSubmit={handleTrackingSubmit}>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Batch ID</label>
                              <input
                                type="text"
                                className="form-control"
                                value={trackingForm.batchId}
                                onChange={(e) => setTrackingForm({...trackingForm, batchId: e.target.value})}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Process Type</label>
                              <select
                                className="form-select"
                                value={trackingForm.processType}
                                onChange={(e) => setTrackingForm({...trackingForm, processType: e.target.value})}
                                required
                              >
                                <option value="">Select Process</option>
                                {processTypes.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Start Date</label>
                              <input
                                type="datetime-local"
                                className="form-control"
                                value={trackingForm.startDate}
                                onChange={(e) => setTrackingForm({...trackingForm, startDate: e.target.value})}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">End Date</label>
                              <input
                                type="datetime-local"
                                className="form-control"
                                value={trackingForm.endDate}
                                onChange={(e) => setTrackingForm({...trackingForm, endDate: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Temperature (°C)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={trackingForm.temperature}
                                onChange={(e) => setTrackingForm({...trackingForm, temperature: e.target.value})}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Humidity (%)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={trackingForm.humidity}
                                onChange={(e) => setTrackingForm({...trackingForm, humidity: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Chemicals Used</label>
                            <input
                              type="text"
                              className="form-control"
                              value={trackingForm.chemicalsUsed}
                              onChange={(e) => setTrackingForm({...trackingForm, chemicalsUsed: e.target.value})}
                              placeholder="List chemicals and quantities"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Processing Notes</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={trackingForm.notes}
                              onChange={(e) => setTrackingForm({...trackingForm, notes: e.target.value})}
                              placeholder="Any observations or special conditions"
                            ></textarea>
                          </div>

                          <button type="submit" className="btn btn-primary" disabled={loading}>
                            <i className="fas fa-save me-2"></i>
                            {loading ? 'Saving...' : 'Save Processing Record'}
                          </button>
                        </form>
                      </div>
                      <div className="col-md-6">
                        <h4 className="mb-4">
                          <i className="fas fa-history me-2 text-success"></i>
                          Processing History
                        </h4>
                        <div style={{maxHeight: '500px', overflowY: 'auto'}}>
                          {processingRecords.length === 0 ? (
                            <div className="alert alert-info">
                              <i className="fas fa-info-circle me-2"></i>
                              No processing records found.
                            </div>
                          ) : (
                            <div className="table-responsive">
                              <table className="table table-striped table-sm">
                                <thead className="table-dark">
                                  <tr>
                                    <th>Batch</th>
                                    <th>Process</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {processingRecords.map((record, index) => (
                                    <tr key={index}>
                                      <td>{record.batchId}</td>
                                      <td>{record.processType}</td>
                                      <td>
                                        <span className={`badge ${record.endDate ? 'bg-success' : 'bg-warning'}`}>
                                          {record.endDate ? 'Complete' : 'In Progress'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                  <div>
                    <div className="row">
                      <div className="col-md-6">
                        <h4 className="mb-4">
                          <i className="fas fa-tools me-2 text-success"></i>
                          Request Processing Services
                        </h4>
                        <form onSubmit={handleServiceSubmit}>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Service Type</label>
                              <select
                                className="form-select"
                                value={serviceForm.serviceType}
                                onChange={(e) => setServiceForm({...serviceForm, serviceType: e.target.value})}
                                required
                              >
                                <option value="">Select Service</option>
                                {serviceTypes.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Wool Type</label>
                              <select
                                className="form-select"
                                value={serviceForm.woolType}
                                onChange={(e) => setServiceForm({...serviceForm, woolType: e.target.value})}
                                required
                              >
                                <option value="">Select Wool Type</option>
                                <option value="Merino">Merino</option>
                                <option value="Romney">Romney</option>
                                <option value="Corriedale">Corriedale</option>
                                <option value="Leicester">Leicester</option>
                              </select>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Quantity (kg)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={serviceForm.quantity}
                                onChange={(e) => setServiceForm({...serviceForm, quantity: e.target.value})}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Urgency</label>
                              <select
                                className="form-select"
                                value={serviceForm.urgency}
                                onChange={(e) => setServiceForm({...serviceForm, urgency: e.target.value})}
                              >
                                <option value="normal">Normal (2-3 weeks)</option>
                                <option value="urgent">Urgent (1 week)</option>
                                <option value="rush">Rush (3-5 days)</option>
                              </select>
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Special Requirements</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={serviceForm.specialRequirements}
                              onChange={(e) => setServiceForm({...serviceForm, specialRequirements: e.target.value})}
                              placeholder="Any specific requirements or instructions"
                            ></textarea>
                          </div>

                          <button type="submit" className="btn btn-success" disabled={loading}>
                            <i className="fas fa-paper-plane me-2"></i>
                            {loading ? 'Submitting...' : 'Submit Service Request'}
                          </button>
                        </form>
                      </div>
                      <div className="col-md-6">
                        <h4 className="mb-4">
                          <i className="fas fa-list-alt me-2 text-info"></i>
                          Service Requests
                        </h4>
                        <div style={{maxHeight: '500px', overflowY: 'auto'}}>
                          {serviceRequests.length === 0 ? (
                            <div className="alert alert-info">
                              <i className="fas fa-info-circle me-2"></i>
                              No service requests found.
                            </div>
                          ) : (
                            serviceRequests.map((request, index) => (
                              <div key={index} className="card mb-3 border-success">
                                <div className="card-header bg-success text-white">
                                  <h6 className="mb-0">{request.serviceType}</h6>
                                </div>
                                <div className="card-body">
                                  <div className="row">
                                    <div className="col-6">
                                      <p className="mb-1"><strong>Wool:</strong> {request.woolType}</p>
                                      <p className="mb-1"><strong>Quantity:</strong> {request.quantity} kg</p>
                                    </div>
                                    <div className="col-6">
                                      <p className="mb-1"><strong>Urgency:</strong> {request.urgency}</p>
                                      <p className="mb-1"><strong>Cost:</strong> ${request.estimatedCost}</p>
                                    </div>
                                  </div>
                                  <span className={`badge ${request.status === 'pending' ? 'bg-warning' : 'bg-success'}`}>
                                    {request.status}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
        </div>
      </div>
  );
};

export default WoolProcessing;