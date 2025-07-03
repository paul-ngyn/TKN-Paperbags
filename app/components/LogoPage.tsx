"use client";

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import baglogo from '../public/baglogo.jpg';
import timelogo from '../public/fastclock.jpg';
import biodegradable from '../public/biodegradablelogo.jpg';
import tknlogo from '../public/tkn_products.png';
import paperbagheader from '../public/paperbagfullheader2.jpg';
import custombag from '../public/two-bag-homepage.png';
import Link from 'next/link';
import DroneVideo from './DroneVideo/DroneVideo';

interface LogoPageProps {
  handleNavigation: (page: string) => void;
}

const LogoPage: React.FC<LogoPageProps> = ({ handleNavigation }) => {
  const brandRef = useRef(null);
  const contactRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".brand, .contact-info");

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <>
      <DroneVideo />
      
      {/* Combined ImageSubHeader and Design Instantly Section */}
      <section className="combined-hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              CUSTOM PAPER BAGS AT THE LOWEST PRICES.<br />
              INSTANTLY DESIGNED BY YOU.
            </h1>
            <p className="hero-description">
              Instantly create your own custom bags using our design studio. Select your bag dimensions and upload your logo to get started. You can easily download your blueprint and send it to us in your quote!
            </p>
          </div>
          <div className="hero-image">
            <Image src={custombag} alt="Custom Bag" width={750} height={750} />
          </div>
        </div>
        <div className="hero-button-container">
          <Link href="/design" className="hero-button">
            Start Designing Now
          </Link>
        </div>
      </section>

      <div className="paragraph">
        <div className="section-title">
          <h2>Why Choose MTC?</h2>
        </div>
      </div>
      
      <section className="features">
        <div className="feature">
          <div className="feature-image-container">
            <Image src={biodegradable} alt="Feature 2" width={150} height={150} className="feature-image" />
          </div>
          <p className="feature-text">Biodegradable and Recyclable</p>
          <div className="feature-description">
            <p>Our products are environmentally friendly, biodegradable, recyclable and compostable.</p>
          </div>
        </div>
        <div className="feature">
          <div className="feature-image-container">
            <Image src={baglogo} alt="Feature 1" width={150} height={150} className="feature-image" />
          </div>
          <p className="feature-text">High Quality Paper Bags</p>
          <div className="feature-description">
            <p>Our paper bags are made in the U.S and sourced from the highest quality materials, ensuring durability and strength.</p>
          </div>
        </div>
        <div className="feature">
          <div className="feature-image-container">
            <Image src={timelogo} alt="Feature 3" width={150} height={150} className="feature-image" />
          </div>
          <p className="feature-text">Swift and Efficient Service</p>
          <div className="feature-description">
            <p>We provide fast, efficient, and personalized service to meet your needs promptly.</p>
          </div>
        </div>
      </section>
      
      <div className="center-button-container">
        <button className="feature-button" onClick={() => handleNavigation('product')}>
          Check Out Our Products
        </button>
      </div>

      <hr className="section-divider" />

      <section className="brands">
        <div className="section-title2">
          <h2>Our Brand</h2>
        </div>
        <div className="brand-container">
          <div className="brand" ref={brandRef}>
            <Image src={tknlogo} alt="TKN Logo" width={250} height={250} />
            <div className="brand-paragraph">
              <p>
                We are the exclusive distributors of TKN products. If you want to learn more about MTC and
                TKN, please click &apos;Learn More&apos;.
              </p>
            </div>
          </div>
        </div>
        <div className="learn-buttoncontainer">
          <button className="learn-button" onClick={() => handleNavigation('about')}>
            Learn More
          </button>
        </div>
        <div
          className="contact-info"
          ref={contactRef}
          style={{ backgroundImage: `url(${paperbagheader.src})` }}
        >
          <div className="Contact-Title">
            <p>Any Questions?</p>
          </div>
          <div className="Contact-Description">
            <p>
              Please use our{" "}
              <Link href="/contact" style={{ textDecoration: "underline" }}>
                contact form
              </Link>
              <br />
              We may also be reached at 777-777-777 or admin@mapletradecorp.com
            </p>
          </div>
        </div>
      </section>

      <hr className="section-divider" />
    </>
  );
};

export default LogoPage;