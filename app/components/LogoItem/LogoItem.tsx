"use client";
import React from "react";
import { Rnd } from "react-rnd";
import Image from "next/image";
import styles from "../DesignPage/DesignPage.module.css";
import resizeIcon from "../../public/resize-68.png";
import duplicateIcon from "../../public/duplicate-icon.png";

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
  calculateOptimalTextSize
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
        return Math.min(600, longestLineLength * (logo.textStyle?.fontSize || 24) * 1.2);
      }
    }
    return Math.min(500, ((logo.text?.length || 10) * (logo.textStyle?.fontSize || 24) * 1.2));
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
          let newFontSize;
          
          // Determine which dimension is more important based on text configuration
          if (lineCount > 1) {
            // For multi-line text, height is more important for readability
            newFontSize = Math.max(12, Math.min(64, 
              Math.floor(newHeight / (lineCount * 1.4 + 0.8))
            ));
            
            // But also check if width is sufficient
            const minWidthNeeded = longestLine * newFontSize * 0.6;
            if (minWidthNeeded > newWidth) {
              // Adjust font size down if width is constraining
              newFontSize = Math.max(12, Math.min(newFontSize,
                Math.floor((newWidth - 20) / (longestLine * 0.6))
              ));
            }
          } else {
            // For single-line text, width is typically the key factor
            newFontSize = Math.max(12, Math.min(64,
              Math.floor((newWidth - 20) / (longestLine * 0.6 + 1))
            ));
            
            // But ensure height is sufficient
            if (newHeight < newFontSize * 1.8) {
              newFontSize = Math.max(12, Math.floor(newHeight / 1.8));
            }
          }
          
          // Create updated style with new font size
          const updatedTextStyle = {
            ...logo.textStyle,
            fontSize: newFontSize
          };

          // During active resize, just update the font size and use the user's dimensions
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
      cancel=".logoControlButtons, .duplicateLogoButton, .removeLogoButton, .dragButton, .resizeButton"
      dragHandleClassName={styles.logoOverlay}
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