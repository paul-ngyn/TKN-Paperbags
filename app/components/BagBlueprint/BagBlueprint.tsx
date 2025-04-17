"use client";
import React from "react";
import styles from "./BagBlueprint.module.css";

interface BagBlueprintProps {
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

const BagBlueprint: React.FC<BagBlueprintProps> = ({ 
  dimensions = { length: 990, width: 310, height: 428 } 
}) => {
  // Calculate scaled dimensions
  const totalWidth = dimensions.length + 20; // Adding padding to match original
  const totalHeight = dimensions.height;
  
  // Original values
  const originalWidth = 990;
  const originalHeight = 428;
  
  // Calculate scale factors
  const widthScale = totalWidth / 1010; // Original rectangle width
  const heightScale = totalHeight / 600; // Original rectangle height
  
  // Section measurements - maintaining proportions while keeping pairs equal
  const section1Width = Math.round(165 * widthScale);
  const section2Width = Math.round(310 * widthScale);
  const section3Width = section1Width; // Keep equal to section1
  const section4Width = section2Width; // Keep equal to section2
  
  // Calculate positions
  const leftMargin = 50;
  const section1Start = 100;
  const section1End = section1Start + section1Width;
  const section2End = section1End + section2Width;
  const section3End = section2End + section3Width;
  const section4End = section3End + section4Width;
  
  // Calculate heights
  const tabsideHeight = Math.round(450 * heightScale);
  const tabLength = Math.round(110 * heightScale);
  
  // Calculate fold line positions
  const foldLine1 = Math.round((section1Start + section1Width/2 + 35) * widthScale);
  const foldLine2 = Math.round(665 * widthScale);
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-25 -60 1170 900"
      className={styles.bagBlueprint}
    >
      {/* Base Rectangle */}
      <rect x="50" y="50" width={totalWidth} height={totalHeight} fill="#f5f5f5" stroke="#000" strokeWidth="2" />

      {/* Vertical Lines */}
      <line x1={section1Start} y1="50" x2={section1Start} y2={50 + totalHeight} stroke="#000" strokeWidth="1" />
      <line x1={section1End} y1="50" x2={section1End} y2={50 + totalHeight} stroke="#000" strokeWidth="1" />
      <line x1={section2End} y1="50" x2={section2End} y2={50 + totalHeight} stroke="#000" strokeWidth="1" />
      <line x1={section3End} y1="50" x2={section3End} y2={50 + totalHeight} stroke="#000" strokeWidth="1" />

      {/* Horizontal Lines */}
      <line x1="50" y1={50 + tabsideHeight} x2={50 + totalWidth} y2={50 + tabsideHeight} stroke="#000" strokeWidth="1" />

      {/* Fold Lines */}
      <line x1={foldLine1} y1="50" x2={foldLine1} y2={50 + totalHeight} stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1={foldLine1} y1={50 + totalHeight * 0.58} x2={section1End + section2Width * 0.4} y2={50 + totalHeight} stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1={foldLine2} y1={50 + totalHeight * 0.58} x2={section2End - section2Width * 0.4} y2={50 + totalHeight} stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1={foldLine2} y1="50" x2={foldLine2} y2={50 + totalHeight} stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1={foldLine2} y1={50 + totalHeight * 0.58} x2={section3End + section4Width * 0.4} y2={50 + totalHeight} stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1={50 + totalWidth} y1={50 + tabsideHeight} x2={section4End - section4Width * 0.18} y2={50 + totalHeight} stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1={section1Start} y1={50 + totalHeight * 0.58} x2={foldLine1} y2={50 + totalHeight * 0.58} stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1={section1Start} y1={50 + tabsideHeight} x2={foldLine1} y2={50 + totalHeight * 0.58} stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1={foldLine2} y1={50 + totalHeight * 0.58} x2={50 + totalWidth} y2={50 + totalHeight * 0.58} stroke="#000" strokeWidth="1" strokeDasharray="3,2" />

      {/* Measurements */}
      {/* 1. Total Width (Top) */}
      <text
        x={50 + totalWidth / 2}
        y="5"
        textAnchor="middle"
        fontSize="22"
        fill="#000"
      >
        {dimensions.length} mm
      </text>
      {/* Arrow for Total Width */}
      <line x1="60" y1="20" x2={50 + totalWidth - 10} y2="20" stroke="#000" strokeWidth="1" />
      <polygon points={`${50 + totalWidth - 10},15 ${50 + totalWidth - 10},25 ${50 + totalWidth + 10},20`} fill="#000" />
      <polygon points="60,15 60,25 45,20" fill="#000" />

      {/* 2. Total Height (right) */}
      <text
        x="1120"
        y={50 + totalHeight / 2}
        textAnchor="middle"
        fontSize="20"
        fill="#000"
        transform={`rotate(-270, 1120, ${50 + totalHeight / 2})`}
      >
        {dimensions.height} mm
      </text>
      {/* Arrow for Total Height */}
      <line x1="1100" y1="50" x2="1100" y2={50 + totalHeight} stroke="#000" strokeWidth="1" />
      <polygon points="1095,65 1105,65 1100,50" fill="#000" />
      <polygon points={`1095,${50 + totalHeight - 15} 1105,${50 + totalHeight - 15} 1100,${50 + totalHeight}`} fill="#000" />

      {/* 3. Tabside Height (left) */}
      <text
        x="30"
        y={50 + tabsideHeight / 2}
        textAnchor="middle"
        fontSize="20"
        fill="#000"
        transform={`rotate(-90, 30, ${50 + tabsideHeight / 2})`}
      >
        {tabsideHeight} mm
      </text>
      {/* Arrow for Tabside Height */}
      <line x1="35" y1="70" x2="35" y2={50 + tabsideHeight} stroke="#000" strokeWidth="1" />
      <polygon points="30,70 40,70 35,55" fill="#000" />
      <polygon points={`30,${50 + tabsideHeight} 40,${50 + tabsideHeight} 35,${50 + tabsideHeight + 15}`} fill="#000" />

      {/* 4. Tab Length */}
      <text
        x="0"
        y="142"
        textAnchor="middle"
        fontSize="20"
        fill="#000"
        transform={`rotate(-90, 220, 350)`}
      >
        {tabLength} mm
      </text>
      {/* Arrow for Tab Length */}
      <line x1="35" y1={50 + tabsideHeight + 20} x2="35" y2={50 + tabsideHeight + tabLength} stroke="#000" strokeWidth="1" />
      <polygon points={`30,${50 + tabsideHeight + 20} 40,${50 + tabsideHeight + 20} 35,${50 + tabsideHeight + 5}`} fill="#000" />
      <polygon points={`30,${50 + tabsideHeight + tabLength} 40,${50 + tabsideHeight + tabLength} 35,${50 + tabsideHeight + tabLength + 15}`} fill="#000" />

      {/* Small 40mm Arrow (Tab Bottom Section) - FIXED at 40mm regardless of scaling */}
      <text
        x="75"
        y="720"
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        40 mm
      </text>
      {/* Arrow for 40mm measurement - fixed */}
      <line x1="55" y1="680" x2="95" y2="680" stroke="#000" strokeWidth="1" />
      <polygon points="90,675 90,685 105,680" fill="#000" />
      <polygon points="60,675 60,685 50,680" fill="#000" />

      {/* 5. Section 1 Width */}
      <text
        x={section1Start + section1Width / 2}
        y="720"
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        {section1Width} mm
      </text>
      {/* Arrow for Section 1 */}
      <line x1={section1Start} y1="680" x2={section1End} y2="680" stroke="#000" strokeWidth="1" />
      <polygon points={`${section1End - 10},675 ${section1End - 10},685 ${section1End + 5},680`} fill="#000" />
      <polygon points={`${section1Start + 10},675 ${section1Start + 10},685 ${section1Start - 5},680`} fill="#000" />

      {/* 6. Section 2 Width */}
      <text
        x={section1End + section2Width / 2}
        y="720"
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        {section2Width} mm
      </text>
      {/* Arrow for Section 2 */}
      <line x1={section1End} y1="680" x2={section2End} y2="680" stroke="#000" strokeWidth="1" />
      <polygon points={`${section2End - 10},675 ${section2End - 10},685 ${section2End + 5},680`} fill="#000" />
      <polygon points={`${section1End + 10},675 ${section1End + 10},685 ${section1End - 5},680`} fill="#000" />

      {/* 7. Section 3 Width */}
      <text
        x={section2End + section3Width / 2}
        y="720"
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        {section3Width} mm
      </text>
      {/* Arrow for Section 3 */}
      <line x1={section2End} y1="680" x2={section3End} y2="680" stroke="#000" strokeWidth="1" />
      <polygon points={`${section3End - 10},675 ${section3End - 10},685 ${section3End + 5},680`} fill="#000" />
      <polygon points={`${section2End + 10},675 ${section2End + 10},685 ${section2End - 5},680`} fill="#000" />

      {/* 8. Section 4 Width */}
      <text
        x={section3End + section4Width / 2}
        y="720"
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        {section4Width} mm
      </text>
      {/* Arrow for Section 4 */}
      <line x1={section3End} y1="680" x2={50 + totalWidth} y2="680" stroke="#000" strokeWidth="1" />
      <polygon points={`${50 + totalWidth - 15},675 ${50 + totalWidth - 15},685 ${50 + totalWidth},680`} fill="#000" />
      <polygon points={`${section3End + 10},675 ${section3End + 10},685 ${section3End - 5},680`} fill="#000" />
    </svg>
  );
};

export default BagBlueprint;