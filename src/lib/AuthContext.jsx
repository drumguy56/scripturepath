import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { auth } from '@/api/client';

const AuthContext = createContext(null);

// Session state comes from GET /api/auth/me (the session cookie is sent automatically).
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  // Ends the session on the server, then sends the user to the login page.
  const logout = async (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      await auth.logout();
    } catch {
      // Session may already be gone; the local state is cleared either way.
    }
    if (shouldRedirect) window.location.assign('/login');
  };

  const navigateToLogin = () => {
    window.location.assign('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
