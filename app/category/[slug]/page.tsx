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
  
  if (slug === 'all-candles') {
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
            <div className={styles.bannerBg}></div>
            <div className={styles.bannerContent}>
              <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.25em', color: 'var(--accent)', textTransform: 'uppercase' }}>
                Artisanal Curation
              </span>
              <h1 style={{ fontSize: '42px', fontWeight: '300', margin: '12px 0 16px 0', fontFamily: 'var(--font-serif)', color: '#FAF8F5', letterSpacing: '0.05em' }}>
                {title}
              </h1>
              <div style={{ width: '40px', height: '1.5px', backgroundColor: 'var(--accent)', margin: '0 auto 16px auto' }}></div>
              
              {hasProducts ? (
                <p style={{ fontSize: '15px', color: 'rgba(250, 248, 245, 0.85)', fontWeight: '300', lineHeight: '1.6' }}>
                  Explore our signature premium artificial jewelry curated for the {title} collection. Handcrafted with gold plating, sterling silver, and luxury cubic zirconia.
                </p>
              ) : (
                <div>
                  <p style={{ fontSize: '15px', color: 'rgba(250, 248, 245, 0.85)', fontWeight: '300', lineHeight: '1.6', marginBottom: '12px' }}>
                    Our limited-edition <strong>{title}</strong> pieces are currently in high demand. Explore our signature best-sellers below while we prepare the next restock:
                  </p>
                  <div style={{ display: 'inline-block', fontSize: '11px', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '5px 12px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                    ⚡ Premium Artistry — Handcrafted Collection
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <AuraCollection products={displayProducts} />

        </div>
      </main>

      <Footer />
    </div>
  );
}
