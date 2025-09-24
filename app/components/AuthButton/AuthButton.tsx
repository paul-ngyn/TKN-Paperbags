import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AuthForm from '../AuthForm/AuthForm'
import ProfileSettings from '../ProfileSettings/ProfileSettings'
import SavedDesignsPage from '../SavedDesignPage/SavedDesignPage'
import styles from './AuthButton.module.css'
import Image from 'next/image'
import avatar from '../../public/avatar.png' 

const AuthButton: React.FC = () => {
  const { user, signOut } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [showSavedDesigns, setShowSavedDesigns] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleOpenModal = () => setShowModal(true)
  const handleCloseModal = () => setShowModal(false)
  const handleOpenProfileSettings = () => {
    setShowProfileSettings(true)
    setShowDropdown(false)
  }
  const handleCloseProfileSettings = () => setShowProfileSettings(false)

  const handleOpenSavedDesigns = () => {
    setShowSavedDesigns(true)
    setShowDropdown(false)
  }
  const handleCloseSavedDesigns = () => setShowSavedDesigns(false)
  
  const showDropdownMenu = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }
    setShowDropdown(true)
  }
  
  const hideDropdownMenu = () => {
    hoverTimerRef.current = setTimeout(() => {
      setShowDropdown(false)
    }, 150)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowDropdown(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

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
                onClick={handleOpenProfileSettings} 
                className={styles.dropdownItem}
              >
                Profile Settings
              </button>
              <button 
                onClick={handleOpenSavedDesigns} 
                className={styles.dropdownItem}
              >
                Saved Designs
              </button>
              <button 
                onClick={handleSignOut} 
                className={styles.dropdownItem}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Profile Settings Modal */}
        {showProfileSettings && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <ProfileSettings onClose={handleCloseProfileSettings} />
            </div>
            <div className={styles.modalBackdrop} onClick={handleCloseProfileSettings}></div>
          </div>
        )}

        {/* Saved Designs Modal */}
        {showSavedDesigns && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <button 
                  onClick={handleCloseSavedDesigns}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>
              <SavedDesignsPage />
            </div>
            <div className={styles.modalBackdrop} onClick={handleCloseSavedDesigns}></div>
          </div>
        )}
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
          suppressHydrationWarning={true}
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