import React, { useState, useEffect, useRef } from 'react';
import firebaseService from '../services/firebaseService.jsx';
import blockchainService from '../services/blockchainService.jsx';
import { BrowserQRCodeReader } from '@zxing/browser';

const BatchQRScanner = ({ onScanSuccess, onClose, user }) => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [processType, setProcessType] = useState('movement');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannedBatch, setScannedBatch] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const qrReaderRef = useRef(null);

  // Process types for tracking
  const processTypes = [
    { id: 'movement', name: 'Movement/Transport', icon: 'fas fa-truck' },
    { id: 'processing', name: 'Processing', icon: 'fas fa-cogs' },
    { id: 'storage', name: 'Storage/Warehouse', icon: 'fas fa-warehouse' },
    { id: 'quality_check', name: 'Quality Check', icon: 'fas fa-check-circle' },
    { id: 'packaging', name: 'Packaging', icon: 'fas fa-box' },
    { id: 'delivery', name: 'Delivery', icon: 'fas fa-shipping-fast' }
  ];

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to default location (Delhi)
          setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
    }

    return () => {
      stopScanning(); // Also stops QR reader
    };
  }, []);

  // Enhance startScanning to enable live QR reading
  const startScanning = async () => {
    try {
      setScanning(true);
      setError('');
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Start ZXing QR decoding
        if (!qrReaderRef.current) {
          qrReaderRef.current = new BrowserQRCodeReader();
        }
        // Wait for video to be ready
        setTimeout(() => {
          if (videoRef.current) {
            qrReaderRef.current.decodeFromVideoDevice(
              null,
              videoRef.current,
              (result, err) => {
                if (result) {
                  // Only accept if not already scanned
                  if (!scanResult) {
                    // Assume batchId is plain text or inside a JSON
                    let raw = result.getText();
                    let batchId = raw;
                    try {
                      let parsed = JSON.parse(raw);
                      batchId = parsed.batchId || raw;
                    } catch (_) { }
                    setScanResult({
                      batchId: batchId,
                      timestamp: new Date(),
                      scanned: true
                    });
                    setScanning(false);
                    stopScanning();
                  }
                }
                if (err && err.name !== 'NotFoundException') {
                  setError('QR decoding error: ' + err.message);
                }
              }
            );
          }
        }, 700);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      setScanning(false);
    }
  };

  // Clean up QR reader on stop
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (qrReaderRef.current) {
      try {
        qrReaderRef.current.reset();
      } catch { /* ignore */ }
    }
    setScanning(false);
  };

  const simulateQRScan = () => {
    // For demo purposes, simulate scanning a QR code
    const demoBatchId = `WOOL-${Date.now()}`;
    setScanResult({
      batchId: demoBatchId,
      timestamp: new Date(),
      scanned: true
    });
    setScanning(false);
  };

  const handleManualEntry = () => {
    const batchId = prompt('Enter Batch ID manually:');
    if (batchId) {
      setScanResult({
        batchId: batchId.trim(),
        timestamp: new Date(),
        scanned: true
      });
    }
  };

  // Load batch info after a scan to enforce gating rules in UI
  useEffect(() => {
    const loadBatch = async () => {
      if (scanResult?.batchId) {
        const batch = await firebaseService.getBatchById(scanResult.batchId);
        setScannedBatch(batch);
        if (batch && batch.status !== 'QUALITY_CERTIFIED') {
          setProcessType('quality_check');
        }
      } else {
        setScannedBatch(null);
      }
    };
    loadBatch();
  }, [scanResult]);

  const processBatchScan = async () => {
    if (!scanResult || !currentLocation) {
      alert('Missing scan result or location data');
      return;
    }

    setLoading(true);
    try {
      // Get batch details
      const batch = scannedBatch || await firebaseService.getBatchById(scanResult.batchId);

      if (!batch) {
        alert('Batch not found. Please check the Batch ID.');
        setLoading(false);
        return;
      }

      // Enforce certification gating: only allow quality_check until certified
      const isCertified = batch.status === 'QUALITY_CERTIFIED';
      if (!isCertified && processType !== 'quality_check') {
        alert('This batch is not certified yet. Only Quality Check is allowed.');
        setLoading(false);
        return;
      }

      // Create tracking entry
      const trackingEntry = {
        batchId: scanResult.batchId,
        process: processType,
        location: currentLocation,
        actor: user.name || user.displayName || 'Unknown',
        actorId: user.uid,
        timestamp: new Date(),
        notes: notes,
        coordinates: `${currentLocation.lat}, ${currentLocation.lng}`,
        status: 'IN_PROGRESS'
      };

      // Add to Firebase tracking
      await firebaseService.addBatchTrackingEntry(trackingEntry);

      // Add to blockchain
      await blockchainService.trackMovement(
        scanResult.batchId,
        batch.location || 'Previous Location',
        `${currentLocation.lat}, ${currentLocation.lng}`,
        user.name || user.displayName,
        processTypes.find(p => p.id === processType)?.name || 'Movement',
        currentLocation,
        user.uid
      );

      // Update batch status only for non-quality processes
      if (processType !== 'quality_check') {
        await firebaseService.updateBatchStatus(scanResult.batchId, {
          status: 'IN_TRANSIT',
          lastLocation: currentLocation,
          lastUpdate: new Date()
        });
      }

      // Show success message
      alert(`✅ Batch ${scanResult.batchId} successfully tracked!\nProcess: ${processTypes.find(p => p.id === processType)?.name}\nLocation: ${currentLocation.lat}, ${currentLocation.lng}`);

      // Reset form
      setScanResult(null);
      setNotes('');
      setProcessType('movement');

      // Call success callback
      if (onScanSuccess) {
        onScanSuccess(trackingEntry);
      }

    } catch (error) {
      console.error('Error processing batch scan:', error);
      alert('Error processing batch scan: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="klwb-detail-header">
            <h5 className="klwb-detail-title">
              <i className="fas fa-qrcode me-2"></i>
              Batch QR Scanner
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body" style={{ backgroundColor: '#f8f9fa', padding: '20px' }}>
            {/* Main Grid Layout - 3 Columns Side by Side */}
            <div className="row g-4 mb-4">
              {/* LEFT: Camera Scanner */}
              <div className="col-lg-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0">
                      <i className="fas fa-camera me-2"></i>
                      Camera Scanner
                    </h6>
                  </div>
                  <div className="card-body text-center p-3">
                    {!scanning ? (
                      <div className="py-2">
                        <i className="fas fa-qrcode fa-3x text-primary mb-3"></i>
                        <p className="text-muted small mb-3">Click to start scanning</p>
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={startScanning}
                          >
                            <i className="fas fa-camera me-1"></i>Start Scanning
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={handleManualEntry}
                          >
                            <i className="fas fa-keyboard me-1"></i>Manual Entry
                          </button>
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={simulateQRScan}
                          >
                            <i className="fas fa-play me-1"></i>Demo Scan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="position-relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="img-fluid rounded shadow-sm"
                          style={{ maxHeight: '200px', width: '100%' }}
                        />
                        <div className="position-absolute top-50 start-50 translate-middle">
                          <div className="qr-scanner-overlay">
                            <div className="qr-scanner-frame"></div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={stopScanning}
                          >
                            <i className="fas fa-stop me-1"></i>Stop
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="alert alert-danger mt-3 p-2 small mb-0">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MIDDLE: Process Type */}
              <div className="col-lg-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-header bg-info text-white">
                    <h6 className="mb-0">
                      <i className="fas fa-tasks me-2"></i>
                      Process Type
                    </h6>
                  </div>
                  <div className="card-body p-3">
                    <div className="row g-2">
                      {processTypes.map(process => (
                        <div key={process.id} className="col-6">
                          <div
                            className={`card shadow-sm ${processType === process.id ? 'border-primary bg-primary text-white' : 'border-light'}`}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => setProcessType(process.id)}
                          >
                            <div className="card-body text-center p-2">
                              <i className={`${process.icon} fa-lg mb-1 ${processType === process.id ? 'text-white' : 'text-info'}`}></i>
                              <p className="mb-0" style={{ fontSize: '0.7rem', fontWeight: processType === process.id ? 'bold' : 'normal' }}>{process.name}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Additional Notes */}
              <div className="col-lg-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0">
                      <i className="fas fa-sticky-note me-2"></i>
                      Additional Notes
                    </h6>
                  </div>
                  <div className="card-body p-3">
                    <textarea
                      className="form-control form-control-sm shadow-sm"
                      rows="10"
                      placeholder="Enter any additional notes about this batch movement..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ resize: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scan Result - Full Width Below */}
            {scanResult && (
              <div className="row">
                <div className="col-12">
                  <div className="card border-success shadow-sm">
                    <div className="card-header bg-success text-white py-2">
                      <h6 className="mb-0">
                        <i className="fas fa-check-circle me-2"></i>
                        Scan Result
                      </h6>
                    </div>
                    <div className="card-body p-3">
                      <div className="row">
                        <div className="col-md-6">
                          <p className="mb-2 small"><strong>Batch ID:</strong> {scanResult.batchId}</p>
                          <p className="mb-2 small"><strong>Scanned At:</strong> {scanResult.timestamp.toLocaleString()}</p>
                          <p className="mb-0 small"><strong>Scanner:</strong> {user.name || user.displayName}</p>
                        </div>
                        <div className="col-md-6">
                          <p className="mb-2 small"><strong>Location:</strong> {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Unknown'}</p>
                          <p className="mb-0 small"><strong>GPS Status:</strong>
                            <span className={`badge ms-2 ${currentLocation ? 'bg-success' : 'bg-warning'}`}>
                              {currentLocation ? 'Active' : 'Limited'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <div className="klwb-form-actions">
              <button className="klwb-btn-secondary" onClick={onClose}>
                <i className="fas fa-times me-2"></i>Cancel
              </button>
              {scanResult && (
                <button
                  className="klwb-btn-primary"
                  onClick={processBatchScan}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Track Batch
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .qr-scanner-overlay {
          position: relative;
          width: 200px;
          height: 200px;
        }
        
        .qr-scanner-frame {
          width: 100%;
          height: 100%;
          border: 3px solid #007bff;
          border-radius: 10px;
          position: relative;
          animation: pulse 2s infinite;
        }
        
        .qr-scanner-frame::before,
        .qr-scanner-frame::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border: 3px solid #007bff;
        }
        
        .qr-scanner-frame::before {
          top: -3px;
          left: -3px;
          border-right: none;
          border-bottom: none;
        }
        
        .qr-scanner-frame::after {
          bottom: -3px;
          right: -3px;
          border-left: none;
          border-top: none;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .process-card:hover {
          border-color: #007bff !important;
          background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  );
};

export default BatchQRScanner;
