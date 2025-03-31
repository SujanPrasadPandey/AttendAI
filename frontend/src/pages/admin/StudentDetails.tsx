// frontend/src/pages/admin/StudentDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../utils/api'; // Adjust path

const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await apiClient.get(`/api/users/admin/users/${id}/`);
        setStudent(response.data);
      } catch (error) {
        console.error('Error fetching student:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!student) return <div className="p-4">Student not found</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{student.first_name} {student.last_name}</h2>
      <img
        src={student.profile_picture || '/default-profile.png'}
        alt="Profile"
        className="w-32 h-32 rounded-full mb-4"
      />
      <p><strong>Username:</strong> {student.username}</p>
      <p><strong>Email:</strong> {student.email}</p>
      <p><strong>Role:</strong> {student.role}</p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default StudentDetails;