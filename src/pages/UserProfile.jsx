import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import firebaseService from '../services/firebaseService.jsx';

const UserProfile = ({ user }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    farmName: '',
    farmSize: '',
    woolTypes: [],
    businessLicense: '',
    experience: '',
    specialization: '',
    bio: '',
    certifications: [],
    language: 'English',
    timezone: 'Asia/Kolkata',
    photoURL: user?.photoURL || ''
  });
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalOrders: 0,
    totalSales: 0,
    rating: 0,
    reviews: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadUserStats();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.uid) return;

    try {
      const userProfile = await firebaseService.getUserProfile(user.uid);
      if (userProfile) {
        setProfile(prev => ({ ...prev, ...userProfile }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUserStats = async () => {
    if (!user) return;

    try {
      let statsData = {
        totalBatches: 0,
        totalSales: 0,
        totalOrders: 0,
        rating: 0,
        reviews: 0
      };

      if (user.role === 'farmer') {
        const batches = await firebaseService.getFarmerBatches(user.uid);
        statsData.totalBatches = batches.length;

        const sales = await firebaseService.getUserOrders('seller');
        statsData.totalSales = sales.length;

        // Mock rating/reviews for now as they are not yet implemented in backend
        statsData.rating = 4.8;
        statsData.reviews = 124;
      } else if (user.role === 'buyer') {
        const orders = await firebaseService.getUserOrders('buyer');
        statsData.totalOrders = orders.length;
      } else if (user.role === 'government') {
        // For government, maybe show total applications or similar
        // Using mock for now as specific government stats methods might be needed
        statsData.totalBatches = 1247; // Applications
        statsData.totalSales = 1089; // Approved
      } else if (user.role === 'inspector') {
        // Using mock for now
        statsData.totalBatches = 156; // Inspected Today
        statsData.totalSales = 1247; // Total Inspections
      }

      setStats(statsData);
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await firebaseService.updateUserProfile(user.uid, profile);
      setMessage(t('profileUpdated'));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(t('errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      farmer: 'success',
      buyer: 'info',
      government: 'primary',
      inspector: 'warning'
    };
    return colors[role] || 'secondary';
  };

  const getRoleIcon = (role) => {
    const icons = {
      farmer: 'fas fa-seedling',
      buyer: 'fas fa-shopping-bag',
      government: 'fas fa-landmark',
      inspector: 'fas fa-microscope'
    };
    return icons[role] || 'fas fa-user';
  };

  return (
    <div className="klwb-main-content">
      <div className="container-fluid">
        {/* Profile Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #004B87 0%, #1976D2 100%)' }}>
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-2 text-center">
                    <div className="position-relative d-inline-block">
                      <img
                        src={profile.photoURL || 'https://via.placeholder.com/150'}
                        alt={profile.name}
                        className="rounded-circle border border-4 border-white"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      />
                      <span
                        className="position-absolute bottom-0 end-0 bg-success rounded-circle"
                        style={{ width: '24px', height: '24px', border: '3px solid white' }}
                        title="Online"
                      ></span>
                    </div>
                  </div>
                  <div className="col-md-7">
                    <h2 className="text-white mb-2">{profile.name}</h2>
                    <p className="text-white-50 mb-2">
                      <i className="fas fa-envelope me-2"></i>
                      {profile.email}
                    </p>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <span className={`badge bg-${getRoleBadgeColor(user?.role)} fs-6`}>
                        <i className={`${getRoleIcon(user?.role)} me-1`}></i>
                        {t(user?.role) || user?.role?.toUpperCase()}
                      </span>
                      {profile.phone && (
                        <span className="text-white-50">
                          <i className="fas fa-phone me-1"></i>
                          {profile.phone}
                        </span>
                      )}
                      {profile.city && (
                        <span className="text-white-50">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {profile.city}, {profile.state}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3 text-end">
                    <button
                      className="btn btn-light btn-lg"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'} me-2`}></i>
                      {isEditing ? t('cancel') : t('edit')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {(user?.role === 'farmer' || user?.role === 'buyer') && (
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm bg-gradient-primary text-white">
                <div className="card-body text-center py-4">
                  <i className="fas fa-box fa-2x mb-3"></i>
                  <h3 className="mb-1">{stats.totalBatches}</h3>
                  <small>{user?.role === 'farmer' ? t('totalBatches') : 'Batches Purchased'}</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm bg-gradient-success text-white">
                <div className="card-body text-center py-4">
                  <i className="fas fa-receipt fa-2x mb-3"></i>
                  <h3 className="mb-1">{stats.totalOrders}</h3>
                  <small>{user?.role === 'farmer' ? t('totalSales') : t('totalOrders')}</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm bg-gradient-info text-white">
                <div className="card-body text-center py-4">
                  <i className="fas fa-rupee-sign fa-2x mb-3"></i>
                  <h3 className="mb-1">₹{(stats.totalSales / 1000).toFixed(0)}K</h3>
                  <small>Total Revenue</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm bg-gradient-warning text-white">
                <div className="card-body text-center py-4">
                  <i className="fas fa-star fa-2x mb-3"></i>
                  <h3 className="mb-1">{stats.rating}</h3>
                  <small>{t('rating')} ({stats.reviews} {t('reviews')})</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user me-2"></i>
              {t('personalInformation')}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'business' ? 'active' : ''}`}
              onClick={() => setActiveTab('business')}
            >
              <i className="fas fa-briefcase me-2"></i>
              {t('businessDetails')}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fas fa-cog me-2"></i>
              {t('accountSettings')}
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="row">
          <div className="col-12">
            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`}>
                {message}
                <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-id-card me-2"></i>
                      {t('personalInformation')}
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">{t('fullName')} *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={profile.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">{t('emailAddress')} *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={profile.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">{t('phoneNumber')}</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Preferred Language</label>
                        <select
                          className="form-control"
                          name="language"
                          value={profile.language}
                          onChange={handleChange}
                          disabled={!isEditing}
                        >
                          <option value="English">English</option>
                          <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                          <option value="Hindi">हिंदी (Hindi)</option>
                          <option value="Tamil">தமிழ் (Tamil)</option>
                          <option value="Telugu">తెలుగు (Telugu)</option>
                          <option value="Malayalam">മലയാളം (Malayalam)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">{t('address')}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Street Address"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">{t('city')}</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={profile.city}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">{t('state')}</label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={profile.state}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">{t('pincode')}</label>
                        <input
                          type="text"
                          className="form-control"
                          name="pincode"
                          value={profile.pincode}
                          onChange={handleChange}
                          disabled={!isEditing}
                          maxLength="6"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">{t('bio')}</label>
                      <textarea
                        className="form-control"
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows="4"
                        placeholder="Tell us about yourself, your experience, and your goals..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Details Tab */}
              {activeTab === 'business' && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-briefcase me-2"></i>
                      {t('businessDetails')}
                    </h5>
                  </div>
                  <div className="card-body">
                    {user?.role === 'farmer' && (
                      <>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">{t('farmName')}</label>
                            <input
                              type="text"
                              className="form-control"
                              name="farmName"
                              value={profile.farmName}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">{t('farmSize')} (acres)</label>
                            <input
                              type="number"
                              className="form-control"
                              name="farmSize"
                              value={profile.farmSize}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">{t('woolTypes')}</label>
                          <input
                            type="text"
                            className="form-control"
                            name="woolTypes"
                            value={profile.woolTypes}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="e.g., Merino, Corriedale, Romney"
                          />
                          <small className="form-text text-muted">Separate multiple types with commas</small>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">{t('certifications')} (Optional)</label>
                          <input
                            type="text"
                            className="form-control"
                            name="certifications"
                            value={profile.certifications}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="e.g., Organic Certified, GOTS"
                          />
                        </div>
                      </>
                    )}

                    {user?.role === 'buyer' && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">{t('businessName')}</label>
                          <input
                            type="text"
                            className="form-control"
                            name="farmName"
                            value={profile.farmName}
                            onChange={handleChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">{t('businessLicense')} / GST Number</label>
                          <input
                            type="text"
                            className="form-control"
                            name="businessLicense"
                            value={profile.businessLicense}
                            onChange={handleChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Business Type</label>
                          <select
                            className="form-control"
                            name="specialization"
                            value={profile.specialization}
                            onChange={handleChange}
                            disabled={!isEditing}
                          >
                            <option value="">Select Type</option>
                            <option value="Textile Manufacturer">Textile Manufacturer</option>
                            <option value="Wool Trader">Wool Trader</option>
                            <option value="Carpet Manufacturer">Carpet Manufacturer</option>
                            <option value="Garment Manufacturer">Garment Manufacturer</option>
                            <option value="Retail Business">Retail Business</option>
                          </select>
                        </div>
                      </>
                    )}

                    {user?.role === 'inspector' && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">{t('experience')}</label>
                          <input
                            type="number"
                            className="form-control"
                            name="experience"
                            value={profile.experience}
                            onChange={handleChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">{t('specialization')}</label>
                          <input
                            type="text"
                            className="form-control"
                            name="specialization"
                            value={profile.specialization}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="e.g., Wool Quality Assessment, Fiber Analysis"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">{t('certifications')}</label>
                          <input
                            type="text"
                            className="form-control"
                            name="certifications"
                            value={profile.certifications}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="e.g., ISO 9001, NABL Accredited"
                          />
                        </div>
                      </>
                    )}

                    {user?.role === 'government' && (
                      <div className="mb-3">
                        <label className="form-label">Department / Office</label>
                        <input
                          type="text"
                          className="form-control"
                          name="specialization"
                          value={profile.specialization}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="e.g., Karnataka Labour Welfare Board"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-cog me-2"></i>
                      {t('accountSettings')}
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <h6 className="text-muted mb-3">Notification Preferences</h6>
                      <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="emailNotif" defaultChecked />
                        <label className="form-check-label" htmlFor="emailNotif">
                          Email Notifications
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="smsNotif" />
                        <label className="form-check-label" htmlFor="smsNotif">
                          SMS Notifications
                        </label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="marketingNotif" />
                        <label className="form-check-label" htmlFor="marketingNotif">
                          Marketing Communications
                        </label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="text-muted mb-3">Privacy Settings</h6>
                      <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="profileVisible" defaultChecked />
                        <label className="form-check-label" htmlFor="profileVisible">
                          Make my profile visible to other users
                        </label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="contactVisible" />
                        <label className="form-check-label" htmlFor="contactVisible">
                          Allow others to contact me directly
                        </label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="text-muted mb-3">Security</h6>
                      <button
                        type="button"
                        className="btn btn-outline-warning me-2"
                        onClick={async () => {
                          try {
                            await firebaseService.sendPasswordResetEmail(profile.email);
                            setMessage('Password reset email sent to ' + profile.email);
                          } catch (error) {
                            console.error('Error sending password reset email:', error);
                            setMessage('Error sending password reset email.');
                          }
                        }}
                      >
                        <i className="fas fa-key me-2"></i>
                        {t('changePassword')}
                      </button>
                      <button type="button" className="btn btn-outline-info">
                        <i className="fas fa-shield-alt me-2"></i>
                        Enable Two-Factor Authentication
                      </button>
                    </div>

                    <div>
                      <h6 className="text-muted mb-3">Account Actions</h6>
                      <button
                        type="button"
                        className="btn btn-outline-secondary me-2"
                        onClick={() => {
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
                          const downloadAnchorNode = document.createElement('a');
                          downloadAnchorNode.setAttribute("href", dataStr);
                          downloadAnchorNode.setAttribute("download", "user_profile.json");
                          document.body.appendChild(downloadAnchorNode);
                          downloadAnchorNode.click();
                          downloadAnchorNode.remove();
                          setMessage(t('successMessage'));
                        }}
                      >
                        <i className="fas fa-download me-2"></i>
                        {t('exportData')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => {
                          if (window.confirm(t('confirmDelete'))) {
                            // In a real app, this would call a delete account API
                            alert('Account deactivation request sent to admin.');
                          }
                        }}
                      >
                        <i className="fas fa-user-times me-2"></i>
                        {t('deactivateAccount')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {isEditing && (
                <div className="text-center mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {t('loading')}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        {t('save')}
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;