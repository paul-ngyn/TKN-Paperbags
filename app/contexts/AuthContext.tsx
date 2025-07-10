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
  
  const mounted = useRef(true)
  const isSigningOut = useRef(false)
  const currentUserId = useRef<string | null>(null)

  // Force clear ALL Supabase data from localStorage
  const forceCleanLocalStorage = () => {
    try {
      const keysToRemove: string[] = [];
      
      // Collect all keys that should be removed
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('supabase') || 
          key.includes('auth') ||
          key.startsWith('signup_data_') ||
          key.includes('sb-') // Supabase prefix
        )) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all collected keys
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log('Removed localStorage key:', key);
        } catch (e) {
          console.error('Error removing key:', key, e);
        }
      });
      
      console.log('Cleaned localStorage - removed', keysToRemove.length, 'keys');
    } catch (e) {
      console.error('Error cleaning localStorage:', e);
    }
  };

  const createProfileIfNeeded = async (userId: string, email: string) => {
    try {
      console.log('Checking if profile exists for user:', userId);
      
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
      
      if (data && mounted.current && currentUserId.current === userId) {
        setUserProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  // Clear all auth state
  const clearAuthState = () => {
    console.log('Clearing auth state...');
    setUser(null);
    setUserProfile(null);
    currentUserId.current = null;
    setLoading(false);
  };

  // Set auth state for a user
  const setAuthState = async (newUser: User) => {
  if (!mounted.current || isSigningOut.current) {
    setLoading(false);
    return;
  }
  
  console.log('Setting auth state for user:', newUser.id);
  currentUserId.current = newUser.id;
  setUser(newUser);
  
  try {
    await createProfileIfNeeded(newUser.id, newUser.email || '');
    await fetchUserProfile(newUser.id);
  } catch (error) {
    console.error('Error setting up user profile:', error);
  } finally {
    // Always set loading to false when done
    if (mounted.current) {
      setLoading(false);
    }
  }
};    

  // Initialize auth on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error('Session error:', error);
          clearAuthState();
          return;
        }

        if (session?.user) {
          console.log('Found existing session for user:', session.user.id);
          await setAuthState(session.user);
        } else {
          console.log('No existing session found');
          clearAuthState();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          clearAuthState();
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auth state change listener - SIMPLIFIED
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return;

        console.log('Auth state changed:', event, 'Session:', !!session);
        
        switch (event) {
          case 'SIGNED_OUT':
            console.log('Supabase confirmed sign out');
            clearAuthState();
            isSigningOut.current = false;
            break;

          case 'SIGNED_IN':
            console.log('User signed in via auth change');
            if (session?.user && !isSigningOut.current) {
              await setAuthState(session.user);
            }
            break;

          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            if (session?.user && !isSigningOut.current) {
              // Only update the user object, don't reload profile
              setUser(session.user);
            }
            break;
        }
      }
    );

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []); // Remove user dependency to prevent loops

  // Cross-tab communication
useEffect(() => {
  console.log('Setting up auth state listener...');
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (!mounted.current) return;

      console.log('Auth state changed:', event, 'Session:', !!session);
      
      switch (event) {
        case 'SIGNED_OUT':
          console.log('Supabase confirmed sign out');
          clearAuthState(); // This sets loading to false
          isSigningOut.current = false;
          break;

        case 'SIGNED_IN':
          console.log('User signed in via auth change');
          if (session?.user && !isSigningOut.current) {
            await setAuthState(session.user); // This sets loading to false at the end
          } else {
            setLoading(false); // Reset loading if no user
          }
          break;

        case 'TOKEN_REFRESHED':
          console.log('Token refreshed');
          if (session?.user && !isSigningOut.current) {
            setUser(session.user);
            // Don't change loading state for token refresh
          }
          break;

        case 'INITIAL_SESSION':
          console.log('Initial session loaded');
          // Handle initial session load
          if (session?.user && !isSigningOut.current) {
            await setAuthState(session.user);
          } else {
            setLoading(false);
          }
          break;

        default:
          console.log('Other auth event:', event);
          // For any other events, ensure loading is false if no session
          if (!session && !isSigningOut.current) {
            setLoading(false);
          }
      }
    }
  );

  return () => {
    console.log('Cleaning up auth listener');
    subscription.unsubscribe();
  };
}, []);

// Add a timeout safety net for loading state:
useEffect(() => {
  // Safety timeout to prevent infinite loading
  const loadingTimeout = setTimeout(() => {
    if (loading && !isSigningOut.current) {
      console.warn('Loading state timeout - forcing loading to false');
      setLoading(false);
    }
  }, 10000); // 10 second timeout

  return () => {
    clearTimeout(loadingTimeout);
  };
}, [loading]);

  // IMPROVED signOut function with complete session clearing
  const signOut = async () => {
    if (isSigningOut.current) {
      console.log('SignOut already in progress');
      return;
    }

    isSigningOut.current = true;
    console.log('AuthContext: Starting COMPLETE signOut process');
    
    try {
      // Step 1: Clear state immediately for responsive UI
      clearAuthState();

      // Step 2: Force clean ALL localStorage data
      forceCleanLocalStorage();

      // Step 3: Sign out from Supabase
      console.log('Signing out from Supabase...');
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });

      if (error) {
        console.error('Supabase signOut error:', error);
        // Continue with cleanup even if there's an error
      }

      // Step 4: Force refresh Supabase auth state
      try {
        console.log('Forcing auth state refresh...');
        await supabase.auth.refreshSession();
      } catch (refreshError) {
        console.log('Auth refresh failed (expected after logout):', refreshError);
      }

      // Step 5: Double-check session is cleared
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.warn('Session still exists after logout, forcing another signout...');
          await supabase.auth.signOut({ scope: 'global' });
        } else {
          console.log('Session successfully cleared');
        }
      } catch (sessionError) {
        console.log('Session check failed (this is okay):', sessionError);
      }

      // Step 6: Clean localStorage again (just to be sure)
      forceCleanLocalStorage();

      // Step 7: Notify other tabs
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

      console.log('AuthContext: COMPLETE SignOut successful');
    } catch (error) {
      console.error('AuthContext: SignOut failed:', error);
      // Force clear everything even on error
      clearAuthState();
      forceCleanLocalStorage();
    } finally {
      // Reset signout flag
      setTimeout(() => {
        isSigningOut.current = false;
      }, 2000); // Longer delay to prevent rapid clicking
    }
  };

  const signIn = async (email: string, password: string) => {
  setLoading(true);
  
  try {
    // Clear any existing session before signing in
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Clearing existing session before new login...');
        await supabase.auth.signOut({ scope: 'global' });
        forceCleanLocalStorage();
      }
    } catch (clearError) {
      console.log('No existing session to clear:', clearError);
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      setLoading(false); // Reset loading on error
      return { error };
    }

    // Don't set loading to false here - let the auth state change handle it
    console.log('Sign in request successful, waiting for auth state change...');
    return { error: null };
    
  } catch (unexpectedError) {
    console.error('Unexpected sign in error:', unexpectedError);
    setLoading(false); // Reset loading on unexpected error
    return { error: unexpectedError as AuthError };
  }
};

  const signUp = async (email: string, password: string, name: string, businessName: string, phoneNumber: string) => {
    try {
      setLoading(true);
      
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
        setLoading(false);
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
      setLoading(false);
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
      
      if (mounted.current && currentUserId.current === user.id) {
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