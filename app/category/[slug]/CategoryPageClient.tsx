'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import CustomerExperience from '@/components/CustomerExperience';
import styles from './page.module.css';

interface CategoryPageClientProps {
  slug: string;
  title: string;
  products: Product[];
  bannerImage?: string;
  description?: string;
}

export default function CategoryPageClient({ slug, title, products, bannerImage, description }: CategoryPageClientProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number | null>(null);
  const isAllJewelleryPage = slug === 'all-jewellery' || slug === 'all' || slug === 'all-candles';
  const allJewelleryBannerUrl = 'https://storage.mlcdn.com/account_image/2566542/poUKaQKX4RL7I5b4y3fQPKb2aLSu0cTjRsafS1pM.png';

  const toggleWishlist = (id: number) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(product);
    setIsCartOpen(true);
  };

  // Filter products by selected budget tier if clicked
  const displayedProducts = selectedMaxPrice
    ? products.filter(p => p.price <= selectedMaxPrice)
    : products;

  const getCollectionTitle = () => {
    const uppercaseTitle = title.toUpperCase();
    if (uppercaseTitle.includes('COLLECTION')) return uppercaseTitle;
    if (uppercaseTitle.startsWith('LUXURY')) return `${uppercaseTitle} COLLECTION`;
    return `LUXURY ${uppercaseTitle} COLLECTION`;
  };

  const heroImgSrc = bannerImage && bannerImage.trim() !== ''
    ? bannerImage
    : slug.includes('necklace') || slug.includes('choker') || slug.includes('pendant')
      ? '/images/featured_necklaces_bg.png'
      : slug.includes('earring') || slug.includes('jhumka') || slug.includes('drop') || slug.includes('hoop')
        ? '/images/featured_earrings_bg.png'
        : slug.includes('bracelet') || slug.includes('bangle')
          ? '/images/featured_bracelets_bg.png'
          : '/images/featured_rings_bg.png';

  return (
    <main className={styles.main}>
      <div className="container">

        {isAllJewelleryPage && (
          <section className={styles.allJewelleryBanner} aria-label="All jewellery banner">
            <img
              src={allJewelleryBannerUrl}
              alt="Deera Glow all jewellery collection"
              className={styles.allJewelleryBannerImage}
            />
          </section>
        )}

        {/* 1. TOP LUXURY HERO BANNER CARD */}
        {!isAllJewelleryPage && <>
        <section className={styles.heroBanner}>
          <div className={styles.heroLeft}>
            <span className={styles.heroEyebrow}>WORLD OF ELEGANCE</span>
            <h1 className={styles.heroTitle}>{getCollectionTitle()}</h1>

            <div className={styles.heroStarting}>
              <span>Starting at ₹299</span>
            </div>

            <div className={styles.heroBadgesRow}>
              <div className={styles.heroBadge}>
                <span className={styles.heroBadgeIcon}>🚚</span>
                <div>
                  <h4 className={styles.heroBadgeTitle}>FREE SHIPPING</h4>
                  <p className={styles.heroBadgeSub}>On all orders</p>
                </div>
              </div>

              <div className={styles.heroBadge}>
                <span className={styles.heroBadgeIcon}>🔄</span>
                <div>
                  <h4 className={styles.heroBadgeTitle}>EASY RETURNS</h4>
                  <p className={styles.heroBadgeSub}>7 Days Return</p>
                </div>
              </div>

              <div className={styles.heroBadge}>
                <span className={styles.heroBadgeIcon}>📦</span>
                <div>
                  <h4 className={styles.heroBadgeTitle}>COD AVAILABLE</h4>
                  <p className={styles.heroBadgeSub}>Pay on Delivery</p>
                </div>
              </div>
            </div>

            <a href="#collection-products" className={styles.heroBtn}>
              SHOP NOW <span>→</span>
            </a>
          </div>

          <div className={styles.heroRight}>
            <img
              src={heroImgSrc}
              alt={title}
              className={styles.heroRightImg}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className={styles.newArrivalsEmblem}>
              <span className={styles.emblemTextTop}>NEW</span>
              <span className={styles.emblemTextSub}>ARRIVALS</span>
              <span style={{ fontSize: '7px', color: '#cfae7d', marginTop: '2px' }}>SHOP NOW</span>
            </div>
          </div>
        </section>

        {/* 2. SHOP BY PRICE BUDGET CARDS */}
        <section style={{ marginBottom: '50px' }}>
          <div className={styles.sectionHeader}>
            <div className={styles.dividerLine}>
              <span className={styles.dividerDiamond}>◆</span>
            </div>
            <span className={styles.sectionEyebrow}>BUDGET SELECTION</span>
            <h2 className={styles.sectionTitle}>SHOP BY PRICE</h2>
            <p className={styles.sectionSubtitle}>Find the perfect piece that fits your style and budget</p>
          </div>

          <div className={styles.priceGrid}>
            {/* Card 1: UNDER ₹299 */}
            <div
              onClick={() => setSelectedMaxPrice(selectedMaxPrice === 299 ? null : 299)}
              className={styles.priceCard}
              style={{ cursor: 'pointer', borderColor: selectedMaxPrice === 299 ? '#cfae7d' : '#e2d3be' }}
            >
              <div className={styles.priceCardHeader}>
                <span className={styles.priceCardTag}>UNDER</span>
                <div className={styles.priceCardVal}>₹299</div>
                <div className={styles.priceCardDivider}>
                  <span className={styles.priceCardDiamond}>◆</span>
                </div>
              </div>
              <div className={styles.priceCardImgWrapper}>
                <Image
                  src="/images/featured_earrings_bg.png"
                  alt="Under ₹299"
                  fill
                  sizes="220px"
                  className={styles.priceCardImg}
                />
              </div>
              <span className={styles.priceCardBtn}>
                {selectedMaxPrice === 299 ? 'SHOW ALL ✓' : 'EXPLORE NOW →'}
              </span>
            </div>

            {/* Card 2: UNDER ₹499 */}
            <div
              onClick={() => setSelectedMaxPrice(selectedMaxPrice === 499 ? null : 499)}
              className={styles.priceCard}
              style={{ cursor: 'pointer', borderColor: selectedMaxPrice === 499 ? '#cfae7d' : '#e2d3be' }}
            >
              <div className={styles.priceCardHeader}>
                <span className={styles.priceCardTag}>UNDER</span>
                <div className={styles.priceCardVal}>₹499</div>
                <div className={styles.priceCardDivider}>
                  <span className={styles.priceCardDiamond}>◆</span>
                </div>
              </div>
              <div className={styles.priceCardImgWrapper}>
                <Image
                  src="/images/featured_rings_bg.png"
                  alt="Under ₹499"
                  fill
                  sizes="220px"
                  className={styles.priceCardImg}
                />
              </div>
              <span className={styles.priceCardBtn}>
                {selectedMaxPrice === 499 ? 'SHOW ALL ✓' : 'EXPLORE NOW →'}
              </span>
            </div>

            {/* Card 3: UNDER ₹699 */}
            <div
              onClick={() => setSelectedMaxPrice(selectedMaxPrice === 699 ? null : 699)}
              className={styles.priceCard}
              style={{ cursor: 'pointer', borderColor: selectedMaxPrice === 699 ? '#cfae7d' : '#e2d3be' }}
            >
              <div className={styles.priceCardHeader}>
                <span className={styles.priceCardTag}>UNDER</span>
                <div className={styles.priceCardVal}>₹699</div>
                <div className={styles.priceCardDivider}>
                  <span className={styles.priceCardDiamond}>◆</span>
                </div>
              </div>
              <div className={styles.priceCardImgWrapper}>
                <Image
                  src="/images/featured_necklaces_bg.png"
                  alt="Under ₹699"
                  fill
                  sizes="220px"
                  className={styles.priceCardImg}
                />
              </div>
              <span className={styles.priceCardBtn}>
                {selectedMaxPrice === 699 ? 'SHOW ALL ✓' : 'EXPLORE NOW →'}
              </span>
            </div>

            {/* Card 4: UNDER ₹999 */}
            <div
              onClick={() => setSelectedMaxPrice(selectedMaxPrice === 999 ? null : 999)}
              className={styles.priceCard}
              style={{ cursor: 'pointer', borderColor: selectedMaxPrice === 999 ? '#cfae7d' : '#e2d3be' }}
            >
              <div className={styles.priceCardHeader}>
                <span className={styles.priceCardTag}>UNDER</span>
                <div className={styles.priceCardVal}>₹999</div>
                <div className={styles.priceCardDivider}>
                  <span className={styles.priceCardDiamond}>◆</span>
                </div>
              </div>
              <div className={styles.priceCardImgWrapper}>
                <Image
                  src="/images/featured_bracelets_bg.png"
                  alt="Under ₹999"
                  fill
                  sizes="220px"
                  className={styles.priceCardImg}
                />
              </div>
              <span className={styles.priceCardBtn}>
                {selectedMaxPrice === 999 ? 'SHOW ALL ✓' : 'EXPLORE NOW →'}
              </span>
            </div>
          </div>
        </section>
        </>}

        {/* 3. PRODUCT GRID SECTION */}
        <section id="collection-products" style={{ scrollMarginTop: '80px' }}>
          <div className={styles.sectionHeader}>
            <div className={styles.dividerLine}>
              <span className={styles.dividerDiamond}>◆</span>
            </div>
            <span className={styles.sectionEyebrow}>OUR ELEGANT CREATIONS</span>
            <h2 className={styles.sectionTitle}>Shop the Collection</h2>
            <p className={styles.sectionSubtitle}>
              Each piece is created with premium materials and designed to add a touch of elegance, shine, and style to your everyday life.
            </p>
          </div>

          <div className={styles.productGrid}>
            {displayedProducts.map((prod) => {
              const originalPrice = Math.round(prod.price * 1.35);
              const discountPercent = Math.round(((originalPrice - prod.price) / originalPrice) * 100);
              const isBestseller = prod.rating >= 4.8;
              const isSoldOut = prod.inventory != null && Number(prod.inventory) <= 0;
              const isWishlisted = wishlist.includes(prod.id);

              return (
                <div key={prod.id} className={styles.productCard}>
                  {/* Top Dark Container */}
                  <div className={styles.productTop}>
                    {(isBestseller || isSoldOut) && (
                      <div className={styles.productBadgeRow}>
                        {isBestseller && <span className={styles.bestsellerTag}>★ BEST SELLER</span>}
                        {isSoldOut && <span className={styles.soldOutTag}>SOLD OUT</span>}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleWishlist(prod.id)}
                      className={styles.wishlistBtn}
                      aria-label="Add to Wishlist"
                    >
                      {isWishlisted ? '❤️' : '♡'}
                    </button>

                    <Link href={`/products/${prod.slug}`}>
                      <Image
                        src={prod.image_url || '/images/earrings_category.png'}
                        alt={prod.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className={styles.productImg}
                      />
                    </Link>
                  </div>

                  {/* Bottom Cream Details Container */}
                  <div className={styles.productBottom}>
                    <span className={styles.categoryTag}>
                      {prod.collection && prod.collection.toLowerCase() !== 'unassigned'
                        ? prod.collection.toUpperCase()
                        : 'JEWELLERY'}
                    </span>

                    <Link href={`/products/${prod.slug}`} className={styles.productTitle}>
                      {prod.name}
                    </Link>

                    <div className={styles.ratingRow}>
                      <span className={styles.stars}>★★★★★</span>
                      <span>{prod.rating}</span>
                      <span style={{ color: '#aaa' }}>|</span>
                      <span>{prod.reviews_count} Reviews</span>
                    </div>

                    <div className={styles.priceRow}>
                      <span className={styles.priceCurrent}>₹{prod.price}</span>
                      <span className={styles.priceOriginal}>₹{originalPrice}</span>
                      <span className={styles.discountBadge}>{discountPercent}% OFF</span>
                    </div>

                    {/* Action Buttons Row */}
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(prod, e)}
                        className={styles.addBagBtn}
                      >
                        ADD TO BAG
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleBuyNow(prod, e)}
                        className={styles.buyNowBtn}
                      >
                        BUY NOW →
                      </button>

                      <Link
                        href={`/products/${prod.slug}`}
                        className={styles.quickViewBtn}
                        title="Quick View"
                      >
                        👁
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. BOTTOM TRUST BAR */}
        <section className={styles.trustBar}>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🚚</span>
            <div>
              <h4 className={styles.trustTitle}>FREE SHIPPING</h4>
              <p className={styles.trustSub}>On orders above ₹999</p>
            </div>
          </div>

          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🔄</span>
            <div>
              <h4 className={styles.trustTitle}>EASY RETURNS</h4>
              <p className={styles.trustSub}>7 days return policy</p>
            </div>
          </div>

          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🔒</span>
            <div>
              <h4 className={styles.trustTitle}>SECURE PAYMENT</h4>
              <p className={styles.trustSub}>100% secure checkout</p>
            </div>
          </div>

          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>👥</span>
            <div>
              <h4 className={styles.trustTitle}>10000+ HAPPY CUSTOMERS</h4>
              <p className={styles.trustSub}>4.9/5 customer rating</p>
            </div>
          </div>
        </section>

      </div>

      {/* 5. CUSTOMER EXPERIENCE SECTION (REVIEWS, REAL MOMENTS, VIDEOS, TRUST STATS) */}
      <CustomerExperience />
    </main>
  );
}
