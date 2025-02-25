import React from "react";

interface ProfileInfoFormProps {
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  onChange: (field: string, value: string) => void;
  onSave: () => void;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  firstName,
  lastName,
  phoneNumber,
  onChange,
  onSave,
}) => {
  return (
    <div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-300">
          First Name
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => onChange("first_name", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-400 bg-gray-700 text-gray-100 p-2"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-300">
          Last Name
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => onChange("last_name", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-400 bg-gray-700 text-gray-100 p-2"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-300">
          Phone Number
        </label>
        <input
          type="text"
          value={phoneNumber || ""}
          onChange={(e) => onChange("phone_number", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-400 bg-gray-700 text-gray-100 p-2"
        />
      </div>
      <button
        onClick={onSave}
        className="mb-6 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
      >
        Save Profile Changes
      </button>
    </div>
  );
};

export default ProfileInfoForm;
