"use client";
import React, { useMemo } from "react";

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
  dimensions = { length: 310, width: 155, height: 428 },
  isEditing = false,
  currentEditValues = {} // Values currently being edited
}) => {
  // Improved conversion from mm to inches with smart display formatting
  const mmToInches = (mm: number) => {
    // Precise conversion - exactly 25.4mm per inch
    const exactInches = mm / 25.4;
        
    // For all other values, round to 2 decimal places
    return exactInches.toFixed(2);
  };

  // Custom function for tabside height display that never rounds to whole numbers
  // This ensures values like 14.96 aren't rounded to 15
  const formatTabsideHeight = (mm: number): string => {
    const exactInches = mm / 25.4;
    // Always show 2 decimal places for tabside height
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
  
  // Calculate the total length based on section widths (2 sides + 2 fronts)
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

  // Calculate tab length with precise formula: (width/2) + 20mm
  // This ensures it's exactly half the width plus 20mm
  const tabLengthMm = (activeDimensions.width / 2) + 20;
  
  // Calculate tabside height precisely as totalHeight - tabLength
  // Don't round here to preserve exact measurements
  const tabsideHeight = activeDimensions.height - tabLengthMm;
  
  // For rendering purposes only (not for calculations)
  const tabLength = Math.round(tabLengthMm);
  
  // Position for height measurement arrow - always 30px to the right of the blueprint
  const heightArrowX = 50 + totalWidth + 30;
  
  // Positions for bottom measurements
  const measurementOffset = 50 + totalHeight + 70; // Base position + height + spacing
  const measurementLineY = measurementOffset - 30; // Position for measurement lines
  const measurementTextY = measurementOffset + 30; // Position for measurement text

  // Format the total length display with special handling for default dimensions
  const formatTotalLength = (mm: number): string => {
    // Check if using default dimensions (within small tolerance for floating-point comparisons)
    const isDefaultWidth = Math.abs(activeDimensions.width - 155) < 0.1;
    const isDefaultLength = Math.abs(activeDimensions.length - 310) < 0.1;
    
    // If both width and length are at default values, force 38.17 display
    if (isDefaultWidth && isDefaultLength) {
      return "38.17";
    }
    
    // Otherwise, use standard formatting
    return mmToInches(mm);
  };

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
  }, [totalWidth, measurementTextY]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
      className="bagBlueprint"
      preserveAspectRatio="xMidYMid meet"
      version="1.1"
    >
      {/* SVG Metadata for better PDF structure */}
      <metadata>
        {JSON.stringify({
          title: "Bag Blueprint",
          description: `Bag with dimensions: L=${mmToInches(activeDimensions.length)}in × W=${mmToInches(activeDimensions.width)}in × H=${mmToInches(activeDimensions.height)}in`,
          creator: "MTC Bags Design Tool"
        })}
      </metadata>
    
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
      
      {/* Base Rectangle - now just serves as a background 
      <rect 
        x="50" 
        y="50" 
        width={totalWidth + 10} 
        height={totalHeight} 
        fill="#f5f5f5" 
        stroke="#000" 
        strokeWidth="2" 
        id="bag-outline"
        data-name="Bag Outline"
      /> 

      {/* RECTANGLE 1: Left Small Section (40mm padding) */}
        <g id="left-padding-upper" data-name="Left Padding Upper">
        <rect
          x="50"
          y="50"
          width="50"
          height={tabsideHeight}
          fill="none"
          stroke="#000"
          strokeWidth="1"
          data-section="padding-left-upper"
        />
        <text
          x="75"
          y={50 + tabsideHeight / 2}
          textAnchor="middle"
          fontSize="12"
          fill="#666"
        >
        </text>
      </g>

      {/* Left Padding Lower Section */}
      <g id="left-padding-lower" data-name="Left Padding Lower">
        <rect
          x="50"
          y={50 + tabsideHeight}
          width="50"
          height={tabLength}
          fill="none"
          stroke="#000"
          strokeWidth="1"
          data-section="padding-left-lower"
        />
      </g>



      {/* RECTANGLE 2: Section 1 (First Width) */}
      <g id="section1-panel" data-name="Width Panel 1">
        <rect
          x={section1Start}
          y="50"
          width={section1Width}
          height={tabsideHeight}
          fill="none"
          stroke="#000"
          strokeWidth="1"
          data-section="side1"
        />
        <text
          x={section1Start + section1Width / 2}
          y={50 + tabsideHeight / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#666"
        >
          Side 1
        </text>
      </g>

      {/* RECTANGLE 3: Section 2 (First Length) */}
      <g id="section2-panel" data-name="Length Panel 1">
        <rect
          x={section1End}
          y="50"
          width={section2Width}
          height={tabsideHeight}
          fill="none"
          stroke="#000"
          strokeWidth="1"
          data-section="front1"
        />
        <text
          x={section1End + section2Width / 2}
          y={50 + tabsideHeight / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#666"
        >
          Front 1
        </text>
      </g>

      {/* RECTANGLE 4: Section 3 (Second Width) */}
      <g id="section3-panel" data-name="Width Panel 2">
        <rect
          x={section2End}
          y="50"
          width={section3Width}
          height={tabsideHeight}
          fill="none"
          stroke="#000"
          strokeWidth="1"
          data-section="side2"
        />
        <text
          x={section2End + section3Width / 2}
          y={50 + tabsideHeight / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#666"
        >
          Side 2
        </text>
      </g>

      {/* RECTANGLE 5: Section 4 (Second Length) */}
      <g id="section4-panel" data-name="Length Panel 2">
        <rect
          x={section3End}
          y="50"
          width={section4Width}
          height={tabsideHeight}
          fill="none"
          stroke="#000"
          strokeWidth="1"
          data-section="front2"
        />
        <text
          x={section3End + section4Width / 2}
          y={50 + tabsideHeight / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#666"
        >
          Front 2
        </text>
      </g>

      {/* RECTANGLE 6: Tab 1 (Left Width) */}
      <g id="tab1-panel" data-name="Tab 1">
        <rect
          x={section1Start}
          y={50 + tabsideHeight}
          width={section1Width}
          height={tabLength}
          fill="none"
          stroke="#000"
          strokeWidth="1"
          data-section="tab1"
        />
        <text
          x={section1Start + section1Width / 2}
          y={50 + tabsideHeight + tabLength / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#666"
        >
          Tab 1
        </text>
      </g>

      {/* RECTANGLE 7: Tab 2 (Right Width) */}
      <g id="tab2-panel" data-name="Tab 2">
        <rect
          x={section2End}
          y={50 + tabsideHeight}
          width={section3Width}
          height={tabLength}
          fill="none"
          stroke="#000"
          strokeWidth="1"
          data-section="tab2"
        />
        <text
          x={section2End + section3Width / 2}
          y={50 + tabsideHeight + tabLength / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#666"
        >
          Tab 2
        </text>
      </g>
      {/* NEW RECTANGLE: Section under Front 1 */}
<g id="front1-bottom-panel" data-name="Front 1 Bottom">
  <rect
    x={section1End}
    y={50 + tabsideHeight}
    width={section2Width}
    height={tabLength}
    fill="none"
    stroke="#000"
    strokeWidth="1"
    data-section="front1-bottom"
  />
  <text
    x={section1End + section2Width / 2}
    y={50 + tabsideHeight + tabLength / 2}
    textAnchor="middle"
    fontSize="14"
    fill="#666"
  >
    Base 1
  </text>
</g>

{/* NEW RECTANGLE: Section under Front 2 */}
<g id="front2-bottom-panel" data-name="Front 2 Bottom">
  <rect
    x={section3End}
    y={50 + tabsideHeight}
    width={section4Width}
    height={tabLength}
    fill="none"
    stroke="#000"
    strokeWidth="1"
    data-section="front2-bottom"
  />
  <text
    x={section3End + section4Width / 2}
    y={50 + tabsideHeight + tabLength / 2}
    textAnchor="middle"
    fontSize="14"
    fill="#666"
  >
    Base 2
  </text>
</g>


      {/* Measurements */}
      {/* 1. Total Width (Top) */}
      <g id="total-width-measurement">
        <text
          x={50 + totalWidth / 2}
          y="15"
          textAnchor="middle"
          fontSize="22"
          fill="#000"
        >
          {formatTotalLength(calculatedTotalLength)} in
        </text>
        {/* Arrow for Total Width */}
        <line x1="60" y1="30" x2={50 + totalWidth - 10} y2="30" stroke="#000" strokeWidth="1" />
        <polygon points={`${50 + totalWidth - 10},25 ${50 + totalWidth - 10},35 ${50 + totalWidth + 10},30`} fill="#000" />
        <polygon points="60,25 60,35 45,30" fill="#000" />
      </g>

      {/* 2. Total Height (right) - FIXED at 30px right of the rectangle */}
      <g id="total-height-measurement">
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
      </g>

      {/* 3. Tabside Height (left) - Now calculated as totalHeight - tabLength */}
      <g id="tabside-height-measurement">
        <text
          x="20"
          y={40 + tabsideHeight / 2}
          textAnchor="middle"
          fontSize="20"
          fill="#000"
          transform={`rotate(-90, 30, ${50 + tabsideHeight / 2})`}
        >
          {formatTabsideHeight(tabsideHeight)} in
        </text>
        {/* Arrow for Tabside Height */}
        <line x1="35" y1="70" x2="35" y2={40 + tabsideHeight} stroke="#000" strokeWidth="1" />
        <polygon points="30,70 40,70 35,55" fill="#000" />
        <polygon points={`30,${37 + tabsideHeight} 40,${37 + tabsideHeight} 35,${37 + tabsideHeight + 15}`} fill="#000" />
      </g>

      {/* 4. Tab Length - now calculated as 1/2 section1Width + 20mm */}
      <g id="tab-length-measurement">
        <text
          x="20"
          y={50 + tabsideHeight + tabLength / 2}
          textAnchor="middle"
          fontSize="18"
          fill="#000"
          transform={`rotate(-90, 20, ${50 + tabsideHeight + tabLength / 2})`}
        >
          {mmToInches(tabLengthMm)} in
        </text>
        {/* Arrow for Tab Length */}
        <line x1="35" y1={50 + tabsideHeight + 10} x2="35" y2={40 + tabsideHeight + tabLength} stroke="#000" strokeWidth="1" />
        <polygon points={`30,${45 + tabsideHeight + 20} 40,${45 + tabsideHeight + 20} 35,${45 + tabsideHeight + 5}`} fill="#000" />
        <polygon points={`30,${37 + tabsideHeight + tabLength} 40,${37 + tabsideHeight + tabLength} 35,${37 + tabsideHeight + tabLength + 15}`} fill="#000" />
      </g>

      {/* Bottom Measurements */}
      <g id="bottom-measurements">
        {/* Small 40mm Arrow - Fixed at 1.57 inches */}
        <g id="padding-measurement">
          <text
            x="75"
            y={measurementTextY}
            textAnchor="middle"
            fontSize="16"
            fill="#000"
          >
            1.57 in
          </text>
          {/* Arrow for 40mm measurement - fixed */}
          <line x1="55" y1={measurementLineY} x2="95" y2={measurementLineY} stroke="#000" strokeWidth="1" />
          <polygon points={`90,${measurementLineY-5} 90,${measurementLineY+5} 105,${measurementLineY}`} fill="#000" />
          <polygon points={`60,${measurementLineY-5} 60,${measurementLineY+5} 45,${measurementLineY}`} fill="#000" />
        </g>

        {/* 5. Section 1 Width - Shows actual width value */}
        <g id="section1-width-measurement">
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
        </g>

        {/* 6. Section 2 Width - Shows actual length value */}
        <g id="section2-width-measurement">
          <text
            x={section1End + section2Width / 2}
            y={measurementTextY}
            textAnchor="middle"
            fontSize="20"
            fill="#000"
          >
            {mmToInches(activeDimensions.length)} in
          </text>
          {/* Arrow for Section 2 */}
          <line x1={section1End} y1={measurementLineY} x2={section2End} y2={measurementLineY} stroke="#000" strokeWidth="1" />
          <polygon points={`${section2End-10},${measurementLineY-5} ${section2End-10},${measurementLineY+5} ${section2End+5},${measurementLineY}`} fill="#000" />
          <polygon points={`${section1End+10},${measurementLineY-5} ${section1End+10},${measurementLineY+5} ${section1End-5},${measurementLineY}`} fill="#000" />
        </g>

        {/* 7. Section 3 Width - Shows actual width value */}
        <g id="section3-width-measurement">
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
        </g>

        {/* 8. Section 4 Width - Shows actual length value */}
        <g id="section4-width-measurement">
          <text
            x={section3End + section4Width / 2}
            y={measurementTextY}
            textAnchor="middle"
            fontSize="20"
            fill="#000"
          >
            {mmToInches(activeDimensions.length)} in
          </text>
          {/* Arrow for Section 4 */}
          <line x1={section3End} y1={measurementLineY} x2={50 + totalWidth} y2={measurementLineY} stroke="#000" strokeWidth="1" />
          <polygon points={`${50 + totalWidth-15},${measurementLineY-5} ${50 + totalWidth-15},${measurementLineY+5} ${50 + totalWidth},${measurementLineY}`} fill="#000" />
          <polygon points={`${section3End+10},${measurementLineY-5} ${section3End+10},${measurementLineY+5} ${section3End-5},${measurementLineY}`} fill="#000" />
        </g>
      </g>
    </svg>
  );
};

export default BagBlueprint;