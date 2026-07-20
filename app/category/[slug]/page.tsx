import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuraCollection from '@/components/AuraCollection';
import { getProducts, Product } from '@/lib/products';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const products = await getProducts();

  // Helper to format slug to readable title
  const formatTitle = (s: string) => {
    return s
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const title = formatTitle(slug);

  // Filter products matching category
  let filteredProducts: Product[] = [];
  
  if (slug === 'all-candles' || slug === 'all-jewelry') {
    filteredProducts = products;
  } else {
    // Check if slug matches fragrance features (e.g. 'vanilla' matches 'Amber Vanilla')
    filteredProducts = products.filter(p => {
      const matchTerm = slug.toLowerCase().replace('-', ' ');
      return (
        p.name.toLowerCase().includes(matchTerm) ||
        p.features.toLowerCase().includes(matchTerm) ||
        p.collection.toLowerCase().includes(matchTerm)
      );
    });
  }

  // Fallback if no matching products (we display all signature products with a banner)
  const hasProducts = filteredProducts.length > 0;
  const displayProducts = hasProducts ? filteredProducts : products;

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        <div className="container">
          
          {/* Category Banner */}
          <div className={styles.categoryBanner}>
            <div className={styles.bannerContent}>
              <span className={styles.bannerTagline}>World Of Jewelry</span>
              <h1 className={styles.bannerTitle}>
                {slug === 'rings' || slug === 'all-jewelry' || slug === 'all-candles' 
                  ? "And She Said YES !!" 
                  : slug === 'earrings' 
                  ? "Shine With Every Move"
                  : slug === 'necklaces'
                  ? "Grace in Every Detail"
                  : slug === 'bracelets'
                  ? "A Touch of Sophistication"
                  : `Premium ${title} Collection`}
              </h1>
              
              <a href="#products-list" className={styles.bannerBtn}>
                Buy Now
              </a>
            </div>

            {/* Slider Dots */}
            <div className={styles.bannerDots}>
              <span className={`${styles.bannerDot} ${styles.active}`}></span>
              <span className={styles.bannerDot}></span>
              <span className={styles.bannerDot}></span>
            </div>
          </div>

          {/* Product Grid */}
          <div id="products-list">
            <AuraCollection products={displayProducts} />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
