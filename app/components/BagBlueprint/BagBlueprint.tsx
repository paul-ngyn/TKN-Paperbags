
"use client";
import React from "react";
import styles from "./BagBlueprint.module.css";

const BagBlueprint: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-35 -60 1180 900"
      className={styles.bagBlueprint}
    >
      {/* Base Rectangle */}
      <rect x="50" y="50" width="1010" height="600" fill="#f5f5f5" stroke="#000" strokeWidth="2" />

      {/* Vertical Lines */}
      <line x1="100" y1="50" x2="100" y2="650" stroke="#000" strokeWidth="1" />
      <line x1="265" y1="50" x2="265" y2="650" stroke="#000" strokeWidth="1" />
      <line x1="575" y1="50" x2="575" y2="650" stroke="#000" strokeWidth="1" />
      <line x1="750" y1="50" x2="750" y2="650" stroke="#000" strokeWidth="1" />
      <line x1="50" y1="500" x2="1060" y2="500" stroke="#000" strokeWidth="1" />

      {/* Fold Lines */}
      <line x1="185" y1="50" x2="185" y2="650" stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1="185" y1="400" x2="385" y2="650" stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1="665" y1="400" x2="450" y2="650" stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1="665" y1="50" x2="665" y2="650" stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1="665" y1="400" x2="875" y2="650" stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1="1060" y1="500" x2="950" y2="650" stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1="100" y1="400" x2="185" y2="400" stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1="100" y1="500" x2="185" y2="400" stroke="#000" strokeWidth="1" strokeDasharray="3,2" />
      <line x1="665" y1="400" x2="1060" y2="400" stroke="#000" strokeWidth="1" strokeDasharray="3,2" />

      {/* Measurements */}
      {/* 1. Total Width (Top) */}
      <text
        x="562.5" /* Center of the rectangle (50 + 1025 / 2) */
        y="40" /* Slightly above the rectangle */
        textAnchor="middle"
        fontSize="22"
        fill="#000"
      >
        990 mm
      </text>
      {/* Arrow for Total Width */}
      <line x1="60" y1="20" x2="1040" y2="20" stroke="#000" strokeWidth="1" />
      <polygon points="1040,15 1040,25 1060,20" fill="#000" /> {/* Right arrowhead */}
      <polygon points="60,15 60,25 45,20" fill="#000" /> {/* Left arrowhead */}

      {/* 2. Total Height (right) */}
      <text
        x="1120"  /* Position text to the right of the rectangle */
        y="350"   /* Center of the rectangle height (50 + 600 / 2) */
        textAnchor="middle"
        fontSize="20"
        fill="#000"
        transform="rotate(-270, 1120, 350)" /* Rotate for vertical text */
      >
        428 mm
      </text>
      {/* Arrow for Total Height */}
      <line x1="1100" y1="50" x2="1100" y2="650" stroke="#000" strokeWidth="1" />
      <polygon points="1095,65 1105,65 1100,50" fill="#000" /> {/* Top arrowhead */}
      <polygon points="1095,635 1105,635 1100,650" fill="#000" /> {/* Bottom arrowhead */}

      {/* 2. Tabside Height (left) */}
      <text
        x="30"  /* Position text to the left of the rectangle */
        y="330"  /* Center of the rectangle height (50 + 600 / 2) */
        textAnchor="middle"
        fontSize="20"
        fill="#000"
        transform="rotate(-90, 30, 350)" /* Rotate for vertical text */
      >
        330 mm
      </text>
      {/* Arrow for Tabside Height */}
      <line x1="35" y1="70" x2="35" y2="500" stroke="#000" strokeWidth="1" />
      <polygon points="30,70 40,70 35,55" fill="#000"/> {/* Top arrowhead */}
      <polygon points="30,485 40,485 35,505" fill="#000" /> {/* Bottom arrowhead */}

      {/* Tab Length */}
      <text
        x="0"  /* Position text centered below the tab */
        y="142"  /* Position text below the tab area */
        textAnchor="middle"
        fontSize="20"
        fill="#000"
        transform="rotate(-90, 220, 350)" /* Rotate for vertical text */
      >
        98 mm
      </text>
      {/* Arrow for Tab Length */}
      <line x1="35" y1="520" x2="35" y2="630" stroke="#000" strokeWidth="1" />
      <polygon points="30,520 40,520 35,505" fill="#000" /> {/* Top arrowhead */}
      <polygon points="30,630 40,630 35,645" fill="#000" /> {/* Bottom arrowhead */}

        {/* Small 40mm Arrow (Tab Bottom Section) */}
        <text
        x="75" /* Position within Section 1 */
        y="720" /* Position above the main bottom measurements */
        textAnchor="middle"
        fontSize="18"
        fill="#000"
        >
        40 mm
        </text>
        {/* Arrow for 40mm measurement */}
        <line x1="55" y1="680" x2="95" y2="680" stroke="#000" strokeWidth="1" />
        <polygon points="90,675 90,685 105,680" fill="#000" /> {/* Right arrowhead */}
        <polygon points="60,675 60,685 50,680" fill="#000" /> {/* Left arrowhead */}


      {/* 3. Section 1 Width */}
      <text
        x="182.5" /* Midpoint between x1=100 and x1=265 */
        y="720" /* Slightly below the rectangle */
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        165 mm
      </text>
      {/* Arrow for Section 1 */}
      <line x1="100" y1="680" x2="265" y2="680" stroke="#000" strokeWidth="1" />
      <polygon points="255,675 255,685 270,680" fill="#000" /> {/* Right arrowhead */}
      <polygon points="110,675 110,685 95,680" fill="#000" /> {/* Left arrowhead */}

      {/* 4. Section 2 Width */}
      <text
        x="420" /* Midpoint between x1=265 and x1=575 */
        y="720" /* Slightly below the rectangle */
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        310 mm
      </text>
      {/* Arrow for Section 2 */}
      <line x1="265" y1="680" x2="575" y2="680" stroke="#000" strokeWidth="1" />
      <polygon points="565,675 565,685 580,680" fill="#000" /> {/* Right arrowhead */}
      <polygon points="280,675 280,685 265,680" fill="#000" /> {/* Left arrowhead */}

      {/* 5. Section 3 Width */}
      <text
        x="664.5" /* Midpoint between x1=575 and x1=750 */
        y="720" /* Slightly below the rectangle */
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        165 mm
      </text>
      {/* Arrow for Section 3 */}
      <line x1="575" y1="680" x2="750" y2="680" stroke="#000" strokeWidth="1" />
      <polygon points="740,675 740,685 755,680" fill="#000" /> {/* Right arrowhead */}
      <polygon points="590,675 590,685 575,680" fill="#000" /> {/* Left arrowhead */}

      {/* 6. Section 4 Width */}
      <text
        x="912.5" /* Midpoint between x1=750 and x1=1060 */
        y="720" /* Slightly below the rectangle */
        textAnchor="middle"
        fontSize="18"
        fill="#000"
      >
        310 mm
      </text>
      {/* Arrow for Section 4 */}
      <line x1="750" y1="680" x2="1065" y2="680" stroke="#000" strokeWidth="1" />
      <polygon points="1050,675 1050,685 1065,680" fill="#000" /> {/* Right arrowhead */}
      <polygon points="760,675 760,685 745,680" fill="#000" /> {/* Left arrowhead */}
    </svg>
  );
};

export default BagBlueprint;