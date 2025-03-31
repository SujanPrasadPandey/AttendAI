import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

interface Subject {
  id: number;
  name: string;
}

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Partial<Subject>>({ name: '' });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await apiClient.get('/api/school_data/subjects/');
        setSubjects(response.data);
      } catch (err) {
        setError('Failed to fetch subjects');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const openModal = (sub?: Subject) => {
    if (sub) {
      setIsEditing(true);
      setCurrentSubject(sub);
    } else {
      setIsEditing(false);
      setCurrentSubject({ name: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentSubject({ name: '' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await apiClient.delete(`/api/school_data/subjects/${id}/`);
        setSubjects(subjects.filter((sub) => sub.id !== id));
      } catch (err) {
        setError('Failed to delete subject');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentSubject.id) {
        // Update subject
        const response = await apiClient.put(`/api/school_data/subjects/${currentSubject.id}/`, currentSubject);
        setSubjects(subjects.map(sub => (sub.id === currentSubject.id ? response.data : sub)));
      } else {
        // Create subject
        const response = await apiClient.post(`/api/school_data/subjects/`, currentSubject);
        setSubjects([...subjects, response.data]);
      }
      closeModal();
    } catch (err) {
      setError('Operation failed');
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen dark:bg-gray-900 dark:text-gray-100">
        <div>Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 text-red-800 p-3 rounded">{error}</div>
      </div>
    );

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Manage Subjects</h1>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4"
        onClick={() => openModal()}
      >
        Add New Subject
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
            {subjects.map((sub) => (
              <tr key={sub.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{sub.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{sub.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2"
                    onClick={() => openModal(sub)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                    onClick={() => handleDelete(sub.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={currentSubject.name || ''}
                  onChange={(e) => setCurrentSubject({ ...currentSubject, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                  {isEditing ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;
