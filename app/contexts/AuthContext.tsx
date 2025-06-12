"use client";

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
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

// Union type for all possible errors
type ErrorType = AuthError | CustomError | null;

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: ErrorType }>
  signUp: (email: string, password: string, name: string, businessName: string, phoneNumber: string) => Promise<{ error: ErrorType }>
  signOut: () => Promise<void>
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

      // Try to get stored signup data
      let name = email?.split('@')[0] || 'User'
      let businessName = 'Business'
      let phoneNumber = 'Not provided'

      try {
        const storedData = localStorage.getItem(`signup_data_${email}`)
        if (storedData) {
          const data = JSON.parse(storedData) as { name?: string; businessName?: string; phoneNumber?: string }
          name = data.name || name
          businessName = data.businessName || businessName
          phoneNumber = data.phoneNumber || phoneNumber
          // Clean up stored data
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
            name: name,
            business_name: businessName,
            phone_number: phoneNumber,
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
    await supabase.auth.signOut()
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}