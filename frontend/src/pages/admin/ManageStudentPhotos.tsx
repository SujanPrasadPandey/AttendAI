// src/pages/admin/ManageStudentPhotos.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import apiClient from '../../utils/api';

interface Student {
  id: number;
  username: string;
  // include other fields as needed
}

interface EnrollResponse {
  message: string;
  avg_embedding?: number[];
  num_samples?: number;
}

const ManageStudentPhotos: React.FC = () => {
  // State for list of students
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  // State for images to enroll (pending images)
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  // For preview URLs of pending images (so we can show thumbnails)
  const [previewURLs, setPreviewURLs] = useState<string[]>([]);
  // Status message and errors
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch student list on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await apiClient.get('/api/users/admin/users/?role=student');
        setStudents(response.data);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students.');
      }
    };
    fetchStudents();
  }, []);

  // Filtered student list based on search query
  const filteredStudents = students.filter((student) =>
    student.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler when selecting a student from the list
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    // Clear any pending images when a new student is selected
    setPendingImages([]);
    setPreviewURLs([]);
    setMessage(null);
    setError(null);
  };

  // Handler for file input change – add image to pending images and preview URLs
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPendingImages((prev) => [...prev, file]);
      const previewUrl = URL.createObjectURL(file);
      setPreviewURLs((prev) => [...prev, previewUrl]);
    }
  };

  // Handler to remove an image from pending list
  const handleRemoveImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewURLs((prev) => prev.filter((_, i) => i !== index));
  };

  // Handler for enrolling images for the selected student
  const handleEnroll = async () => {
    if (!selectedStudent) {
      setError('Please select a student.');
      return;
    }
    if (pendingImages.length === 0) {
      setError('No images to enroll.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Loop over each image and call enroll API using the correct endpoint
      const enrollPromises = pendingImages.map((file) => {
        const formData = new FormData();
        formData.append('student_id', selectedStudent.id.toString());
        formData.append('image', file);
        return apiClient.post<EnrollResponse>('/api/facial_recognition/enroll/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      });
      const responses = await Promise.all(enrollPromises);
      // Optionally, process responses; here we simply show a success message.
      setMessage(`Enrolled ${responses.length} image${responses.length > 1 ? 's' : ''} for ${selectedStudent.username}.`);
      // Clear pending images after enrollment
      setPendingImages([]);
      setPreviewURLs([]);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error enrolling images.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-100">
      {/* Search bar and student selection */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex-1 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
          />
        </div>
      </div>

      {/* Student list */}
      <div className="mb-6">
        {filteredStudents.length > 0 ? (
          <ul className="space-y-2">
            {filteredStudents.map((student) => (
              <li
                key={student.id}
                className={`p-2 border border-gray-700 rounded cursor-pointer hover:bg-gray-800 ${selectedStudent?.id === student.id ? 'bg-gray-800' : ''}`}
                onClick={() => handleSelectStudent(student)}
              >
                {student.username}
              </li>
            ))}
          </ul>
        ) : (
          <p>No students found.</p>
        )}
      </div>

      {/* Selected student panel */}
      {selectedStudent && (
        <div className="border border-gray-700 rounded">
          {/* Top thin box: Student info and enroll button */}
          <div className="flex justify-between items-center p-2 border-b border-gray-700 bg-gray-800">
            <span className="font-semibold">{selectedStudent.username}</span>
            <button
              onClick={handleEnroll}
              disabled={loading || pendingImages.length === 0}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-gray-100"
            >
              {loading ? 'Enrolling...' : 'Enroll Images'}
            </button>
          </div>

          {/* Bottom fat box: List of images with "Add" button */}
          <div className="p-4">
            <div className="mb-4">
              <label className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded cursor-pointer text-gray-100">
                Add Image
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            {previewURLs.length > 0 ? (
              <div className="flex space-x-4 overflow-x-auto py-2">
                {previewURLs
                  .slice()
                  .reverse() // Latest first
                  .map((url, index) => (
                    <div key={index} className="relative">
                      <img src={url} alt="Enrolled" className="w-32 h-32 object-cover rounded" />
                      <button
                        onClick={() =>
                          // Calculate index relative to original pendingImages array
                          handleRemoveImage(previewURLs.length - 1 - index)
                        }
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400">No images added yet.</p>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-red-500">{error}</p>}
      {message && <p className="mt-4 text-green-400">{message}</p>}
    </div>
  );
};

export default ManageStudentPhotos;
