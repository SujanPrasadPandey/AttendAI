import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfilePictureUpload from "./profileSettings/ProfilePictureUpload";
import ProfileInfoForm from "./profileSettings/ProfileInfoForm";
import EmailSection from "./profileSettings/EmailSection";
import PasswordChangeForm from "./profileSettings/PasswordChangeForm";

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
  const access_token = localStorage.getItem("access_token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    profile_picture: "",
    email_verified: false,
  });
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!access_token) {
      navigate("/signin");
    }
  }, [access_token, navigate]);

  const refreshProfile = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/users/me/`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        setMessage("Failed to load profile.");
      }
    } catch (error) {
      setMessage("Network error while fetching profile.");
    }
  };

  useEffect(() => {
    if (access_token) {
      refreshProfile();
    }
  }, [access_token]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    navigate("/signin");
  };

  const handleProfileInfoSave = async () => {
    const payload = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone_number: profile.phone_number,
    };
    try {
      const response = await fetch(`${backendUrl}/api/users/me/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setMessage("Profile updated successfully.");
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (error) {
      setMessage("Network error while updating profile.");
    }
  };

  const handleProfileInfoChange = (field: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmailChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      email: value,
    }));
  };

  const handleEmailUpdate = async () => {
    const payload = { email: profile.email };
    try {
      const response = await fetch(`${backendUrl}/api/users/update-email/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setMessage("Email updated successfully.");
        refreshProfile();
      } else {
        setMessage("Failed to update email.");
      }
    } catch (error) {
      setMessage("Network error while updating email.");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/users/resend-verification-email/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (response.ok) {
        setMessage("Verification email sent.");
      } else {
        setMessage("Failed to send verification email.");
      }
    } catch (error) {
      setMessage("Network error while sending verification email.");
    }
  };

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
          accessToken={access_token || ""}
          backendUrl={backendUrl}
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
        accessToken={access_token || ""}
        backendUrl={backendUrl}
        setMessage={setMessage}
      />
    </div>
  );
};

export default ProfileSettings;
