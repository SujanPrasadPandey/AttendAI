// src/pages/common/StudentAttendanceViewer.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../utils/api';
import StudentAttendanceDashboard from '../../components/student/StudentAttendanceDashboard';

const StudentAttendanceViewer: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [studentName, setStudentName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true); // Loading state for student name
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    if (studentId) {
      setLoading(true);
      setError(null); // Reset error on new fetch
      apiClient.get(`/api/school_data/studentprofiles/${studentId}/`)
        .then(response => {
          if (response.data && response.data.user) {
             setStudentName(`${response.data.user.first_name || ''} ${response.data.user.last_name || ''}`.trim());
          } else {
              setStudentName('Student Profile Incomplete');
          }
          setLoading(false);
        })
        .catch(() => {
            setStudentName('Unknown Student');
            setError('Failed to load student information.');
            setLoading(false);
        });
    } else {
        setLoading(false); // No ID, so not loading
    }
  }, [studentId]);

  // Container with dark mode styling and padding
  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      {loading && (
           <h1 className="text-2xl font-bold mb-6 text-center text-gray-700 dark:text-gray-300">Loading Student Info...</h1>
      )}

      {!loading && error && (
            <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
      )}

      {!loading && !error && studentId && (
        <>
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Attendance for: {studentName || 'Loading...'}
          </h1>
          <StudentAttendanceDashboard studentId={Number(studentId)} />
        </>
      )}

      {!studentId && !loading && (
        <div className="text-center text-xl text-gray-500 dark:text-gray-400 mt-10">
          Please select a student to view their attendance.
        </div>
      )}
    </div>
  );
};

export default StudentAttendanceViewer;