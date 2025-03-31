import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

interface SchoolClass {
  id: number;
  name: string;
  grade_level: number;
}

const ManageClasses = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClass, setCurrentClass] = useState<Partial<SchoolClass>>({ name: '', grade_level: 0 });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiClient.get('/api/school_data/classes/');
        setClasses(response.data);
      } catch (err) {
        setError('Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const openModal = (cls?: SchoolClass) => {
    if (cls) {
      setIsEditing(true);
      setCurrentClass(cls);
    } else {
      setIsEditing(false);
      setCurrentClass({ name: '', grade_level: 0 });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentClass({ name: '', grade_level: 0 });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await apiClient.delete(`/api/school_data/classes/${id}/`);
        setClasses(classes.filter((cls) => cls.id !== id));
      } catch (err) {
        setError('Failed to delete class');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentClass.id) {
        // Update
        const response = await apiClient.put(`/api/school_data/classes/${currentClass.id}/`, currentClass);
        setClasses(classes.map(cls => (cls.id === currentClass.id ? response.data : cls)));
      } else {
        // Create
        const response = await apiClient.post(`/api/school_data/classes/`, currentClass);
        setClasses([...classes, response.data]);
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
      <h1 className="text-2xl font-bold mb-4">Manage School Classes</h1>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4"
        onClick={() => openModal()}
      >
        Add New Class
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
                Grade Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
            {classes.map((cls) => (
              <tr key={cls.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{cls.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{cls.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{cls.grade_level}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2"
                    onClick={() => openModal(cls)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                    onClick={() => handleDelete(cls.id)}
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
              {isEditing ? 'Edit Class' : 'Add New Class'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={currentClass.name || ''}
                  onChange={(e) => setCurrentClass({ ...currentClass, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1" htmlFor="grade_level">
                  Grade Level
                </label>
                <input
                  id="grade_level"
                  type="number"
                  value={currentClass.grade_level || 0}
                  onChange={(e) =>
                    setCurrentClass({ ...currentClass, grade_level: parseInt(e.target.value) })
                  }
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

export default ManageClasses;
