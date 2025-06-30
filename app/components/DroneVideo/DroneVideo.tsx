"use client";

import React, { useRef, useEffect, useState } from 'react';
import styles from './DroneVideo.module.css';


interface DroneVideoProps {
  className?: string;
}

const DroneVideo: React.FC<DroneVideoProps> = ({ className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Add a timeout to prevent infinite loading
    const loadTimeout = setTimeout(() => {
      if (!isLoaded) {
        console.log('Video loading timeout');
        setHasError(true);
      }
    }, 15000); // 15 second timeout

    const handleLoadStart = () => {
      console.log('Video load started');
    };

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded');
    };

    const handleLoadedData = () => {
      console.log('Video data loaded');
      clearTimeout(loadTimeout);
      setIsLoaded(true);
      // Auto-play once loaded
      video.play().catch(err => {
        console.log('Auto-play was prevented:', err);
      });
    };

    const handleCanPlay = () => {
      console.log('Video can start playing');
      clearTimeout(loadTimeout);
      setIsLoaded(true);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          setLoadingProgress((bufferedEnd / duration) * 100);
        }
      }
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      clearTimeout(loadTimeout);
      const videoElement = e.target as HTMLVideoElement;
      if (videoElement.error) {
        console.error('Video error code:', videoElement.error.code);
        console.error('Video error message:', videoElement.error.message);
      }
      setHasError(true);
    };

    // Add multiple event listeners for better debugging
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('error', handleError);

    // Force load the video
    video.load();

    return () => {
      clearTimeout(loadTimeout);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('error', handleError);
    };
  }, [isLoaded]);

  if (hasError) {
    return (
      <div className={`${styles.videoContainer} ${className}`.trim()}>
        <div className={styles.errorPlaceholder}>
          <div className={styles.fallbackContent}>
            <h1 className={styles.fallbackTitle}>Welcome to MTC</h1>
            <p className={styles.fallbackSubtitle}>Quality, Sustainability, Excellence</p>
            <p className={styles.errorMessage}>
              <small>Video temporarily unavailable</small>
            </p>
          </div>
        </div>
      </div>
    );
  }

   return (
    <div className={`${styles.videoContainer} ${className}`.trim()}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          className={`${styles.video} ${isLoaded ? styles.loaded : ''}`.trim()}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          src="https://raw.githubusercontent.com/paul-ngyn/mtc-video-assets/main/MTC_COMMERICIAL.mp4(1).mp4"
        >
          Your browser does not support the video tag.
        </video>
        
        {!isLoaded && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading video... {Math.round(loadingProgress)}%</p>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Overlay content */}
        <div className={styles.videoOverlay}>
          <div className={styles.overlayContent}>
            <h1 className={styles.overlayTitle}></h1>
            <p className={styles.overlaySubtitle}></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneVideo;