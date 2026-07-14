"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ShopByCollection.module.css';

export default function ShopByCollection() {
  const categories = [
    {
      id: 'collection',
      label: 'Explore the Ranges',
      title: 'Collection',
      desc: 'Discover our signature and luxury collections, crafted for clean burning and optimal scent throw.',
      btnText: 'Shop Collections',
      link: '/category/luxury-collection',
      image: '/images/collection_card.png',
      styleType: 'card1', // Text Left, Image Right
      btnType: 'solid'
    },
    {
      id: 'fragrance',
      label: "Nature's Essences",
      title: 'Fragrance',
      desc: 'Find your signature aroma from botanical, woody, citrus, and herbal scent profiles.',
      btnText: 'Explore Scents',
      link: '/category/lavender',
      image: '/images/fragrance_card.png',
      styleType: 'card2', // Text Left, Image Right
      btnType: 'outline'
    },
    {
      id: 'purpose',
      label: 'Mindful Rituals',
      title: 'Purpose',
      desc: 'Elevate your space with intention. Choose from relaxing, grounding, or energizing blends.',
      btnText: 'Shop by Purpose',
      link: '/category/relaxation-spa',
      image: '/images/purpose_card.png',
      styleType: 'card3', // Image Top, Text Bottom
      btnType: 'solid'
    },
    {
      id: 'occasion',
      label: 'Thoughtful Gifting',
      title: 'Occasion',
      desc: 'Perfect tokens for weddings, anniversaries, self-care, or cozy quiet evenings.',
      btnText: 'Shop Occasions',
      link: '/category/wedding-gifts',
      image: '/images/occasion_card.png',
      styleType: 'card4', // Image Left, Text Right
      btnType: 'outline'
    }
  ];

  return (
    <section className={styles.section} id="shop-by-collection">
      <div className="container">
        
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.subtitle}>CURATED EXPERIENCES</span>
          <h2 className={styles.title}>Shop by Collection</h2>
          <div className={styles.titleLine}></div>
          <p className={styles.leadText}>
            Select how you would like to begin your olfactory journey. Each category represents a unique path to finding your ideal ritual.
          </p>
        </div>

        {/* Modular Grid */}
        <div className={styles.grid}>
          {categories.map((cat) => (
            <div key={cat.id} className={`${styles.card} ${styles[cat.styleType]}`}>
              <div className={styles.content}>
                <div className={styles.textWrapper}>
                  <span className={styles.cardLabel}>{cat.label}</span>
                  <h3 className={styles.cardTitle}>{cat.title}</h3>
                  <p className={styles.cardDesc}>{cat.desc}</p>
                </div>
                <Link 
                  href={cat.link} 
                  className={`${styles.btn} ${cat.btnType === 'solid' ? styles.btnSolid : styles.btnOutline}`}
                >
                  {cat.btnText}
                </Link>
              </div>

              <div className={styles.imageContainer}>
                <Image 
                  src={cat.image} 
                  alt={`Shop by ${cat.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={styles.image}
                />
                <div className={styles.overlay}></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
