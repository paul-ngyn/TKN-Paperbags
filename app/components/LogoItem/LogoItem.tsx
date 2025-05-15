"use client";
import React from "react";
import { Rnd } from "react-rnd";
import Image from "next/image";
import styles from "../DesignPage/DesignPage.module.css";
import resizeIcon from "../../public/resize-68.png";
import duplicateIcon from "../../public/duplicate-icon.png";
import rotateIcon from "../../public/rotate.png";

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: string;
}

export interface Logo {
  id: string;
  type: 'image' | 'text';
  src?: string;
  text?: string;
  textStyle?: TextStyle;
  position: { x: number, y: number };
  size: { width: number, height: number };
  rotation?: number;
}

interface LogoItemProps {
  logo: Logo;
  isActive: boolean;
  isDraggable: boolean;
  rndRef: React.RefObject<Rnd>;
  onToggleDragMode: (logoId: string) => void;
  onLogoMove: (
    logoId: string, 
    position: {x: number, y: number}, 
    size?: {width: number, height: number},
    textStyle?: TextStyle
  ) => void;
  onLogoDelete: (logoId: string, e?: React.MouseEvent) => void;
  onDuplicateLogo: (logoId: string, e?: React.MouseEvent) => void;
  calculateOptimalTextSize: (text: string, fontSize: number) => { width: number, height: number };
  onLogoRotate?: (logoId: string, rotation: number) => void;
}

