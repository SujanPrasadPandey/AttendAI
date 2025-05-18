// src/pages/common/Dashboard.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Use useAuth hook for consistency

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth(); // Get user and isLoading from AuthContext
  const navigate = useNavigate();

  // Redirect based on user role when user data is available
  useEffect(() => {
    if (!isLoading && user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'teacher':
          navigate('/teacher', { replace: true });
          break;
        case 'student':
          navigate('/student', { replace: true });
          break;
        case 'parent':
          // Stay on dashboard or redirect to a future /parent route
          break;
        default:
          // Handle unexpected roles (optional: redirect to /signin or show error)
          console.warn(`Unexpected user role: ${user.role}`);
          break;
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading state while fetching user data
  if (isLoading || !user) {
    return <div className="p-4">Loading...</div>;
  }

  // Render parent dashboard (or placeholder for other roles)
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.first_name || user.username}</h1>
      <div>Dashboard for {user.role} (Parent Dashboard - to be implemented)</div>
    </div>
  );
};

export default Dashboard;