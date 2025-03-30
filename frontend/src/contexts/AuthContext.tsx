import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../utils/api';

interface AuthContextType {
  role: string | null;
  isLoading: boolean;
  setRole: (role: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  role: null,
  isLoading: true, // Start as loading
  setRole: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await apiClient.get('/api/users/me/');
        setRole(response.data.role);
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      } finally {
        setIsLoading(false); // Done loading, success or fail
      }
    };

    if (localStorage.getItem('access_token')) {
      fetchUserRole();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ role, isLoading, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};