const LogoItem: React.FC<LogoItemProps> = ({
  logo,
  isActive,
  isDraggable,
  rndRef,
  onToggleDragMode,
  onLogoMove,
  onLogoDelete,
  onDuplicateLogo,
  calculateOptimalTextSize,
  onLogoRotate
}) => {
  // Calculate min/max constraints for text elements
  const calculateMinMaxWidth = () => {
    if (logo.type === 'text' && logo.text) {
      const lineBreaks = (logo.text.match(/\n/g) || []).length;
      if (lineBreaks > 0) {
        const lines = logo.text.split('\n');
        const longestLineLength = Math.max(...lines.map(line => line.length));
        return Math.max(100, longestLineLength * (logo.textStyle?.fontSize || 24) * 0.4);
      }
    }
    return Math.max(100, ((logo.text?.length || 10) * (logo.textStyle?.fontSize || 24) * 0.5));
  };

  const calculateMaxWidth = () => {
    if (logo.type === 'text' && logo.text) {
      const lineBreaks = (logo.text.match(/\n/g) || []).length;
      if (lineBreaks > 0) {
        const lines = logo.text.split('\n');
        const longestLineLength = Math.max(...lines.map(line => line.length));
        // Allow wider text boxes - increase the multiplier
        return Math.min(1200, longestLineLength * (logo.textStyle?.fontSize || 24) * 2.0);
      }
    }
    // Increase the maximum allowed width
    return Math.min(1000, ((logo.text?.length || 10) * (logo.textStyle?.fontSize || 24) * 2.0));
  };

  const calculateMinHeight = () => {
    if (logo.type === 'text' && logo.text) {
      const lineBreaks = (logo.text.match(/\n/g) || []).length;
      if (lineBreaks > 0) {
        return Math.max(60, (lineBreaks + 1) * (logo.textStyle?.fontSize || 24) * 1.2);
      }
    }
    return Math.max(40, ((logo.textStyle?.fontSize || 24) * 1.5));
  };

  const calculateMaxHeight = () => {
    if (logo.type === 'text' && logo.text) {
      const lineBreaks = (logo.text.match(/\n/g) || []).length;
      if (lineBreaks > 0) {
        return Math.min(500, (lineBreaks + 1) * (logo.textStyle?.fontSize || 24) * 3);
      }
    }
    return Math.min(300, ((logo.textStyle?.fontSize || 24) * 5));
  };

  const rotation = logo.rotation || 0;

  // Add state for tracking rotation gestures
  const [isDraggingRotation, setIsDraggingRotation] = React.useState(false);
  const [startAngle, setStartAngle] = React.useState(0);

  // Function to calculate angle between two points
  const calculateAngle = (centerX: number, centerY: number, pointX: number, pointY: number) => {
    return Math.atan2(pointY - centerY, pointX - centerX) * (180 / Math.PI);
  };

  // Handle rotation start
  const handleRotateStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isDraggable || !isActive || !onLogoRotate) return;

    const element = e.currentTarget.parentElement?.parentElement;
    if (!element) return;

    setIsDraggingRotation(true);

    // Calculate center point of the element
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate initial angle
    const initialAngle = calculateAngle(centerX, centerY, e.clientX, e.clientY);
    setStartAngle(initialAngle - (rotation || 0));

    // Add event listeners for move and up events
    document.addEventListener('mousemove', handleRotateMove);
    document.addEventListener('mouseup', handleRotateEnd);
  };

  // Handle rotation movement
  const handleRotateMove = (e: MouseEvent) => {
    if (!isDraggingRotation || !onLogoRotate) return;

    const element = document.querySelector(`[data-rnd-id="${logo.id}"]`);
    if (!element) return;

    // Calculate center point of the element
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate current angle
    const currentAngle = calculateAngle(centerX, centerY, e.clientX, e.clientY);
    
    // Calculate new rotation (normalized to 0-360 degrees)
    let newRotation = (currentAngle - startAngle) % 360;
    if (newRotation < 0) newRotation += 360;

    // Update the rotation
    onLogoRotate(logo.id, newRotation);
  };

  const handleRotateEnd = () => {
    setIsDraggingRotation(false);
    document.removeEventListener('mousemove', handleRotateMove);
    document.removeEventListener('mouseup', handleRotateEnd);
  };

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
      disableDragging={!(isActive && isDraggable)}
      enableResizing={isActive && isDraggable ? { bottomRight: true } : false}
      minWidth={logo.type === 'text' ? calculateMinMaxWidth() : 50}
      maxWidth={logo.type === 'text' ? calculateMaxWidth() : 800}
      minHeight={logo.type === 'text' ? calculateMinHeight() : 50}
      maxHeight={logo.type === 'text' ? calculateMaxHeight() : 800}
      onDragStart={() => {}}
      onDrag={(e, d) => onLogoMove(logo.id, {x: d.x, y: d.y})}
      onDragStop={(e, d) => onLogoMove(logo.id, {x: d.x, y: d.y})}
      onResize={(e, direction, ref, delta, position) => {
        const newWidth = parseInt(ref.style.width);
        const newHeight = parseInt(ref.style.height);
        
        if (logo.type === 'text' && logo.textStyle) {
          const text = logo.text || '';
          
          // Store the current resize dimensions in a ref to avoid lost updates
          if (!ref.dataset.isResizing) {
            ref.dataset.isResizing = 'true';
          }
          
          // During active resize, only update the font size but keep user's dimensions
          const lines = text.split('\n');
          const lineCount = lines.length;
          const longestLine = Math.max(...lines.map(line => line.length || 1));
          
          // Calculate new font size based on resize dimensions
          // Increase the maximum font size limit
          const MAX_FONT_SIZE = 64; // Allow much larger font sizes
          
          let newFontSize;
          
          // Scale font size more generously based on container dimensions
          if (lineCount > 1) {
            // For multi-line text
            newFontSize = Math.max(12, Math.min(MAX_FONT_SIZE, 
              Math.floor(newHeight / (lineCount * 1.2)) // Less restrictive height ratio
            ));
            
            // But still check if width is sufficient
            const minWidthNeeded = longestLine * newFontSize * 0.5; // Lower ratio for wider text
            if (minWidthNeeded > newWidth) {
              newFontSize = Math.max(12, Math.min(newFontSize,
                Math.floor(newWidth / (longestLine * 0.5)) // Allow wider text
              ));
            }
          } else {
            // For single-line text, prioritize width but with a more generous ratio
            newFontSize = Math.max(12, Math.min(MAX_FONT_SIZE,
              Math.floor(newWidth / (longestLine * 0.5 + 0.5)) // More generous width calculation
            ));
            
            // Make sure height is sufficient but less restrictive
            if (newHeight < newFontSize * 1.3) {
              newFontSize = Math.max(12, Math.floor(newHeight / 1.3));
            }
          }
          
          console.log(`Resizing: width=${newWidth}, height=${newHeight}, newFontSize=${newFontSize}`);
          
          // Create updated style with new font size
          const updatedTextStyle = {
            ...logo.textStyle,
            fontSize: newFontSize
          };
      
          // Apply the changes immediately
          onLogoMove(
            logo.id,
            position,
            { width: newWidth, height: newHeight },
            updatedTextStyle
          );
        } else {
          // For images, use the existing behavior
          onLogoMove(logo.id, position, { width: newWidth, height: newHeight });
        }
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (logo.type === 'text' && logo.textStyle) {
          // Clear resizing flag
          if (ref.dataset.isResizing) {
            delete ref.dataset.isResizing;
          }
          
          // Now apply optimal sizing with a minimal delay to ensure smooth transition
          const text = logo.text || '';
          const fontSize = logo.textStyle.fontSize;
          
          // Use a RAF to ensure the UI updates smoothly
          requestAnimationFrame(() => {
            const { width, height } = calculateOptimalTextSize(text, fontSize);
            
            // Apply the optimal size to state
            onLogoMove(
              logo.id,
              position,
              { width, height }
            );
            
            // Update the component size
            if (rndRef?.current) {
              rndRef.current.updateSize({
                width, height
              });
            }
          });
        } else {
          // For images, use the existing behavior
          onLogoMove(
            logo.id, 
            position,
            { width: parseInt(ref.style.width), height: parseInt(ref.style.height) }
          );
        }
      }}
      ref={rndRef}
      cancel=".logoControlButtons, .duplicateLogoButton, .removeLogoButton, .dragButton, .resizeButton, .rotateButton"
      dragHandleClassName={styles.logoOverlay}
      data-rnd-id={logo.id}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div
        style={{ 
          width: "100%", 
          height: "100%", 
          position: "relative",
          cursor: isActive && isDraggable ? "move" : "pointer" 
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleDragMode(logo.id);
        }}
        className={`${styles.logoOverlay} ${isActive ? styles.active : ""}`}
      >
        {logo.type === 'text' ? (
          <div 
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: logo.textStyle?.fontFamily || 'Arial',
              fontSize: `${logo.textStyle?.fontSize || 24}px`,
              fontWeight: logo.textStyle?.fontWeight || 'normal',
              color: logo.textStyle?.color || '#000000',
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "pre-wrap",
              textAlign: "center",
              overflow: "hidden",
              padding: `${Math.max(4, (logo.textStyle?.fontSize || 24) * 0.15)}px`,
              boxSizing: "border-box",
              lineHeight: logo.text?.includes('\n') ? 1.3 : 1.1,
              wordBreak: "break-word",
              textOverflow: "ellipsis",
              maxHeight: "100%"
            }}
          >
            {logo.text || "Text"}
          </div>
        ) : (
          <img
            src={logo.src}
            alt={`Logo ${logo.id}`}
            style={{ 
              width: "100%", 
              height: "100%",
              pointerEvents: "none"
            }}
            draggable={false}
          />
        )}
        
        {isActive && (
          <>
            <div className={styles.customResizeHandle}>
              <Image
                src={resizeIcon}
                alt="Resize Handle"
                width={24}
                height={24}
                style={{ objectFit: "contain" }}
              />
            </div>
            
            {/* Rotation handle with lever */}
            <div 
              className="rotateButton"
              style={{
                position: "absolute",
                top: "-50px", // Position above the element
                left: "50%",
                transform: "translateX(-50%)",
                width: "2px", // The "lever" width
                height: "50px", // The "lever" height
                backgroundColor: "#666",
                display: isDraggable ? "block" : "none",
                zIndex: 1002
              }}
            >
              <button
                onMouseDown={handleRotateStart}
                style={{
                  position: "absolute",
                  top: "-15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "grab",
                  zIndex: 1003
                }}
                aria-label="Rotate Logo"
                title="Rotate Logo"
              >
                <Image
                  src={rotateIcon}
                  alt="Rotate"
                  width={18}
                  height={18}
                  style={{ objectFit: "contain" }}
                />
              </button>
            </div>
            
            <button 
              className={styles.removeLogoButton}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onLogoDelete(logo.id, e);
              }}
              style={{
                position: "absolute",
                top: "-15px",
                left: "-15px",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "50%",
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#ff3b30",
                fontWeight: "bold",
                fontSize: "18px",
                zIndex: 1002
              }}
              aria-label="Remove Logo"
              title="Remove Logo"
            >
              &times;
            </button>
            
            <button 
              className={styles.duplicateLogoButton}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDuplicateLogo(logo.id, e);
              }}
              style={{
                position: "absolute",
                bottom: "-15px",
                left: "-15px",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "50%",
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 1002
              }}
              aria-label="Duplicate Logo"
              title="Duplicate Logo"
            >
              <Image
                src={duplicateIcon}
                alt="Duplicate"
                width={20}
                height={20}
                style={{ objectFit: "contain" }}
              />
            </button>
          </>
        )}
      </div>
    </Rnd>
  );
};

export default LogoItem;