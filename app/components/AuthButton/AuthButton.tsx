"use client";

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AuthForm from '../AuthForm/AuthForm'
import styles from './AuthButton.module.css'

const AuthButton: React.FC = () => {
  const { user, userProfile, signOut } = useAuth()
  const [showModal, setShowModal] = useState(false)

  const handleOpenModal = () => setShowModal(true)
  const handleCloseModal = () => setShowModal(false)

 
  if (user) {
    return (
      <div className={styles.userMenu}>
        <span className={styles.userMenuText}>
          Welcome, {userProfile?.name || user.email?.split('@')[0]}
        </span>
        <button onClick={signOut} className={styles.signOutButton}>
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={handleOpenModal} className={styles.authButton}>
        Login
      </button>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <AuthForm onClose={handleCloseModal} />
          </div>
          <div className={styles.modalBackdrop} onClick={handleCloseModal}></div>
        </div>
      )}
    </div>
  )
}

export default AuthButton