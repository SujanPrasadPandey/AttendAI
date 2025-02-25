import React, { ChangeEvent } from "react";
import imageCompression from "browser-image-compression";

interface ProfilePictureUploadProps {
  profilePicture: string | null;
  onUploadSuccess: () => void;
  accessToken: string;
  backendUrl: string;
  setMessage: (msg: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  profilePicture,
  onUploadSuccess,
  accessToken,
  backendUrl,
  setMessage,
}) => {
  const handleProfilePicChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setMessage("Only JPG, JPEG, and PNG files are allowed.");
        return;
      }
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        uploadProfilePicture(compressedFile, file.name);
      } catch (error) {
        setMessage("Error compressing the image.");
      }
    }
  };

  const uploadProfilePicture = async (file: File, originalName: string) => {
    const formData = new FormData();
    formData.append("profile_picture", file, originalName);

    try {
      const response = await fetch(
        `${backendUrl}/api/users/me/upload-profile-picture/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        }
      );
      if (response.ok) {
        setMessage("Profile picture updated successfully.");
        onUploadSuccess();
      } else {
        setMessage("Failed to update profile picture.");
      }
    } catch (error) {
      setMessage("Network error while uploading picture.");
    }
  };

  return (
    <div className="relative">
      <img
        src={profilePicture || "/default-profile.png"}
        alt="Profile"
        className="w-60 h-60 rounded-full object-cover"
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleProfilePicChange}
        className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
      />
    </div>
  );
};

export default ProfilePictureUpload;
