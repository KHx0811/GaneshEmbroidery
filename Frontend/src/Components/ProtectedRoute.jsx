import React, { useEffect } from 'react';
import { isAuthenticated, getUserRole } from '../utils/auth.js';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = redirectTo;
      return;
    }

    if (requiredRole) {
      const userRole = getUserRole();
      if (userRole !== requiredRole) {
        if (userRole === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
        return;
      }
    }
  }, [requiredRole, redirectTo]);

  if (!isAuthenticated()) {
    return null;
  }

  if (requiredRole) {
    const userRole = getUserRole();
    if (userRole !== requiredRole) {
      return null;
    }
  }

  return children;
};

export default ProtectedRoute;
