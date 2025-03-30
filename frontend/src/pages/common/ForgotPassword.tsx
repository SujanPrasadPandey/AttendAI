import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleReset = async () => {
    if (email.trim() === "") {
      setError("Please enter your email.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/users/request-reset/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Password reset instructions have been sent to your email.");
        setError("");
      } else {
        const errData = await response.json();
        setError(errData.detail || "Error sending reset request.");
      }
    } catch (err) {
      setError("Network error, please try again later.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleReset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#232539]">
      <h1 className="text-2xl mb-4 text-[#CDD6F4]">Reset Password</h1>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your email"
        className="mb-4 p-2 border rounded bg-[#1E1E2E] text-[#CDD6F4] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#89B5FA]"
      />
      <button
        onClick={handleReset}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Send Reset Link
      </button>
      {message && <p className="text-green-400">{message}</p>}
      {error && <p className="text-red-400">{error}</p>}
      <button
        onClick={() => navigate("/signin")}
        className="mt-2 text-blue-400 underline hover:text-blue-300"
      >
        Back to Sign In
      </button>
    </div>
  );
};

export default ForgotPassword;
