"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Rnd } from "react-rnd";
import styles from "./DesignPage.module.css";
import paperbag from "../../public/paperbagproduct.jpg";
import resizeIcon from "../../public/resize.png"; // Import the resize icon
import Sidebar from "../Sidebar/Sidebar"; // Import your new Sidebar component

interface DesignPageProps {
  handleNavigation?: (page: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DesignPage: React.FC<DesignPageProps> = ({ handleNavigation }) => {
  const [logo, setLogo] = useState<string | null>(null);
  const [draggable, setDraggable] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [selectedBag, setSelectedBag] = useState<string>("paperbag"); // State for selected bag

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

  const handleBagChange = (bag: string) => {
    setSelectedBag(bag);
  };

  const getBagImage = () => {
    switch (selectedBag) {
      case "paperbag":
      default:
        return paperbag;
    }
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

  // Clear the logo and reset the file input
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
        handleBagChange={handleBagChange} // Pass the handleBagChange function
      />
      {/* Bag and draggable/resizable logo */}
      <div className={styles.bagContainer}>
        <Image
          src={getBagImage()}
          alt="Customizable Paper Bag"
          className={styles.bagImage}
          layout="fill"
          objectFit="cover"
        />
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