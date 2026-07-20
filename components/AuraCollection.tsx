"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/products';
import styles from './AuraCollection.module.css';

interface AuraCollectionProps {
  products: Product[];
}

export default function AuraCollection({ products }: AuraCollectionProps) {
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState<number | null>(null);

  const handleAddToCart = (product: Product) => {
    setAddingId(product.id);
    addToCart(product, 1, 'Standard');
    
    setTimeout(() => {
      setAddingId(null);
    }, 1500);
  };

  return (
    <section id="products" className={styles.section}>
      <div className="container">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.subtitle}>OUR ARTISANAL CREATIONS</span>
          <h2 className={styles.title}>Shop the Collection</h2>
          <div className={styles.titleLine}></div>
          <p className={styles.leadText}>
            Each piece is handcrafted with premium materials and designed to add a touch of elegance, shine, and style to your everyday life.
          </p>
        </div>

        {/* Jewelry Card Grid */}
        <div className={styles.grid}>
          {products.map((product, index) => {
            const isAdding = addingId === product.id;
            const originalPrice = Math.round((product.price / 0.7) / 100) * 100 - 1;
            const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);
            
            return (
              <div key={product.id} className={styles.jewelryCard}>
                
                {/* Image Container with Badges */}
                <div className={styles.imageSection}>
                  {index === 0 && (
                    <div className={styles.bestSellerBadge}>
                      <span>★ BEST SELLER</span>
                    </div>
                  )}

                  <button className={styles.wishlistBtn} aria-label="Add to wishlist">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>

                  <Link href={`/products/${product.slug}`} className={styles.imageLink}>
                    <div className={styles.imageContainer}>
                      <Image 
                        src={product.image_url} 
                        alt={product.name}
                        width={400}
                        height={400}
                        className={styles.image}
                      />
                    </div>
                  </Link>
                </div>

                {/* Content details */}
                <div className={styles.info}>
                  <span className={styles.features}>{product.collection.toUpperCase()}</span>
                  
                  <Link href={`/products/${product.slug}`}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </Link>
                  
                  <div className={styles.ratingRow}>
                    <div className={styles.stars}>★★★★★</div>
                    <span className={styles.ratingValue}>{product.rating}</span>
                    <span className={styles.ratingSeparator}>|</span>
                    <span className={styles.reviewsCount}>{product.reviews_count} Reviews</span>
                  </div>

                  <div className={styles.priceRow}>
                    <span className={styles.price}>₹{product.price}</span>
                    <span className={styles.originalPrice}>₹{originalPrice}</span>
                    <span className={styles.discountBadge}>{discountPercent}% OFF</span>
                  </div>

                  <div className={styles.divider}></div>

                  {/* Action row matching second image */}
                  <div className={styles.actionRow}>
                    <button 
                      className={styles.addBagBtn}
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdding}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.btnIcon}>
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      <span>{isAdding ? "ADDED" : "ADD TO BAG"}</span>
                    </button>

                    <button 
                      className={styles.buyNowBtn}
                      onClick={() => {
                        handleAddToCart(product);
                        setTimeout(() => {
                          alert(`Proceeding to checkout with ${product.name}!`);
                        }, 500);
                      }}
                    >
                      <span>BUY NOW</span>
                      <span className={styles.arrow}>→</span>
                    </button>

                    <Link href={`/products/${product.slug}`} className={styles.quickViewLink}>
                      <button className={styles.quickViewBtn} type="button">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span className={styles.quickViewText}>QUICK VIEW</span>
                      </button>
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
