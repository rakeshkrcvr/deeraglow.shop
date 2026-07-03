"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/products';
import styles from './FeaturedProducts.module.css';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
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
          <span className={styles.subtitle}>OUR WORKSHOP FAVORITES</span>
          <h2 className={styles.title}>Shop the Rituals</h2>
          <div className={styles.titleLine}></div>
          <p className={styles.leadText}>
            Each candle is hand-poured inside our studio into artisanal glassware. Designed to elevate your atmosphere and bring quiet mindfulness to daily life.
          </p>
        </div>

        {/* Products Grid */}
        <div className={styles.grid}>
          {products.map((product) => {
            const isAdding = addingId === product.id;
            
            return (
              <div key={product.id} className={styles.card}>
                
                {/* Product Image Container */}
                <div className={styles.imageWrapper}>
                  <Image 
                    src={product.image_url} 
                    alt={product.name}
                    width={400}
                    height={400}
                    className={styles.image}
                  />
                  <div className={styles.quickView}>
                    <span>{product.features}</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className={styles.info}>
                  <div className={styles.metaRow}>
                    <span className={styles.category}>{product.collection}</span>
                    <div className={styles.rating}>
                      <span className={styles.stars}>★</span>
                      <span className={styles.ratingVal}>{product.rating}</span>
                      <span className={styles.reviews}>({product.reviews_count})</span>
                    </div>
                  </div>
                  
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.description}>{product.description}</p>
                  
                  <div className={styles.purchaseRow}>
                    <span className={styles.price}>₹{product.price}</span>
                    <button 
                      className={`${styles.addBtn} ${isAdding ? styles.adding : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <span className={styles.btnContent}>
                          Added ✓
                        </span>
                      ) : (
                        <span className={styles.btnContent}>
                          Add to Cart
                        </span>
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
