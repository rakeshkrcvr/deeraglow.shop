import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './about.module.css';

export default function AboutPage() {
  const sideImageUrl = "https://www.deeraglow.shop/api/media/1785227789880-5cd79750-fcc1-48a2-9059-e0d62a9136ef-aboutus.png";

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.aboutContainer}>
          
          {/* HERO SECTION */}
          <section className={styles.heroSection}>
            <div className={styles.heroLeft}>
              <div className={styles.eyebrow}>
                <span>ABOUT US</span>
                <span className={styles.sparkleIcon}>✦</span>
              </div>

              <h1 className={styles.heroTitle}>
                <span className={styles.heroTitleSpan}>About</span>
                <span className={styles.heroTitleSpan}>Deera Glow</span>
              </h1>

              <p className={styles.heroDescription}>
                At Deera Glow, we believe jewellery is more than an accessory—it's a reflection of your personality, your emotions, and your journey. Our collections are thoughtfully designed to add that perfect sparkle to your everyday moments and special occasions.
              </p>

              <p className={styles.heroHighlight}>
                Because you deserve to shine, always.
              </p>

              <Link href="/collections" className={styles.ctaButton}>
                <span>OUR COLLECTIONS</span>
                <span className={styles.ctaArrow}>→</span>
              </Link>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.heroImageFrame}>
                <Image
                  src={sideImageUrl}
                  alt="Deera Glow Model - Designed for Elegance"
                  width={500}
                  height={620}
                  priority
                  className={styles.heroImg}
                />
              </div>
            </div>
          </section>

          {/* FEATURE BADGES GRID */}
          <section className={styles.featuresGrid}>
            {/* Card 1 */}
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="6 3 18 3 22 9 12 21 2 9 6 3" />
                  <line x1="11" y1="3" x2="8" y2="9" />
                  <line x1="13" y1="3" x2="16" y2="9" />
                  <line x1="2" y1="9" x2="22" y2="9" />
                  <line x1="12" y1="21" x2="8" y2="9" />
                  <line x1="12" y1="21" x2="16" y2="9" />
                </svg>
              </div>
              <div className={styles.featureText}>
                <span className={styles.featureTitle}>PREMIUM QUALITY</span>
                <span className={styles.featureDesc}>High-quality materials for lasting shine</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className={styles.featureText}>
                <span className={styles.featureTitle}>TRENDY DESIGNS</span>
                <span className={styles.featureDesc}>Modern styles for every occasion</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className={styles.featureText}>
                <span className={styles.featureTitle}>FAST SHIPPING</span>
                <span className={styles.featureDesc}>Quick delivery across India</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" rx="1" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              <div className={styles.featureText}>
                <span className={styles.featureTitle}>GIFT READY</span>
                <span className={styles.featureDesc}>Beautifully packaged for your loved ones</span>
              </div>
            </div>
          </section>

          {/* PROMISE SECTION */}
          <section className={styles.promiseSection}>
            <div className={styles.promiseImageFrame}>
              <Image
                src="/images/featured_earrings_bg.png"
                alt="Deera Glow Craftsmanship and Details"
                width={500}
                height={350}
                className={styles.promiseImg}
              />
            </div>

            <div className={styles.promiseContent}>
              <div className={styles.eyebrow}>
                <span>OUR PROMISE</span>
                <span className={styles.sparkleIcon}>✦</span>
              </div>

              <h2 className={styles.promiseTitle}>Designed for You, Made to Shine</h2>

              <p className={styles.promiseDesc}>
                Every piece at Deera Glow is crafted with care, creativity, and a passion for detail. We design jewellery that celebrates your style, your story, and every beautiful moment in between.
              </p>

              <div className={styles.promiseCursive}>
                <span className={styles.promiseCursiveLine}>More than jewellery.</span>
                <span className={styles.promiseCursiveLine}>It&apos;s you.</span>
              </div>
            </div>
          </section>

          {/* STATS BAR */}
          <section className={styles.statsBar}>
            {/* Stat 1 */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className={styles.statText}>
                <span className={styles.statNumber}>50K+</span>
                <span className={styles.statLabel}>HAPPY CUSTOMERS</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4z" />
                  <path d="M12 14a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4z" />
                  <path d="M14 12a4 4 0 0 0 4-4 4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4z" />
                  <path d="M2 12a4 4 0 0 0 4-4 4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4z" />
                </svg>
              </div>
              <div className={styles.statText}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>DESIGNS</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className={styles.statText}>
                <span className={styles.statNumber}>100+</span>
                <span className={styles.statLabel}>CITIES ACROSS INDIA</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <div className={styles.statText}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>CUSTOMER SATISFACTION</span>
              </div>
            </div>
          </section>

          {/* THANK YOU BANNER */}
          <div className={styles.thankYouBanner}>
            <span className={styles.thankYouText}>
              <span>✦</span>
              <span>THANK YOU FOR BEING A PART OF OUR GLOWING JOURNEY</span>
              <span>✦</span>
            </span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
