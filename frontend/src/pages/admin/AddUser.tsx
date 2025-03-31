// src/pages/admin/AddUser.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../utils/api';
import TeacherFormFields from '../../components/admin/TeacherFormFields';
import StudentFormFields from '../../components/admin/StudentFormFields';

interface Subject {
  id: number;
  name: string;
}

interface SchoolClass {
  id: number;
  name: string;
}

const AddUser: React.FC = () => {
  const { role } = useParams<{ role?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Common user fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // Teacher-specific fields
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<SchoolClass[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedTeacherClasses, setSelectedTeacherClasses] = useState<number[]>([]);

  // Student-specific fields
  const [studentClasses, setStudentClasses] = useState<SchoolClass[]>([]);
  const [selectedStudentClass, setSelectedStudentClass] = useState<number | ''>('');
  const [rollNumber, setRollNumber] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState<string | null>(null);

  // Fetch data based on role
  useEffect(() => {
    if (role === 'teacher') {
      const fetchSubjects = async () => {
        try {
          const response = await apiClient.get('/api/school_data/subjects/');
          setSubjects(response.data);
        } catch (err) {
          console.error('Error fetching subjects:', err);
          setError('Failed to load subjects.');
        }
      };

      const fetchClasses = async () => {
        try {
          const response = await apiClient.get('/api/school_data/classes/');
          setTeacherClasses(response.data);
        } catch (err) {
          console.error('Error fetching classes:', err);
          setError('Failed to load classes.');
        }
      };

      fetchSubjects();
      fetchClasses();
    } else if (role === 'student') {
      // For students, we only need to fetch classes
      const fetchClasses = async () => {
        try {
          const response = await apiClient.get('/api/school_data/classes/');
          setStudentClasses(response.data);
        } catch (err) {
          console.error('Error fetching classes for student:', err);
          setError('Failed to load classes.');
        }
      };
      fetchClasses();
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('phone_number', phoneNumber);
    formData.append('password', password);
    formData.append('role', role || 'teacher');
    if (profilePicture) formData.append('profile_picture', profilePicture);

    try {
      // Create the user
      const userResponse = await apiClient.post('/api/users/admin/users/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const userId = userResponse.data.id;

      if (role === 'teacher') {
        // Create teacher profile
        await apiClient.post('/api/school_data/teacherprofiles/', {
          user_id: userId,
          subject_ids: selectedSubjects,
          class_ids: selectedTeacherClasses,
        });
      } else if (role === 'student') {
        // Create student profile
        await apiClient.post('/api/school_data/studentprofiles/', {
          user_id: userId,
          school_class: selectedStudentClass,
          roll_number: rollNumber,
          address: address,
        });
      }

      navigate(`/admin/manage/${role || 'teacher'}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error adding user or profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-100">
      <h2 className="text-2xl font-bold mb-6">
        Add {role?.charAt(0).toUpperCase() + role?.slice(1) || 'User'}
      </h2>
      {loading && <p>Adding user...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {/* Common user fields */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          required
          disabled={loading}
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          disabled={loading}
        />
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          required
          disabled={loading}
        />
        <div>
          <label className="block mb-1">Profile Picture (optional)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setProfilePicture(e.target.files[0]);
              }
            }}
            className="w-full text-gray-100"
            disabled={loading}
          />
        </div>

        {/* Role-specific fields */}
        {role === 'teacher' && (
          <TeacherFormFields
            subjects={subjects}
            teacherClasses={teacherClasses}
            selectedSubjects={selectedSubjects}
            selectedTeacherClasses={selectedTeacherClasses}
            setSelectedSubjects={setSelectedSubjects}
            setSelectedTeacherClasses={setSelectedTeacherClasses}
            disabled={loading}
          />
        )}

        {role === 'student' && (
          <StudentFormFields
            studentClasses={studentClasses}
            selectedStudentClass={selectedStudentClass}
            rollNumber={rollNumber}
            address={address}
            setSelectedStudentClass={setSelectedStudentClass}
            setRollNumber={setRollNumber}
            setAddress={setAddress}
            disabled={loading}
          />
        )}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          disabled={loading}
        >
          Add {role?.charAt(0).toUpperCase() + role?.slice(1) || 'User'}
        </button>
      </form>
    </div>
  );
};

export default AddUser;
