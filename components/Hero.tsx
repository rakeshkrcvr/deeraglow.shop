"use client";

import React from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroContainer}`}>
        
        {/* Left Column: Text & CTA */}
        <div className={styles.textContent}>
          <span className={styles.tagline}>DEEKSHA RITUALS</span>
          <h1 className={styles.title}>
            The Art of <br />
            <span className={styles.italicTitle}>Slow Burning</span>
          </h1>
          <p className={styles.description}>
            Ancestral scents mindfully crafted in small batches. Poured with 100% organic soy wax, pure botanical extracts, and wood wicks to ground your soul and illuminate your sanctuary.
          </p>
          
          <div className={styles.ctaGroup}>
            <a href="#products" className={styles.primaryBtn}>
              Discover Our Rituals
            </a>
            <a href="#story" className={styles.secondaryBtn}>
              Our Philosophy
            </a>
          </div>

          {/* Core Values / Features underneath */}
          <div className={styles.values}>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className={styles.valueText}>
                <h4>Pure Soy Wax</h4>
                <p>Biodegradable, slow clean burn</p>
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              </div>
              <div className={styles.valueText}>
                <h4>Therapeutic Scents</h4>
                <p>Pure botanical essential oils</p>
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className={styles.valueText}>
                <h4>Cruelty-Free & Vegan</h4>
                <p>Consciously sourced in India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Image with Floating Pedestal styling */}
        <div className={styles.imageContent}>
          <div className={styles.imageWrapper}>
            <div className={styles.shadowOverlay}></div>
            <Image 
              src="/images/hero_candle.png" 
              alt="Premium luxury sandalwood hand-poured soy candle on a stone block with leaf shadows in the background" 
              width={600} 
              height={600} 
              priority
              className={styles.heroImg}
            />
          </div>
          {/* Subtle overlay elements */}
          <div className={styles.floatingTag}>
            <span className={styles.goldDot}></span>
            <span>Batch No. 042 / Sandalwood</span>
          </div>
        </div>

      </div>
    </section>
  );
}
