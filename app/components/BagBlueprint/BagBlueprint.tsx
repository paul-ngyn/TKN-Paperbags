"use client";
import React, { useMemo } from "react";
import styles from "./BagBlueprint.module.css";

interface BagBlueprintProps {
  dimensions?: {
    length: number; // This will be the "section2Width" (310mm by default)
    width: number;  // This will be the "section1Width" (165mm by default)
    height: number;
  };
  isEditing?: boolean; // Flag to indicate if dimensions are being edited
  currentEditValues?: { // The values currently being edited in the form
    length?: number;
    width?: number;
    height?: number;
  };
}

const BagBlueprint: React.FC<BagBlueprintProps> = ({ 
  dimensions = { length: 310, width: 165, height: 428 },
  isEditing = false,
  currentEditValues = {} // Values currently being edited
}) => {
  // Improved conversion from mm to inches with smart display formatting
  const mmToInches = (mm: number) => {
    // Precise conversion
    const exactInches = mm / 25.4;
    
    // Handle common inch values - check for close matches to common fractions
    // This makes 152mm display as "6" and 177.8mm display as "7", etc.
    const commonInches = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 
      19, 20, 24, 30, 36, 42, 48
    ];
    
    for (const value of commonInches) {
      if (Math.abs(exactInches - value) < 0.05) {
        return value.toString();
      }
    }
    
    // For all other values, round to 2 decimal places
    return exactInches.toFixed(2);
  };

  // For edit preview, use current edit values if available, otherwise use the saved dimensions
  const activeDimensions = useMemo(() => {
    if (!isEditing) return dimensions;
    
    // Use current edit values if available, or fall back to existing dimensions
    return {
      length: currentEditValues.length !== undefined ? currentEditValues.length : dimensions.length,
      width: currentEditValues.width !== undefined ? currentEditValues.width : dimensions.width,
      height: currentEditValues.height !== undefined ? currentEditValues.height : dimensions.height
    };
  }, [dimensions, isEditing, currentEditValues]);
  
  // Calculate the total width based on section widths (2 sides + 2 fronts)
  // The formula is based on: 2*width + 2*length + padding
  const calculatedTotalLength = (activeDimensions.width * 2) + (activeDimensions.length * 2) + 40;
  
  // Calculate scaled dimensions - use an absolute scale, not relative
  const totalWidth = calculatedTotalLength; 
  const totalHeight = activeDimensions.height;
  
  // Section measurements - directly use the dimensions provided by the user
  // This ensures sections are proportional to their actual dimensions
  const section1Width = activeDimensions.width;
  const section2Width = activeDimensions.length;
  const section3Width = section1Width; // Keep equal to section1
  const section4Width = section2Width; // Keep equal to section2
  
  // Calculate positions
  const section1Start = 100;
  const section1End = section1Start + section1Width;
  const section2End = section1End + section2Width;
  const section3End = section2End + section3Width;
  
  // Calculate heights - use a fixed ratio to height
  const tabsideHeight = Math.round(activeDimensions.height * 0.75);
  const tabLength = Math.round(activeDimensions.height * 0.2);

  // Position for height measurement arrow - always 30px to the right of the blueprint
  const heightArrowX = 50 + totalWidth + 30;
  
  // Positions for bottom measurements
  const measurementOffset = 50 + totalHeight + 70; // Base position + height + spacing
  const measurementLineY = measurementOffset - 30; // Position for measurement lines
  const measurementTextY = measurementOffset + 30; // Position for measurement text

  // Helper to determine if an inch value is likely to represent a clean number
  const isNiceInchValue = (mm: number) => {
    const inches = mm / 25.4;
    const commonValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 30, 36, 42, 48];
    
    for (const value of commonValues) {
      // Check if within 0.05 inches (about 1.27mm) of a common value
      if (Math.abs(inches - value) < 0.05) {
        return true;
      }
    }
    return false;
  };

  // Add debug info to help diagnose issues
  console.log("Dimensions:", dimensions);
  console.log("Active dimensions:", activeDimensions);
  console.log("Width in inches:", mmToInches(activeDimensions.width));
  console.log("Length in inches:", mmToInches(activeDimensions.length));
  console.log("Height in inches:", mmToInches(activeDimensions.height));
  
  // Check if dimensions represent nice inch values
  console.log("Width is nice inch value:", isNiceInchValue(activeDimensions.width));
  console.log("Length is nice inch value:", isNiceInchValue(activeDimensions.length));
  console.log("Height is nice inch value:", isNiceInchValue(activeDimensions.height));

  const viewBox = useMemo(() => {
    // Calculate the content width including margin and height arrow
    const contentWidth = 50 + totalWidth + 100; // Left margin + blueprint width + space for height arrow
    
    // Calculate the content height including measurements
    const contentHeight = measurementTextY + 60; // Include text and bottom padding
    
    // Add generous buffer around the content
    const bufferX = Math.max(200, contentWidth * 0.1); // At least 200px or 10% of content
    const bufferY = Math.max(150, contentHeight * 0.1); // At least 150px or 10% of content
    
    // Calculate total required dimensions
    const requiredWidth = contentWidth + bufferX;
    const requiredHeight = contentHeight + bufferY;
    
    // Center the content in the viewBox
    const minX = -bufferX / 2;
    const minY = -bufferY / 3; // Position it slightly higher than center
    
    // Return the calculated viewBox parameters
    return {
      minX,
      minY,
      width: requiredWidth,
      height: requiredHeight
    };
  }, [totalWidth, totalHeight, measurementTextY]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
      className={styles.bagBlueprint}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Show indication when editing */}
      {isEditing && (
        <text
          x={50 + totalWidth / 2}
          y="-30"
          textAnchor="middle"
          fontSize="16"
          fill="#666"
        >
          Preview with current dimensions
        </text>
      )}
      
      {/* Base Rectangle */}
      <rect x="50" y="50" width={totalWidth} height={totalHeight} fill="#f5f5f5" stroke="#000" strokeWidth="2" />

      {/* Vertical Lines */}
      <line x1={section1Start} y1="50" x2={section1Start} y2={50 + totalHeight} stroke="#000" strokeWidth="1" />
      <line x1={section1End} y1="50" x2={section1End} y2={50 + totalHeight} stroke="#000" strokeWidth="1" />
      <line x1={section2End} y1="50" x2={section2End} y2={50 + totalHeight} stroke="#000" strokeWidth="1" />
      <line x1={section3End} y1="50" x2={section3End} y2={50 + totalHeight} stroke="#000" strokeWidth="1" />

      {/* Horizontal Lines */}
      <line x1="50" y1={50 + tabsideHeight} x2={50 + totalWidth} y2={50 + tabsideHeight} stroke="#000" strokeWidth="1" />

      {/* Measurements */}
      {/* 1. Total Width (Top) */}
      <text
        x={50 + totalWidth / 2}
        y="15"
        textAnchor="middle"
        fontSize="22"
        fill="#000"
      >
        {mmToInches(calculatedTotalLength)} in
      </text>
      {/* Arrow for Total Width */}
      <line x1="60" y1="30" x2={50 + totalWidth - 10} y2="30" stroke="#000" strokeWidth="1" />
      <polygon points={`${50 + totalWidth - 10},25 ${50 + totalWidth - 10},35 ${50 + totalWidth + 10},30`} fill="#000" />
      <polygon points="60,25 60,35 45,30" fill="#000" />

      {/* 2. Total Height (right) - FIXED at 30px right of the rectangle */}
      <text
        x={heightArrowX + 20}
        y={50 + totalHeight / 2}
        textAnchor="middle"
        fontSize="20"
        fill="#000"
        transform={`rotate(-270, ${heightArrowX + 20}, ${50 + totalHeight / 2})`}
      >
        {mmToInches(activeDimensions.height)} in
      </text>
      {/* Arrow for Total Height - positioned relative to the right edge of rectangle */}
      <line x1={heightArrowX} y1="50" x2={heightArrowX} y2={50 + totalHeight} stroke="#000" strokeWidth="1" />
      <polygon points={`${heightArrowX - 5},65 ${heightArrowX + 5},65 ${heightArrowX},50`} fill="#000" />
      <polygon points={`${heightArrowX - 5},${50 + totalHeight - 15} ${heightArrowX + 5},${50 + totalHeight - 15} ${heightArrowX},${50 + totalHeight}`} fill="#000" />

      {/* 3. Tabside Height (left) */}
      <text
        x="30"
        y={50 + tabsideHeight / 2}
        textAnchor="middle"
        fontSize="20"
        fill="#000"
        transform={`rotate(-90, 30, ${50 + tabsideHeight / 2})`}
      >
        {mmToInches(tabsideHeight)} in
      </text>
      {/* Arrow for Tabside Height */}
      <line x1="35" y1="70" x2="35" y2={50 + tabsideHeight} stroke="#000" strokeWidth="1" />
      <polygon points="30,70 40,70 35,55" fill="#000" />
      <polygon points={`30,${50 + tabsideHeight} 40,${50 + tabsideHeight} 35,${50 + tabsideHeight + 15}`} fill="#000" />

      {/* 4. Tab Length */}
      <text
        x="20"
        y={50 + tabsideHeight + tabLength / 2}
        textAnchor="middle"
        fontSize="16"
        fill="#000"
        transform={`rotate(-90, 20, ${50 + tabsideHeight + tabLength / 2})`}
      >
        {mmToInches(tabLength)} in
      </text>
      {/* Arrow for Tab Length */}
      <line x1="35" y1={50 + tabsideHeight + 20} x2="35" y2={50 + tabsideHeight + tabLength} stroke="#000" strokeWidth="1" />
      <polygon points={`30,${50 + tabsideHeight + 20} 40,${50 + tabsideHeight + 20} 35,${50 + tabsideHeight + 5}`} fill="#000" />
      <polygon points={`30,${50 + tabsideHeight + tabLength} 40,${50 + tabsideHeight + tabLength} 35,${50 + tabsideHeight + tabLength + 15}`} fill="#000" />

      {/* Small 40mm Arrow - Fixed at 1.58 inches */}
      <text
        x="75"
        y={measurementTextY}
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        1.58 in
      </text>
      {/* Arrow for 40mm measurement - fixed */}
      <line x1="55" y1={measurementLineY} x2="95" y2={measurementLineY} stroke="#000" strokeWidth="1" />
      <polygon points={`90,${measurementLineY-5} 90,${measurementLineY+5} 105,${measurementLineY}`} fill="#000" />
      <polygon points={`60,${measurementLineY-5} 60,${measurementLineY+5} 45,${measurementLineY}`} fill="#000" />

      {/* 5. Section 1 Width - Shows actual width value */}
      <text
        x={section1Start + section1Width / 2}
        y={measurementTextY}
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        {mmToInches(activeDimensions.width)} in
      </text>
      {/* Arrow for Section 1 */}
      <line x1={section1Start} y1={measurementLineY} x2={section1End} y2={measurementLineY} stroke="#000" strokeWidth="1" />
      <polygon points={`${section1End-10},${measurementLineY-5} ${section1End-10},${measurementLineY+5} ${section1End+5},${measurementLineY}`} fill="#000" />
      <polygon points={`${section1Start+10},${measurementLineY-5} ${section1Start+10},${measurementLineY+5} ${section1Start-5},${measurementLineY}`} fill="#000" />

      {/* 6. Section 2 Width - Shows actual length value */}
      <text
        x={section1End + section2Width / 2}
        y={measurementTextY}
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        {mmToInches(activeDimensions.length)} in
      </text>
      {/* Arrow for Section 2 */}
      <line x1={section1End} y1={measurementLineY} x2={section2End} y2={measurementLineY} stroke="#000" strokeWidth="1" />
      <polygon points={`${section2End-10},${measurementLineY-5} ${section2End-10},${measurementLineY+5} ${section2End+5},${measurementLineY}`} fill="#000" />
      <polygon points={`${section1End+10},${measurementLineY-5} ${section1End+10},${measurementLineY+5} ${section1End-5},${measurementLineY}`} fill="#000" />

      {/* 7. Section 3 Width - Shows actual width value */}
      <text
        x={section2End + section3Width / 2}
        y={measurementTextY}
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        {mmToInches(activeDimensions.width)} in
      </text>
      {/* Arrow for Section 3 */}
      <line x1={section2End} y1={measurementLineY} x2={section3End} y2={measurementLineY} stroke="#000" strokeWidth="1" />
      <polygon points={`${section3End-10},${measurementLineY-5} ${section3End-10},${measurementLineY+5} ${section3End+5},${measurementLineY}`} fill="#000" />
      <polygon points={`${section2End+10},${measurementLineY-5} ${section2End+10},${measurementLineY+5} ${section2End-5},${measurementLineY}`} fill="#000" />

      {/* 8. Section 4 Width - Shows actual length value */}
      <text
        x={section3End + section4Width / 2}
        y={measurementTextY}
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        {mmToInches(activeDimensions.length)} in
      </text>
      {/* Arrow for Section 4 */}
      <line x1={section3End} y1={measurementLineY} x2={50 + totalWidth} y2={measurementLineY} stroke="#000" strokeWidth="1" />
      <polygon points={`${50 + totalWidth-15},${measurementLineY-5} ${50 + totalWidth-15},${measurementLineY+5} ${50 + totalWidth},${measurementLineY}`} fill="#000" />
      <polygon points={`${section3End+10},${measurementLineY-5} ${section3End+10},${measurementLineY+5} ${section3End-5},${measurementLineY}`} fill="#000" />
    </svg>
  );
};

export default BagBlueprint;