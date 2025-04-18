"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Sidebar.module.css";
import downloadicon from "../../public/downloadicon.png";

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
}

const Sidebar: React.FC<SidebarProps> = ({
  handleLogoUpload,
  handleClear,
  fileInputRef,
  dimensions,
  handleDimensionChange,
  startEditingDimensions = () => {} // Default empty function if prop not provided
}) => {
  // Improved conversion factors with precise handling
  const mmToInches = (mm: number) => {
    // Exact conversion
    const exactInches = mm / 25.4;
    
    // Common inch values for checking - these are values we want to show as clean numbers
    const commonInches = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 
      19, 20, 24, 30, 36, 42, 48
    ];
    
    // Check if we're very close to a common inch value
    for (const value of commonInches) {
      // If within 0.05 inches (about 1.27mm), treat as the clean value
      if (Math.abs(exactInches - value) < 0.05) {
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
    
    // Debug info to help diagnose issues
    console.log("Dimensions from props (mm):", dimensions);
    console.log("Converted to inches:", { lengthInches, widthInches, heightInches });
    console.log("Formatted for display:", { 
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
      
      // Update the numeric state as well
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
    // Convert inches back to mm when sending to parent component
    // Use precise conversion to maintain accuracy
    const newDimensions = {
      length: inchesToMm(tempDimensionsInches.length),
      width: inchesToMm(tempDimensionsInches.width),
      height: inchesToMm(tempDimensionsInches.height)
    };
    
    console.log("Applying new dimensions (inches):", tempDimensionsInches);
    console.log("Converted to mm for storage:", newDimensions);
    
    handleDimensionChange(newDimensions);
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

  return (
    <div className={styles.sidebarContainer}>
      <h2 className={styles.sidebarTitle}>Design Your Bag</h2>

      <div className={styles.uploadSection}>
        <h3 className={styles.sectionTitle}>Add Logo</h3>
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
          <p>Drag & drop your logo here, or click to browse</p>
          {fileName && <p className={styles.fileName}>{fileName}</p>}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </div>
        <button onClick={handleClearClick} className={styles.clearButton}>
          Clear Logo
        </button>
      </div>
      
      <div className={styles.dimensionContainer}>
        <h3 className={styles.sectionTitle}>Bag Dimensions</h3>
        <div className={styles.dimensionInputs}>
          <div className={styles.inputGroup}>
            <label htmlFor="length">Length (in)</label>
            <input
              type="number"
              id="length"
              name="length"
              value={inputValues.length}
              onChange={onDimensionChange}
              min="4"
              max="80"
              step="0.01"
              className={styles.dimensionInput}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="width">Width (in)</label>
            <input
              type="number"
              id="width"
              name="width"
              value={inputValues.width}
              onChange={onDimensionChange}
              min="2"
              max="20"
              step="0.01"
              className={styles.dimensionInput}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="height">Height (in)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={inputValues.height}
              onChange={onDimensionChange}
              min="4"
              max="40"
              step="0.01"
              className={styles.dimensionInput}
            />
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
      </div>
    </div>
  );
};

export default Sidebar;