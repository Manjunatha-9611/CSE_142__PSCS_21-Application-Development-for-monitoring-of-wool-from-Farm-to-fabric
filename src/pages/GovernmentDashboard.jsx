import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebaseService from '../services/firebaseService.jsx';
import blockchainService from '../services/blockchainService.jsx';

const GovernmentDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalFarmers: 0,
    totalTransactions: 0,
    blockchainBlocks: 0
  });
  const [recentBatches, setRecentBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load blockchain stats
      const blockchainStats = blockchainService.getBlockchainStats();
      
      // Load recent batches (all batches for government view)
      const allBatches = await firebaseService.getAllAvailableBatches();
      
      // Calculate unique farmers
      const uniqueFarmers = new Set(allBatches.map(batch => batch.farmerId));
      
      setStats({
        totalBatches: allBatches.length,
        totalFarmers: uniqueFarmers.size,
        totalTransactions: blockchainStats.totalBlocks,
        blockchainBlocks: blockchainStats.totalBlocks
      });
      
      setRecentBatches(allBatches.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'REGISTERED': 'primary',
      'IN_TRANSIT': 'warning',
      'PROCESSING': 'info',
      'QUALITY_VERIFIED': 'success',
      'SOLD': 'success'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Loading government dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-gradient-primary text-white border-0">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h3 className="mb-2">
                    <i className="fas fa-building me-3"></i>
                    Government Dashboard
                  </h3>
                  <p className="mb-0 opacity-75">Monitor wool supply chain and regulatory compliance</p>
                </div>
                <div className="col-md-4 text-end">
                  <button className="btn btn-light btn-lg" onClick={loadDashboardData}>
                    <i className="fas fa-sync me-2"></i>Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-4">
          <div className="dashboard-card">
            <div className="stats-icon">
              <i className="fas fa-boxes fa-2x text-white"></i>
            </div>
            <h2 className="fw-bold text-primary">{stats.totalBatches}</h2>
            <h5 className="fw-bold text-muted">Total Batches</h5>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="dashboard-card success">
            <div className="stats-icon" style={{background: 'linear-gradient(135deg, var(--success-color) 0%, var(--success-light) 100%)'}}>
              <i className="fas fa-users fa-2x text-white"></i>
            </div>
            <h2 className="fw-bold text-primary">{stats.totalFarmers}</h2>
            <h5 className="fw-bold text-muted">Registered Farmers</h5>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="dashboard-card info">
            <div className="stats-icon" style={{background: 'linear-gradient(135deg, var(--info-color) 0%, var(--info-light) 100%)'}}>
              <i className="fas fa-exchange-alt fa-2x text-white"></i>
            </div>
            <h2 className="fw-bold text-primary">{stats.totalTransactions}</h2>
            <h5 className="fw-bold text-muted">Total Transactions</h5>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="dashboard-card warning">
            <div className="stats-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'}}>
              <i className="fas fa-link fa-2x text-white"></i>
            </div>
            <h2 className="fw-bold text-primary">{stats.blockchainBlocks}</h2>
            <h5 className="fw-bold text-muted">Blockchain Blocks</h5>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Batches */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>Recent Wool Batches
              </h5>
            </div>
            <div className="card-body">
              {recentBatches.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No batches found</h5>
                  <p className="text-muted">No wool batches have been registered yet</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Batch ID</th>
                        <th>Farmer</th>
                        <th>Weight (kg)</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBatches.map((batch, index) => (
                        <tr key={`${batch.batchId}-${batch.id || index}`}>
                          <td>
                            <strong>{batch.batchId}</strong>
                            {batch.qrCode && <i className="fas fa-qrcode text-success ms-2"></i>}
                          </td>
                          <td>{batch.farmerName}</td>
                          <td>{batch.weight}</td>
                          <td>{batch.currentLocation || batch.location}</td>
                          <td>
                            <span className={`badge bg-${getStatusColor(batch.status)}`}>
                              {batch.status}
                            </span>
                          </td>
                          <td>{new Date(batch.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blockchain Info */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">
                <i className="fas fa-link me-2"></i>Blockchain Status
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Chain Valid:</strong>
                <span className="badge bg-success ms-2">Valid</span>
              </div>
              <div className="mb-3">
                <strong>Total Blocks:</strong> {stats.blockchainBlocks}
              </div>
              <div className="mb-3">
                <strong>Difficulty:</strong> 2
              </div>
              <div className="mb-3">
                <strong>Last Update:</strong>
                <br />
                <small className="text-muted">
                  {new Date().toLocaleString()}
                </small>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">
                <i className="fas fa-tools me-2"></i>Quick Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/marketplace" className="btn btn-outline-primary">
                  <i className="fas fa-store me-2"></i>View Marketplace
                </Link>
                <Link to="/market-info" className="btn btn-outline-info">
                  <i className="fas fa-chart-line me-2"></i>Market Analysis
                </Link>
                <button className="btn btn-outline-warning" onClick={loadDashboardData}>
                  <i className="fas fa-sync me-2"></i>Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentDashboard;