"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { SavedDesign } from '../../types/design';
import styles from './SavedDesignPage.module.css';
import { createClient } from '@supabase/supabase-js';

const SavedDesignsPage: React.FC = () => {
  const { user } = useAuth();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasFetchedRef = useRef(false); // Use ref instead of state

  const fetchDesigns = async () => {
    if (!user || hasFetchedRef.current) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      hasFetchedRef.current = true; // Set immediately to prevent duplicate calls
      
      console.log('Fetching designs for user:', user.id);
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('No valid session found. Please log in again.');
      }
      
      const response = await fetch('/api/designs', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        throw new Error(errorData.error || 'Failed to fetch designs');
      }
      
      const data = await response.json();
      console.log('Fetched designs:', data.designs?.length || 0);
      
      setDesigns(data.designs || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load designs');
      hasFetchedRef.current = false; // Reset on error so retry can work
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDesigns();
    } else {
      setLoading(false);
      hasFetchedRef.current = false;
      setDesigns([]);
      setError('');
    }
  }, [user]); // Only depend on user

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design?')) {
      return;
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('No valid session found. Please log in again.');
      }

      const response = await fetch(`/api/designs/${designId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete design');
      }
      
      setDesigns(prev => prev.filter(d => d.id !== designId));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete design');
    }
  };

  // Handle edit design with forced reload
  const handleEditDesign = (designId: string) => {
    // Force a page reload to the design page with the load parameter
    window.location.href = `/design?load=${designId}`;
  };

  const handleRetry = () => {
    hasFetchedRef.current = false;
    setError('');
    fetchDesigns();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.notLoggedIn}>
          <h2>Please log in to view your saved designs</h2>
          <p>You need to be logged in to access your saved designs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Saved Designs</h1>
        <p>Manage all your saved paper bag designs</p>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your designs...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <h3>Error Loading Designs</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      ) : designs.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h2>No Designs Saved Currently</h2>
          <p>You haven&apos;t saved any designs yet. Start creating your custom paper bag designs and save them here for easy access.</p>
          <div className={styles.emptyActions}>
            <Link href="/design" className={styles.createButton}>
              Create New Design
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.designsGrid}>
          {designs.map((design) => (
            <div key={design.id} className={styles.designCard}>
              <div className={styles.designPreview}>
                {design.preview_image ? (
                  <Image 
                    src={design.preview_image} 
                    alt={design.name}
                    width={200}
                    height={150}
                    className={styles.previewImage}
                  />
                ) : (
                  <div className={styles.noPreview}>No preview available</div>
                )}
              </div>
              
              <div className={styles.designInfo}>
                <h3>{design.name}</h3>
                {design.description && (
                  <p className={styles.description}>{design.description}</p>
                )}
                
                <div className={styles.designMeta}>
                  <div className={styles.dimensions}>
                    <span>📏 {design.dimensions.length}&quot; × {design.dimensions.width}&quot; × {design.dimensions.height}&quot;</span>
                  </div>
                  <div className={styles.logoCount}>
                    <span>🏷️ {design.logos.length} logo{design.logos.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className={styles.lastModified}>
                    <span>📅 {formatDate(design.updated_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.designActions}>
                <button 
                  onClick={() => handleEditDesign(design.id)}
                  className={styles.editButton}
                >
                  Edit Design
                </button>
                <button 
                  onClick={() => handleDeleteDesign(design.id)}
                  className={styles.deleteButton}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {designs.length > 0 && (
        <div className={styles.footer}>
          <p>Total designs: {designs.length}</p>
          <Link href="/design" className={styles.newDesignButton}>
            Create New Design
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedDesignsPage;