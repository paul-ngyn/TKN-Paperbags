"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, AuthError, PostgrestError } from '@supabase/supabase-js' 
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string;
  email: string;
  name: string;
  business_name: string;
  phone_number: string;
  created_at?: string;
  updated_at?: string;
}

// Custom error type for non-auth errors
interface CustomError {
  message: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string, businessName: string, phoneNumber: string) => Promise<{ error: AuthError | CustomError | null }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: {
    name?: string;
    business_name?: string;
    phone_number?: string;
  }) => Promise<{ data?: UserProfile; error: PostgrestError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Use refs to track state without causing re-renders
  const mounted = useRef(true)
  const isSigningOut = useRef(false)

  const createProfileIfNeeded = async (userId: string, email: string) => {
    try {
      console.log('Checking if profile exists for user:', userId);
      
      // First check if profile exists using maybeSingle to avoid errors
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', checkError);
      }
      
      if (existingProfile) {
        console.log('Profile already exists for user', userId);
        return;
      }

      console.log('Creating new profile for user:', userId);

      // Try to get stored signup data
      let userName = email?.split('@')[0] || 'User';
      let userBusinessName = 'Business';
      let userPhoneNumber = 'Not provided';

      try {
        const storedData = localStorage.getItem(`signup_data_${email}`);
        if (storedData) {
          const data = JSON.parse(storedData) as { name?: string; businessName?: string; phoneNumber?: string };
          userName = data.name || userName;
          userBusinessName = data.businessName || userBusinessName;
          userPhoneNumber = data.phoneNumber || userPhoneNumber;
          localStorage.removeItem(`signup_data_${email}`);
        }
      } catch (e) {
        console.error('Error retrieving stored signup data:', e);
      }

      // Create profile
      const { error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: email,
            name: userName,
            business_name: userBusinessName,
            phone_number: userPhoneNumber,
          }
        ]);

      if (error) {
        // Handle duplicate key error (profile already exists)
        if (error.code === '23505') {
          console.log('Profile already exists (duplicate key), this is fine');
          return;
        }
        console.error('Error creating profile on login:', error);
      } else {
        console.log('Profile created successfully on login');
      }
    } catch (err) {
      console.error('Unexpected error in createProfileIfNeeded:', err);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    if (!mounted.current) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data && mounted.current) {
        setUserProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  // FIXED: Remove the dependency loop - only run once on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error('Session error:', error);
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Found existing session for user:', session.user.id);
          setUser(session.user);
          await createProfileIfNeeded(session.user.id, session.user.email || '');
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No existing session found');
          setUser(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run on mount

  // FIXED: Separate auth state change listener with no dependencies
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return;

        console.log('Auth state changed:', event, 'Session:', !!session);
        
        switch (event) {
          case 'SIGNED_OUT':
            console.log('Supabase confirmed sign out');
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            isSigningOut.current = false;
            break;

          case 'SIGNED_IN':
            console.log('User signed in');
            if (session?.user && !isSigningOut.current) {
              setUser(session.user);
              await createProfileIfNeeded(session.user.id, session.user.email || '');
              await fetchUserProfile(session.user.id);
            }
            setLoading(false);
            break;

          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            if (session?.user && !isSigningOut.current) {
              setUser(session.user);
            }
            setLoading(false);
            break;

          case 'INITIAL_SESSION':
            console.log('Initial session event');
            // Don't handle this here - we handle it in initializeAuth
            break;

          default:
            console.log('Other auth event:', event);
        }
      }
    );

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array

  // FIXED: Separate cross-tab communication with proper dependencies
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!mounted.current || isSigningOut.current) return;

      if (e.key === 'auth_logout_event') {
        console.log('Logout event detected from another tab');
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    };

    const handleVisibilityChange = async () => {
      if (document.hidden || !mounted.current || loading || isSigningOut.current) return;

      console.log('Tab became visible, checking auth state');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Only act if there's a mismatch
        if (!session && user) {
          console.log('Session lost while tab was hidden');
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error checking session on tab focus:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, loading]); // Keep necessary dependencies but avoid loops

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const signOut = async () => {
    if (isSigningOut.current) {
      console.log('SignOut already in progress');
      return;
    }

    isSigningOut.current = true;
    console.log('AuthContext: Starting signOut process');
    
    try {
      // Clear localStorage first
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('signup_data_') || key.includes('supabase')) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.error('Error removing key:', key, e);
          }
        }
      });

      // Clear state immediately for responsive UI
      setUser(null);
      setUserProfile(null);
      setLoading(false);

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });

      if (error) {
        console.error('Supabase signOut error:', error);
      }

      // Notify other tabs
      try {
        localStorage.setItem('auth_logout_event', Date.now().toString());
        setTimeout(() => {
          try {
            localStorage.removeItem('auth_logout_event');
          } catch (e) {
            console.error('Error removing logout event:', e);
          }
        }, 100);
      } catch (e) {
        console.error('Error dispatching logout event:', e);
      }

      console.log('AuthContext: SignOut successful');
    } catch (error) {
      console.error('AuthContext: SignOut failed:', error);
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    } finally {
      // Reset signout flag after delay
      setTimeout(() => {
        isSigningOut.current = false;
      }, 1000);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, businessName: string, phoneNumber: string) => {
    try {
      // Store signup data for later profile creation
      try {
        localStorage.setItem(`signup_data_${email}`, JSON.stringify({
          name, businessName, phoneNumber
        }));
        console.log('Stored signup data for:', email);
      } catch (e) {
        console.error('Error storing signup data:', e);
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Auth signup error:', error);
        return { error };
      }

      // Try to create profile immediately, but ignore errors
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: data.user.id,
                email: email,
                name: name,
                business_name: businessName,
                phone_number: phoneNumber,
              }
            ]);
          
          if (profileError && profileError.code !== '23505') {
            console.log('Profile creation failed, will create on first login:', profileError.message);
          } else {
            console.log('Profile created successfully during signup');
          }
        } catch (err) {
          console.error('Unexpected error during profile creation:', err);
        }
      }

      return { error: null };
    } catch (unexpectedError) {
      console.error('Unexpected error in signUp:', unexpectedError);
      return { error: { message: 'An unexpected error occurred. Please try again.' } as CustomError };
    }
  };

  const updateUserProfile = async (updates: {
    name?: string;
    business_name?: string;
    phone_number?: string;
  }): Promise<{ data?: UserProfile; error: PostgrestError | null }> => {
    if (!user) {
      const noUserError: PostgrestError = {
        name: 'NoUserError',
        message: 'No user logged in',
        details: '',
        hint: '',
        code: 'NO_USER'
      };
      return { error: noUserError };
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { error };
      }

      const typedData = data as UserProfile;
      
      if (mounted.current) {
        setUserProfile(typedData);
      }
      
      return { data: typedData, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      
      const catchError: PostgrestError = {
        name: 'UpdateError',
        message: 'Update failed',
        details: String(error),
        hint: '',
        code: 'UPDATE_ERROR'
      };
      
      return { error: catchError };
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};