import React, { useState } from 'react';
import firebaseService from '../services/firebaseService.jsx';
import { analyzeWoolQuality } from '../services/aiQualityService.jsx';

const WoolQualityForm = ({ batchId, onSave }) => {
  const [quality, setQuality] = useState({
    color: '',
    stapleLength: '',
    micron: '',
    strength: 'Medium',
    vegetableMatter: '',
    moisture: '',
    yield: '',
    notes: '',
    crimp: 'Medium',
    elasticity: 'Medium',
    fineness: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setQuality({ ...quality, [e.target.name]: e.target.value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure numeric fields are passed as numbers
      const payload = {
        ...quality,
        stapleLength: Number(quality.stapleLength),
        micron: Number(quality.micron),
        moisture: Number(quality.moisture),
        yield: Number(quality.yield),
      };
      

      
      // Optional AI analysis on uploaded image
      let aiAnalysis = null;
      if (imageFile) {
        try {
          aiAnalysis = await analyzeWoolQuality(imageFile);
        } catch (aiErr) {
          console.warn('AI analysis failed, continuing with rule-based scoring:', aiErr);
        }
      }
      if (aiAnalysis) {
        payload.ai = aiAnalysis;
      }
      
      // Store quality data directly in batch
      await firebaseService.updateBatch(batchId, {
        qualityData: {
          micron: payload.micron,
          stapleLength: payload.stapleLength,
          strength: payload.strength,
          color: payload.color,
          moisture: payload.moisture,
          yield: payload.yield,
          crimp: 'Medium',
          elasticity: 'Medium',
          fineness: 'Medium',
          vegetableMatter: payload.vegetableMatter,
          submittedAt: new Date().toISOString()
        }
      });
      setQuality({ color: '', stapleLength: '', micron: '', strength: 'Medium', vegetableMatter: '', moisture: '', yield: '', notes: '', crimp: 'Medium', elasticity: 'Medium', fineness: 'Medium' });
      setImageFile(null);
      if (onSave) onSave();
      alert('Quality record saved.');
    } catch (err) {
      alert('Error saving quality record: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="klwb-form-container">
      <div className="klwb-form-header">
        <h4 className="klwb-form-title">
          <i className="fas fa-clipboard-check me-2"></i>
          Wool Quality Assessment
        </h4>
      </div>
      <div className="klwb-form-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="klwb-form-group">
                <label className="klwb-form-label required">Color</label>
                <input name="color" className="klwb-form-control" value={quality.color} onChange={handleChange} placeholder="Enter wool color" required />
              </div>
            </div>
            <div className="col-md-6">
              <div className="klwb-form-group">
                <label className="klwb-form-label">Wool Image</label>
                <input type="file" accept="image/*" className="klwb-form-control" onChange={(e)=> setImageFile(e.target.files?.[0] || null)} />
                <small className="text-muted">Optional - Improves AI assessment accuracy</small>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <div className="klwb-form-group">
                <label className="klwb-form-label required">Staple Length (mm)</label>
                <input name="stapleLength" className="klwb-form-control" value={quality.stapleLength} onChange={handleChange} required type="number" min="0" placeholder="Enter length in mm" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="klwb-form-group">
                <label className="klwb-form-label required">Micron (µm)</label>
                <input name="micron" className="klwb-form-control" value={quality.micron} onChange={handleChange} required type="number" min="0" step="0.01" placeholder="Enter micron value" />
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-4">
              <div className="klwb-form-group">
                <label className="klwb-form-label required">Strength</label>
                <select name="strength" className="klwb-form-control" value={quality.strength} onChange={handleChange} required>
                  <option value="Weak">Weak</option>
                  <option value="Medium">Medium</option>
                  <option value="Strong">Strong</option>
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="klwb-form-group">
                <label className="klwb-form-label required">Crimp</label>
                <select name="crimp" className="klwb-form-control" value={quality.crimp} onChange={handleChange} required>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="klwb-form-group">
                <label className="klwb-form-label required">Elasticity</label>
                <select name="elasticity" className="klwb-form-control" value={quality.elasticity} onChange={handleChange} required>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-4">
              <div className="klwb-form-group">
                <label className="klwb-form-label required">Fineness</label>
                <select name="fineness" className="klwb-form-control" value={quality.fineness} onChange={handleChange} required>
                  <option value="Coarse">Coarse</option>
                  <option value="Medium">Medium</option>
                  <option value="Fine">Fine</option>
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="klwb-form-group">
                <label className="klwb-form-label required">Moisture (%)</label>
                <input name="moisture" className="klwb-form-control" value={quality.moisture} onChange={handleChange} required type="number" min="0" step="0.01" placeholder="Enter moisture %" />
              </div>
            </div>
            <div className="col-md-4">
              <div className="klwb-form-group">
                <label className="klwb-form-label required">Yield (%)</label>
                <input name="yield" className="klwb-form-control" value={quality.yield} onChange={handleChange} required type="number" min="0" step="0.01" placeholder="Enter yield %" />
              </div>
            </div>
          </div>
          
          <div className="klwb-form-group">
            <label className="klwb-form-label required">Vegetable Matter</label>
            <input name="vegetableMatter" className="klwb-form-control" value={quality.vegetableMatter} onChange={handleChange} placeholder="Describe vegetable matter content" required />
          </div>
          
          <div className="klwb-form-group">
            <label className="klwb-form-label">Additional Notes</label>
            <textarea name="notes" className="klwb-form-control" value={quality.notes} onChange={handleChange} rows={3} placeholder="Enter any additional observations or notes" />
          </div>
          
          <div className="klwb-form-actions">
            <button className="klwb-btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving Quality Record...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Save Quality Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default WoolQualityForm;
