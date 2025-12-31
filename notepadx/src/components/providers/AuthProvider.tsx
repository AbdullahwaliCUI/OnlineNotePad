'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

interface AuthContextType extends AuthState {
    signOut: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        session: null,
        loading: true,
    });

    useEffect(() => {
        // Check if we're in development without proper Supabase setup
        const isDevelopment = process.env.NODE_ENV === 'development';
        const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL &&
            process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here';

        if (isDevelopment && !hasSupabaseConfig) {
            // In development without Supabase, just set loading to false
            setAuthState({
                user: null,
                session: null,
                loading: false,
            });
            return;
        }

        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error);
                    toast.error('Error loading authentication state');
                }

                setAuthState({
                    user: session?.user ?? null,
                    session,
                    loading: false,
                });
            } catch (error) {
                console.error('Error in getInitialSession:', error);
                setAuthState({
                    user: null,
                    session: null,
                    loading: false,
                });
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session?.user?.email);

                setAuthState({
                    user: session?.user ?? null,
                    session,
                    loading: false,
                });

                // Show toast notifications for auth events
                switch (event) {
                    case 'SIGNED_IN':
                        // To prevent potential duplicate toasts on initial load or re-focus/re-connect
                        // We could add a check here, but since this provider is only mounted once,
                        // it should correctly correspond to actual auth events.
                        // If the issue persists, we can add a useRef to track the last event timestamp.
                        toast.success('Successfully signed in!');
                        break;
                    case 'SIGNED_OUT':
                        toast.success('Successfully signed out!');
                        break;
                    case 'TOKEN_REFRESHED':
                        console.log('Token refreshed');
                        break;
                    case 'USER_UPDATED':
                        toast.success('Profile updated successfully!');
                        break;
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                toast.error('Error signing out: ' + error.message);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error in signOut:', error);
            toast.error('An unexpected error occurred');
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ ...authState, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
