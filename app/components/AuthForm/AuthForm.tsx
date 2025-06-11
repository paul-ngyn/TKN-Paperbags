"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Verify this path matches your file structure
import styles from './AuthForm.module.css';

interface AuthFormProps {
  onClose: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
  console.log("AuthForm RENDERED");

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
  const { signIn, signUp } = useAuth();

  useEffect(() => {
    console.log("AuthForm STATE UPDATE: isLogin:", isLogin, "success:", success, "error:", error, "loading:", loading);
  }, [isLogin, success, error, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AuthForm: handleSubmit initiated. isLogin:", isLogin);
    setLoading(true);
    setError('');
    setSuccess(''); // Reset messages at the start of a new submission

    try {
      if (isLogin) {
        console.log("AuthForm: Attempting LOGIN with email:", formData.email);
        const { error: signInError } = await signIn(formData.email, formData.password);
        if (signInError) {
          console.error("AuthForm: LOGIN FAILED", signInError);
          setError(signInError.message);
        } else {
          console.log("AuthForm: LOGIN SUCCESSFUL");
          setSuccess('Login successful!');
          setTimeout(() => {
            onClose();
          }, 1000);
        }
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
          console.log("AuthForm: SIGN UP SUCCESSFUL - setting success message.");
          setSuccess('Success! Please check your email to confirm your account.');
          setFormData({ // Clear form
            email: '',
            password: '',
            name: '',
            businessName: '',
            phoneNumber: '',
          });
          // The success message should now persist.
          // isLogin remains false.
        }
      }
    } catch (err) {
      console.error("AuthForm: handleSubmit CATCH block error:", err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      console.log("AuthForm: handleSubmit finally block. Setting loading to false.");
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
    console.log("AuthForm: handleModeSwitch. Current isLogin:", isLogin, "Switching to:", !isLogin);
    setIsLogin(!isLogin);
    setError('');
    setSuccess(''); // Clear messages when switching modes
  };

  console.log("AuthForm RENDERING with: isLogin:", isLogin, "success:", `"${success}"`, "error:", `"${error}"`);

  return (
    <div className={styles.authForm}>
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {/* Show form if:
          1. No success message is active OR
          2. There IS a success message, but we are in LOGIN mode (login success briefly shows before modal closes)
      */}
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
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
      )}
      
      {loading && <p>Processing...</p>}

      {/* Toggle between Login and Sign Up:
          Show if:
          1. Not loading AND
          2. EITHER no success message OR (success message exists AND it's for login mode - though this case is brief)
      */}
      {!loading && (!success || (success && isLogin)) && (
        <p>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={handleModeSwitch}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      )}

      {/* "Go to Login" button after successful signup:
          Show if:
          1. Not loading AND
          2. Success message exists AND
          3. We are in SIGNUP mode (isLogin is false)
      */}
      {!loading && success && !isLogin && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          {/* The success message is already displayed above, no need to repeat <p>{success}</p> here */}
          <button
            type="button"
            onClick={() => {
              console.log("AuthForm: 'Go to Login' clicked. Setting isLogin to true, clearing success.");
              setIsLogin(true);
              setSuccess('');
              setError('');
            }}
            className={styles.switchButton} // Make sure this class is styled
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthForm;