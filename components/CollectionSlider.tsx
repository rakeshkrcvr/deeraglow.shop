"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SliderCollectionItem } from '@/lib/collections';
import styles from './CollectionSlider.module.css';

interface CollectionSliderProps {
  collections: SliderCollectionItem[];
}

const defaultCollections: SliderCollectionItem[] = [
  {
    id: 901,
    name: 'Flow Tide',
    slug: 'flow-tide',
    description: 'Fluid gold contours and organic sterling silver forms.',
    image_url: '/images/hero_slide_1.png',
    show_in_slider: true,
    slider_subtitle: 'Jewels That Flow With You',
    products: []
  },
  {
    id: 902,
    name: 'Kings & Queens of Rajasthan',
    slug: 'kings-queens-of-rajasthan',
    description: 'The legacy of royals, crafted in handcrafted jewels.',
    image_url: '/images/hero_slide_2.png',
    show_in_slider: true,
    slider_subtitle: 'The Legacy of Royals, Crafted in Jewels',
    products: []
  },
  {
    id: 903,
    name: 'Navratan',
    slug: 'navratan',
    description: 'Nine vibrant shades of royalty woven into silver and gold.',
    image_url: '/images/hero_slide_3.png',
    show_in_slider: true,
    slider_subtitle: 'Celebrate Every Shade of Royalty',
    products: []
  },
  {
    id: 904,
    name: 'Aura Sterling',
    slug: 'aura-sterling',
    description: 'Radiant 925 sterling silver statement pieces.',
    image_url: '/images/category_banner_jewelry.png',
    show_in_slider: true,
    slider_subtitle: 'Luminous Elegance for Everyday',
    products: []
  }
];

export default function CollectionSlider({ collections }: CollectionSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const displayItems = (collections && collections.length > 0) ? collections : defaultCollections;

  const scrollLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.section} id="new-launches">
      <div className="container">
        {/* Section Header */}
        <div className={styles.headerContainer}>
          <div className={styles.headerLine}></div>
          <h2 className={styles.title}>NEW LAUNCH</h2>
          <div className={styles.headerLine}></div>
        </div>

        {/* Slider Track Wrapper */}
        <div className={styles.sliderWrapper}>
          {/* Navigation Arrows */}
          <button 
            onClick={scrollLeft} 
            className={`${styles.navButton} ${styles.navPrev}`}
            aria-label="Previous Collections"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button 
            onClick={scrollRight} 
            className={`${styles.navButton} ${styles.navNext}`}
            aria-label="Next Collections"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Scrollable Track */}
          <div className={styles.track} ref={trackRef}>
            {displayItems.map((item) => (
              <div key={item.id} className={styles.slide}>
                {/* Main Banner Card */}
                <Link href={`/category/${item.slug}`} className={styles.bannerCard}>
                  <Image
                    src={item.image_url || '/images/hero_slide_1.png'}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 33vw"
                    className={styles.bannerImage}
                  />
                  <div className={styles.overlay}>
                    <h3 className={styles.collectionTitle}>{item.name}</h3>
                    {item.slider_subtitle && (
                      <p className={styles.collectionSubtitle}>{item.slider_subtitle}</p>
                    )}
                  </div>
                </Link>

                {/* 3 Product Thumbnails below the banner */}
                <div className={styles.thumbnailsRow}>
                  {item.products && item.products.length > 0 ? (
                    item.products.slice(0, 3).map((prod) => (
                      <Link 
                        key={prod.id} 
                        href={`/products/${prod.slug}`} 
                        className={styles.thumbnailCard}
                        title={prod.name}
                      >
                        <Image
                          src={prod.image_url}
                          alt={prod.name}
                          fill
                          sizes="120px"
                          className={styles.thumbnailImage}
                        />
                      </Link>
                    ))
                  ) : (
                    // Fallback empty thumbnail slots if no products are linked yet
                    [1, 2, 3].map((idx) => (
                      <div key={idx} className={styles.thumbnailCard}>
                        <Image
                          src="/images/earrings_category.png"
                          alt="Product Sample"
                          fill
                          sizes="120px"
                          className={styles.thumbnailImage}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
