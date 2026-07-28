import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollectionsClient from './CollectionsClient';
import styles from './page.module.css';

export const metadata = {
  title: 'All Collections | Deera Glow Premium Artificial jewellery',
  description: 'Explore all curated artificial jewellery collections by Deera Glow. Discover rings, necklaces, earrings, bracelets, sterling silver, gold-plated jewellery and more.',
};

export default function CollectionsPage() {
  return (
    <div className={styles.page}>
      <Header />
      <CollectionsClient />
      <Footer />
    </div>
  );
}
