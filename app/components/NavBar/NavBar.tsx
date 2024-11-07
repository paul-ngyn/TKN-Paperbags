"use client";
import React from 'react';
import LogoButton from '../Logo/LogoButton';
import ProductButton from '../ProductButton/ProductButton';
import AboutUsButton from '../AboutUsButton/AboutUsButton';
import ContactUsButton from '../ContactUsButton/ContactUsButton';
import styles from './NavBar.module.css';

interface NavBarProps {
  setPage: (page: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ setPage }) => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
      <li className={styles.navItem}>
          <LogoButton setPage={setPage} />
        </li>
        <li className={styles.navItem}>
          <ProductButton setPage={setPage} />
        </li>
        <li className={styles.navItem}>
          <AboutUsButton setPage={setPage} />
        </li>
        <li className={styles.navItem}>
          <ContactUsButton setPage={setPage} />
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;