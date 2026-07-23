import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllCollections } from '@/lib/collections';
import styles from './page.module.css';

export const metadata = {
  title: 'All Collections | Deera Glow Premium Jewelry',
  description: 'Explore all curated artificial jewelry collections by Deera Glow. Discover rings, necklaces, earrings, bracelets, sterling silver, gold-plated jewelry and more.',
};

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* Top Banner */}
        <div className={styles.collectionsBanner}>
          <div className={styles.bannerOverlay}></div>
          <div className={styles.bannerContent}>
            <span className={styles.bannerTagline}>DEERA GLOW CATALOG</span>
            <h1 className={styles.bannerTitle}>All Collections</h1>
            <p className={styles.bannerDescription}>
              Explore our exquisite range of handcrafted artificial jewelry collections designed to make every moment shine.
            </p>
          </div>
        </div>

        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Curated Collections</h2>
          </div>

          {/* Collections Grid */}
          <div className={styles.collectionsGrid}>
            {collections.map((coll) => (
              <Link
                key={coll.id}
                href={`/category/${coll.slug}`}
                className={styles.collectionCard}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={coll.image_url || '/images/category_banner_jewelry.png'}
                    alt={coll.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={styles.cardImage}
                  />
                  <div className={styles.cardOverlay}></div>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardName}>{coll.name}</h3>
                  {coll.description && (
                    <p className={styles.cardDesc}>{coll.description}</p>
                  )}
                  <span className={styles.cardAction}>
                    Explore Products
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
