"use client";

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError, PostgrestError } from '@supabase/supabase-js' // Add PostgrestError import
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        setUser(session?.user ?? null)
        if (session?.user) {
          // On login, try to create profile if it doesn't exist
          await createProfileIfNeeded(session.user.id, session.user.email || '')
          fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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

  const signOut = async () => {
  try {
    console.log('AuthContext: Starting signOut process');
    
    // Clear user profile immediately
    setUserProfile(null);
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('AuthContext: SignOut error:', error);
      throw error;
    }
    
    // Clear user state immediately
    setUser(null);
    
    // Clear any stored data
    try {
      localStorage.clear(); // Clear all localStorage data
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    
    console.log('AuthContext: SignOut successful');
    
    // Force page reload to ensure clean state
    window.location.reload();
    
  } catch (error) {
    console.error('AuthContext: SignOut failed:', error);
    // Force logout anyway
    setUser(null);
    setUserProfile(null);
    window.location.reload();
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