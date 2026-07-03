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
    addToCart(product, 1, 'Vanilla');
    
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
          <h2 className={styles.title}>Shop the Rituals</h2>
          <div className={styles.titleLine}></div>
          <p className={styles.leadText}>
            Each candle is hand-poured inside our studio into artisanal glassware. Designed to elevate your atmosphere and bring quiet mindfulness to daily life.
          </p>
        </div>

        {/* Glassmorphic Grid */}
        <div className={styles.grid}>
          {products.map((product) => {
            const isAdding = addingId === product.id;
            
            return (
              <div key={product.id} className={styles.glassCard}>
                
                {/* Green Dollar Indicator Badge from the user's screenshot */}
                <div className={styles.indicator}>
                  <span>$</span>
                </div>

                 {/* Pedestal Product Image */}
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

                {/* Info Content */}
                <div className={styles.info}>
                  <span className={styles.features}>{product.features}</span>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </Link>
                  
                  <div className={styles.rating}>
                    <span className={styles.stars}>★</span>
                    <span>{product.rating}</span>
                    <span className={styles.reviews}>({product.reviews_count})</span>
                  </div>

                  {/* Divider line before price row, as seen in the user's screenshot */}
                  <div className={styles.divider}></div>

                  {/* Card Bottom: Price and Round Add Cart button */}
                  <div className={styles.cardBottom}>
                    <span className={styles.price}>₹{product.price}</span>
                    
                    {/* Add to Cart and Buy Now text buttons */}
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.textAddBtn}
                        onClick={() => handleAddToCart(product)}
                        disabled={isAdding}
                      >
                        {isAdding ? "Added" : "Add to Cart"}
                      </button>
                      <button 
                        className={styles.buyNowBtn}
                        onClick={() => {
                          handleAddToCart(product);
                          // For Buy Now, open checkout state
                          setTimeout(() => {
                            alert(`Proceeding to checkout with ${product.name}!`);
                          }, 500);
                        }}
                      >
                        Buy Now
                      </button>
                    </div>
 
                    {/* Circular Add Button */}
                    <button 
                      className={`${styles.addBtn} ${isAdding ? styles.adding : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdding}
                      aria-label="Add to cart"
                    >
                      {isAdding ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      )}
                    </button>
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
