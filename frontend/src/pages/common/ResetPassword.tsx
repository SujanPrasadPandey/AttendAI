import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const handleReset = async () => {
    if (!newPassword || !newPassword2) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword !== newPassword2) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const url = `${backendUrl}/api/users/reset-password-confirm/?uid=${uid}&token=${token}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword, new_password2: newPassword2 }),
      });

      if (response.ok) {
        setMessage("Password reset successfully. Redirecting to Sign In...");
        setError("");
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        const data = await response.json();
        setError(data.detail || "Error resetting password.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleReset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#232539]">
      <h1 className="text-2xl mb-4 text-[#CDD6F4]">Reset Your Password</h1>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="New Password"
        className="mb-4 p-2 border rounded bg-[#1E1E2E] text-[#CDD6F4] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#89B5FA]"
      />
      <input
        type="password"
        value={newPassword2}
        onChange={(e) => setNewPassword2(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Confirm New Password"
        className="mb-4 p-2 border rounded bg-[#1E1E2E] text-[#CDD6F4] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#89B5FA]"
      />
      <button
        onClick={handleReset}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Reset Password
      </button>
      {message && <p className="text-green-400">{message}</p>}
      {error && <p className="text-red-400">{error}</p>}
    </div>
  );
};

export default ResetPassword;
