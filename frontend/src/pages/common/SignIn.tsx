import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "@/utils/supabase";
import NavbarLandingPage from "@/components/landingPage/NavbarLandingPage";
import { FaUser, FaLock } from "react-icons/fa";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    // Validate input
    if (!validateEmail(email)) {
      setError("Invalid email format.");
      return;
    }
    if (password.trim() === "") {
      setError("Password cannot be empty.");
      return;
    }

    // Call Supabase API
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else if (data?.user) {
      setError("");
      navigate("/dashboard", { state: { email: data.user.email } });
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
        <h1 className="text-[#CDD6F4] font-inter font-bold text-4xl mb-8">Sign In</h1>

        <div className="mb-6">
          <label htmlFor="email" className="text-[#CDD6F4] font-inter text-sm block mb-2">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown} // Trigger on Enter key
              placeholder="Enter your email..."
              className="w-full h-[40px] pl-10 bg-[#292E44] text-[#CDD6F4] border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#89B5FA]"
            />
            <span className="absolute left-3 top-[50%] translate-y-[-50%] text-[#CDD6F4]">
              <FaUser />
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="text-[#CDD6F4] font-inter text-sm block mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown} // Trigger on Enter key
              placeholder="Enter your password..."
              className="w-full h-[40px] pl-10 bg-[#292E44] text-[#CDD6F4] border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#89B5FA]"
            />
            <span className="absolute left-3 top-[50%] translate-y-[-50%] text-[#CDD6F4]">
              <FaLock />
            </span>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <a href="#" className="text-[#89B5FA] font-inter text-sm underline">
            Forgot password
          </a>
        </div>

        <button
          onClick={handleSignIn}
          className="bg-[#89B5FA] text-[#292E44] font-inter font-semibold text-lg rounded-md w-full h-[54px] flex items-center justify-center"
        >
          Sign In
        </button>

        {error && (
          <p className="text-[#F38BA8] text-sm text-center mt-4">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default SignIn;
