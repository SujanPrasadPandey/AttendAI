// src/pages/common/Dashboard.tsx
import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
// import StudentAttendanceDashboard from '../../components/student/StudentAttendanceDashboard';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Welcome, {user.first_name || user.username}</h1>
      {user.role === 'student' && user.student_profile_id ? (
        <StudentAttendanceDashboard studentId={user.student_profile_id} />
      ) : (
        <div>Dashboard content for {user.role} (to be implemented)</div>
      )} */}
      <div>Dashboard content for {user.role} (to be implemented)</div>
    </div>
  );
};

export default Dashboard;