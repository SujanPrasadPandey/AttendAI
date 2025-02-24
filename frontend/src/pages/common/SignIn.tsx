import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarLandingPage from "../../components/landingPage/NavbarLandingPage";
import { FaUser, FaLock } from "react-icons/fa";

const SignIn: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (username.trim() === "") {
      setError("Username cannot be empty.");
      return;
    }
    if (password.trim() === "") {
      setError("Password cannot be empty.");
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/users/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("username", username);
        setError("");
        navigate("/dashboard", { state: { username } });
      } else {
        const errData = await response.json();
        setError(errData.detail || "Sign in failed.");
      }
    } catch (err) {
      setError("Network error, please try again.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSignIn();
    }
  };

  return (
    <div className="bg-[#232539] min-h-screen flex flex-col">
      <NavbarLandingPage />
      <div className="bg-[#1E1E2E] mt-10 mx-5 md:mx-auto w-full max-w-3xl p-8 rounded-lg shadow-lg">
        <h1 className="text-[#CDD6F4] font-inter font-bold text-4xl mb-8">
          Sign In
        </h1>

        <div className="mb-6">
          <label
            htmlFor="username"
            className="text-[#CDD6F4] font-inter text-sm block mb-2"
          >
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your username..."
              className="w-full h-[40px] pl-10 bg-[#292E44] text-[#CDD6F4] border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#89B5FA]"
            />
            <span className="absolute left-3 top-[50%] translate-y-[-50%] text-[#CDD6F4]">
              <FaUser />
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="text-[#CDD6F4] font-inter text-sm block mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password..."
              className="w-full h-[40px] pl-10 bg-[#292E44] text-[#CDD6F4] border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#89B5FA]"
            />
            <span className="absolute left-3 top-[50%] translate-y-[-50%] text-[#CDD6F4]">
              <FaLock />
            </span>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <a
            href="/forgot-password"
            className="text-[#89B5FA] font-inter text-sm underline"
          >
            Forgot password?
          </a>
        </div>

        <button
          onClick={handleSignIn}
          className="bg-[#89B5FA] text-[#292E44] font-inter font-semibold text-lg rounded-md w-full h-[54px] flex items-center justify-center"
        >
          Sign In
        </button>

        {error && (
          <p className="text-[#F38BA8] text-sm text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
};

export default SignIn;
