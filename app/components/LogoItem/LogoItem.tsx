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
  rotation?: number;
}

export interface Logo {
  id: string;
  type: 'image' | 'text' | 'pdf'; // Added 'pdf' type
  src?: string;
  file?: File; // To hold the original file object
  fileName?: string; // To display the PDF's name
  text?: string;
  textStyle?: {
    fontFamily: string;
    fontSize: number;
    color: string;
    fontWeight: string;
    rotation?: number;
  };
  position: { x: number; y: number; };
  size: {
    width: number;
    height: number;
  };
  rotation?: number;
  hasTransparentBackground?: boolean;
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
}) => {
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
        return Math.min(1200, longestLineLength * (logo.textStyle?.fontSize || 24) * 2.0);
      }
    }
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

  const currentRotation = (logo.type === 'text' && logo.textStyle?.rotation !== undefined)
    ? logo.textStyle.rotation
    : (logo.rotation ?? 0);

  const renderLogoContent = () => {
    switch (logo.type) {
      case 'pdf':
        return (
          <div className={styles.pdfContainer}>
            <span className={styles.pdfFileName}>{logo.fileName || 'PDF Document'}</span>
          </div>
        );
      case 'text':
        return (
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
        );
      case 'image':
      default:
        return (
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
        );
    }
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
        enableResizing={isActive && isDraggable ? { 
          bottomRight: true,
        } : false}
        resizeHandleStyles={{
          bottomRight: {
            position: "absolute",
            bottom: "-12px",
            right: "-12px",
            width: "24px",
            height: "24px",
            backgroundImage: `url(${resizeIcon.src})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            cursor: "se-resize",
            zIndex: 1003,
            transform: `rotate(${-currentRotation}deg)`,
            transformOrigin: 'center center',
          }
        }}
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
            
            if (!ref.dataset.isResizing) {
              ref.dataset.isResizing = 'true';
            }
            
            const lines = text.split('\n');
            const lineCount = lines.length;
            const longestLine = Math.max(...lines.map(line => line.length || 1));
            
            const MAX_FONT_SIZE = 64;
            let newFontSize;
            
            if (lineCount > 1) {
              newFontSize = Math.max(12, Math.min(MAX_FONT_SIZE, 
                Math.floor(newHeight / (lineCount * 1.2))
              ));
              
              const minWidthNeeded = longestLine * newFontSize * 0.5;
              if (minWidthNeeded > newWidth) {
                newFontSize = Math.max(12, Math.min(newFontSize,
                  Math.floor(newWidth / (longestLine * 0.5))
                ));
              }
            } else {
              newFontSize = Math.max(12, Math.min(MAX_FONT_SIZE,
                Math.floor(newWidth / (longestLine * 0.5 + 0.5))
              ));
              
              if (newHeight < newFontSize * 1.3) {
                newFontSize = Math.max(12, Math.floor(newHeight / 1.3));
              }
            }
            
            const updatedTextStyle = {
              ...logo.textStyle,
              fontSize: newFontSize
            };
        
            onLogoMove(
              logo.id,
              position,
              { width: newWidth, height: newHeight },
              updatedTextStyle
            );
          } else {
            onLogoMove(logo.id, position, { width: newWidth, height: newHeight });
          }
        }}
        
        onResizeStop={(e, direction, ref, delta, position) => {
          if (logo.type === 'text' && logo.textStyle) {
            if (ref.dataset.isResizing) {
              delete ref.dataset.isResizing;
            }
            
            const text = logo.text || '';
            const fontSize = logo.textStyle.fontSize;
            
            requestAnimationFrame(() => {
              const { width, height } = calculateOptimalTextSize(text, fontSize);
              onLogoMove(logo.id, position, { width, height }); 
            });
          } else {
            onLogoMove(
              logo.id, 
              position,
              { width: parseInt(ref.style.width), height: parseInt(ref.style.height) }
            );
          }
        }}
        ref={rndRef}
        cancel=".logoControlButtons, .duplicateLogoButton, .removeLogoButton, .dragButton"
        dragHandleClassName={styles.logoOverlay}
        data-rnd-id={logo.id}
      >
        <div
          style={{ 
            width: "100%", 
            height: "100%", 
            position: "relative",
            cursor: isActive && isDraggable ? "move" : "pointer",
            transform: `rotate(${currentRotation}deg)`,
            transformOrigin: 'center center',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleDragMode(logo.id);
          }}
          className={`${styles.logoOverlay} ${isActive ? styles.active : ""}`}
        >
          {renderLogoContent()}
        </div>
        

        {isActive && (
          <>
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
                zIndex: 1002,
                transform: `rotate(${-currentRotation}deg)`,
                transformOrigin: 'center center',
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
                zIndex: 1002,
                transform: `rotate(${-currentRotation}deg)`,
                transformOrigin: 'center center',
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
      </Rnd>
    );
};

export default LogoItem;