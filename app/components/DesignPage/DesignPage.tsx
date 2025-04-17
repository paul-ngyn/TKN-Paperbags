"use client";

import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import styles from "./DesignPage.module.css";
import Sidebar from "../Sidebar/Sidebar";
import resizeIcon from "../../public/resize.png"; // Import the resize icon
import Image from "next/image";

interface DesignPageProps {
  handleNavigation?: (page: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DesignPage: React.FC<DesignPageProps> = ({ handleNavigation }) => {
  const [logo, setLogo] = useState<string | null>(null);
  const [draggable, setDraggable] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const rndRef = useRef<Rnd>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (files: FileList) => {
    const file = files[0];
    if (file?.type === "image/png") {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target) setLogo(event.target.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid PNG file.");
    }
  };

  const toggleDragMode = () => {
    const nextState = !draggable;
    setDraggable(nextState);
    setIsActive(nextState);
  };

  const disableDrag = () => {
    setDraggable(false);
    setIsActive(false);
  };

  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (isActive && imageRef.current && !imageRef.current.contains(ev.target as Node)) {
        disableDrag();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActive]);

  const handleClear = () => {
    setLogo(null);
    disableDrag();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar
        handleLogoUpload={handleLogoUpload}
        handleClear={handleClear}
        fileInputRef={fileInputRef}
      />
      <div className={styles.bagContainer}>
        {/* Single Scalable Blueprint */}
        <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="-60 -10 1200 900"
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
  <line x1="185" y1="50" x2="185" y2="650" stroke="#000" strokeWidth="1" stroke-dasharray="3,2" />
  <line x1="185" y1="400" x2="385" y2="650" stroke="#000" strokeWidth="1" stroke-dasharray="3,2" />
  <line x1="665" y1="400" x2="450" y2="650" stroke="#000" strokeWidth="1" stroke-dasharray="3,2" />
  <line x1="665" y1="50" x2="665" y2="650" stroke="#000" strokeWidth="1" stroke-dasharray="3,2" />
  <line x1="665" y1="400" x2="875" y2="650" stroke="#000" strokeWidth="1" stroke-dasharray="3,2" />
  <line x1="1060" y1="500" x2="950" y2="650" stroke="#000" strokeWidth="1" stroke-dasharray="3,2" />
  <line x1="100" y1="400" x2="185" y2="400" stroke="#000" strokeWidth="1" stroke-dasharray="3,2" />
  <line x1="100" y1="500" x2="185" y2="400" stroke="#000" strokeWidth="1" stroke-dasharray="3,2" />
  <line x1="665" y1="400" x2="1060" y2="400" stroke="#000" strokeWidth="1" stroke-dasharray="3,2" />

  {/* Measurements */}
  {/* 1. Total Width (Top) */}
  <text
    x="562.5" /* Center of the rectangle (50 + 1025 / 2) */
    y="40" /* Slightly above the rectangle */
    textAnchor="middle"
    fontSize="22"
    fill="#000"
  >
    1025 mm
  </text>
  {/* Arrow for Total Width */}
  <line x1="50" y1="20" x2="1075" y2="20" stroke="#000" strokeWidth="1" />
  <polygon points="1075,15 1075,25 1090,20" fill="#000" /> {/* Right arrowhead */}
  <polygon points="50,15 50,25 35,20" fill="#000" /> {/* Left arrowhead */}

  {/* 2. Total Height (right) */}
  <text
  x="1120"  /* Position text to the right of the rectangle */
  y="350"   /* Center of the rectangle height (50 + 600 / 2) */
  textAnchor="middle"
  fontSize="20"
  fill="#000"
  transform="rotate(-270, 1120, 350)" /* Rotate for vertical text */
>
  600 mm
  </text>
  {/* Arrow for Total Height */}
  <line x1="1100" y1="50" x2="1100" y2="650" stroke="#000" strokeWidth="1" />
  <polygon points="1095,50 1105,50 1100,35" fill="#000" /> {/* Top arrowhead */}
  <polygon points="1095,650 1105,650 1100,665" fill="#000" /> {/* Bottom arrowhead */}

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
  <line x1="15" y1="70" x2="15" y2="500" stroke="#000" strokeWidth="1" />
  <polygon points="10,70 20,70 15,55" fill="#000" /> {/* Top arrowhead */}
  <polygon points="10,500 20,500 15,515" fill="#000" /> {/* Bottom arrowhead */}

  {/* Tab Length */}
  <text
  x="0"  /* Position text centered below the tab */
  y="142"  /* Position text below the tab area */
  textAnchor="middle"
  fontSize="20"
  fill="#000"
  transform="rotate(-90, 220, 350)" /* Rotate for vertical text */
>
    150 mm
  </text>
  {/* Arrow for Tab Length */}
  {/* Arrow for Tab Length */}
<line x1="35" y1="520" x2="35" y2="630" stroke="#000" strokeWidth="1" />
<polygon points="30,520 40,520 35,505" fill="#000" /> {/* Top arrowhead */}
<polygon points="30,630 40,630 35,645" fill="#000" /> {/* Bottom arrowhead */}

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
  <polygon points="265,675 265,685 280,680" fill="#000" /> {/* Right arrowhead */}
  <polygon points="100,675 100,685 85,680" fill="#000" /> {/* Left arrowhead */}

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
  <polygon points="575,675 575,685 590,680" fill="#000" /> {/* Right arrowhead */}
  <polygon points="265,675 265,685 250,680" fill="#000" /> {/* Left arrowhead */}

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
  <polygon points="750,675 750,685 765,680" fill="#000" /> {/* Right arrowhead */}
  <polygon points="575,675 575,685 560,680" fill="#000" /> {/* Left arrowhead */}

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
  <line x1="750" y1="680" x2="1075" y2="680" stroke="#000" strokeWidth="1" />
  <polygon points="1075,675 1075,685 1090,680" fill="#000" /> {/* Right arrowhead */}
  <polygon points="750,675 750,685 735,680" fill="#000" /> {/* Left arrowhead */}
</svg>
        {logo && (
          <Rnd
            default={{ x: 50, y: 50, width: 150, height: 150 }}
            bounds="parent"
            disableDragging={!draggable}
            enableResizing={{ bottomRight: true }}
            onDragStop={disableDrag}
            onResizeStop={disableDrag}
            ref={rndRef}
          >
            <div
              style={{ width: "100%", height: "100%", position: "relative" }}
              onClick={toggleDragMode}
              className={`${styles.logoOverlay} ${isActive ? styles.active : ""}`}
            >
              <img
                src={logo}
                alt="Uploaded Logo"
                ref={imageRef}
                style={{ width: "100%", height: "100%" }}
              />
                {isActive && (
                <div className={styles.customResizeHandle}>
                  <Image
                    src={resizeIcon}
                    alt="Resize Handle"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              )}
            </div>
          </Rnd>
        )}
      </div>
    </div>
  );
};

export default DesignPage;