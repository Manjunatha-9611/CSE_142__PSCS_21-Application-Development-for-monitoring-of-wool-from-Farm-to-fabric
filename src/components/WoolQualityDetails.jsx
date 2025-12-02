import React from 'react';

const WoolQualityDetails = ({ batch }) => {
  if (!batch) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No batch selected</p>
      </div>
    );
  }

  return (
    <div className="klwb-detail-card">
      <div className="klwb-detail-header">
        <h5 className="klwb-detail-title">
          <i className="fas fa-clipboard-list me-2"></i>
          Wool Lot Details
        </h5>
      </div>
      
      <div className="klwb-detail-grid">
        <div className="klwb-detail-item">
          <div className="klwb-detail-label">Lot ID</div>
          <div className="klwb-detail-value">{batch.batchId}</div>
        </div>
        <div className="klwb-detail-item">
          <div className="klwb-detail-label">Farmer Name</div>
          <div className="klwb-detail-value">{batch.farmerName}</div>
        </div>
        <div className="klwb-detail-item">
          <div className="klwb-detail-label">Farm Location</div>
          <div className="klwb-detail-value">{batch.location}</div>
        </div>
        <div className="klwb-detail-item">
          <div className="klwb-detail-label">Weight (kg)</div>
          <div className="klwb-detail-value">{batch.weight}</div>
        </div>
        <div className="klwb-detail-item">
          <div className="klwb-detail-label">Wool Type</div>
          <div className="klwb-detail-value">{batch.woolType}</div>
        </div>
        <div className="klwb-detail-item">
          <div className="klwb-detail-label">Status</div>
          <div className="klwb-detail-value">
            <span className={`klwb-status-badge klwb-status-${batch.status === 'QUALITY_VERIFIED' ? 'approved' : 'pending'}`}>
              {batch.status}
            </span>
          </div>
        </div>
        <div className="klwb-detail-item">
          <div className="klwb-detail-label">Created Date</div>
          <div className="klwb-detail-value">
            {batch.createdAt ? new Date(batch.createdAt.seconds ? batch.createdAt.seconds * 1000 : batch.createdAt).toLocaleDateString() : 'N/A'}
          </div>
        </div>
        <div className="klwb-detail-item">
          <div className="klwb-detail-label">Breed</div>
          <div className="klwb-detail-value">{batch.woolType || 'Merino'}</div>
        </div>
      </div>
      
      {batch.qualityData && (
        <div className="mt-4">
          <div className="klwb-detail-header" style={{margin: '0 calc(-1 * var(--klwb-spacing-xl)) var(--klwb-spacing-lg) calc(-1 * var(--klwb-spacing-xl))', borderRadius: '0'}}>
            <h6 className="klwb-detail-title">
              <i className="fas fa-microscope me-2"></i>
              Quality Assessment
            </h6>
          </div>
          <div className="klwb-detail-grid">
            <div className="klwb-detail-item">
              <div className="klwb-detail-label">Micron (μm)</div>
              <div className="klwb-detail-value">{batch.qualityData.micron}</div>
            </div>
            <div className="klwb-detail-item">
              <div className="klwb-detail-label">Staple Length (mm)</div>
              <div className="klwb-detail-value">{batch.qualityData.stapleLength}</div>
            </div>
            <div className="klwb-detail-item">
              <div className="klwb-detail-label">Strength</div>
              <div className="klwb-detail-value">{batch.qualityData.strength}</div>
            </div>
            <div className="klwb-detail-item">
              <div className="klwb-detail-label">Color</div>
              <div className="klwb-detail-value">{batch.qualityData.color}</div>
            </div>
            <div className="klwb-detail-item">
              <div className="klwb-detail-label">Moisture (%)</div>
              <div className="klwb-detail-value">{batch.qualityData.moisture}</div>
            </div>
            <div className="klwb-detail-item">
              <div className="klwb-detail-label">Yield (%)</div>
              <div className="klwb-detail-value">{batch.qualityData.yield}</div>
            </div>
          </div>
        </div>
      )}
      
      {batch.certificate && (
        <div className="mt-4">
          <div className="klwb-detail-header" style={{margin: '0 calc(-1 * var(--klwb-spacing-xl)) var(--klwb-spacing-lg) calc(-1 * var(--klwb-spacing-xl))', borderRadius: '0'}}>
            <h6 className="klwb-detail-title">
              <i className="fas fa-certificate me-2"></i>
              Quality Certificate
            </h6>
          </div>
          <div className="klwb-detail-grid">
            <div className="klwb-detail-item">
              <div className="klwb-detail-label">Certified By</div>
              <div className="klwb-detail-value">{batch.certificate.issuedBy}</div>
            </div>
            <div className="klwb-detail-item">
              <div className="klwb-detail-label">Grade</div>
              <div className="klwb-detail-value">
                <span className="klwb-status-badge klwb-status-approved">
                  <i className="fas fa-award me-1"></i>
                  {batch.certificate.grade}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default WoolQualityDetails;
