import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleGuard = ({ children, user, allowedRoles, requireAuth = true }) => {
  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but doesn't have required role
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4><i className="fas fa-exclamation-triangle"></i> Access Denied</h4>
          <p>You don't have permission to access this page.</p>
          <p>Required roles: {allowedRoles.join(', ')}</p>
          <p>Your role: {user.role}</p>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleGuard;