'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './RecentSalesPopup.module.css';

interface Product {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  price: number;
}

const fallbackProducts: Product[] = [
  { id: 1, name: 'Royal Pearl Drop Earrings', slug: 'earrings-royal-pearl-drops', image_url: '/images/hero_slide_1.png', price: 1299 },
  { id: 2, name: 'Golden Solitaire Ring', slug: 'golden-solitaire-ring', image_url: '/images/rings_category.png', price: 999 },
  { id: 3, name: 'Rose Gold Floral Studs', slug: 'rose-gold-floral-studs', image_url: '/images/earrings_category.png', price: 799 },
  { id: 4, name: 'Classic Heart Pendant Necklace', slug: 'classic-heart-pendant', image_url: '/images/necklaces_category.png', price: 1499 },
  { id: 5, name: 'Minimalist Paperclip Link Chain', slug: 'minimalist-link-chain', image_url: '/images/bracelets_category.png', price: 899 },
  { id: 6, name: 'Vintage Emerald Cut Ring', slug: 'vintage-emerald-ring', image_url: '/images/charm_category.png', price: 1199 },
  { id: 7, name: 'Charm Carrier Bangle', slug: 'charm-carrier-bangle', image_url: '/images/hero_slide_2.png', price: 1599 },
  { id: 8, name: 'Eternity Band Ring', slug: 'eternity-band-ring', image_url: '/images/hero_slide_3.png', price: 1099 }
];

const customerLocations = [
  { name: 'Priya', city: 'Delhi' },
  { name: 'Ananya', city: 'Mumbai' },
  { name: 'Sneha', city: 'Jaipur' },
  { name: 'Ritu', city: 'Bangalore' },
  { name: 'Pooja', city: 'Chandigarh' },
  { name: 'Divya', city: 'Ahmedabad' },
  { name: 'Kavita', city: 'Kolkata' },
  { name: 'Meera', city: 'Pune' },
  { name: 'Aarti', city: 'Lucknow' },
  { name: 'Neha', city: 'Hyderabad' },
  { name: 'Shweta', city: 'Surat' },
  { name: 'Isha', city: 'Indore' },
  { name: 'Tanya', city: 'Noida' },
  { name: 'Deepika', city: 'Gurugram' },
  { name: 'Simran', city: 'Amritsar' }
];

const timeAgoList = [
  '2 minutes ago',
  '4 minutes ago',
  '7 minutes ago',
  '10 minutes ago',
  '12 minutes ago',
  '15 minutes ago',
  '18 minutes ago',
  '23 minutes ago'
];

export default function RecentSalesPopup() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [visible, setVisible] = useState(false);
  const [currentSale, setCurrentSale] = useState<{
    customer: string;
    city: string;
    product: Product;
    timeAgo: string;
  } | null>(null);

  const currentIndexRef = useRef(0);

  // Fetch real products from API
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => console.error('Error loading products for sales popup:', err));
  }, []);

  const triggerNextPopup = () => {
    if (products.length === 0) return;

    const nextProduct = products[currentIndexRef.current % products.length];
    const customerObj = customerLocations[currentIndexRef.current % customerLocations.length];
    const timeAgo = timeAgoList[currentIndexRef.current % timeAgoList.length];

    currentIndexRef.current += 1;

    setCurrentSale({
      customer: customerObj.name,
      city: customerObj.city,
      product: nextProduct,
      timeAgo
    });

    setVisible(true);

    // Hide after 6 seconds
    setTimeout(() => {
      setVisible(false);
    }, 6000);
  };

  useEffect(() => {
    // Initial trigger after 4 seconds
    const initialTimer = setTimeout(() => {
      triggerNextPopup();
    }, 4000);

    // Recurring trigger every 2 minutes (120,000 ms)
    const interval = setInterval(() => {
      triggerNextPopup();
    }, 120000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [products]);

  if (!currentSale) return null;

  const productUrl = currentSale.product.slug
    ? `/products/${currentSale.product.slug}`
    : '/collections';

  return (
    <div className={`${styles.popupWrapper} ${visible ? styles.visible : ''}`}>
      <Link
        href={productUrl}
        className={styles.popupCard}
        onClick={() => setVisible(false)}
      >
        <div className={styles.imageContainer}>
          <img src={currentSale.product.image_url} alt={currentSale.product.name} className={styles.productImg} />
        </div>

        <div className={styles.contentCol}>
          <div className={styles.customerName}>
            {currentSale.customer} from {currentSale.city}
          </div>
          <div className={styles.purchasedLabel}>purchased</div>
          <div className={styles.productTitle}>{currentSale.product.name}</div>
          <div className={styles.metaRow}>
            <span>{currentSale.timeAgo}</span>
            <svg className={styles.verifiedBadge} width="12" height="12" viewBox="0 0 24 24" fill="#b8860b">
              <circle cx="12" cy="12" r="10" fill="#b8860b" />
              <path d="m9 12 2 2 4-4" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setVisible(false);
          }}
          className={styles.closeBtn}
          aria-label="Close notification"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </Link>
    </div>
  );
}
