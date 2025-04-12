// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../utils/api';

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
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/api/users/me/');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (localStorage.getItem('access_token')) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);