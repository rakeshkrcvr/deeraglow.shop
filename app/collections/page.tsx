import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollectionsClient from './CollectionsClient';
import { getAllCollections } from '@/lib/collections';
import { getProducts } from '@/lib/products';
import styles from './page.module.css';

export const metadata = {
  title: 'All Collections | Deera Glow Premium Artificial jewellery',
  description: 'Explore all curated artificial jewellery collections by Deera Glow. Discover rings, necklaces, earrings, bracelets, sterling silver, gold-plated jewellery and more.',
  alternates: {
    canonical: 'https://deeraglow.shop/collections',
  },
  openGraph: {
    title: 'All Collections | Deera Glow',
    description: 'Explore all curated artificial jewellery collections by Deera Glow.',
    url: 'https://deeraglow.shop/collections',
    siteName: 'Deera Glow',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([
    getAllCollections(),
    getProducts()
  ]);

  return (
    <div className={styles.page}>
      <Header />
      <CollectionsClient dbCollections={collections} dbProducts={products} />
      <Footer />
    </div>
  );
}
