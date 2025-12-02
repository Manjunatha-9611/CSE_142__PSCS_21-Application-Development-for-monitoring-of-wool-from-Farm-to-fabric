import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import firebaseService from '../services/firebaseService.jsx';
import woolQualityService from '../services/woolQualityService.jsx';

const InspectorQuality = ({ user }) => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const allBatches = await firebaseService.getAllAvailableBatches();
      console.log('All batches loaded:', allBatches);
      setBatches(allBatches || []);
    } catch (error) {
      console.error('Error loading batches:', error);
      setBatches([]);
    }
  };

  const handleAIAnalysis = async (batch) => {
    setIsLoading(true);
    try {
      // Check if quality data exists
      if (!batch.qualityData) {
        throw new Error('No quality data available for this batch');
      }

      // Import fastApiService
      const fastApiService = (await import('../services/fastApiService.jsx')).default;

      // Call FastAPI prediction service with batch quality data
      const features = {
        micron: batch.qualityData.micron || 25,
        stapleLength: batch.qualityData.stapleLength || 80,
        crimp: batch.qualityData.crimp || 'Medium',
        strength: batch.qualityData.strength || 'Medium',
        elasticity: batch.qualityData.elasticity || 'Medium',
        fineness: batch.qualityData.fineness || 'Medium'
      };

      console.log('Requesting AI prediction with features:', features);
      const apiResponse = await fastApiService.predictWoolQuality(features);

      if (apiResponse.success && apiResponse.data) {
        // Extract predictions from API response
        const { wool_type, indian_grade } = apiResponse.data;

        // Create AI report from predictions
        setAiReport({
          woolType: wool_type,
          indianGrade: indian_grade,
          grade: indian_grade,  // Use indian grade as primary grade
          score: deriveQualityScore(wool_type, indian_grade),
          recommendation: generateRecommendation(wool_type, indian_grade),
          confidence: 0.92,
          modelUsed: apiResponse.data.model_used || 'ML'
        });

        console.log('AI prediction successful:', { wool_type, indian_grade });
      } else if (apiResponse.fallback) {
        // Use fallback prediction
        const { ml_grade, indian_grade } = apiResponse.fallback;
        setAiReport({
          woolType: ml_grade,
          indianGrade: indian_grade,
          grade: indian_grade,
          score: deriveQualityScore(ml_grade, indian_grade),
          recommendation: generateRecommendation(ml_grade, indian_grade),
          confidence: 0.75,
          modelUsed: 'Fallback'
        });
        console.warn('Using fallback prediction:', apiResponse.error);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback AI report based on basic data
      const micron = batch.qualityData?.micron || 30;
      const fallbackGrade = micron < 25 ? 'A' : micron <= 34.4 ? 'A' : 'B';
      setAiReport({
        woolType: micron < 25 ? 'Fine Wool' : micron < 32 ? 'Medium Wool' : 'Coarse Wool',
        indianGrade: fallbackGrade,
        grade: fallbackGrade,
        score: micron < 25 ? 85 : 75,
        recommendation: 'Quality assessment based on micron value only. Full ML prediction unavailable.',
        confidence: 0.60,
        modelUsed: 'Fallback',
        error: error.message
      });
    }
    setIsLoading(false);
  };

  // Helper function to derive quality score from predictions
  const deriveQualityScore = (woolType, indianGrade) => {
    const scoreMap = {
      'Super A': 95,
      'A': 85,
      'B': 75,
      'C': 65,
      'D': 55
    };
    return scoreMap[indianGrade] || 70;
  };

  // Helper function to generate recommendation text
  const generateRecommendation = (woolType, indianGrade) => {
    const recommendations = {
      'Super A': 'Premium quality wool suitable for luxury textiles and high-end apparel',
      'A': 'Excellent quality wool suitable for fine textiles and quality garments',
      'B': 'Good quality wool suitable for medium-grade textiles',
      'C': 'Fair quality wool suitable for general textiles',
      'D': 'Standard quality wool suitable for basic textiles and industrial use'
    };
    return recommendations[indianGrade] || 'Quality assessment completed';
  };

  const handleApprove = async (batch, report) => {
    setIsLoading(true);
    try {
      const certificate = {
        batchId: batch.batchId,
        inspector: user.name || user.displayName,
        inspectorId: user.uid,
        // Store both predictions
        predictedWoolType: report.woolType,
        predictedIndianGrade: report.indianGrade,
        aiGrade: report.grade || report.indianGrade,
        aiScore: report.score,
        recommendation: report.recommendation,
        modelUsed: report.modelUsed || 'ML',
        confidence: report.confidence,
        status: 'APPROVED',
        issuedAt: new Date().toISOString(),
        certificateId: `CERT_${batch.batchId}_${Date.now()}`
      };

      await woolQualityService.saveQualityRecord(certificate);

      await firebaseService.updateBatch(batch.batchId, {
        status: 'QUALITY_CERTIFIED',
        qualityStatus: 'INSPECTED',
        qualityGrade: report.grade || report.indianGrade,
        // Store predictions for farmer visibility
        aiPredictions: {
          woolType: report.woolType,
          indianGrade: report.indianGrade,
          score: report.score
        },
        certificate: certificate,
        lastInspection: new Date().toISOString()
      });

      alert('Batch approved and certificate issued!');
      setSelectedBatch(null);
      setAiReport(null);
      loadBatches();
    } catch (error) {
      console.error('Error approving batch:', error);
      alert('Failed to approve batch');
    }
    setIsLoading(false);
  };

  const handleReject = async (batch) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setIsLoading(true);
    try {
      await firebaseService.updateBatch(batch.batchId, {
        status: 'QUALITY_REJECTED',
        qualityStatus: 'REJECTED',
        rejectionReason: reason,
        rejectedBy: user.name || user.displayName,
        rejectedAt: new Date().toISOString()
      });

      alert('Batch rejected successfully!');
      setSelectedBatch(null);
      setAiReport(null);
      loadBatches();
    } catch (error) {
      console.error('Error rejecting batch:', error);
      alert('Failed to reject batch');
    }
    setIsLoading(false);
  };

  const pendingBatches = batches.filter(b =>
    !b.qualityStatus ||
    b.qualityStatus === 'PENDING' ||
    b.status === 'REGISTERED' ||
    b.status === 'PENDING_QUALITY_CHECK'
  );
  const inspectedBatches = batches.filter(b =>
    b.qualityStatus === 'INSPECTED' ||
    b.status === 'QUALITY_VERIFIED'
  );

  return (
    <div className="klwb-main-content">
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="klwb-detail-card">
              <div className="klwb-detail-header">
                <h3 className="klwb-detail-title">
                  <i className="fas fa-microscope me-3"></i>
                  Quality Assessment Dashboard
                </h3>
              </div>
              <p className="mb-0">Inspector: {user?.name || user?.displayName} | Conduct quality inspections and assign grades</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="klwb-kpi-card red">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <h2 className="klwb-kpi-number">{pendingBatches.length}</h2>
                <p className="klwb-kpi-label">Pending Inspection</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="klwb-kpi-card green">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2 className="klwb-kpi-number">{inspectedBatches.length}</h2>
                <p className="klwb-kpi-label">Inspected Today</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="klwb-kpi-card cyan">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-star"></i>
                </div>
                <h2 className="klwb-kpi-number">{inspectedBatches.filter(b => b.qualityGrade === 'A+').length}</h2>
                <p className="klwb-kpi-label">Grade A+ Batches</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="klwb-kpi-card purple">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-certificate"></i>
                </div>
                <h2 className="klwb-kpi-number">{batches.length}</h2>
                <p className="klwb-kpi-label">Total Batches</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Batch List */}
          <div className="col-lg-8">
            <div className="klwb-detail-card">
              <div className="klwb-detail-header">
                <h5 className="klwb-detail-title">
                  <i className="fas fa-list me-2"></i>Batch Inspection Queue
                </h5>
                <div className="klwb-login-tabs">
                  <button
                    className={`klwb-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                  >
                    Pending ({pendingBatches.length})
                  </button>
                  <button
                    className={`klwb-tab ${activeTab === 'inspected' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inspected')}
                  >
                    Inspected ({inspectedBatches.length})
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="klwb-table">
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Farmer</th>
                      <th>Wool Type</th>
                      <th>Weight (kg)</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === 'pending' ? pendingBatches : inspectedBatches).map(batch => (
                      <tr key={batch.batchId}>
                        <td>
                          <strong>{batch.batchId}</strong>
                          <br />
                          <small className="text-muted">{new Date(batch.createdAt).toLocaleDateString()}</small>
                        </td>
                        <td>{batch.farmerName}</td>
                        <td>{batch.woolType}</td>
                        <td>{batch.weight}</td>
                        <td>
                          <span className={`klwb-status-badge ${batch.qualityStatus === 'INSPECTED' ? 'klwb-status-approved' : 'klwb-status-pending'
                            }`}>
                            {batch.qualityStatus === 'INSPECTED' ?
                              `Grade ${batch.qualityGrade}` : 'Pending Inspection'
                            }
                          </span>
                        </td>
                        <td>
                          {activeTab === 'pending' ? (
                            <button
                              className="klwb-action-btn klwb-btn-edit"
                              onClick={() => setSelectedBatch(batch)}
                            >
                              <i className="fas fa-microscope"></i>Inspect
                            </button>
                          ) : (
                            <button
                              className="klwb-action-btn klwb-btn-view"
                              onClick={() => navigate(`/tracking/${batch.batchId}`)}
                            >
                              <i className="fas fa-eye"></i>View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quality Assessment Form */}
          <div className="col-lg-4">
            <div className="klwb-detail-card">
              <div className="klwb-detail-header">
                <h5 className="klwb-detail-title">
                  <i className="fas fa-clipboard-check me-2"></i>Quality Assessment
                </h5>
              </div>

              {selectedBatch ? (
                <div>
                  <div className="mb-3">
                    <h6 className="text-primary">Batch: {selectedBatch.batchId}</h6>
                    <p className="text-muted mb-3">Farmer: {selectedBatch.farmerName}</p>
                  </div>

                  {/* Farmer Quality Data Display */}
                  {selectedBatch.qualityData ? (
                    <div className="klwb-detail-card mb-3">
                      <h6 className="text-success mb-3">
                        <i className="fas fa-check-circle me-2"></i>Farmer Quality Data
                      </h6>
                      <div className="row">
                        <div className="col-6">
                          <div className="klwb-detail-item">
                            <div className="klwb-detail-label">Micron (μm)</div>
                            <div className="klwb-detail-value">{selectedBatch.qualityData.micron}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="klwb-detail-item">
                            <div className="klwb-detail-label">Staple Length (mm)</div>
                            <div className="klwb-detail-value">{selectedBatch.qualityData.stapleLength}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="klwb-detail-item">
                            <div className="klwb-detail-label">Strength</div>
                            <div className="klwb-detail-value">{selectedBatch.qualityData.strength}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="klwb-detail-item">
                            <div className="klwb-detail-label">Color</div>
                            <div className="klwb-detail-value">{selectedBatch.qualityData.color}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="klwb-detail-item">
                            <div className="klwb-detail-label">Moisture (%)</div>
                            <div className="klwb-detail-value">{selectedBatch.qualityData.moisture}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="klwb-detail-item">
                            <div className="klwb-detail-label">Yield (%)</div>
                            <div className="klwb-detail-value">{selectedBatch.qualityData.yield}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <button
                          className="klwb-btn-primary"
                          onClick={() => handleAIAnalysis(selectedBatch)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-robot me-2"></i>
                              Get AI Quality Report
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      No quality data found. Farmer must submit quality data first.
                    </div>
                  )}

                  {/* AI Report Display */}
                  {aiReport && (
                    <div className="klwb-detail-card mb-3">
                      <h6 className="text-info mb-3">
                        <i className="fas fa-robot me-2"></i>AI Quality Report
                        {aiReport.modelUsed && (
                          <small className="text-muted ms-2">({aiReport.modelUsed})</small>
                        )}
                      </h6>
                      <div className="row">
                        <div className="col-12 mb-2">
                          <div className="klwb-detail-item">
                            <div className="klwb-detail-label">Predicted Wool Type</div>
                            <div className="klwb-detail-value">
                              <span className={`klwb-status-badge klwb-status-${aiReport.woolType?.includes('Fine') ? 'approved' : aiReport.woolType?.includes('Coarse') ? 'rejected' : 'pending'}`}>
                                {aiReport.woolType || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 mb-2">
                          <div className="klwb-detail-item">
                            <div className="klwb-detail-label">Indian Grade</div>
                            <div className="klwb-detail-value">
                              <span className={`klwb-status-badge klwb-status-${aiReport.indianGrade === 'Super A' || aiReport.indianGrade === 'A' ? 'approved' : aiReport.indianGrade === 'D' ? 'rejected' : 'pending'}`}>
                                {aiReport.indianGrade || aiReport.grade}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 mb-2">
                          <div className="klwb-detail-item">
                            <div className="klwb-detail-label">Quality Score</div>
                            <div className="klwb-detail-value">{aiReport.score}/100</div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="klwb-detail-item">
                            <div className="klwb-detail-label">AI Recommendation</div>
                            <div className="klwb-detail-value">{aiReport.recommendation}</div>
                          </div>
                        </div>
                        {aiReport.error && (
                          <div className="col-12 mt-2">
                            <small className="text-warning">
                              <i className="fas fa-exclamation-triangle me-1"></i>
                              {aiReport.error}
                            </small>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 d-flex gap-2">
                        <button
                          className="klwb-btn-primary"
                          onClick={() => handleApprove(selectedBatch, aiReport)}
                          disabled={isLoading}
                        >
                          <i className="fas fa-check me-2"></i>
                          Approve Batch
                        </button>
                        <button
                          className="klwb-btn-secondary"
                          onClick={() => handleReject(selectedBatch)}
                          disabled={isLoading}
                        >
                          <i className="fas fa-times me-2"></i>
                          Reject Batch
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    className="klwb-btn-secondary"
                    onClick={() => { setSelectedBatch(null); setAiReport(null); }}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to List
                  </button>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-microscope fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Select a batch from the list to begin quality assessment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectorQuality;