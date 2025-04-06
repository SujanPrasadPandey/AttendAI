import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

interface Student {
  id: number;
  user: {
    username: string;
  };
}

interface FaceImage {
  id: number;
  image: string; // URL to the image
  created_at: string;
}

const ManageStudentPhotos: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [photos, setPhotos] = useState<FaceImage[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photosToRemove, setPhotosToRemove] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all students when the page loads
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/api/school_data/studentprofiles/');
        setStudents(response.data);
      } catch (error) {
        setMessage('Failed to load students.');
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Fetch photos when a student is selected
  useEffect(() => {
    if (selectedStudent) {
      const fetchPhotos = async () => {
        setLoading(true);
        try {
          const response = await apiClient.get(`/api/facial_recognition/student/${selectedStudent.id}/images/`);
          setPhotos(response.data);
        } catch (error) {
          setMessage('Failed to load photos.');
          console.error('Error fetching photos:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPhotos();
    }
  }, [selectedStudent]);

  // Handle selecting a student
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setPhotos([]);
    setNewPhotos([]);
    setPhotosToRemove([]);
    setMessage('');
  };

  // Handle adding new photos
  const handleAddPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setNewPhotos((prev) => [...prev, ...files]);
    }
  };

  // Handle marking a photo for removal
  const handleRemovePhoto = (photoId: number) => {
    setPhotosToRemove((prev) => [...prev, photoId]);
  };

  // Handle the Enroll button click
  const handleEnroll = async () => {
    if (!selectedStudent) {
      setMessage('Please select a student.');
      return;
    }

    setLoading(true);
    setMessage('');

    // Step 1: Remove selected photos
    for (const photoId of photosToRemove) {
      try {
        await apiClient.delete(`/api/facial_recognition/remove-image/${photoId}/`);
      } catch (error) {
        setMessage(`Failed to remove photo ID ${photoId}.`);
        console.error('Error removing photo:', error);
        setLoading(false);
        return;
      }
    }

    // Step 2: Add new photos one-by-one
    const uploadResults = [];
    for (const photo of newPhotos) {
      const formData = new FormData();
      formData.append('student_id', selectedStudent.id.toString());
      formData.append('image', photo);
      try {
        const response = await apiClient.post('/api/facial_recognition/enroll/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadResults.push({ success: true, fileName: photo.name, message: response.data.message });
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Unknown error';
        uploadResults.push({ success: false, fileName: photo.name, message: errorMessage });
        console.error(`Error enrolling ${photo.name}:`, error);
      }
    }

    // Step 3: Refresh the photo list
    try {
      const response = await apiClient.get(`/api/facial_recognition/student/${selectedStudent.id}/images/`);
      setPhotos(response.data);
      setNewPhotos([]);
      setPhotosToRemove([]);

      // Summarize upload results
      const successes = uploadResults.filter((r) => r.success);
      const failures = uploadResults.filter((r) => !r.success);
      let resultMessage = '';
      if (successes.length > 0) {
        resultMessage += `Successfully enrolled ${successes.length} photo(s). `;
      }
      if (failures.length > 0) {
        resultMessage += `Failed to enroll ${failures.length} photo(s): ${failures.map((f) => `${f.fileName} (${f.message})`).join(', ')}.`;
      }
      setMessage(resultMessage.trim());
    } catch (error) {
      setMessage('Failed to refresh photo list.');
      console.error('Error refreshing photos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Student Photos</h1>

      {loading && <p className="text-blue-400">Loading...</p>}
      {message && <p className={message.includes('Failed') ? 'text-red-500' : 'text-green-500'}>{message}</p>}

      {/* Student List */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Students</h2>
        <ul className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
          {students.map((student) => (
            <li
              key={student.id}
              onClick={() => handleStudentSelect(student)}
              className={`p-2 cursor-pointer hover:bg-gray-700 rounded ${
                selectedStudent?.id === student.id ? 'bg-blue-600' : ''
              }`}
            >
              {student.user.username}
            </li>
          ))}
        </ul>
      </div>

      {/* Selected Student Photos */}
      {selectedStudent && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Photos for {selectedStudent.user.username}
          </h2>

          {/* Existing Photos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {photos.map((photo) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.image}
                  alt="Student Photo"
                  className="w-55 h-55 object-cover rounded"
                />
                {!photosToRemove.includes(photo.id) ? (
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                ) : (
                  <span className="absolute top-1 right-1 bg-yellow-500 text-white px-2 py-1 rounded">
                    To Be Removed
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* New Photos Preview */}
          {newPhotos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">New Photos to Add</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newPhotos.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt="New Photo"
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add Photos and Enroll */}
          <div className="flex items-center space-x-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleAddPhoto}
              className="text-gray-100 bg-gray-700 p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />
            <button
              onClick={handleEnroll}
              disabled={loading || (newPhotos.length === 0 && photosToRemove.length === 0)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-500"
            >
              Enroll
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudentPhotos;