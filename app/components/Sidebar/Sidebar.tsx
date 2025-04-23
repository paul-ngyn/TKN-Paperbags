"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link from next/link
import styles from "./Sidebar.module.css";
import downloadicon from "../../public/downloadicon.png";
import BlueprintExample from "../../public/BlueprintExample.png"; // Import the blueprint example image



// Import the BagDimensions interface or define it here
interface BagDimensions {
  length: number;
  width: number;
  height: number;
}

interface SidebarProps {
  handleLogoUpload: (files: FileList) => void;
  handleClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  dimensions: BagDimensions;
  handleDimensionChange: (dimensions: BagDimensions) => void;
  startEditingDimensions?: () => void;
  downloadDesign?: () => void;
  logoCount?: number; // Add this new prop
  
}

const Sidebar: React.FC<SidebarProps> = ({
  handleLogoUpload,
  handleClear,
  fileInputRef,
  dimensions,
  handleDimensionChange,
  startEditingDimensions = () => {}, // Default empty function if prop not provided
  downloadDesign,
  logoCount = 0 
}) => {
  // Add state for showing/hiding the blueprint example modal
  const [showBlueprintExample, setShowBlueprintExample] = useState(false);

  
  // Define max dimensions in inches
  const MAX_DIMENSIONS = {
    length: 21.65, 
    width: 11.81,
    height: 25.98
  };

  const MIN_DIMENSIONS = {
    length: 6,
    width: 2,
    height: 6
  };
  
  // Improved conversion factors with precise handling
  const mmToInches = (mm: number) => {
    // Exact conversion
    const exactInches = mm / 25.4;
    
    // Common inch values for checking - these are values we want to show as clean numbers
    const commonInches = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 
      19, 20, 24
    ];
    
    // Check if we're very close to a common inch value
    for (const value of commonInches) {
      // If within 0.005 inches treat as the clean value
      if (Math.abs(exactInches - value) < 0.005) {
        return value;
      }
    }
    
    // Otherwise return the precise conversion with 2 decimal places
    return Math.round(exactInches * 100) / 100;
  };
  
  // Precise conversion from inches to mm
  const inchesToMm = (inches: number) => {
    // Exact conversion - use decimal precision for millimeters
    return +(inches * 25.4).toFixed(2);
  };
  
  // Store current input values as strings to preserve what user types exactly
  const [inputValues, setInputValues] = useState({
    length: "",
    width: "",
    height: ""
  });
  
  // Store the actual numeric values (in inches) for calculations
  const [tempDimensionsInches, setTempDimensionsInches] = useState<{
    length: number;
    width: number;
    height: number;
  }>({
    length: mmToInches(dimensions.length),
    width: mmToInches(dimensions.width),
    height: mmToInches(dimensions.height)
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Update both states when props change
  useEffect(() => {
    const lengthInches = mmToInches(dimensions.length);
    const widthInches = mmToInches(dimensions.width);
    const heightInches = mmToInches(dimensions.height);
    
    setTempDimensionsInches({
      length: lengthInches,
      width: widthInches,
      height: heightInches
    });
    
    // Format display values
    setInputValues({
      length: formatDisplayValue(lengthInches),
      width: formatDisplayValue(widthInches),
      height: formatDisplayValue(heightInches)
    });
  }, [dimensions]);
  
  // Format display values - show whole numbers as integers
  const formatDisplayValue = (value: number): string => {
    // If very close to an integer (within 0.001), display as integer
    if (Math.abs(Math.round(value) - value) < 0.001) {
      return Math.round(value).toString();
    }
    // Otherwise display with 2 decimal places, removing trailing zeros
    return value.toFixed(2).replace(/\.?0+$/, '');
  };
  
  // Handler for dimension changes
  const onDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Always update the input value to exactly what user typed
    setInputValues({
      ...inputValues,
      [name]: value
    });
    
    // Only update numeric value if we have valid input
    if (value && !isNaN(parseFloat(value))) {
      const numValue = parseFloat(value);
      
      // Store the user's value without enforcing limits
      setTempDimensionsInches({
        ...tempDimensionsInches,
        [name]: numValue
      });
      
      // Notify parent that we're in editing mode
      startEditingDimensions();
    }
  };
  
  // Apply dimension changes when button is clicked
  const applyDimensions = () => {
    // First, enforce min/max limits before applying
    const clampedDimensions = {
      length: Math.min(Math.max(tempDimensionsInches.length, MIN_DIMENSIONS.length), MAX_DIMENSIONS.length),
      width: Math.min(Math.max(tempDimensionsInches.width, MIN_DIMENSIONS.width), MAX_DIMENSIONS.width),
      height: Math.min(Math.max(tempDimensionsInches.height, MIN_DIMENSIONS.height), MAX_DIMENSIONS.height)
    };
    
    // Update the input values to reflect any clamping
    setInputValues({
      length: formatDisplayValue(clampedDimensions.length),
      width: formatDisplayValue(clampedDimensions.width),
      height: formatDisplayValue(clampedDimensions.height)
    });
    
    // Update the temp dimensions with clamped values
    setTempDimensionsInches(clampedDimensions);
    
    // Convert inches back to mm when sending to parent component
    const newDimensions = {
      length: inchesToMm(clampedDimensions.length),
      width: inchesToMm(clampedDimensions.width),
      height: inchesToMm(clampedDimensions.height)
    };
    
    handleDimensionChange(newDimensions);
  };

  const onDimensionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyDimensions();
    }
  };
  
  // Reset to the original dimensions
  const resetDimensions = () => {
    const lengthInches = mmToInches(dimensions.length);
    const widthInches = mmToInches(dimensions.width);
    const heightInches = mmToInches(dimensions.height);
    
    setTempDimensionsInches({
      length: lengthInches,
      width: widthInches,
      height: heightInches
    });
    
    setInputValues({
      length: formatDisplayValue(lengthInches),
      width: formatDisplayValue(widthInches),
      height: formatDisplayValue(heightInches)
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      handleLogoUpload(e.dataTransfer.files);
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      handleLogoUpload(files);
      setFileName(files[0].name);
    }
  };

  // Click the hidden file input
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Clear logo and filename
  const handleClearClick = () => {
    setFileName(null);
    handleClear();
  };

  // Check if current values differ from original values
  const dimensionsChanged = () => {
    const originalInches = {
      length: mmToInches(dimensions.length),
      width: mmToInches(dimensions.width),
      height: mmToInches(dimensions.height)
    };
    
    // Use small epsilon for floating point comparison
    const epsilon = 0.005; // Allow 0.005 inch difference (rounding errors)
    
    return (
      Math.abs(originalInches.length - tempDimensionsInches.length) > epsilon ||
      Math.abs(originalInches.width - tempDimensionsInches.width) > epsilon ||
      Math.abs(originalInches.height - tempDimensionsInches.height) > epsilon
    );
  };

  // Check if values are outside min/max limits
  const dimensionOutOfRange = (name: string, value: number): boolean => {
    if (name === 'length') {
      return value < MIN_DIMENSIONS.length || value > MAX_DIMENSIONS.length;
    } else if (name === 'width') {
      return value < MIN_DIMENSIONS.width || value > MAX_DIMENSIONS.width;
    } else if (name === 'height') {
      return value < MIN_DIMENSIONS.height || value > MAX_DIMENSIONS.height;
    }
    return false;
  };

  // Visual feedback if value is outside limits
  const getInputClass = (name: string): string => {
    const value = tempDimensionsInches[name as keyof typeof tempDimensionsInches];
    return dimensionOutOfRange(name, value) 
      ? `${styles.dimensionInput} ${styles.outOfRange}` 
      : styles.dimensionInput;
  };

  return (
    <div className={styles.sidebarContainer}>
      <h2 className={styles.sidebarTitle}>Design Your Bag</h2>

      <div className={styles.uploadSection}>
        <div 
          className={`${styles.dropZone} ${dragActive ? styles.dragOver : ""}`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Image
            src={downloadicon}
            alt="Upload Icon"
            width={40}
            height={40}
            className={styles.dropIcon}
          />
          <p>Drag & drop your logos here, or click to browse</p>
          {fileName && <p className={styles.fileName}>Selected: {fileName}</p>}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </div>
        <div className={styles.buttonInfoGroup}>
          {/* Show logo count if there are any logos */}
          {logoCount > 0 && (
            <p className={styles.logoCount}>
              {logoCount} logo{logoCount !== 1 ? 's' : ''} added
            </p>
          )}
           {/* Add a button to explicitly add another logo */}
           <button onClick={handleClick} className={styles.addLogoButton}>
            Add {logoCount > 0 ? 'Another' : 'New'} Logo
          </button>
          {/* Update button text to reflect multiple logos */}
          <button onClick={handleClearClick} className={styles.clearButton}>
            {logoCount > 1 ? 'Clear All Logos' : 'Clear Logos'}
          </button>
          
        </div>
      </div>

      <div className={styles.infoLinkContainer}>
        <Link href="/orderinfo" className={styles.infoLink}>
          Image Upload Details
        </Link>
        <span className={styles.linkSeparator}>-</span>
        <button 
          onClick={() => setShowBlueprintExample(true)}
          className={styles.infoLink}
        >
          Blueprint Example
        </button>
      </div>
      
      <div className={styles.dimensionContainer}>
        <h3 className={styles.sectionTitle}>Customize Your Bag Dimensions</h3>
        <div className={styles.dimensionInputs}>
        <div className={styles.inputGroup}>
          <label htmlFor="length">Length (in)</label>
          <input
            type="number"
            id="length"
            name="length"
            value={inputValues.length}
            onChange={onDimensionChange}
            onKeyDown={onDimensionKeyDown}
            min={MIN_DIMENSIONS.length}
            max={MAX_DIMENSIONS.length}
            step="0.01"
            className={getInputClass('length')}
          />
          <div className={styles.dimensionLimits}>
            <span className={styles.minDimension}>Min: {MIN_DIMENSIONS.length}&quot;</span>
            <span className={styles.maxDimension}>Max: {MAX_DIMENSIONS.length}&quot;</span>
          </div>
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="width">Width (in)</label>
          <input
            type="number"
            id="width"
            name="width"
            value={inputValues.width}
            onChange={onDimensionChange}
            onKeyDown={onDimensionKeyDown}
            min={MIN_DIMENSIONS.width}
            max={MAX_DIMENSIONS.width}
            step="0.01"
            className={getInputClass('width')}
          />
          <div className={styles.dimensionLimits}>
            <span className={styles.minDimension}>Min: {MIN_DIMENSIONS.width}&quot;</span>
            <span className={styles.maxDimension}>Max: {MAX_DIMENSIONS.width}&quot;</span>
          </div>
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="height">Height (in)</label>
          <input
            type="number"
            id="height"
            name="height"
            value={inputValues.height}
            onChange={onDimensionChange}
            onKeyDown={onDimensionKeyDown}
            min={MIN_DIMENSIONS.height}
            max={MAX_DIMENSIONS.height}
            step="0.01"
            className={getInputClass('height')}
          />
          <div className={styles.dimensionLimits}>
            <span className={styles.minDimension}>Min: {MIN_DIMENSIONS.height}&quot;</span>
            <span className={styles.maxDimension}>Max: {MAX_DIMENSIONS.height}&quot;</span>
          </div>
        </div>
      </div>
        
        {/* Buttons to apply or reset dimensions */}
        <div className={styles.buttonGroup}>
          <button 
            onClick={applyDimensions} 
            className={styles.applyButton}
            disabled={!dimensionsChanged()}
          >
            Apply Dimensions
          </button>
          <button 
            onClick={resetDimensions} 
            className={styles.resetButton}
            disabled={!dimensionsChanged()}
          >
            Reset
          </button>
        </div>

        {/* Download Design Button */}
        <div className={styles.downloadButtonContainer}>
        <button 
          onClick={() => {
            if (typeof downloadDesign === 'function') {
              downloadDesign();
            } else {
              console.error("No download function available");
              alert("Unable to download design at this time.");
            }
          }}
          className={styles.downloadButton}
        >
          Download Design
        </button>
      </div>
      </div>
      
      {/* Blueprint Example Modal */}
      {showBlueprintExample && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton} 
              onClick={() => setShowBlueprintExample(false)}
            >
              &times;
            </button>
            <div className={styles.blueprintImageContainer}>
              <Image
                src={BlueprintExample}
                alt="Blueprint Example"
                width={1400}
                height={1200}
                className={styles.blueprintImage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;