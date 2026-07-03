"use client";

import React from 'react';
import Image from 'next/image';
import styles from './Collections.module.css';

export default function Collections() {
  const collectionList = [
    {
      id: 'aromatherapy',
      title: 'AROMATHERAPY',
      features: 'Lavender & Oud  •  Calming  •  Restful',
      image: '/images/lavender_candle.png',
      cta: 'Explore Blend',
      link: '#products'
    },
    {
      id: 'botanical',
      title: 'BOTANICAL BLENDS',
      features: 'Jasmine & Mint  •  Fresh  •  Invigorating',
      image: '/images/jasmine_candle.png',
      cta: 'Explore Blend',
      link: '#products'
    },
    {
      id: 'rituals',
      title: 'RITUAL COLLECTION',
      features: 'Sandalwood  •  Grounding  •  Meditation',
      image: '/images/hero_candle.png',
      cta: 'Explore Collection',
      link: '#products'
    }
  ];

  return (
    <section id="collections" className={styles.collectionsSection}>
      <div className={`container ${styles.collectionsContainer}`}>
        {collectionList.map((col, index) => (
          <div key={col.id} className={styles.collectionCard}>
            <div className={styles.imageContainer}>
              <Image 
                src={col.image} 
                alt={col.title}
                width={380}
                height={280}
                className={styles.image}
              />
              <div className={styles.overlay}></div>
            </div>
            
            <div className={styles.content}>
              <h3 className={styles.title}>{col.title}</h3>
              <p className={styles.features}>{col.features}</p>
              
              <a href={col.link} className={styles.ctaLink}>
                <span>{col.cta}</span>
                <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 5h16M13 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
            {index < collectionList.length - 1 && <div className={styles.divider}></div>}
          </div>
        ))}
      </div>
    </section>
  );
}
