"use client";
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './QuoteReqButton.module.css';
import QuoteForm from '../QuoteForm/QuoteForm';
import LoginRequiredPopup from '../LoginRequiredPopup/LoginRequiredPopup';
import AuthForm from '../AuthForm/AuthForm';

const QuoteReqButton: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showLoginRequiredPopup, setShowLoginRequiredPopup] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleOpenModal = () => {
    if (!user) {
      setShowLoginRequiredPopup(true);
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleLoginRequiredClose = () => {
    setShowLoginRequiredPopup(false);
  };

  const handleLoginRequiredLogin = () => {
    setShowLoginRequiredPopup(false);
    setShowAuthForm(true);
  };

  const handleAuthFormClose = () => {
    setShowAuthForm(false);
  };

  // When user successfully logs in, automatically open quote form
  React.useEffect(() => {
    if (user && showAuthForm) {
      setShowAuthForm(false);
      setShowModal(true);
    }
  }, [user, showAuthForm]);

  return (
    <div>
      <button onClick={handleOpenModal} className={styles.navButton}>
        Get a Quote
      </button>
      
      {/* Quote Form Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <QuoteForm onClose={handleCloseModal} />
          </div>
          <div className={styles.modalBackdrop} onClick={handleCloseModal}></div>
        </div>
      )}

      {/* Login Required Popup */}
      <LoginRequiredPopup
        isOpen={showLoginRequiredPopup}
        onClose={handleLoginRequiredClose}
        onLogin={handleLoginRequiredLogin}
        action="quote"
      />

      {/* Auth Form Modal */}
      {showAuthForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <AuthForm onClose={handleAuthFormClose} />
          </div>
          <div className={styles.modalBackdrop} onClick={handleAuthFormClose}></div>
        </div>
      )}
    </div>
  );
};

export default QuoteReqButton;