import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Collections from '@/components/Collections';
import AuraCollection from '@/components/AuraCollection';
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

        {/* Collections Promotional Bar */}
        <Collections />

        {/* Aura Collection (Pedestal Glassmorphic cards) */}
        <AuraCollection products={products} />

        {/* Brand Philosophy / Story Section */}
        <section id="story" className={styles.storySection}>
          <div className={`container ${styles.storyContainer}`}>
            
            {/* Story Image Column */}
            <div className={styles.storyImageWrapper}>
              <div className={styles.imageGrid}>
                <div className={styles.mainImageCol}>
                  <Image 
                    src="/images/lavender_candle.png" 
                    alt="Aromatherapy Lavender soy candle in amber jar" 
                    width={450} 
                    height={450}
                    className={styles.storyImg1}
                  />
                </div>
                <div className={styles.subImageCol}>
                  <Image 
                    src="/images/jasmine_candle.png" 
                    alt="Botanical Jasmine soy candle in white ceramic cup" 
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
              <h2 className={styles.storyTitle}>Crafted for Consciousness</h2>
              <div className={styles.storyDivider}></div>
              
              <p className={styles.storyParagraph}>
                At Deeksha, we believe that lighting a candle is a threshold. It marks the transition from the noise of the external world to the quiet sanctuary of the self. Every single creation is poured by hand, carrying the intention of warmth, grounding, and peace.
              </p>

              <div className={styles.storyPoints}>
                <div className={styles.point}>
                  <div className={styles.pointNumber}>01</div>
                  <div className={styles.pointText}>
                    <h3>Sustainably Sourced Wax</h3>
                    <p>We use 100% natural, biodegradable soy wax which burns slower and 90% cleaner than conventional paraffin.</p>
                  </div>
                </div>

                <div className={styles.point}>
                  <div className={styles.pointNumber}>02</div>
                  <div className={styles.pointText}>
                    <h3>Therapeutic Botany</h3>
                    <p>Infused only with pure, cold-pressed essential oils and extracts, omitting all synthetic chemical compounds.</p>
                  </div>
                </div>

                <div className={styles.point}>
                  <div className={styles.pointNumber}>03</div>
                  <div className={styles.pointText}>
                    <h3>Sound & Flame Rituals</h3>
                    <p>Equipped with crackling wooden wicks that hum a soothing fireside melody, helping you practice active grounding.</p>
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
