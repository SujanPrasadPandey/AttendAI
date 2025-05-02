import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BACKEND_URL } from "@env";

interface CustomUser {
  id: number;
  role: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

interface AuthContextType {
  user: CustomUser | null;
  isLoading: boolean;
  setUser: (user: CustomUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data;
      if (user.role !== "teacher") {
        console.warn("Only teachers are allowed in mobile app.");
        setUser(null);
        return;
      }

      setUser(user);
    } catch (error) {
      console.log("Fetch user error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["access_token", "refresh_token", "username"]);
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);