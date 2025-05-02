import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Alert,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "@env";
import { useAuth } from "../contexts/AuthContext";

const ProfileScreen = ({ navigation }) => {
  const { user, setUser, logout } = useAuth();
  const [profile, setProfile] = useState({
    id: 0,
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    profile_picture: null,
    email_verified: false,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        setUser(null);
      } else {
        fetchProfile(token);
      }
    };
    checkAuthAndFetchProfile();
  }, []);

  const fetchProfile = async (token: string) => {
    if (!BACKEND_URL) {
      setMessage("Backend URL is not configured.");
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleProfileUpdate = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const payload = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone_number: profile.phone_number,
    };
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/me/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully.");
        fetchProfile(token!);
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (error) {
      setMessage("Network error while updating profile.");
    }
  };

  const handlePickImage = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const uriParts = asset.uri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append("profile_picture", {
        uri: asset.uri,
        name: `profile.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/users/me/upload-profile-picture/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            body: formData,
          }
        );
        if (response.ok) {
          Alert.alert("Success", "Profile picture updated.");
          fetchProfile(token!);
        } else {
          setMessage("Failed to update profile picture.");
        }
      } catch (error) {
        setMessage("Network error while uploading picture.");
      }
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Profile Settings</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TouchableOpacity onPress={handlePickImage}>
        <Image
          source={
            profile.profile_picture
              ? { uri: profile.profile_picture }
              : require("../../assets/default-profile.png")
          }
          style={styles.profilePic}
        />
        <Text style={styles.uploadHint}>Tap to change profile picture</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={profile.first_name}
        onChangeText={(text) => setProfile((p) => ({ ...p, first_name: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={profile.last_name}
        onChangeText={(text) => setProfile((p) => ({ ...p, last_name: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={profile.phone_number || ""}
        onChangeText={(text) => setProfile((p) => ({ ...p, phone_number: text }))}
      />
      <TextInput
        style={[styles.input, { backgroundColor: "#ddd" }]}
        value={profile.username}
        editable={false}
        placeholder="Username"
      />

      <Button title="Save Profile Changes" onPress={handleProfileUpdate} />

      <View style={styles.spacer} />
      <Button title="Logout" color="#b00020" onPress={handleLogout} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#111",
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },
  message: {
    color: "#f1c40f",
    marginBottom: 10,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 10,
  },
  uploadHint: {
    textAlign: "center",
    color: "#aaa",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  spacer: {
    height: 20,
  },
});

export default ProfileScreen;