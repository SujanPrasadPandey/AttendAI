import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    const { role, isLoading } = useContext(AuthContext);
    const token = localStorage.getItem('access_token');
  
    if (!token) {
      return <Navigate to="/signin" />;
    }
  
    if (isLoading) {
      return <div>Loading...</div>; // Show a spinner or placeholder
    }
  
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" />;
    }
  
    return children;
  };

export default ProtectedRoute;