import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children, user, requireAuth = true, showLoginPrompt = false }) => {
  if (requireAuth && !user) {
    if (showLoginPrompt) {
      return (
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card text-center">
                <div className="card-body py-5">
                  <i className="fas fa-lock fa-4x text-primary mb-4"></i>
                  <h3>Login Required</h3>
                  <p className="text-muted mb-4">
                    Please log in to access this feature and continue shopping.
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <a href="/login" className="btn btn-primary btn-lg">
                      <i className="fas fa-sign-in-alt me-2"></i>Login
                    </a>
                    <a href="/login" className="btn btn-outline-primary btn-lg">
                      <i className="fas fa-user-plus me-2"></i>Sign Up
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;