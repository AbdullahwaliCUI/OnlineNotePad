'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { DRIVE_SCOPE } from '@/lib/googleDrive';

interface GoogleDriveContextType {
  accessToken: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  isConnecting: boolean;
}

const GoogleDriveContext = createContext<GoogleDriveContextType | undefined>(undefined);

export function GoogleDriveProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('google_drive_access_token');
    // Note: In a production app, access tokens expire (usually after 1 hour).
    // We should ideally check expiration, but for simplicity, we'll let API calls fail 
    // and handle re-auth there if needed, or simply let the user re-connect.
    if (savedToken) {
      setAccessToken(savedToken);
    }
  }, []);

  const login = useGoogleLogin({
    scope: DRIVE_SCOPE,
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      localStorage.setItem('google_drive_access_token', tokenResponse.access_token);
      toast.success('Connected to Google Drive!');
      setIsConnecting(false);
    },
    onError: (error) => {
      console.error('Google Login Error:', error);
      toast.error('Failed to connect to Google Drive.');
      setIsConnecting(false);
    },
    onNonOAuthError: (error) => {
      // Typically user closed the popup
      console.log('Google Login Closed:', error);
      setIsConnecting(false);
    }
  });

  const connect = () => {
    setIsConnecting(true);
    login();
  };

  const disconnect = () => {
    setAccessToken(null);
    localStorage.removeItem('google_drive_access_token');
    toast.success('Disconnected from Google Drive.');
  };

  return (
    <GoogleDriveContext.Provider
      value={{
        accessToken,
        isConnected: !!accessToken,
        connect,
        disconnect,
        isConnecting
      }}
    >
      {children}
    </GoogleDriveContext.Provider>
  );
}

export function useGoogleDrive() {
  const context = useContext(GoogleDriveContext);
  if (context === undefined) {
    throw new Error('useGoogleDrive must be used within a GoogleDriveProvider');
  }
  return context;
}
