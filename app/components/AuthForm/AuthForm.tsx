"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    businessName: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  // Reset form when switching between login/signup
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      name: '',
      businessName: '',
      phoneNumber: '',
    });
    setError('');
    setSuccess('');
  }, [isLogin]);

  // Handle successful login
  useEffect(() => {
    if (user && !authLoading && loading && isLogin) {
      console.log("AuthForm: User authenticated successfully");
      setLoading(false);
      setSuccess('Login successful!');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }, [user, authLoading, loading, isLogin, onSuccess, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    console.log("AuthForm: handleSubmit initiated. isLogin:", isLogin);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        console.log("AuthForm: Attempting LOGIN with email:", formData.email);
        const { error: signInError } = await signIn(formData.email, formData.password);
        
        if (signInError) {
          console.error("AuthForm: LOGIN FAILED", signInError);
          
          // Handle specific error messages
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials.');
          } else if (signInError.message.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before logging in.');
          } else {
            setError(signInError.message);
          }
          setLoading(false);
        }
        // Success is handled in useEffect
      } else {
        // Sign Up logic
        console.log("AuthForm: Attempting SIGN UP with email:", formData.email);
        const { error: signUpError } = await signUp(
          formData.email,
          formData.password,
          formData.name,
          formData.businessName,
          formData.phoneNumber
        );

        if (signUpError) {
          console.error("AuthForm: SIGN UP FAILED", signUpError);
          
          // Handle specific signup errors
          if (signUpError.message.includes('User already registered')) {
            setError('This email is already registered. Please try logging in instead.');
          } else if (signUpError.message.includes('email')) {
            setError('Email sending failed. Please try again or contact support.');
          } else {
            setError(signUpError.message);
          }
        } else {
          console.log("AuthForm: SIGN UP SUCCESSFUL");
          setSuccess('Success! Please check your email (including spam folder) to confirm your account.');
          setFormData({
            email: '',
            password: '',
            name: '',
            businessName: '',
            phoneNumber: '',
          });
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("AuthForm: handleSubmit CATCH block error:", err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleModeSwitch = () => {
    console.log("AuthForm: Switching mode from", isLogin ? 'login' : 'signup');
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setLoading(false);
  };

  // Show loading spinner during auth operations
  if (authLoading) {
    return (
      <div className={styles.authForm}>
        <div className={styles.loadingMessage}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.authForm}>
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {(!success || (success && isLogin)) && !loading && (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min. 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            disabled={loading}
          />
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <input
                type="text"
                name="businessName"
                placeholder="Business Name"
                value={formData.businessName}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
      )}
      
      {loading && <div className={styles.loadingMessage}>Processing...</div>}

      {!loading && (!success || (success && isLogin)) && (
        <p>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={handleModeSwitch} disabled={loading}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      )}

      {!loading && success && !isLogin && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setSuccess('');
              setError('');
            }}
            className={styles.switchButton}
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthForm;