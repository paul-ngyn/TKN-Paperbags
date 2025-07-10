"use client";

import React, { createContext, useContext, useEffect, useState } from 'react'
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
  }) => Promise<{ data?: UserProfile; error: PostgrestError | null }>; // Fixed: Replace any with proper types
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const createProfileIfNeeded = async (userId: string, email: string) => {
  try {
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (existingProfile) {
      console.log('Profile already exists for user', userId)
      return
    }

    // Try to get stored signup data - RENAMED VARIABLES
    let userName = email?.split('@')[0] || 'User'  // Changed from 'name' to 'userName'
    let userBusinessName = 'Business'              // Changed from 'businessName' to 'userBusinessName'
    let userPhoneNumber = 'Not provided'           // Changed from 'phoneNumber' to 'userPhoneNumber'

    try {
      const storedData = localStorage.getItem(`signup_data_${email}`)
      if (storedData) {
        const data = JSON.parse(storedData) as { name?: string; businessName?: string; phoneNumber?: string }
        userName = data.name || userName                    // Updated variable name
        userBusinessName = data.businessName || userBusinessName  // Updated variable name
        userPhoneNumber = data.phoneNumber || userPhoneNumber     // Updated variable name
        // Clean up stored data
        localStorage.removeItem(`signup_data_${email}`)
      }
    } catch (e) {
      console.error('Error retrieving stored signup data:', e)
    }

    // Create profile - UPDATED VARIABLE NAMES
    const { error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          email: email,
          name: userName,              // Updated variable name
          business_name: userBusinessName,  // Updated variable name
          phone_number: userPhoneNumber,    // Updated variable name
        }
      ])

    if (error) {
      console.error('Error creating profile on login:', error)
    } else {
      console.log('Profile created successfully on login')
    }
  } catch (err) {
    console.error('Unexpected error in createProfileIfNeeded:', err)
  }
}

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Try to create profile if needed, then fetch it
        createProfileIfNeeded(session.user.id, session.user.email || '')
          .then(() => fetchUserProfile(session.user!.id))
      }
      setLoading(false)
    })

    // Listen for auth changes
  // Update your onAuthStateChange to handle logout more reliably:
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    console.log('Auth state changed:', event, 'Session:', !!session);
    
    if (event === 'SIGNED_OUT') {
      // This is the proper logout event - clear everything here
      console.log('Supabase confirmed sign out');
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      
      // Clear any remaining auth-related localStorage
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.error('Error clearing auth localStorage:', e);
      }
      
    } else if (!session && user) {
      // Session is null but we have a user - session expired
      console.log('Session expired or invalid');
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      
    } else if (event === 'SIGNED_IN' && session) {
      // User signed in
      console.log('User signed in');
      setUser(session.user);
      if (session.user) {
        await createProfileIfNeeded(session.user.id, session.user.email || '');
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
      
    } else if (event === 'TOKEN_REFRESHED' && session) {
      // Token refreshed - update user but don't reload profile
      console.log('Token refreshed');
      setUser(session.user);
      setLoading(false);
      
    } else if (event === 'INITIAL_SESSION') {
      // Initial session load
      console.log('Initial session check');
      setUser(session?.user ?? null);
      if (session?.user) {
        await createProfileIfNeeded(session.user.id, session.user.email || '');
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    }
  }
);
    return () => subscription.unsubscribe()
  }, [])

  // Update your storage event handler to be more specific:
useEffect(() => {
  // Listen for storage changes (cross-tab communication)
  const handleStorageChange = (e: StorageEvent) => {
    console.log('Storage event:', e.key, e.newValue);
    
    // Check for custom logout event
    if (e.key === 'auth_logout_event') {
      console.log('Logout event detected from another tab');
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    }
    
    // Check for Supabase auth token removal
    if (e.key?.includes('supabase.auth.token') && e.newValue === null) {
      console.log('Auth token removed in another tab');
      // Double-check session before logging out
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      });
    }
  };

  // Listen for visibility changes (tab switching)
  const handleVisibilityChange = async () => {
    if (!document.hidden && !loading) {
      console.log('Tab became visible, checking auth state');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session on visibility change:', !!session);
        
        // Only update state if there's a real change
        if (!session && user) {
          console.log('No session found but user exists, signing out');
          setUser(null);
          setUserProfile(null);
        } else if (session && !user) {
          console.log('Session found but no user, signing in');
          setUser(session.user);
          if (session.user) {
            await createProfileIfNeeded(session.user.id, session.user.email || '');
            fetchUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error checking session on tab focus:', error);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [user, loading]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (!error && data) {
      setUserProfile(data as UserProfile)
    } else {
      console.log('Error fetching user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, name: string, businessName: string, phoneNumber: string) => {
    try {
      // Store signup data for later profile creation
      try {
        localStorage.setItem(`signup_data_${email}`, JSON.stringify({
          name, businessName, phoneNumber
        }))
        console.log('Stored signup data for:', email)
      } catch (e) {
        console.error('Error storing signup data:', e)
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error('Auth signup error:', error)
        return { error }
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
            ])
          
          if (profileError) {
            console.log('Profile creation failed, will create on first login:', profileError.message)
            // Don't return error to UI, this is expected and will be handled later
          } else {
            console.log('Profile created successfully during signup')
          }
        } catch (err) {
          console.error('Unexpected error during profile creation:', err)
          // Don't return error to UI
        }
      }

      // Always return success if auth signup succeeded
      return { error: null }
    } catch (unexpectedError) {
      console.error('Unexpected error in signUp:', unexpectedError)
      return { error: { message: 'An unexpected error occurred. Please try again.' } as CustomError }
    }
  }

  // Replace your signOut function with this corrected version:
const signOut = async () => {
  try {
    console.log('AuthContext: Starting signOut process');

    setUser(null);
    setUserProfile(null);
    setLoading(false);
    
    // Clear localStorage first (but keep auth tokens until after signout)
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('signup_data_')) {
          localStorage.removeItem(key);
        }
        // Don't clear supabase tokens yet - let signOut handle it
      });
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    
    // Sign out from Supabase FIRST - this will trigger the auth state change
    const { error } = await supabase.auth.signOut({
      scope: 'global'
    });

    if (error) {
      console.error('AuthContext: SignOut error:', error);
      // Only force clear state if there's an error
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    }
    
    // Force a storage event to notify other tabs
    try {
      localStorage.setItem('auth_logout_event', Date.now().toString());
      localStorage.removeItem('auth_logout_event');
    } catch (e) {
      console.error('Error dispatching logout event:', e);
    }
    
    console.log('AuthContext: SignOut successful');
    
  } catch (error) {
    console.error('AuthContext: SignOut failed:', error);
    // Only force logout if there's an unexpected error
    setUser(null);
    setUserProfile(null);
    setLoading(false);
  }
};

  // In your AuthContext.tsx file, add this function:

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

    // Type the data properly
    const typedData = data as UserProfile;
    
    // Update local state
    setUserProfile(typedData);
    
    return { data: typedData, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Create a proper PostgrestError for catch block
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

// Properly typed context value
const value: AuthContextType = {
  user,
  userProfile,
  loading,
  signIn,
  signUp,
  signOut,
  updateUserProfile,
};

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>

}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}