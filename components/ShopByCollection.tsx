"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ShopByCollection.module.css';

interface ShopByCollectionProps {
  categoriesJson?: string;
}

export default function ShopByCollection({ categoriesJson }: ShopByCollectionProps) {
  const defaultCategories = [
    {
      id: 'rings',
      title: 'SHOP RINGS',
      link: '/category/rings',
      image: '/images/rings_category.png',
      className: styles.ringsCard
    },
    {
      id: 'bracelets',
      title: 'SHOP BRACELETS',
      link: '/category/bracelets',
      image: '/images/bracelets_category.png',
      className: styles.braceletsCard
    },
    {
      id: 'necklaces',
      title: 'SHOP NECKLACES',
      link: '/category/necklaces',
      image: '/images/necklaces_category.png',
      className: styles.necklacesCard
    },
    {
      id: 'earrings',
      title: 'SHOP EARRINGS',
      link: '/category/earrings',
      image: '/images/earrings_category.png',
      className: styles.earringsCard
    },
    {
      id: 'charm',
      title: 'SHOP CHARM',
      link: '/category/charms',
      image: '/images/charm_category.png',
      className: styles.charmCard
    }
  ];

  const categories = categoriesJson
    ? JSON.parse(categoriesJson).map((cat: any) => ({
        ...cat,
        className: styles[`${cat.id}Card`] || styles.card
      }))
    : defaultCategories;

  return (
    <section className={styles.section} id="shop-by-collection">
      <div className="container">
        <div className={styles.grid}>
          {categories.map((cat: any) => (
            <Link key={cat.id} href={cat.link} className={`${styles.card} ${cat.className}`}>
              <div className={styles.imageContainer}>
                <Image 
                  src={cat.image} 
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className={styles.image}
                />
                <div className={styles.overlay}></div>
              </div>
              <div className={styles.content}>
                <span className={styles.cardTitle}>{cat.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
