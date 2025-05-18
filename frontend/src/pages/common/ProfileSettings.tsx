// src/pages/common/ProfileSettings.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfilePictureUpload from "./profileSettings/ProfilePictureUpload";
import ProfileInfoForm from "./profileSettings/ProfileInfoForm";
import EmailSection from "./profileSettings/EmailSection";
import PasswordChangeForm from "./profileSettings/PasswordChangeForm";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth
import apiClient from "../../utils/api"; // Import apiClient

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  profile_picture: string | null;
  email_verified: boolean;
}

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, setUser } = useAuth(); // Get user and isLoading from AuthContext
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState<string>("");

  // Redirect to signin if no user or token
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/signin");
    }
  }, [user, isLoading, navigate]);

  // Sync profile state with AuthContext user
  useEffect(() => {
    if (user) {
      setProfile({
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        profile_picture: user.profile_picture,
        email_verified: user.email_verified,
      });
    }
  }, [user]);

  const refreshProfile = async () => {
    try {
      const response = await apiClient.get("/api/users/me/");
      setUser(response.data); // Update AuthContext
      setMessage("Profile loaded successfully.");
    } catch (error: any) {
      setMessage(error.response?.data?.detail || "Failed to load profile.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    setUser(null); // Clear user in AuthContext
    navigate("/signin");
  };

  const handleProfileInfoSave = async () => {
    if (!profile) return;
    const payload = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone_number: profile.phone_number,
    };
    try {
      const response = await apiClient.put("/api/users/me/", payload);
      setUser(response.data); // Update AuthContext
      setMessage("Profile updated successfully.");
    } catch (error: any) {
      setMessage(error.response?.data?.detail || "Failed to update profile.");
    }
  };

  const handleProfileInfoChange = (field: string, value: string) => {
    setProfile((prev) =>
      prev ? { ...prev, [field]: value } : prev
    );
  };

  const handleEmailChange = (value: string) => {
    setProfile((prev) =>
      prev ? { ...prev, email: value } : prev
    );
  };

  const handleEmailUpdate = async () => {
    if (!profile) return;
    const payload = { email: profile.email };
    try {
      const response = await apiClient.put("/api/users/update-email/", payload);
      setUser({ ...user!, email: response.data.email }); // Update email in AuthContext
      setMessage("Email updated successfully.");
      await refreshProfile(); // Refresh profile to sync data
    } catch (error: any) {
      setMessage(error.response?.data?.detail || "Failed to update email.");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await apiClient.get("/api/users/resend-verification-email/");
      setMessage("Verification email sent.");
    } catch (error: any) {
      setMessage(error.response?.data?.detail || "Failed to send verification email.");
    }
  };

  if (isLoading || !profile) {
    return <div className="p-6 text-gray-100">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
      {message && <p className="mb-4 text-yellow-300">{message}</p>}

      <div className="flex items-center mb-6">
        <ProfilePictureUpload
          profilePicture={profile.profile_picture}
          onUploadSuccess={refreshProfile}
          accessToken={localStorage.getItem("access_token") || ""}
          backendUrl={import.meta.env.VITE_API_URL} // Use same env var as api.ts
          setMessage={setMessage}
        />
        <div className="ml-4 flex-1">
          <ProfileInfoForm
            firstName={profile.first_name}
            lastName={profile.last_name}
            phoneNumber={profile.phone_number}
            onChange={handleProfileInfoChange}
            onSave={handleProfileInfoSave}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">
          Username
        </label>
        <input
          type="text"
          value={profile.username}
          readOnly
          className="mt-1 block w-full rounded-md border-gray-400 bg-gray-800 text-gray-400 p-2"
        />
      </div>

      <EmailSection
        email={profile.email}
        emailVerified={profile.email_verified}
        onEmailChange={handleEmailChange}
        onUpdateEmail={handleEmailUpdate}
        onVerifyEmail={handleVerifyEmail}
      />

      <PasswordChangeForm
        accessToken={localStorage.getItem("access_token") || ""}
        backendUrl={import.meta.env.VITE_API_URL} // Use same env var as api.ts
        setMessage={setMessage}
      />
    </div>
  );
};

export default ProfileSettings;