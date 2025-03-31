import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';

interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture?: string;
}

interface Subject {
  id: number;
  name: string;
}

interface SchoolClass {
  id: number;
  name: string;
}

interface TeacherProfile {
  id: number;
  subjects: Subject[];
  classes: SchoolClass[];
}

const EditUser: React.FC = () => {
  const { role, userId } = useParams<{ role?: string; userId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return <div className="p-4 bg-gray-900 min-h-screen text-gray-100">Error: User ID is not provided.</div>;
  }

  // User fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // Teacher-specific fields
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [teacherProfileId, setTeacherProfileId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user details
        const userResponse = await apiClient.get(`/api/users/admin/users/${userId}/`);
        const userData: User = userResponse.data;
        setUsername(userData.username);
        setEmail(userData.email || '');
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setPhoneNumber(userData.phone_number || '');

        // Fetch teacher-specific data if role is teacher
        if (role === 'teacher') {
          const subjectsResponse = await apiClient.get('/api/school_data/subjects/');
          setSubjects(subjectsResponse.data);

          const classesResponse = await apiClient.get('/api/school_data/classes/');
          setClasses(classesResponse.data);

          const profilesResponse = await apiClient.get('/api/school_data/teacherprofiles/');
          const profile: TeacherProfile | undefined = profilesResponse.data.find(
            (p: any) => p.user.id === parseInt(userId)
          );
          if (profile) {
            setTeacherProfileId(profile.id);
            setSelectedSubjects(profile.subjects.map((s) => s.id));
            setSelectedClasses(profile.classes.map((c) => c.id));
          } else {
            setError('Teacher profile not found.');
          }
        }
      } catch (err: any) {
        console.error(err);
        setError('Error fetching user or teacher profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    if (email.trim() !== '') formData.append('email', email);
    if (firstName.trim() !== '') formData.append('first_name', firstName);
    if (lastName.trim() !== '') formData.append('last_name', lastName);
    if (phoneNumber.trim() !== '') formData.append('phone_number', phoneNumber);
    formData.append('role', role || 'teacher');
    if (password.trim() !== '') formData.append('password', password);
    if (profilePicture) formData.append('profile_picture', profilePicture);

    try {
      // Update user
      await apiClient.patch(`/api/users/admin/users/${userId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update teacher profile if teacher
      if (role === 'teacher' && teacherProfileId) {
        await apiClient.patch(`/api/school_data/teacherprofiles/${teacherProfileId}/`, {
          subject_ids: selectedSubjects,
          class_ids: selectedClasses,
        });
      }

      setSuccess('User updated successfully.');
      navigate(`/admin/manage/${role}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error updating user or teacher profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await apiClient.delete(`/api/users/admin/users/${userId}/`);
      navigate(`/admin/manage/${role}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error deleting user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-100">
      <h2 className="text-2xl font-bold mb-6">
        Edit {role?.charAt(0).toUpperCase() + role?.slice(1)} User
      </h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
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
          placeholder="Enter new password (leave blank to keep unchanged)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
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

        {/* Teacher-specific fields */}
        {role === 'teacher' && (
          <>
            <div>
              <label className="block mb-1">Subjects</label>
              <select
                multiple
                value={selectedSubjects.map(String)}
                onChange={(e) =>
                  setSelectedSubjects(
                    Array.from(e.target.selectedOptions, (option) => parseInt(option.value))
                  )
                }
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                disabled={loading}
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Classes</label>
              <select
                multiple
                value={selectedClasses.map(String)}
                onChange={(e) =>
                  setSelectedClasses(
                    Array.from(e.target.selectedOptions, (option) => parseInt(option.value))
                  )
                }
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                disabled={loading}
              >
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id.toString()}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            disabled={loading}
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            disabled={loading}
          >
            Delete User
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;