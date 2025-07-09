"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import styles from './ProfileSettings.module.css';

interface ProfileSettingsProps {
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phoneNumber: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when userProfile loads
  useEffect(() => {
    if (userProfile && user) {
      const initialData = {
        name: userProfile.name || '',
        businessName: userProfile.business_name || '',
        phoneNumber: userProfile.phone_number || '',
        email: user.email || '',
      };
      setFormData(initialData);
    }
  }, [userProfile, user]);

  // Check if form has changes
  useEffect(() => {
    if (userProfile && user) {
      const hasChanged = 
        formData.name !== (userProfile.name || '') ||
        formData.businessName !== (userProfile.business_name || '') ||
        formData.phoneNumber !== (userProfile.phone_number || '') ||
        formData.email !== (user.email || '');
      setHasChanges(hasChanged);
    }
  }, [formData, userProfile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!hasChanges || !user) return;

  setLoading(true);
  setError('');
  setSuccess('');

  try {
    // Use updateUserProfile if available, otherwise use direct Supabase call
    if (updateUserProfile) {
      const result = await updateUserProfile({
        name: formData.name,
        business_name: formData.businessName,
        phone_number: formData.phoneNumber,
      });

      if (result.error) {
        setError('Failed to update profile: ' + (result.error.message || 'Unknown error'));
      } else {
        setSuccess('Profile updated successfully!');
        // The AuthContext should update userProfile automatically
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    } else {
      // Fallback to direct Supabase call
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          name: formData.name,
          business_name: formData.businessName,
          phone_number: formData.phoneNumber,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        setError('Failed to update profile: ' + updateError.message);
      } else {
        setSuccess('Profile updated successfully!');
        
        // IMPORTANT: Manually trigger a profile refresh since we bypassed AuthContext
        setTimeout(() => {
          window.location.reload(); // Force refresh to get updated data
        }, 1000);
        
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    }
  } catch (err) {
    console.error('Profile update error:', err);
    setError('An unexpected error occurred. Please try again.');
  } finally {
    // CRITICAL: Always set loading to false
    setLoading(false);
  }
};

  const formatJoinDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user || !userProfile) {
    return (
      <div className={styles.profileSettings}>
        <div className={styles.loadingMessage}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className={styles.profileSettings}>
      <div className={styles.header}>
        <h2>Profile Settings</h2>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
      </div>

      <div className={styles.content}>
        {/* Account Information Section */}
        <div className={styles.section}>
          <h3>Account Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Account Status:</label>
              <span className={styles.statusBadge}>
                {user.email_confirmed_at ? '✅ Verified' : '⚠️ Unverified'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Member Since:</label>
              <span>{formatJoinDate(userProfile.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Editable Profile Section */}
        <div className={styles.section}>
          <h3>Personal Information</h3>
          
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled={true}
                className={styles.disabledInput}
                title="Email cannot be changed. Contact support if needed."
              />
              <small className={styles.helpText}>
                Email address cannot be changed. Contact support if you need to update this.
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="businessName">Business Name</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                disabled={loading || !hasChanges}
                className={`${styles.saveButton} ${!hasChanges ? styles.disabled : ''}`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className={styles.section}>
          <h3>Security</h3>
          <div className={styles.securityInfo}>
            <p>🔒 Password changes and advanced security settings coming soon.</p>
            <p>For security concerns, please contact us at <a href="mailto:info@mapletradecorp.com">info@mapletradecorp.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;