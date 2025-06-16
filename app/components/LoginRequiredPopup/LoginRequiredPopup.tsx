"use client";

import React from 'react';
import styles from './LoginRequiredPopup.module.css';

interface LoginRequiredPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  action: 'download' | 'quote';
}

const LoginRequiredPopup: React.FC<LoginRequiredPopupProps> = ({ 
  isOpen, 
  onClose, 
  onLogin, 
  action 
}) => {
  if (!isOpen) return null;

  const actionText = action === 'download' ? 'download your design' : 'request a quote';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div className={styles.content}>
          <h2>Login Required</h2>
          <p>You need to be logged in to {actionText}.</p>
          <p><strong>Don't worry!</strong> Your current design will be preserved.</p>
          <p>Please log in or create an account to continue.</p>
          <div className={styles.buttonGroup}>
            <button className={styles.loginButton} onClick={onLogin}>
              Login / Sign Up
            </button>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
      <div className={styles.modalBackdrop} onClick={onClose}></div>
    </div>
  );
};