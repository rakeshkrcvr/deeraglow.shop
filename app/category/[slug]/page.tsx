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

  const canonicalUrl = `https://deeraglow.shop/category/${slug}`;

  return {
    title: `${title} Collection | Deera Glow Premium jewellery`,
    description: `Shop exquisite ${title} artificial jewellery by Deera Glow. Discover luxury rings, necklaces, earrings, bracelets, sterling silver, gold-plated jewellery and more.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} Collection | Deera Glow`,
      description: `Explore the ${title} collection at Deera Glow. Premium artificial jewellery delivered across India.`,
      url: canonicalUrl,
      siteName: "Deera Glow",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} Collection | Deera Glow`,
      description: `Explore the ${title} collection at Deera Glow.`,
    },
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://deeraglow.shop"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Collections",
        "item": "https://deeraglow.shop/collections"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": `https://deeraglow.shop/category/${slug}`
      }
    ]
  };

  let filteredProducts: Product[] = [];
  const norm = (str?: string | null) => (str || '').trim().toLowerCase();
  const productCollectionNames = (product: Product) => {
    const names = product.collections?.length ? product.collections : [product.collection];
    return names.map(norm).filter(name => name && name !== 'unassigned');
  };

  if (slug === 'all-jewellery' || slug === 'all-candles' || slug === 'all') {
    filteredProducts = products;
  } else {
    // 1. Filter out unassigned products from specific category pages
    const validProducts = products.filter(p => productCollectionNames(p).length > 0);

    if (slug === 'rings') {
      filteredProducts = validProducts.filter(p => {
        const collectionNames = productCollectionNames(p);
        return collectionNames.some(name => name.includes('ring')) || /\brings?\b/i.test(p.name);
      });
    } else if (slug === 'earrings') {
      filteredProducts = validProducts.filter(p => {
        const collectionNames = productCollectionNames(p);
        return collectionNames.some(name => name.includes('earring') || name.includes('jhumka') || name.includes('stud') || name.includes('hoop')) || /\bearrings?\b/i.test(p.name);
      });
    } else if (slug === 'necklaces') {
      filteredProducts = validProducts.filter(p => {
        const collectionNames = productCollectionNames(p);
        return collectionNames.some(name => name.includes('necklace') || name.includes('choker') || name.includes('pendant')) || /\bnecklaces?\b/i.test(p.name);
      });
    } else if (slug === 'bracelets') {
      filteredProducts = validProducts.filter(p => {
        const collectionNames = productCollectionNames(p);
        return collectionNames.some(name => name.includes('bracelet') || name.includes('bangle') || name.includes('cuff')) || /\bbracelets?\b/i.test(p.name);
      });
    } else if (matchedColl) {
      const collNameLower = matchedColl.name.toLowerCase();
      filteredProducts = validProducts.filter(p => {
        return productCollectionNames(p).some(name => name === collNameLower);
      });
    } else {
      const matchTerm = slug.toLowerCase().replace(/-/g, ' ');
      filteredProducts = validProducts.filter(p => {
        const collectionNames = productCollectionNames(p);
        const pName = norm(p.name);
        const pFeat = norm(p.features);
        return (
          collectionNames.some(name => name.includes(matchTerm)) ||
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
