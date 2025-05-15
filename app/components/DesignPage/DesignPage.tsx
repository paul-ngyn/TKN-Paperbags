"use client";
import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import Sidebar from "../Sidebar/Sidebar";
import BagBlueprint from "../BagBlueprint/BagBlueprint";
import LogoItem, { Logo } from "../LogoItem/LogoItem";
import styles from "./DesignPage.module.css";
import { BagDimensions } from "../../util/BagDimensions";
import { generatePDF } from "../../util/pdfGenerator";


interface DesignPageProps {
  handleNavigation: (page: string) => void;
}

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: string;
}

const DesignPage: React.FC<DesignPageProps> = () => {
  // State declarations
  const [logos, setLogos] = useState<Logo[]>([]);
  const [activeLogoId, setActiveLogoId] = useState<string | null>(null);
  const [draggable, setDraggable] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [dimensions, setDimensions] = useState<BagDimensions>({
    length: 310,
    width: 155,
    height: 428
  });
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoRefs = useRef<Map<string, React.RefObject<Rnd>>>(new Map());
  const bagContainerRef = useRef<HTMLDivElement>(null);
  
  // Calculate size constraints for text elements
  const calculateTextConstraints = (text: string, fontSize: number, lineBreaks: number = 0) => {
    const charWidthFactor = fontSize * 0.6;
    
    // Handle multi-line text differently than single-line text
    const hasLineBreaks = lineBreaks > 0;
    
    if (hasLineBreaks) {
      // For multi-line text, calculate based on the longest line
      const lines = text.split('\n');
      const longestLineLength = Math.max(...lines.map(line => line.length));
      const longestLineWidth = longestLineLength * charWidthFactor;
      
      return {
        minWidth: Math.max(100, Math.min(300, longestLineWidth * 0.8)),
        maxWidth: Math.min(600, Math.max(200, longestLineWidth * 1.5)),
        minHeight: Math.max(60, (lineBreaks + 1) * fontSize * 1.5),
        maxHeight: Math.min(500, (lineBreaks + 1) * fontSize * 3)
      };
    } else {
      // For single-line text, use the original logic
      const textWidth = text.length * charWidthFactor;
      
      return {
        minWidth: Math.max(100, Math.min(300, textWidth * 0.8)),
        maxWidth: Math.min(500, Math.max(200, textWidth * 1.5)),
        minHeight: Math.max(40, fontSize * 1.5),
        maxHeight: Math.min(300, fontSize * 3)
      };
    }
  };
  
  // Generate PDF function
  const handleGeneratePDF = async () => {
    return await generatePDF(dimensions, logos, bagContainerRef);
  };
  
  // Handle logo upload
  const handleLogoUpload = (files: FileList) => {
    if (!files.length) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        const newLogo: Logo = {
          id: `logo-${Date.now()}`,
          type: 'image',
          src: e.target.result,
          position: { x: 50, y: 50 },
          size: { width: 150, height: 150 }
        };
        
        logoRefs.current.set(newLogo.id, React.createRef<Rnd>());
        setLogos(prev => [...prev, newLogo]);
        setActiveLogoId(newLogo.id);
        setDraggable(true);
        setIsActive(true);
      }
    }; 
    
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Calculate optimal text box dimensions
  const calculateOptimalTextSize = (text: string, fontSize: number): { width: number, height: number } => {
    // Get line details
    const lines = text.split('\n');
    const lineCount = lines.length;
    const longestLine = Math.max(...lines.map(line => line.length || 1));
    
    // Calculate dimensions based on text content with minimal padding
    const charWidth = fontSize * 0.6;
    const lineHeight = fontSize * 1.4;
    
    // Add just enough padding to make text look good
    // For width: add horizontal padding of 1 character on each side
    const widthPadding = fontSize * 1.2;
    
    // For height: add vertical padding of 0.8 line height total (0.4 top and bottom)
    const heightPadding = fontSize * 0.8;
    
    const optimalWidth = Math.max(100, (longestLine * charWidth) + widthPadding);
    const optimalHeight = Math.max(40, (lineCount * lineHeight) + heightPadding);
    
    return { width: optimalWidth, height: optimalHeight };
  };

  // Handle adding text
  const handleAddText = (text?: string, style?: TextStyle) => {
    const textContent = text || "Your text here";
    const textStyle = style || {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#000000',
      fontWeight: 'normal'
    };
    
    // Calculate optimal size for the new text
    const { width, height } = calculateOptimalTextSize(textContent, textStyle.fontSize);
    
    const newTextLogo: Logo = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: textContent,
      textStyle: textStyle,
      position: { x: 50, y: 50 },
      size: { width, height }
    };
    
    logoRefs.current.set(newTextLogo.id, React.createRef<Rnd>());
    setLogos(prev => [...prev, newTextLogo]);
    setActiveLogoId(newTextLogo.id);
    setDraggable(true);
    setIsActive(true);
  };
  
  // Update text content and styling
  const updateTextContent = (id: string, text: string, style: TextStyle) => {
    // Calculate optimal size for text with new content and style
    const { width, height } = calculateOptimalTextSize(text, style.fontSize);
    
    setLogos(prev => prev.map(logo => {
      if (logo.id === id) {
        return { 
          ...logo, 
          text, 
          textStyle: style, 
          size: { width, height } 
        };
      }
      return logo;
    }));
    
    // Update the component size to match new content
    const logo = logos.find(l => l.id === id);
    if (logo && logoRefs.current.get(logo.id)?.current) {
      logoRefs.current.get(logo.id)?.current?.updateSize({
        width, height
      });
    }
  };

  // Logo operations (delete, duplicate, move)
  const handleLogoDelete = (logoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setLogos(prev => prev.filter(logo => logo.id !== logoId));
    logoRefs.current.delete(logoId);
    
    if (activeLogoId === logoId) {
      setActiveLogoId(null);
      setDraggable(false);
      setIsActive(false);
    }
  };

  const handleDuplicateLogo = (logoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const logoToDuplicate = logos.find(logo => logo.id === logoId);
    if (!logoToDuplicate) return;
    
    const newLogo: Logo = {
      id: `${logoToDuplicate.type}-${Date.now()}`,
      type: logoToDuplicate.type,
      src: logoToDuplicate.src,
      text: logoToDuplicate.text,
      textStyle: logoToDuplicate.textStyle ? {...logoToDuplicate.textStyle} : undefined,
      position: { 
        x: logoToDuplicate.position.x + 20, 
        y: logoToDuplicate.position.y + 20 
      },
      size: { ...logoToDuplicate.size }
    };
    
    logoRefs.current.set(newLogo.id, React.createRef<Rnd>());
    setLogos(prev => [...prev, newLogo]);
    setActiveLogoId(newLogo.id);
    setDraggable(true);
    setIsActive(true);
  };

  const handleLogoMove = (
    logoId: string, 
    position: {x: number, y: number}, 
    size?: {width: number, height: number},
    textStyle?: TextStyle
  ) => {
    setLogos(prev => prev.map(logo => {
      if (logo.id === logoId) {
        return {
          ...logo,
          position,
          size: size || logo.size,
          textStyle: textStyle || logo.textStyle
        };
      }
      return logo;
    }));
  };
  
  // UI interaction handlers
  const toggleDragMode = (logoId: string) => {
    setActiveLogoId(logoId);
    setIsActive(true);
    if (activeLogoId !== logoId || !draggable) {
      setDraggable(true);
      
      // Check if we need to validate text element's size constraints
      const selectedLogo = logos.find(logo => logo.id === logoId);
      if (selectedLogo?.type === 'text' && selectedLogo.textStyle) {
        // Get the Rnd reference
        const rndRef = logoRefs.current.get(logoId);
        if (rndRef?.current) {
          // Calculate proper constraints based on current text and font size
          const text = selectedLogo.text || '';
          const lineBreaks = (text.match(/\n/g) || []).length;
          const fontSize = selectedLogo.textStyle.fontSize;
          const constraints = calculateTextConstraints(text, fontSize, lineBreaks);
          
          // Check if current size meets constraints
          const needsResize = 
            selectedLogo.size.width < constraints.minWidth || 
            selectedLogo.size.height < constraints.minHeight;
          
          if (needsResize) {
            // Update element size to meet minimum constraints
            const newSize = {
              width: Math.max(constraints.minWidth, selectedLogo.size.width),
              height: Math.max(constraints.minHeight, selectedLogo.size.height)
            };
            
            // Update both the state and the component
            handleLogoMove(logoId, selectedLogo.position, newSize);
            rndRef.current.updateSize(newSize);
          }
        }
      }
    }
  };
  
  const handleBagClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target) {
      setActiveLogoId(null);
      setDraggable(false);
      setIsActive(false);
    }
  };
  
  // Dimensions editing
  const startEditingDimensions = () => setIsEditingDimensions(true);
  const handleDimensionChange = (newDimensions: BagDimensions) => {
    setDimensions(newDimensions);
    setIsEditingDimensions(false);
  };

  const handleLogoDeselect = () => {
    setActiveLogoId(null);
    setDraggable(false);
    setIsActive(false);
  };
  
  return (
    <div className={styles.pageContainer}>
      <Sidebar
        handleLogoUpload={handleLogoUpload}
        handleAddText={handleAddText}
        fileInputRef={fileInputRef}
        dimensions={dimensions}
        handleDimensionChange={handleDimensionChange}
        startEditingDimensions={startEditingDimensions}
        downloadDesign={handleGeneratePDF}
        logoCount={logos.length}
        activeLogoId={activeLogoId}
        activeLogoText={logos.find(logo => logo.id === activeLogoId && logo.type === 'text')?.text || ''}
        activeLogoTextStyle={logos.find(logo => logo.id === activeLogoId && logo.type === 'text')?.textStyle}
        updateTextContent={updateTextContent}
        onLogoDeselect={handleLogoDeselect}
      />
      
      <div 
        className={styles.bagContainer} 
        ref={bagContainerRef}
        onClick={handleBagClick}
      >
        <BagBlueprint 
          dimensions={dimensions} 
          isEditing={isEditingDimensions}
          currentEditValues={isEditingDimensions ? dimensions : undefined}
        />

        {logos.map((logo) => (
          <LogoItem
            key={logo.id}
            logo={logo}
            isActive={logo.id === activeLogoId && isActive}
            isDraggable={draggable}
            rndRef={logoRefs.current.get(logo.id) || React.createRef()}
            onToggleDragMode={toggleDragMode}
            onLogoMove={handleLogoMove}
            onLogoDelete={handleLogoDelete}
            onDuplicateLogo={handleDuplicateLogo}
            calculateOptimalTextSize={calculateOptimalTextSize}
          />
        ))}
      </div>
    </div>
  );
};

export default DesignPage;