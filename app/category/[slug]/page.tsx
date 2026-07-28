import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryPageClient from './CategoryPageClient';
import { getProducts, Product } from '@/lib/products';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const title = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${title} Collection | Deera Glow Premium jewellery`,
    description: `Shop exquisite ${title} artificial jewellery by Deera Glow. Discover luxury rings, necklaces, earrings, bracelets, sterling silver, gold-plated jewellery and more.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const products = await getProducts();

  const formatTitle = (s: string) => {
    return s
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const title = formatTitle(slug);

  // Filter products matching category
  let filteredProducts: Product[] = [];

  if (slug === 'all-jewellery' || slug === 'all-candles' || slug === 'all') {
    filteredProducts = products;
  } else {
    filteredProducts = products.filter(p => {
      const matchTerm = slug.toLowerCase().replace('-', ' ');
      const normCollection = p.collection ? p.collection.toLowerCase() : '';
      const normName = p.name ? p.name.toLowerCase() : '';
      const normFeatures = p.features ? p.features.toLowerCase() : '';

      return (
        normCollection.includes(matchTerm) ||
        normName.includes(matchTerm) ||
        normFeatures.includes(matchTerm) ||
        (matchTerm === 'under 499' && p.price <= 499) ||
        (matchTerm === '500 999' && p.price >= 500 && p.price <= 999)
      );
    });
  }

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products;

  return (
    <div className={styles.page}>
      <Header />
      <CategoryPageClient slug={slug} title={title} products={displayProducts} />
      <Footer />
    </div>
  );
}
