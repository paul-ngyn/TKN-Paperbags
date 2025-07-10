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
  
  // Refs to prevent multiple operations
  const isSigningOut = useRef(false)
  const mounted = useRef(true)
  const authSubscription = useRef<any>(null)

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

      // Try to get stored signup data
      let userName = email?.split('@')[0] || 'User'
      let userBusinessName = 'Business'
      let userPhoneNumber = 'Not provided'

      try {
        const storedData = localStorage.getItem(`signup_data_${email}`)
        if (storedData) {
          const data = JSON.parse(storedData) as { name?: string; businessName?: string; phoneNumber?: string }
          userName = data.name || userName
          userBusinessName = data.businessName || userBusinessName
          userPhoneNumber = data.phoneNumber || userPhoneNumber
          localStorage.removeItem(`signup_data_${email}`)
        }
      } catch (e) {
        console.error('Error retrieving stored signup data:', e)
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

  const fetchUserProfile = async (userId: string) => {
    if (!mounted.current) return
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (!error && data && mounted.current) {
      setUserProfile(data as UserProfile)
    } else {
      console.log('Error fetching user profile:', error)
    }
  }

  // Improved signOut function
  const signOut = async () => {
    // Prevent multiple simultaneous signouts
    if (isSigningOut.current) {
      console.log('SignOut already in progress, ignoring...')
      return
    }

    isSigningOut.current = true
    console.log('AuthContext: Starting signOut process')

    try {
      // Clear localStorage first
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('signup_data_') || key.includes('supabase')) {
          try {
            localStorage.removeItem(key)
          } catch (e) {
            console.error('Error removing localStorage key:', key, e)
          }
        }
      })

      // Clear state immediately for responsive UI
      if (mounted.current) {
        setUser(null)
        setUserProfile(null)
        setLoading(false)
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      })

      if (error) {
        console.error('Supabase signOut error:', error)
      }

      // Notify other tabs
      try {
        localStorage.setItem('auth_logout_signal', Date.now().toString())
        setTimeout(() => {
          try {
            localStorage.removeItem('auth_logout_signal')
          } catch (e) {
            console.error('Error removing logout signal:', e)
          }
        }, 100)
      } catch (e) {
        console.error('Error dispatching logout signal:', e)
      }

      console.log('AuthContext: SignOut completed')
    } catch (error) {
      console.error('AuthContext: SignOut failed:', error)
      // Force clear state on error
      if (mounted.current) {
        setUser(null)
        setUserProfile(null)
        setLoading(false)
      }
    } finally {
      // Reset the signout flag after a delay
      setTimeout(() => {
        isSigningOut.current = false
      }, 1000)
    }
  }

  // Initialize auth state
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMounted) return

        if (error) {
          console.error('Session error:', error)
          setUser(null)
          setUserProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
          await createProfileIfNeeded(session.user.id, session.user.email || '')
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setUserProfile(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (isMounted) {
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [])

  // Auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return

        console.log('Auth state changed:', event, 'Session:', !!session)
        
        switch (event) {
          case 'SIGNED_OUT':
            console.log('Supabase confirmed sign out')
            setUser(null)
            setUserProfile(null)
            setLoading(false)
            break

          case 'SIGNED_IN':
            console.log('User signed in')
            if (session?.user) {
              setUser(session.user)
              await createProfileIfNeeded(session.user.id, session.user.email || '')
              await fetchUserProfile(session.user.id)
            }
            setLoading(false)
            break

          case 'TOKEN_REFRESHED':
            console.log('Token refreshed')
            if (session?.user) {
              setUser(session.user)
            }
            setLoading(false)
            break

          case 'INITIAL_SESSION':
            console.log('Initial session')
            if (session?.user) {
              setUser(session.user)
              await createProfileIfNeeded(session.user.id, session.user.email || '')
              await fetchUserProfile(session.user.id)
            } else {
              setUser(null)
              setUserProfile(null)
            }
            setLoading(false)
            break

          default:
            // Handle session expiry
            if (!session && user) {
              console.log('Session expired')
              setUser(null)
              setUserProfile(null)
              setLoading(false)
            }
        }
      }
    )

    authSubscription.current = subscription
    return () => subscription.unsubscribe()
  }, [user])

  // Cross-tab communication
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!mounted.current) return

      // Handle logout signal from other tabs
      if (e.key === 'auth_logout_signal') {
        console.log('Logout signal received from another tab')
        if (!isSigningOut.current) {
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        }
      }
    }

    const handleVisibilityChange = async () => {
      if (document.hidden || !mounted.current || loading) return

      console.log('Tab became visible, verifying auth state')
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session && user && !isSigningOut.current) {
          console.log('Session lost while tab was hidden')
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking session on tab focus:', error)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, loading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false
      if (authSubscription.current) {
        authSubscription.current.unsubscribe()
      }
    }
  }, [])

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
          } else {
            console.log('Profile created successfully during signup')
          }
        } catch (err) {
          console.error('Unexpected error during profile creation:', err)
        }
      }

      return { error: null }
    } catch (unexpectedError) {
      console.error('Unexpected error in signUp:', unexpectedError)
      return { error: { message: 'An unexpected error occurred. Please try again.' } as CustomError }
    }
  }

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}