import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // To check initial auth status
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/auth/me');
        if (response.data) {
          setUser(response.data); 
        }
      } catch (error) {
        setUser(null); // No user logged in or error fetching status
        console.log('No active session or error fetching /me:', error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserStatus();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    // Potentially invalidate/refetch other queries that depend on user data
    queryClient.invalidateQueries(); // Broad invalidation, can be more specific
  };

  const logoutUser = async () => {
    try {
      await apiClient.post('/auth/logout');
      setUser(null);
      queryClient.clear(); // Clear all query cache on logout
      // Redirect to login or home page usually handled by component via navigate
    } catch (error) {
      console.error('Logout failed:', error.response?.data?.message || error.message);
      // Still set user to null locally even if server logout fails for some reason
      setUser(null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginUser, logoutUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 