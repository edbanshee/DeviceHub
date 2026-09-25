import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setAuthError(null);
        try {
          localStorage.setItem('collectahub_has_session', 'true');
        } catch {}
      } else {
        try {
          localStorage.removeItem('collectahub_has_session');
        } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    if (isSigningIn) return null;
    setIsSigningIn(true);
    setAuthError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: any) {
      // Handle clean cancellation
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('closed-by-user')
      ) {
        return null;
      }
      if (err?.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'github.io';
        setAuthError(`auth/unauthorized-domain:${domain}`);
        return null;
      }
      // If internal assertion or popup collision occurs, log cleanly and avoid unhandled crash
      if (err?.message?.includes('INTERNAL ASSERTION FAILED') || err?.message?.includes('Pending promise')) {
        console.warn('Firebase popup in flight collision prevented.');
        return null;
      }
      console.error('Google Sign In Error:', err);
      setAuthError(err?.message || 'Error authenticating with Google');
      return null;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await fbSignOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSigningIn,
        signInWithGoogle,
        signOut,
        authError,
        clearAuthError,
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
