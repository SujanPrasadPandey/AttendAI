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

const EditUser: React.FC = () => {
  const { role, userId } = useParams<{ role?: string; userId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return <div className="p-4 bg-gray-900 min-h-screen text-gray-100">Error: User ID is not provided in the route.</div>;
  }

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/users/admin/users/${userId}/`);
        if (response.status >= 200 && response.status < 300) {
          const data: User = response.data;
          setUsername(data.username);
          setEmail(data.email || '');
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setPhoneNumber(data.phone_number || '');
          setPassword('');
        } else {
          setError('Failed to fetch user details.');
        }
      } catch (err: any) {
        console.error(err);
        setError('Network error while fetching user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

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
      const response = await apiClient.patch(`/api/users/admin/users/${userId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status >= 200 && response.status < 300) {
        setSuccess('User updated successfully.');
        navigate(`/admin/manage/${role}`);
      } else {
        setError('Failed to update user.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Network error while updating user.');
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
      const response = await apiClient.delete(`/api/users/admin/users/${userId}/`);
      if (response.status >= 200 && response.status < 300) {
        navigate(`/admin/manage/${role}`);
      } else {
        setError('Failed to delete user.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Network error while deleting user.');
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