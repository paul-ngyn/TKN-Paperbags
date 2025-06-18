"use client";

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AuthForm from '../AuthForm/AuthForm'
import styles from './AuthButton.module.css'
import Image from 'next/image'
import avatar from '../../public/avatar.png' 

const AuthButton: React.FC = () => {
  const { user, signOut } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleOpenModal = () => setShowModal(true)
  const handleCloseModal = () => setShowModal(false)
  
  const showDropdownMenu = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }
    setShowDropdown(true)
  }
  
  const hideDropdownMenu = () => {
    hoverTimerRef.current = setTimeout(() => {
      setShowDropdown(false)
    }, 150) // Small delay to prevent flickering when moving between button and dropdown
  }

  const handleSignOut = () => {
    signOut()
    setShowDropdown(false)
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  if (user) {
    return (
      <div className={styles.authWrapper}>
        <div 
          className={styles.profileDropdown} 
          ref={dropdownRef}
          onMouseEnter={showDropdownMenu}
          onMouseLeave={hideDropdownMenu}
        >
          <button 
            className={styles.profileButton}
            aria-expanded={showDropdown}
          >
            <Image 
              src={avatar}
              alt="Profile Avatar" 
              width={26}
              height={26}
              className={styles.avatar}
            />
            My Profile
            <span className={styles.dropdownArrow}>▼</span>
          </button>
          
          {showDropdown && (
            <div 
              className={styles.dropdownMenu}
              onMouseEnter={showDropdownMenu}
              onMouseLeave={hideDropdownMenu}
            >
              <div className={styles.userInfo}>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
              <hr className={styles.divider} />
              <button 
                onClick={handleSignOut} 
                className={styles.dropdownItem}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.authWrapper}>
      <button onClick={handleOpenModal} className={styles.authButton}>
           <Image 
              src={avatar}
              alt="Profile Avatar" 
              width={26}
              height={26}
              className={styles.avatar}
            />
        Login/Sign Up
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