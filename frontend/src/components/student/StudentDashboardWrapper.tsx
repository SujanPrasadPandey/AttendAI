// src/components/student/StudentDashboardWrapper.tsx
import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import StudentAttendanceDashboard from './StudentAttendanceDashboard';

const StudentDashboardWrapper: React.FC = () => {
  const { user } = useContext(AuthContext);

  if (!user || !user.student_profile_id) {
    return <div className="text-red-500">Error: Student profile not found.</div>;
  }

  return <StudentAttendanceDashboard studentId={user.student_profile_id} />;
};

export default StudentDashboardWrapper;