import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useContext(AuthContext);
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/signin" />;
  }

  if (isLoading) {
    return <div>Loading...</div>; // You can also use a spinner or another loading indicator.
  }

  // Check if user or user's role is not set, or if the user's role is not in allowedRoles.
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
