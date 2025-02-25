import React, { useState } from "react";

interface PasswordChangeFormProps {
  accessToken: string;
  backendUrl: string;
  setMessage: (msg: string) => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  accessToken,
  backendUrl,
  setMessage,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !newPassword2) {
      setMessage("All password fields are required.");
      return;
    }
    if (newPassword !== newPassword2) {
      setMessage("New passwords do not match.");
      return;
    }
    const payload = {
      current_password: currentPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    };

    try {
      const response = await fetch(`${backendUrl}/api/users/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setMessage("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setNewPassword2("");
      } else {
        const errData = await response.json();
        setMessage(errData.detail || "Failed to change password.");
      }
    } catch (error) {
      setMessage("Network error while changing password.");
    }
  };

  return (
    <div className="border-t border-gray-600 pt-4">
      <h3 className="text-xl font-semibold mb-2">Change Password</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">
          Current Password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-400 bg-gray-700 text-gray-100 p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-400 bg-gray-700 text-gray-100 p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">
          Confirm New Password
        </label>
        <input
          type="password"
          value={newPassword2}
          onChange={(e) => setNewPassword2(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-400 bg-gray-700 text-gray-100 p-2"
        />
      </div>
      <button
        onClick={handlePasswordChange}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
      >
        Change Password
      </button>
    </div>
  );
};

export default PasswordChangeForm;
