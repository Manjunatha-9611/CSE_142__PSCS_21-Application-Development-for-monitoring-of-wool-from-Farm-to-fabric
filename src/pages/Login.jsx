import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import authService from '../services/authService.jsx';

const Login = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('farmer');
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    role: 'farmer' 
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inspectorCode, setInspectorCode] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const INSPECTOR_CODE = 'INSPECTOR2024';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      let result;
      if (isSignUp) {
        if (isSignUp && formData.role === 'inspector' && inspectorCode !== INSPECTOR_CODE) {
          setError('Invalid Inspector code. Please contact system admin.');
          setIsLoading(false);
          return;
        }
        result = await authService.signUp(formData.email, formData.password, {
          name: formData.name,
          role: formData.role
        });
      } else {
        result = await authService.signIn(formData.email, formData.password);
      }
      
      if (result.success) {
        onLogin(result.user);
        navigate('/');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Authentication failed: ' + err.message);
    }
    setIsLoading(false);
  };


  return (
    <div className="klwb-login-container">
      <div className="container-fluid h-100">
        <div className="row h-100">
          {/* Left Panel - KLWB Welcome */}
          <div className="col-lg-6 klwb-login-left">
            <div className="klwb-login-content">
              <div className="text-center mb-4">
                <img src="/image.png" alt="Karnataka Government Emblem" style={{width: '100px', height: '100px', marginBottom: '2rem'}} />
                <h1 className="klwb-welcome-title">Welcome to</h1>
                <h2 className="klwb-system-subtitle">Wool Traceability System</h2>
                <p className="lead">Government of Karnataka | Farm to Fabric Monitoring</p>
              </div>
              
              <div className="klwb-info-box">
                <h4 className="mb-3">Registration Requirements:</h4>
                <ol className="klwb-instructions">
                  <li>Farmers must register their farm details before adding wool batches to the system</li>
                  <li>Processing Units must register their facility and obtain quality certification</li>
                  <li>Quality Inspectors require special access codes from system administrators</li>
                  <li>Government officials can access comprehensive monitoring and analytics dashboards</li>
                  <li>All users must verify their identity through email confirmation process</li>
                </ol>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Login Form */}
          <div className="col-lg-6 klwb-login-right">
            <div className="klwb-login-card">
              <div className="klwb-login-tabs">
                <button 
                  type="button"
                  className={`klwb-tab ${activeTab === 'farmer' ? 'active' : ''}`}
                  onClick={() => {setActiveTab('farmer'); setFormData({...formData, role: 'farmer'})}}
                >
                  Farmer Login
                </button>
                <button 
                  type="button"
                  className={`klwb-tab ${activeTab === 'processor' ? 'active' : ''}`}
                  onClick={() => {setActiveTab('processor'); setFormData({...formData, role: 'buyer'})}}
                >
                  Processor Login
                </button>
                <button 
                  type="button"
                  className={`klwb-tab ${activeTab === 'inspector' ? 'active' : ''}`}
                  onClick={() => {setActiveTab('inspector'); setFormData({...formData, role: 'inspector'})}}
                >
                  Inspector Login
                </button>
              </div>
              
              <div className="klwb-form-body">
                <div className="text-center mb-4">
                  <h4>User Login</h4>
                  <p className="text-muted">Access your account to continue</p>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {isSignUp && (
                    <div className="klwb-form-group">
                      <label className="klwb-form-label required">Full Name</label>
                      <input
                        type="text"
                        className="klwb-form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  )}

                  <div className="klwb-form-group">
                    <label className="klwb-form-label required">Email Address</label>
                    <input
                      type="email"
                      className="klwb-form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  <div className="klwb-form-group">
                    <label className="klwb-form-label required">Password</label>
                    <input
                      type="password"
                      className="klwb-form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  {activeTab === 'inspector' && isSignUp && (
                    <div className="klwb-form-group">
                      <label className="klwb-form-label required">Inspector Access Code</label>
                      <input
                        type="password"
                        className="klwb-form-control"
                        value={inspectorCode}
                        onChange={e => setInspectorCode(e.target.value)}
                        placeholder="Enter inspector access code"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="form-check mb-4">
                    <input className="form-check-input" type="checkbox" id="robotCheck" required />
                    <label className="form-check-label" htmlFor="robotCheck">
                      <i className="fas fa-shield-alt me-2"></i>I'm not a robot (reCAPTCHA)
                    </label>
                  </div>
                  
                  <button type="submit" className="klwb-btn-primary w-100 mb-3" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {isSignUp ? 'Creating Account...' : 'Logging In...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas fa-${isSignUp ? 'user-plus' : 'sign-in-alt'} me-2`}></i>
                        {isSignUp ? 'Register Account' : 'Login to System'}
                      </>
                    )}
                  </button>
                  
                  <div className="text-center">
                    <a href="#" className="text-primary" style={{fontSize: 'var(--klwb-font-size-sm)'}}>
                      <i className="fas fa-key me-1"></i>Forgot Password?
                    </a>
                  </div>
                </form>

                <div className="text-center mt-4 pt-3" style={{borderTop: '1px solid var(--klwb-gray-light)'}}>
                  <button 
                    className="btn btn-link text-primary"
                    onClick={() => setIsSignUp(!isSignUp)}
                    style={{fontSize: 'var(--klwb-font-size-sm)'}}
                  >
                    {isSignUp ? 'Already have an account? Login here' : 'Need an account? Register here'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;