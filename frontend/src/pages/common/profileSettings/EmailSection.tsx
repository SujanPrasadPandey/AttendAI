import React from "react";

interface EmailSectionProps {
  email: string;
  emailVerified: boolean;
  onEmailChange: (value: string) => void;
  onUpdateEmail: () => void;
  onVerifyEmail: () => void;
}

const EmailSection: React.FC<EmailSectionProps> = ({
  email,
  emailVerified,
  onEmailChange,
  onUpdateEmail,
  onVerifyEmail,
}) => {
  return (
    <div className="mb-6 border-t border-gray-600 pt-4">
      <label className="block text-sm font-medium text-gray-300">
        Email
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-400 bg-gray-700 text-gray-100 p-2"
      />
      <div className="mt-1 flex items-center gap-4">
        <button
          onClick={onUpdateEmail}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Update Email
        </button>
        {!emailVerified && (
          <button
            onClick={onVerifyEmail}
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded"
          >
            Verify Email
          </button>
        )}
        <span className="text-sm">
          Verification Status:{" "}
          {emailVerified ? (
            <span className="text-green-400">Verified</span>
          ) : (
            <span className="text-red-400">Not Verified</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default EmailSection;
