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
  const [allDesigns, setAllDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingDesignId, setLoadingDesignId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const hasFetchedRef = useRef(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const DESIGNS_PER_PAGE = 3;

  const fetchDesigns = async () => {
    if (!user || hasFetchedRef.current) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      hasFetchedRef.current = true;
      
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
      
      // Add a minimum delay to prevent jarring transitions
      const minDelay = 800; // 800ms minimum loading time
      const startTime = Date.now();
      
      await new Promise(resolve => {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, minDelay - elapsed);
        setTimeout(resolve, remainingDelay);
      });
      
      setAllDesigns(data.designs || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load designs');
      hasFetchedRef.current = false;
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDesigns();
    } else if (user === null && !hasInitialized) {
      // Only set loading to false if we've confirmed there's no user and we haven't initialized yet
      setLoading(false);
      setHasInitialized(true);
      hasFetchedRef.current = false;
      setAllDesigns([]);
      setError('');
    }
  }, [user, hasInitialized]);

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
      
      setAllDesigns(prev => prev.filter(d => d.id !== designId));
      
      // Adjust current page if needed
      const remainingDesigns = allDesigns.length - 1;
      const maxPages = Math.ceil(remainingDesigns / DESIGNS_PER_PAGE);
      if (currentPage > maxPages && maxPages > 0) {
        setCurrentPage(maxPages);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete design');
    }
  };

  const handleEditDesign = (designId: string) => {
    setLoadingDesignId(designId);
    window.location.href = `/design?load=${designId}`;
  };

  const handleRetry = () => {
    hasFetchedRef.current = false;
    setError('');
    setLoading(true);
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

  // Calculate pagination
  const totalPages = Math.ceil(allDesigns.length / DESIGNS_PER_PAGE);
  const startIndex = (currentPage - 1) * DESIGNS_PER_PAGE;
  const endIndex = startIndex + DESIGNS_PER_PAGE;
  const currentDesigns = allDesigns.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Show loading while we're still determining user state or fetching designs
  if (loading || !hasInitialized) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Saved Designs</h1>
          <p>Manage all your saved paper bag designs</p>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your designs...</p>
        </div>
      </div>
    );
  }

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

      {error ? (
        <div className={styles.error}>
          <h3>Error Loading Designs</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      ) : allDesigns.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h2>No Designs Saved Currently</h2>
          <p>You haven&apos;t saved any designs yet. Start creating your custom paper bag designs and save them here for easy access.</p>
          <div className={styles.emptyActions}>
            <Link href="/design" className={styles.footerButton}>
              Create New Design
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.designsGrid}>
            {currentDesigns.map((design) => (
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
                    disabled={loadingDesignId === design.id}
                  >
                    {loadingDesignId === design.id ? (
                      <>
                        <span className={styles.buttonSpinner}></span>
                        Loading...
                      </>
                    ) : (
                      'Edit Design'
                    )}
                  </button>
                  <button 
                    onClick={() => handleDeleteDesign(design.id)}
                    className={styles.deleteButton}
                    disabled={loadingDesignId === design.id}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                ← Previous
              </button>
              
              <div className={styles.paginationNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`${styles.paginationNumber} ${page === currentPage ? styles.active : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {allDesigns.length > 0 && (
        <div className={styles.footer}>
          <p>Total designs: {allDesigns.length}</p>
        </div>
      )}
    </div>
  );
};

export default SavedDesignsPage;