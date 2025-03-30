import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail: React.FC = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("No token provided.");
        return;
      }
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(
          `${backendUrl}/api/users/verify-email/?token=${token}`
        );
        const data = await response.json();
        if (response.ok) {
          setMessage(data.detail);
        } else {
          setError(data.detail || "Verification failed.");
        }
      } catch (err) {
        setError("Network error. Please try again later.");
      }
    };
    verifyEmail();
  }, [token]);

  const handleSignIn = () => {
    navigate("/signin");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#232539]">
      <h1 className="text-2xl mb-4 text-[#CDD6F4]">Verify Email</h1>
      {message && <p className="text-green-400 mb-4">{message}</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <button
        onClick={handleSignIn}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Go to Sign In
      </button>
    </div>
  );
};

export default VerifyEmail;
