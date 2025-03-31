// src/components/admin/StudentFormFields.tsx
import React from 'react';

interface SchoolClass {
  id: number;
  name: string;
}

interface StudentFormFieldsProps {
  studentClasses: SchoolClass[];
  selectedStudentClass: number | '';
  rollNumber: string;
  address: string;
  setSelectedStudentClass: (value: number | '') => void;
  setRollNumber: (value: string) => void;
  setAddress: (value: string) => void;
  disabled?: boolean;
}

const StudentFormFields: React.FC<StudentFormFieldsProps> = ({
  studentClasses,
  selectedStudentClass,
  rollNumber,
  address,
  setSelectedStudentClass,
  setRollNumber,
  setAddress,
  disabled = false,
}) => {
  return (
    <>
      <div>
        <label className="block mb-1">Class</label>
        <select
          value={selectedStudentClass.toString()}
          onChange={(e) => setSelectedStudentClass(parseInt(e.target.value))}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          disabled={disabled}
        >
          <option value="">Select a class</option>
          {studentClasses.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label className="block mb-1">Roll Number</label>
        <input
          type="text"
          placeholder="Roll Number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          disabled={disabled}
        />
      </div>
      <div className="mt-4">
        <label className="block mb-1">Address</label>
        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          disabled={disabled}
        />
      </div>
    </>
  );
};

export default StudentFormFields;
