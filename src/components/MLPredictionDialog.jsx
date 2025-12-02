import React from 'react';

const MLPredictionDialog = ({ prediction, quality, onConfirm, onCancel, loading }) => {
  if (!prediction) return null;

  return (
    <div className="modal show d-block" style={{backgroundColor:'rgba(0,0,0,0.7)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-robot me-2"></i>
              ML Quality Prediction Results
            </h5>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-primary">Farmer Submitted Data:</h6>
                <div className="card bg-light">
                  <div className="card-body">
                    <div><strong>Micron:</strong> {quality.micron}μm</div>
                    <div><strong>Staple Length:</strong> {quality.stapleLength}mm</div>
                    <div><strong>Strength:</strong> {quality.strength}</div>
                    <div><strong>Color:</strong> {quality.color}</div>
                    <div><strong>Moisture:</strong> {quality.moisture}%</div>
                    <div><strong>Yield:</strong> {quality.yield}%</div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <h6 className="text-success">ML Prediction:</h6>
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <div className="mb-2">
                      <strong>ML Grade:</strong> 
                      <span className="badge bg-light text-dark ms-2">{prediction.ml_grade}</span>
                    </div>
                    <div className="mb-2">
                      <strong>Indian Grade:</strong> 
                      <span className="badge bg-light text-dark ms-2">{prediction.indian_grade}</span>
                    </div>
                    {prediction.model_used && (
                      <div>
                        <small>Model: {prediction.model_used}</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="alert alert-info mt-3">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Certification Decision:</strong> Do you want to certify this batch based on the ML prediction results?
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={onConfirm} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Certifying...
                </>
              ) : (
                <>
                  <i className="fas fa-certificate me-2"></i>
                  Certify Batch
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLPredictionDialog;