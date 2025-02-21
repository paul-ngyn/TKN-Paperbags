"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Rnd } from "react-rnd";
import styles from "./DesignPage.module.css";
import paperbag from "../../public/paperbagproduct.jpg";
import resizeIcon from "../../public/resize.png"; // Import the resize icon

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
  const fileInputRef = useRef<HTMLInputElement>(null); // NEW ref to access the file input

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  // Clears the logo and resets the file input
  const handleClear = () => {
    setLogo(null);
    disableDrag();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.pageContainer}>

      <h1 className={styles.heading}>Customize Your Bag</h1>

      <div className={styles.bagContainer}>
        <Image
          src={paperbag}
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
                  <Image src={resizeIcon} alt="Resize Handle" layout="fill" objectFit="contain" />
                </div>
              )}
            </div>
          </Rnd>
        )}
      </div>

      <div className={styles.controls}>
        <label htmlFor="logoUpload" className={styles.uploadLabel}>
          Upload Your Logo:
        </label>
        <input
          type="file"
          id="logoUpload"
          accept="image/png"
          onChange={handleLogoUpload}
          ref={fileInputRef} // attach the ref
        />
      </div>
      <Link href="/orderinfo" className={styles.navLink}>
          Image Upload Details
        </Link>

      <div className={styles.navigation}>
        <button onClick={handleClear} className={styles.navButton}>
          Clear
        </button>
        <Link href="/product" className={styles.navButton}>Back to Bags</Link>
      </div>
    </div>
  );
};

export default DesignPage;