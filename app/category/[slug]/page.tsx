import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryPageClient from './CategoryPageClient';
import { getProducts, Product } from '@/lib/products';
import { getAllCollections, normalizeImageUrl } from '@/lib/collections';
import styles from './page.module.css';

// Category listings must reflect admin product edits immediately.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
  const collections = await getAllCollections();

  const matchedColl = collections.find(c =>
    c.slug.toLowerCase() === slug.toLowerCase() ||
    c.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );

  const formatTitle = (s: string) => {
    return s
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const title = matchedColl ? matchedColl.name : formatTitle(slug);
  const bannerImage = matchedColl ? normalizeImageUrl(matchedColl.image_url) : '';
  const description = matchedColl ? matchedColl.description : '';

  let filteredProducts: Product[] = [];
  const norm = (str?: string | null) => (str || '').trim().toLowerCase();

  if (slug === 'all-jewellery' || slug === 'all-candles' || slug === 'all') {
    filteredProducts = products;
  } else {
    // 1. Filter out unassigned products from specific category pages
    const validProducts = products.filter(p => norm(p.collection) !== 'unassigned');

    if (slug === 'rings') {
      filteredProducts = validProducts.filter(p => {
        const pColl = norm(p.collection);
        if (pColl.includes('earring')) return false; // Exclude earrings from rings
        return pColl.includes('ring') || /\brings?\b/i.test(p.name);
      });
    } else if (slug === 'earrings') {
      filteredProducts = validProducts.filter(p => {
        const pColl = norm(p.collection);
        if (pColl === 'rings' || pColl === 'ring') return false; // Exclude rings from earrings
        return pColl.includes('earring') || pColl.includes('jhumka') || pColl.includes('stud') || pColl.includes('hoop') || /\bearrings?\b/i.test(p.name);
      });
    } else if (slug === 'necklaces') {
      filteredProducts = validProducts.filter(p => {
        const pColl = norm(p.collection);
        return pColl.includes('necklace') || pColl.includes('choker') || pColl.includes('pendant') || /\bnecklaces?\b/i.test(p.name);
      });
    } else if (slug === 'bracelets') {
      filteredProducts = validProducts.filter(p => {
        const pColl = norm(p.collection);
        return pColl.includes('bracelet') || pColl.includes('bangle') || pColl.includes('cuff') || /\bbracelets?\b/i.test(p.name);
      });
    } else if (matchedColl) {
      const collNameLower = matchedColl.name.toLowerCase();
      filteredProducts = validProducts.filter(p => {
        const pColl = norm(p.collection);
        if (pColl.includes('earring') && collNameLower.includes('ring') && !collNameLower.includes('earring')) return false;
        return pColl === collNameLower || pColl.includes(collNameLower);
      });
    } else {
      const matchTerm = slug.toLowerCase().replace(/-/g, ' ');
      filteredProducts = validProducts.filter(p => {
        const pColl = norm(p.collection);
        const pName = norm(p.name);
        const pFeat = norm(p.features);
        if (pColl.includes('earring') && matchTerm.includes('ring') && !matchTerm.includes('earring')) return false;

        return (
          pColl.includes(matchTerm) ||
          pName.includes(matchTerm) ||
          pFeat.includes(matchTerm) ||
          (matchTerm === 'under 499' && p.price <= 499) ||
          (matchTerm === '500 999' && p.price >= 500 && p.price <= 999)
        );
      });
    }
  }

  return (
    <div className={styles.page}>
      <Header />
      <CategoryPageClient
        slug={slug}
        title={title}
        products={filteredProducts}
        bannerImage={bannerImage}
        description={description}
      />
      <Footer />
    </div>
  );
}
