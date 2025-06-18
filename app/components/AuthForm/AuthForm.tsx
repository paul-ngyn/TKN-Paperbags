"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  onClose: () => void;
  onSuccess?: () => void; // Add optional success callback
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
  const { signIn, signUp, user } = useAuth(); // Add user to detect login success

  // Auto-close when user becomes authenticated
  useEffect(() => {
    if (user && loading) {
      console.log("AuthForm: User authenticated, closing modal");
      setLoading(false);
      setSuccess('Login successful!');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 500);
    }
  }, [user, loading, onSuccess, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          setError(signInError.message);
          setLoading(false); // Reset loading on error
        }
        // Don't set loading to false here - let the useEffect handle it when user state updates
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
          setError(signUpError.message);
        } else {
          console.log("AuthForm: SIGN UP SUCCESSFUL");
          setSuccess('Success! Please check your email to confirm your account.');
          setFormData({
            email: '',
            password: '',
            name: '',
            businessName: '',
            phoneNumber: '',
          });
        }
        setLoading(false); // Reset loading for signup
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
    console.log("AuthForm: handleModeSwitch. Current isLogin:", isLogin);
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setLoading(false); // Reset loading when switching modes
  };

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
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min. 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
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
              />
              <input
                type="text"
                name="businessName"
                placeholder="Business Name"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
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
          <button type="button" onClick={handleModeSwitch}>
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