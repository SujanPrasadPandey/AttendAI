// src/components/admin/TeacherFormFields.tsx
import React from 'react';

interface Subject {
  id: number;
  name: string;
}

interface SchoolClass {
  id: number;
  name: string;
}

interface TeacherFormFieldsProps {
  subjects: Subject[];
  teacherClasses: SchoolClass[];
  selectedSubjects: number[];
  selectedTeacherClasses: number[];
  setSelectedSubjects: (subjects: number[]) => void;
  setSelectedTeacherClasses: (classes: number[]) => void;
  disabled?: boolean;
}

const TeacherFormFields: React.FC<TeacherFormFieldsProps> = ({
  subjects,
  teacherClasses,
  selectedSubjects,
  selectedTeacherClasses,
  setSelectedSubjects,
  setSelectedTeacherClasses,
  disabled = false,
}) => {
  return (
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
          disabled={disabled}
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id.toString()}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label className="block mb-1">Classes</label>
        <select
          multiple
          value={selectedTeacherClasses.map(String)}
          onChange={(e) =>
            setSelectedTeacherClasses(
              Array.from(e.target.selectedOptions, (option) => parseInt(option.value))
            )
          }
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          disabled={disabled}
        >
          {teacherClasses.map((classItem) => (
            <option key={classItem.id} value={classItem.id.toString()}>
              {classItem.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default TeacherFormFields;
