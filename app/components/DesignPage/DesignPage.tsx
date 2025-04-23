"use client";
import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import Sidebar from "../Sidebar/Sidebar";
import BagBlueprint from "../BagBlueprint/BagBlueprint";
import styles from "./DesignPage.module.css";
import resizeIcon from "../../public/resize.png";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


interface DesignPageProps {
  handleNavigation: (page: string) => void;
}

// Define the BagDimensions interface
interface BagDimensions {
  length: number;
  width: number;
  height: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DesignPage: React.FC<DesignPageProps> = ({ handleNavigation }) => {
  const [logo, setLogo] = useState<string | null>(null);
  const [draggable, setDraggable] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rndRef = useRef<Rnd>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const bagContainerRef = useRef<HTMLDivElement>(null); // Add ref for the bag container
  
  // Add state for bag dimensions
  const [dimensions, setDimensions] = useState<BagDimensions>({
    length: 310,
    width: 155,
    height: 428
  });
  
  // Add state to track if dimensions are being edited
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);

  
  // NEW: Generate PDF function
  const generatePDF = async () => {
    console.log("Starting PDF generation from DesignPage...");
    
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4"
      });
      
      // Function to safely convert an element to image
      const elementToImage = async (element: Element | null, fallbackText: string) => {
        if (!element) {
          console.warn(`${fallbackText} element not found`);
          return null;
        }
        
        try {
          // Use a higher scale for better quality
          const canvas = await html2canvas(element as HTMLElement, {
            scale: 2,
            logging: false,
            useCORS: true, // Enable CORS for images
            allowTaint: true,
            backgroundColor: null // Transparent background
          });
          return canvas.toDataURL('image/png');
        } catch (err) {
          console.error(`Failed to capture ${fallbackText}:`, err);
          return null;
        }
      };
      
      // First capture the entire design area (this has better chances of success)
      console.log("Capturing design area...");
      const designArea = bagContainerRef.current;
      const designImage = await elementToImage(designArea, "Design area");
      
      // Try to capture the bag blueprint specifically
      console.log("Attempting to capture bag blueprint...");
      const bagBlueprintElement = document.querySelector(".bagBlueprint") || 
                                 document.querySelector("svg");
      const bagImage = bagBlueprintElement ? 
        await elementToImage(bagBlueprintElement, "Bag blueprint") : null;
      
      // Then capture the logo if available
      console.log("Capturing logo...");
      const logoElement = rndRef.current?.resizableElement.current;
      const logoImage = logo && logoElement ? 
        await elementToImage(logoElement, "Logo") : null;
      
      // Calculate page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add a title
      pdf.setFontSize(20);
      pdf.text("Your Bag Design", pageWidth / 2, 30, { align: "center" });
      
      // Add the design image (which contains both bag and logo)
      if (designImage) {
        pdf.addImage(designImage, "PNG", 20, 50, pageWidth - 40, 300);
        console.log("Added complete design to PDF");
      }
      // If we couldn't get the full design but got individual components
      else if (bagImage) {
        pdf.addImage(bagImage, "PNG", 20, 50, pageWidth - 40, 250);
        console.log("Added bag blueprint to PDF");
        
        // Add logo separately if available
        if (logoImage) {
          pdf.addImage(logoImage, "PNG", 20, 320, pageWidth - 40, 150);
          console.log("Added logo to PDF");
        }
      } 
      else {
        pdf.setFontSize(12);
        pdf.text("(Could not capture bag design)", pageWidth / 2, 150, { align: "center" });
        console.log("No design elements captured");
      }
      
      // Add dimensions information
      const lengthInches = (dimensions.length / 25.4).toFixed(2);
      const widthInches = (dimensions.width / 25.4).toFixed(2);
      const heightInches = (dimensions.height / 25.4).toFixed(2);
      
      pdf.setFontSize(12);
      pdf.text("Bag Dimensions:", 20, 380);
      pdf.text(`Length: ${lengthInches} inches`, 30, 400);
      pdf.text(`Width: ${widthInches} inches`, 30, 420);
      pdf.text(`Height: ${heightInches} inches`, 30, 440);
      
      // Add a footer
      const today = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.text(`Generated on ${today} - MTC Bags`, pageWidth / 2, pageHeight - 10, { align: "center" });
      
      // Save the PDF
      console.log("Saving PDF...");
      pdf.save("MTC-Bag-Design.pdf");
      
      console.log("PDF generation complete!");
      return true;
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Sorry, we couldn't generate your PDF. Please try again or contact support.");
      return false;
    }
  };
  const handleLogoUpload = (files: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          setLogo(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleDragMode = () => {
    setDraggable(!draggable);
    setIsActive(!isActive);
  };

  const disableDrag = () => {
    setDraggable(false);
    setIsActive(false);
  };
  
  // Start editing dimensions
  const startEditingDimensions = () => {
    // Initialize current edit values with the existing dimensions
    setIsEditingDimensions(true);
  };
    
  // Confirm dimension changes
  const handleDimensionChange = (newDimensions: BagDimensions) => {
    setDimensions(newDimensions);
    setIsEditingDimensions(false); // Mark editing as complete
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
      />
      
      <div className={styles.bagContainer} ref={bagContainerRef}>
      <BagBlueprint 
        dimensions={dimensions} 
        isEditing={isEditingDimensions}
      />
      
      {logo && (
          <Rnd
            default={{ x: 50, y: 50, width: 150, height: 150 }}
            bounds="parent"
            disableDragging={!draggable}
            enableResizing={{ bottomRight: true, bottomLeft: true, topRight: true, topLeft: true }}
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