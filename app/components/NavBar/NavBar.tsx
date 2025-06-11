"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import LogoButton from '../Logo/LogoButton';
import ProductButton from '../ProductButton/ProductButton';
import AboutUsButton from '../AboutUsButton/AboutUsButton';
import ContactUsButton from '../ContactUsButton/ContactUsButton';
import OrderInfoButton from '../OrderInfoButton/OrderInfoButton';
import DesignButton from '../DesignButton/DesignButton';
import QuoteReqButton from '../QuoteReqButton/QuoteReqButon';
import AuthButton from '../AuthButton/AuthButton';
import styles from './NavBar.module.css';

const NavBar: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (page: string) => {
    router.push(`/${page}`);
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navlist}>
        <li className={styles.navItem}>
          <LogoButton onClick={() => handleNavigation('logo')} />
        </li>
        <li className={styles.navItem}>
          <AboutUsButton onClick={() => handleNavigation('about')} />
        </li>
        <li className={styles.navItem}>
          <ContactUsButton onClick={() => handleNavigation('contact')} />
        </li>
        <li className={styles.navItem}>
          <ProductButton onClick={() => handleNavigation('product')} />
        </li>
        <li className={styles.navItem}>
          <OrderInfoButton onClick={() => handleNavigation('orderinfo')} />
        </li>
        <li className={styles.navItem}>
          <DesignButton onClick={() => handleNavigation('design')} />
        </li>
        <li className={styles.navItem}>
          <QuoteReqButton/>
        </li>
        <li className={styles.navItem}>
          <AuthButton />
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;