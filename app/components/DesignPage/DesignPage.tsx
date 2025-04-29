"use client";
import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import Sidebar from "../Sidebar/Sidebar";
import BagBlueprint from "../BagBlueprint/BagBlueprint";
import styles from "./DesignPage.module.css";
import resizeIcon from "../../public/resize.png";
import Image from "next/image";
import jsPDF from "jspdf";
import {svg2pdf} from "svg2pdf.js";

interface DesignPageProps {
  handleNavigation: (page: string) => void;
}

// Define the BagDimensions interface
interface BagDimensions {
  length: number;
  width: number;
  height: number;
}

interface Logo {
  id: string;
  src: string;
  position: { x: number, y: number };
  size: { width: number, height: number };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DesignPage: React.FC<DesignPageProps> = ({ handleNavigation }) => {
  // Change to array of Logo objects
  const [logos, setLogos] = useState<Logo[]>([]);
  const [activeLogoId, setActiveLogoId] = useState<string | null>(null);
  const [draggable, setDraggable] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoRefs = useRef<Map<string, React.RefObject<Rnd>>>(new Map());
  const bagContainerRef = useRef<HTMLDivElement>(null);
  
  // Add state for bag dimensions
  const [dimensions, setDimensions] = useState<BagDimensions>({
    length: 310,
    width: 155,
    height: 428
  });
  
  // Add state to track if dimensions are being edited
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  
  // Generate PDF function
  // Update the generatePDF function to preserve logo positions

  const generatePDF = async () => {
  console.log("Starting physically accurate PDF generation...");

  try {
    const { length, width, height } = dimensions;

    // Actual bag dimensions in mm (length = width of PDF)
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [length, height],
      compress: false,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();


    // Get SVG element
    const bagBlueprintElement = document.querySelector(".bagBlueprint") ||
                                document.querySelector("svg");

    if (!(bagBlueprintElement instanceof SVGElement)) {
      console.warn("SVG element not found.");
      return;
    }

    const svgClone = bagBlueprintElement.cloneNode(true) as SVGElement;
    const containerRect = bagContainerRef.current?.getBoundingClientRect();

    if (!containerRect) {
      console.error("Bag container ref not available.");
      return;
    }

    // Compensation factor for DPI mismatch
    const PHYSICAL_DPI = 72; // jsPDF standard
    const SCREEN_DPI = 96; // typical browser rendering DPI
    const dpiScaleFactor = SCREEN_DPI / PHYSICAL_DPI; // usually ~1.33

    // Adjusted scaling for SVG to match real physical output
    const scaledWidth = pageWidth * dpiScaleFactor;
    const scaledHeight = pageHeight * dpiScaleFactor;

    // Render SVG at 0,0 using corrected scale
    await svg2pdf(svgClone, pdf, {
      x: 0,
      y: 0,
      width: scaledWidth,
      height: scaledHeight,
    });

    // Scale logos using real-world mm conversion from screen pixels
    const pxToMmX = pageWidth / (containerRect.width / dpiScaleFactor);
    const pxToMmY = pageHeight / (containerRect.height / dpiScaleFactor);

    for (const logo of logos) {
      const x = logo.position.x * pxToMmX;
      const y = logo.position.y * pxToMmY;
      const w = logo.size.width * pxToMmX;
      const h = logo.size.height * pxToMmY;

      if (logo.src.startsWith("data:image/svg+xml")) {
        const svgString = atob(logo.src.split(",")[1]);
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
        if (svgDoc.documentElement) {
          await svg2pdf(svgDoc.documentElement, pdf, { x, y, width: w, height: h });
        } else {
          pdf.addImage(logo.src, "PNG", x, y, w, h);
        }
      } else {
        pdf.addImage(logo.src, "PNG", x, y, w, h);
      }
    }

    // Save the PDF
    pdf.save("MTC-Bag-Design-ActualSize.pdf");
    console.log("PDF generation complete!");
    return true;

  } catch (error) {
    console.error("Failed to generate actual-size PDF:", error);
    alert("PDF generation failed. Please try again.");
    return false;
  }
};



  
  const handleLogoUpload = (files: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          const newLogo: Logo = {
            id: `logo-${Date.now()}`,
            src: e.target.result,
            position: { x: 50, y: 50 }, // Default position
            size: { width: 150, height: 150 } // Default size
          };
          
          // Create a new ref for this logo
          logoRefs.current.set(newLogo.id, React.createRef<Rnd>());
          
          // Add the new logo to the array
          setLogos(prev => [...prev, newLogo]);
          // Make it the active logo
          setActiveLogoId(newLogo.id);
          setDraggable(true);
          setIsActive(true);
        }
      };
      reader.readAsDataURL(file);
      
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    // Clear all logos
    setLogos([]);
    logoRefs.current = new Map();
    setActiveLogoId(null);
    setDraggable(false);
    setIsActive(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogoDelete = (logoId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Remove specific logo
    setLogos(prev => prev.filter(logo => logo.id !== logoId));
    // Clear the ref
    logoRefs.current.delete(logoId);
    
    // Reset active logo if needed
    if (activeLogoId === logoId) {
      setActiveLogoId(null);
      setDraggable(false);
      setIsActive(false);
    }
  };

  // Add new duplicate logo function
  const handleDuplicateLogo = (logoId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Find the logo to duplicate
    const logoToDuplicate = logos.find(logo => logo.id === logoId);
    
    if (logoToDuplicate) {
      // Create a new logo with the same image but slightly offset position
      const newLogo: Logo = {
        id: `logo-${Date.now()}`, // New unique ID
        src: logoToDuplicate.src,
        position: { 
          x: logoToDuplicate.position.x + 20, 
          y: logoToDuplicate.position.y + 20 
        },
        size: { ...logoToDuplicate.size }
      };
      
      // Create a new ref for the duplicated logo
      logoRefs.current.set(newLogo.id, React.createRef<Rnd>());
      
      // Add the new logo to the array
      setLogos(prev => [...prev, newLogo]);
      
      // Make it the active logo
      setActiveLogoId(newLogo.id);
      setDraggable(true);
      setIsActive(true);
    }
  };

  const toggleDragMode = (logoId: string) => {
    // If it's already active, no need to change anything
    if (activeLogoId === logoId && draggable) return;
    
    // Deactivate any previously active logo
    setActiveLogoId(logoId);
    setDraggable(true);
    setIsActive(true);
  };

  const disableDrag = () => {
    setDraggable(false);
    setIsActive(false);
  };
  
  // Update logo position and size when moved or resized
  const handleLogoMove = (logoId: string, position: {x: number, y: number}, size?: {width: number, height: number}) => {
    setLogos(prev => prev.map(logo => {
      if (logo.id === logoId) {
        return {
          ...logo,
          position: position,
          size: size || logo.size
        };
      }
      return logo;
    }));
  };
  
  // Start editing dimensions
  const startEditingDimensions = () => {
    setIsEditingDimensions(true);
  };
    
  // Confirm dimension changes
  const handleDimensionChange = (newDimensions: BagDimensions) => {
    setDimensions(newDimensions);
    setIsEditingDimensions(false);
  };
  
  // Handle clicking outside any logo (in the bag area)
  const handleBagClick = (e: React.MouseEvent) => {
    // Only handle the click if it's directly on the bag container (not on a logo)
    if (e.currentTarget === e.target) {
      setActiveLogoId(null);
      setDraggable(false);
      setIsActive(false);
    }
  };
  
  return (
    <div className={styles.pageContainer}>
      <Sidebar
        handleLogoUpload={handleLogoUpload}
        handleClear={handleClear}
        fileInputRef={fileInputRef}
        dimensions={dimensions}
        handleDimensionChange={handleDimensionChange}
        startEditingDimensions={startEditingDimensions}
        downloadDesign={generatePDF}
        logoCount={logos.length}
      />
      
      <div 
        className={styles.bagContainer} 
        ref={bagContainerRef}
        onClick={handleBagClick}
      >
        <BagBlueprint 
          dimensions={dimensions} 
          isEditing={isEditingDimensions}
        />

        {logos.map((logo) => {
          const isLogoActive = logo.id === activeLogoId;
          return (
            <Rnd
              key={logo.id}
              default={{ 
                x: logo.position.x, 
                y: logo.position.y, 
                width: logo.size.width, 
                height: logo.size.height 
              }}
              position={{ x: logo.position.x, y: logo.position.y }}
              size={{ width: logo.size.width, height: logo.size.height }}
              bounds="parent"
              disableDragging={!(isLogoActive && draggable)}
              enableResizing={isLogoActive && draggable ? { 
                bottomRight: true, 
              } : false}
              onDragStop={(e, d) => {
                handleLogoMove(logo.id, {x: d.x, y: d.y});
                disableDrag();
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                handleLogoMove(
                  logo.id, 
                  position,
                  { width: parseInt(ref.style.width), height: parseInt(ref.style.height) }
                );
                disableDrag();
              }}
              ref={logoRefs.current.get(logo.id)}
            >
              <div
                style={{ width: "100%", height: "100%", position: "relative" }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDragMode(logo.id);
                }}
                className={`${styles.logoOverlay} ${isLogoActive && isActive ? styles.active : ""}`}
              >
                <img
                  src={logo.src}
                  alt={`Logo ${logo.id}`}
                  style={{ width: "100%", height: "100%" }}
                />
                {isLogoActive && isActive && (
                  <>
                    <div className={styles.customResizeHandle}>
                      <Image
                        src={resizeIcon}
                        alt="Resize Handle"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    <div className={styles.logoControlButtons}>
                      <button 
                        className={styles.duplicateLogoButton}
                        onClick={(e) => handleDuplicateLogo(logo.id, e)}
                        aria-label="Duplicate Logo"
                        title="Duplicate Logo"
                      >
                        <span role="img" aria-label="duplicate">📋</span>
                      </button>
                      <button 
                        className={styles.removeLogoButton}
                        onClick={(e) => handleLogoDelete(logo.id, e)}
                        aria-label="Remove Logo"
                        title="Remove Logo"
                      >
                        &times;
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Rnd>
          );
        })}
      </div>
    </div>
  );
};

export default DesignPage;