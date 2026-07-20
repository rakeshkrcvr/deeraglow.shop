import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ShopByCollection from '@/components/ShopByCollection';
import AuraCollection from '@/components/AuraCollection';
import CustomerExperience from '@/components/CustomerExperience';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import { getProducts } from '@/lib/products';
import { getStoreSettings } from '@/lib/settings';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Home() {
  // Fetch products from Neon PostgreSQL
  const products = await getProducts();
  const settings = await getStoreSettings();

  return (
    <div className={styles.page}>
      {/* Interactive Header & Promo Bar */}
      <Header />

      <main className={styles.main}>
        {/* Hero Section */}
        <Hero
          eyebrow={settings.heroEyebrow}
          title={settings.heroTitle}
          italicTitle={settings.heroItalicTitle}
          description={settings.heroDescription}
          primaryButtonText={settings.heroPrimaryButtonText}
          primaryButtonHref={settings.heroPrimaryButtonHref}
          secondaryButtonText={settings.heroSecondaryButtonText}
          secondaryButtonHref={settings.heroSecondaryButtonHref}
          floatingTag={settings.heroFloatingTag}
          sliderImages={settings.heroSliderImages}
        />

        {/* Shop By Collection Grid */}
        <ShopByCollection />

        {/* Aura Collection (Pedestal Glassmorphic cards) */}
        <AuraCollection products={products} />

        {/* Customer Reviews, Galleries, Slider and Badges */}
        <CustomerExperience />

        {/* Brand Philosophy / Story Section */}
        <section id="story" className={styles.storySection}>
          <div className={`container ${styles.storyContainer}`}>
            
            {/* Story Image Column */}
            <div className={styles.storyImageWrapper}>
              <div className={styles.imageGrid}>
                <div className={styles.mainImageCol}>
                  <Image 
                    src="/images/category_banner_jewelry.png" 
                    alt="Premium handcrafted jewelry selection" 
                    width={450} 
                    height={450}
                    className={styles.storyImg1}
                  />
                </div>
                <div className={styles.subImageCol}>
                  <Image 
                    src="/images/earrings_category.png" 
                    alt="Elegant gold plated earrings close-up" 
                    width={220} 
                    height={220}
                    className={styles.storyImg2}
                  />
                </div>
              </div>
              <div className={styles.shadowCaster}></div>
            </div>

            {/* Story Text Column */}
            <div className={styles.storyContent}>
              <span className={styles.storyTagline}>OUR PHILOSOPHY</span>
              <h2 className={styles.storyTitle}>Crafted for Elegance</h2>
              <div className={styles.storyDivider}></div>
              
              <p className={styles.storyParagraph}>
                At Deera Glow, we believe that jewelry is more than an accessory—it is an expression of your inner light. Each piece is meticulously designed and handcrafted, carrying the promise of warmth, confidence, and timeless elegance for every moment.
              </p>

              <div className={styles.storyPoints}>
                <div className={styles.point}>
                  <div className={styles.pointNumber}>01</div>
                  <div className={styles.pointText}>
                    <h3>Premium Materials</h3>
                    <p>We use 925 sterling silver, 18k gold plating, and AAA+ cubic zirconia that mimic the luxury of fine jewelry.</p>
                  </div>
                </div>

                <div className={styles.point}>
                  <div className={styles.pointNumber}>02</div>
                  <div className={styles.pointText}>
                    <h3>Skin-Friendly Polish</h3>
                    <p>Hypoallergenic, lead-free, and nickel-free construction ensures comfortable daily wear without irritation.</p>
                  </div>
                </div>

                <div className={styles.point}>
                  <div className={styles.pointNumber}>03</div>
                  <div className={styles.pointText}>
                    <h3>Anti-Tarnish Polish</h3>
                    <p>Equipped with a long-lasting protective coating that maintains a brilliant, high-shine finish for years.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Interactive Newsletter Subscription */}
        <Newsletter />
      </main>

      {/* Footer Branding & Links */}
      <Footer />
    </div>
  );
}
