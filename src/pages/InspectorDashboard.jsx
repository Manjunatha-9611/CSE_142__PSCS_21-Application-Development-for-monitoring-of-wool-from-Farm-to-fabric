import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const InspectorDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    pendingInspections: 0,
    completedToday: 0,
    totalInspected: 0,
    averageGrade: 'A'
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // Simulate loading data
  useEffect(() => {
    // In a real app, fetch this from an API
    setStats({
      pendingInspections: 12,
      completedToday: 5,
      totalInspected: 145,
      averageGrade: 'A'
    });

    setRecentActivity([
      { id: 1, action: 'Inspected Batch #B-2024-001', time: '10:30 AM', status: 'Approved' },
      { id: 2, action: 'Rejected Batch #B-2024-005', time: '09:15 AM', status: 'Rejected' },
      { id: 3, action: 'Updated Quality Report #QR-112', time: 'Yesterday', status: 'Updated' }
    ]);
  }, []);

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
                  Inspector Dashboard
                </h3>
              </div>
              <p className="mb-0">Inspector: {user?.name || user?.displayName} | Quality Assessment & Certification</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="klwb-kpi-card red">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <h2 className="klwb-kpi-number">{stats.pendingInspections}</h2>
                <p className="klwb-kpi-label">Pending Inspections</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="klwb-kpi-card green">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-check-double"></i>
                </div>
                <h2 className="klwb-kpi-number">{stats.completedToday}</h2>
                <p className="klwb-kpi-label">Completed Today</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="klwb-kpi-card cyan">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-history"></i>
                </div>
                <h2 className="klwb-kpi-number">{stats.totalInspected}</h2>
                <p className="klwb-kpi-label">Total Inspected</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="klwb-kpi-card purple">
              <div className="klwb-kpi-content">
                <div className="klwb-kpi-icon">
                  <i className="fas fa-star"></i>
                </div>
                <h2 className="klwb-kpi-number">{stats.averageGrade}</h2>
                <p className="klwb-kpi-label">Avg. Grade Awarded</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Quick Actions */}
          <div className="col-lg-8 mb-4">
            <div className="klwb-detail-card h-100">
              <div className="klwb-detail-header">
                <h5 className="klwb-detail-title">
                  <i className="fas fa-bolt me-2"></i>Inspector Actions
                </h5>
              </div>
              <div className="d-flex gap-3 flex-wrap p-3">
                <Link to="/inspector-quality" className="klwb-action-btn klwb-btn-view btn-lg flex-grow-1 text-center">
                  <i className="fas fa-microscope fa-2x d-block mb-2"></i>
                  Start Inspection
                </Link>
                <Link to="/traceability" className="klwb-action-btn klwb-btn-edit btn-lg flex-grow-1 text-center">
                  <i className="fas fa-search fa-2x d-block mb-2"></i>
                  Batch Lookup
                </Link>
                <Link to="/market-info" className="klwb-action-btn klwb-btn-view btn-lg flex-grow-1 text-center">
                  <i className="fas fa-chart-line fa-2x d-block mb-2"></i>
                  Market Reports
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-lg-4 mb-4">
            <div className="klwb-detail-card h-100">
              <div className="klwb-detail-header">
                <h5 className="klwb-detail-title">
                  <i className="fas fa-clock me-2"></i>Recent Activity
                </h5>
              </div>
              <div className="p-3">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <div className={`rounded-circle p-2 me-3 ${activity.status === 'Approved' ? 'bg-success text-white' :
                      activity.status === 'Rejected' ? 'bg-danger text-white' : 'bg-info text-white'
                      }`}>
                      <i className={`fas ${activity.status === 'Approved' ? 'fa-check' :
                        activity.status === 'Rejected' ? 'fa-times' : 'fa-edit'
                        }`}></i>
                    </div>
                    <div>
                      <h6 className="mb-0">{activity.action}</h6>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectorDashboard;