'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CustomerExperience from '@/components/CustomerExperience';
import type { CollectionItem } from '@/lib/collections';
import { normalizeImageUrl } from '@/lib/imageUtils';
import { Product } from '@/lib/products';
import styles from './page.module.css';

interface CategoryCardItem {
  id: string;
  name: string;
  count: string;
  slug: string;
  image: string;
  category: 'rings' | 'necklaces' | 'earrings' | 'bracelets' | 'bangles' | 'gifts' | 'new arrivals';
  badge?: 'BESTSELLER' | 'NEW';
}

interface CollectionsClientProps {
  dbCollections?: CollectionItem[];
  dbProducts?: Product[];
}

const ALL_CATEGORY_CARDS: CategoryCardItem[] = [
  {
    id: 'gold-plated-rings',
    name: 'GOLD PLATED RINGS',
    count: '42 Products',
    slug: 'gold-plated-rings',
    category: 'rings',
    image: '/images/rings_category.png'
  },
  {
    id: 'sterling-silver-rings',
    name: 'STERLING SILVER RINGS',
    count: '36 Products',
    slug: 'sterling-silver-rings',
    category: 'rings',
    image: '/images/hero_slide_1.png'
  },
  {
    id: 'bridal-rings',
    name: 'BRIDAL RINGS',
    count: '28 Products',
    slug: 'rings',
    category: 'rings',
    badge: 'BESTSELLER',
    image: '/images/featured_rings_bg.png'
  },
  {
    id: 'solitaire-rings',
    name: 'SOLITAIRE RINGS',
    count: '24 Products',
    slug: 'solitaire-rings',
    category: 'rings',
    image: '/images/hero_slide_3.png'
  },
  {
    id: 'necklaces-all',
    name: 'NECKLACES',
    count: '57 Products',
    slug: 'necklaces',
    category: 'necklaces',
    image: '/images/necklaces_category.png'
  },
  {
    id: 'layered-necklaces',
    name: 'LAYERED NECKLACES',
    count: '34 Products',
    slug: 'layered-necklaces',
    category: 'necklaces',
    image: '/images/featured_necklaces_bg.png'
  },
  {
    id: 'choker-necklaces',
    name: 'CHOKER NECKLACES',
    count: '22 Products',
    slug: 'choker-necklaces',
    category: 'necklaces',
    image: '/images/category_banner_jewellery.png'
  },
  {
    id: 'pendant-necklaces',
    name: 'PENDANT NECKLACES',
    count: '26 Products',
    slug: 'pendant-necklaces',
    category: 'necklaces',
    badge: 'NEW',
    image: '/images/hero_slide_2.png'
  },
  {
    id: 'stud-earrings',
    name: 'STUD EARRINGS',
    count: '40 Products',
    slug: 'stud-earrings',
    category: 'earrings',
    image: '/images/earrings_category.png'
  },
  {
    id: 'drop-earrings',
    name: 'DROP EARRINGS',
    count: '30 Products',
    slug: 'drop-earrings',
    category: 'earrings',
    image: '/images/featured_earrings_bg.png'
  },
  {
    id: 'hoop-earrings',
    name: 'HOOP EARRINGS',
    count: '30 Products',
    slug: 'hoop-earrings',
    category: 'earrings',
    image: '/images/jewellery_category_banner.png'
  },
  {
    id: 'jhumka-earrings',
    name: 'JHUMKA EARRINGS',
    count: '18 Products',
    slug: 'jhumka-earrings',
    category: 'earrings',
    image: '/images/collection_card.png'
  },
  {
    id: 'bracelets-all',
    name: 'LINK BRACELETS',
    count: '25 Products',
    slug: 'bracelets',
    category: 'bracelets',
    image: '/images/bracelets_category.png'
  },
  {
    id: 'bangles-cuffs',
    name: 'CHARM BANGLES',
    count: '18 Products',
    slug: 'bangles',
    category: 'bangles',
    image: '/images/featured_bracelets_bg.png'
  },
  {
    id: 'gift-combos',
    name: 'ROYAL GIFT SETS',
    count: '15 Products',
    slug: 'birthday-gifts',
    category: 'gifts',
    badge: 'BESTSELLER',
    image: '/images/collections_hero_bg.png'
  },
  {
    id: 'new-arrivals-cat',
    name: 'NEW SEASON ARRIVALS',
    count: '20 Products',
    slug: 'new-arrivals',
    category: 'new arrivals',
    badge: 'NEW',
    image: '/images/charm_category.png'
  }
];

export default function CollectionsClient({ dbCollections, dbProducts }: CollectionsClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [instagramUrl, setInstagramUrl] = useState<string>('https://www.instagram.com/deeraglowshop/');

  const budgetTrackRef = React.useRef<HTMLDivElement>(null);

  const scrollBudget = (direction: 'left' | 'right') => {
    if (budgetTrackRef.current) {
      const scrollAmount = 280;
      budgetTrackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  React.useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.instagramUrl) {
          setInstagramUrl(data.instagramUrl);
        }
      })
      .catch((err) => console.error('Error loading instagram settings:', err));
  }, []);

  const dynamicCards: CategoryCardItem[] = React.useMemo(() => {
    if (!dbCollections || dbCollections.length === 0) return ALL_CATEGORY_CARDS;

    return dbCollections.map((coll) => {
      const collNameLower = coll.name.toLowerCase();
      let category: 'rings' | 'necklaces' | 'earrings' | 'bracelets' | 'bangles' | 'gifts' | 'new arrivals' = 'rings';
      if (collNameLower.includes('necklace') || collNameLower.includes('choker') || collNameLower.includes('pendant')) {
        category = 'necklaces';
      } else if (collNameLower.includes('earring') || collNameLower.includes('jhumka') || collNameLower.includes('stud') || collNameLower.includes('hoop') || collNameLower.includes('chandelier')) {
        category = 'earrings';
      } else if (collNameLower.includes('bracelet')) {
        category = 'bracelets';
      } else if (collNameLower.includes('bangle') || collNameLower.includes('cuff')) {
        category = 'bangles';
      } else if (collNameLower.includes('gift')) {
        category = 'gifts';
      } else if (collNameLower.includes('new')) {
        category = 'new arrivals';
      }

      const count = dbProducts
        ? dbProducts.filter(p => (p.collection || '').toLowerCase().includes(collNameLower) || collNameLower.includes((p.collection || '').toLowerCase())).length
        : 0;

      let badge: 'BESTSELLER' | 'NEW' | undefined = undefined;
      if (collNameLower.includes('best') || collNameLower.includes('bridal')) badge = 'BESTSELLER';
      if (collNameLower.includes('new')) badge = 'NEW';

      const image = normalizeImageUrl(coll.image_url) || (
        collNameLower.includes('ring') ? '/images/rings_category.png' :
        collNameLower.includes('necklace') ? '/images/necklaces_category.png' :
        collNameLower.includes('earring') ? '/images/earrings_category.png' :
        collNameLower.includes('bracelet') ? '/images/bracelets_category.png' :
        '/images/category_banner_jewellery.png'
      );

      return {
        id: coll.slug,
        name: coll.name.toUpperCase(),
        count: count > 0 ? `${count} Product${count > 1 ? 's' : ''}` : 'View Collection',
        slug: coll.slug,
        category,
        image,
        badge
      };
    });
  }, [dbCollections, dbProducts]);

  const categories = [
    { id: 'all', label: 'ALL' },
    { id: 'rings', label: 'RINGS' },
    { id: 'necklaces', label: 'NECKLACES' },
    { id: 'earrings', label: 'EARRINGS' },
    { id: 'bracelets', label: 'BRACELETS' },
    { id: 'bangles', label: 'BANGLES' },
    { id: 'gifts', label: 'GIFTS' },
    { id: 'new arrivals', label: 'NEW ARRIVALS' },
  ];

  // Filter cards
  const filteredCards = dynamicCards.filter(card => {
    if (activeCategory === 'all') return true;
    return card.category === activeCategory;
  });

  // Sort cards if needed
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // Default popular order
  });

  const visibleCards = sortedCards.slice(0, visibleCount);

  return (
    <main className={styles.main}>
      {/* 1. HERO BANNER */}
      <section
        className={styles.heroBanner}
        style={{ backgroundImage: `url('/images/collections_hero_bg.png')` }}
      >
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>TIMELESS BEAUTY, PRECIOUS YOU</span>
          <h1 className={styles.heroTitle}>ALL COLLECTIONS</h1>
          <p className={styles.heroDescription}>
            Explore our exquisite range of collections crafted to make every moment shine.
          </p>
          <a href="#shop-by-category" className={styles.heroButton}>
            SHOP ALL COLLECTIONS
          </a>
        </div>
      </section>

      <div className="container">
        {/* 2. FEATURED COLLECTIONS SECTION */}
        <section style={{ marginTop: '50px' }}>
          <div className={styles.sectionHeader}>
            <div className={styles.dividerLine}>
              <span className={styles.dividerDiamond}>◆</span>
            </div>
            <h2 className={styles.sectionTitle}>FEATURED COLLECTIONS</h2>
          </div>

          <div className={styles.featuredGrid}>
            {/* Card 1: RINGS */}
            <Link href="/category/rings" className={styles.featuredCard}>
              <Image
                src="/images/featured_rings_bg.png"
                alt="Rings Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.featuredCardImage}
              />
              <div className={styles.featuredCardOverlay}></div>
              <div className={styles.featuredCardContent}>
                <h3 className={styles.featuredCardTitle}>RINGS</h3>
                <p className={styles.featuredCardDesc}>Timeless elegance for every occasion</p>
                <span className={styles.featuredCardAction}>
                  EXPLORE COLLECTION <span>→</span>
                </span>
              </div>
            </Link>

            {/* Card 2: NECKLACES */}
            <Link href="/category/necklaces" className={styles.featuredCard}>
              <Image
                src="/images/featured_necklaces_bg.png"
                alt="Necklaces Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.featuredCardImage}
              />
              <div className={styles.featuredCardOverlay}></div>
              <div className={styles.featuredCardContent}>
                <h3 className={styles.featuredCardTitle}>NECKLACES</h3>
                <p className={styles.featuredCardDesc}>Designed to highlight your beauty</p>
                <span className={styles.featuredCardAction}>
                  EXPLORE COLLECTION <span>→</span>
                </span>
              </div>
            </Link>

            {/* Card 3: EARRINGS */}
            <Link href="/category/earrings" className={styles.featuredCard}>
              <Image
                src="/images/featured_earrings_bg.png"
                alt="Earrings Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.featuredCardImage}
              />
              <div className={styles.featuredCardOverlay}></div>
              <div className={styles.featuredCardContent}>
                <h3 className={styles.featuredCardTitle}>EARRINGS</h3>
                <p className={styles.featuredCardDesc}>Sparkle that speaks for you</p>
                <span className={styles.featuredCardAction}>
                  EXPLORE COLLECTION <span>→</span>
                </span>
              </div>
            </Link>

            {/* Card 4: BRACELETS */}
            <Link href="/category/bracelets" className={styles.featuredCard}>
              <Image
                src="/images/featured_bracelets_bg.png"
                alt="Bracelets Collection"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.featuredCardImage}
              />
              <div className={styles.featuredCardOverlay}></div>
              <div className={styles.featuredCardContent}>
                <h3 className={styles.featuredCardTitle}>BRACELETS</h3>
                <p className={styles.featuredCardDesc}>Grace around your wrist</p>
                <span className={styles.featuredCardAction}>
                  EXPLORE COLLECTION <span>→</span>
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* 2.5 BUDGET SLIDER SECTION (SHOP MORE, SAVE MORE) */}
        <section className={styles.budgetContainer}>
          <div className={styles.budgetHeader}>
            <span className={styles.budgetMotif}>☙</span>
            <h2 className={styles.budgetTitle}>SHOP MORE, SAVE MORE</h2>
            <p className={styles.budgetSubtitle}>Beautiful jewellery for every budget</p>
          </div>

          <div className={styles.budgetSliderWrapper}>
            <button
              type="button"
              onClick={() => scrollBudget('left')}
              className={`${styles.sliderNavBtn} ${styles.sliderNavPrev}`}
              aria-label="Previous budget option"
            >
              ‹
            </button>

            <div ref={budgetTrackRef} className={styles.budgetTrack}>
              {/* Card 1: UNDER ₹299 */}
              <Link href="/category/under-499" className={styles.budgetCard}>
                <div className={styles.budgetCardHeader}>
                  <span className={styles.budgetCardTag}>UNDER</span>
                  <div className={styles.budgetCardPrice}>₹299</div>
                  <div className={styles.budgetCardDivider}>
                    <span className={styles.budgetCardDiamond}>◆</span>
                  </div>
                </div>
                <div className={styles.budgetCardImgWrapper}>
                  <Image
                    src="/images/featured_earrings_bg.png"
                    alt="Jewellery under ₹299"
                    fill
                    sizes="220px"
                    className={styles.budgetCardImg}
                  />
                </div>
                <span className={styles.budgetCardBtn}>
                  SHOP NOW <span>→</span>
                </span>
              </Link>

              {/* Card 2: UNDER ₹399 */}
              <Link href="/category/under-499" className={styles.budgetCard}>
                <div className={styles.budgetCardHeader}>
                  <span className={styles.budgetCardTag}>UNDER</span>
                  <div className={styles.budgetCardPrice}>₹399</div>
                  <div className={styles.budgetCardDivider}>
                    <span className={styles.budgetCardDiamond}>◆</span>
                  </div>
                </div>
                <div className={styles.budgetCardImgWrapper}>
                  <Image
                    src="/images/featured_rings_bg.png"
                    alt="Jewellery under ₹399"
                    fill
                    sizes="220px"
                    className={styles.budgetCardImg}
                  />
                </div>
                <span className={styles.budgetCardBtn}>
                  SHOP NOW <span>→</span>
                </span>
              </Link>

              {/* Card 3: UNDER ₹499 */}
              <Link href="/category/under-499" className={styles.budgetCard}>
                <div className={styles.budgetCardHeader}>
                  <span className={styles.budgetCardTag}>UNDER</span>
                  <div className={styles.budgetCardPrice}>₹499</div>
                  <div className={styles.budgetCardDivider}>
                    <span className={styles.budgetCardDiamond}>◆</span>
                  </div>
                </div>
                <div className={styles.budgetCardImgWrapper}>
                  <Image
                    src="/images/featured_necklaces_bg.png"
                    alt="Jewellery under ₹499"
                    fill
                    sizes="220px"
                    className={styles.budgetCardImg}
                  />
                </div>
                <span className={styles.budgetCardBtn}>
                  SHOP NOW <span>→</span>
                </span>
              </Link>

              {/* Card 4: UNDER ₹599 */}
              <Link href="/category/500-999" className={styles.budgetCard}>
                <div className={styles.budgetCardHeader}>
                  <span className={styles.budgetCardTag}>UNDER</span>
                  <div className={styles.budgetCardPrice}>₹599</div>
                  <div className={styles.budgetCardDivider}>
                    <span className={styles.budgetCardDiamond}>◆</span>
                  </div>
                </div>
                <div className={styles.budgetCardImgWrapper}>
                  <Image
                    src="/images/featured_bracelets_bg.png"
                    alt="Jewellery under ₹599"
                    fill
                    sizes="220px"
                    className={styles.budgetCardImg}
                  />
                </div>
                <span className={styles.budgetCardBtn}>
                  SHOP NOW <span>→</span>
                </span>
              </Link>

              {/* Card 5: UNDER ₹799 */}
              <Link href="/category/500-999" className={styles.budgetCard}>
                <div className={styles.budgetCardHeader}>
                  <span className={styles.budgetCardTag}>UNDER</span>
                  <div className={styles.budgetCardPrice}>₹799</div>
                  <div className={styles.budgetCardDivider}>
                    <span className={styles.budgetCardDiamond}>◆</span>
                  </div>
                </div>
                <div className={styles.budgetCardImgWrapper}>
                  <Image
                    src="/images/hero_slide_1.png"
                    alt="Jewellery under ₹799"
                    fill
                    sizes="220px"
                    className={styles.budgetCardImg}
                  />
                </div>
                <span className={styles.budgetCardBtn}>
                  SHOP NOW <span>→</span>
                </span>
              </Link>

              {/* Card 6: UNDER ₹999 */}
              <Link href="/category/500-999" className={styles.budgetCard}>
                <div className={styles.budgetCardHeader}>
                  <span className={styles.budgetCardTag}>UNDER</span>
                  <div className={styles.budgetCardPrice}>₹999</div>
                  <div className={styles.budgetCardDivider}>
                    <span className={styles.budgetCardDiamond}>◆</span>
                  </div>
                </div>
                <div className={styles.budgetCardImgWrapper}>
                  <Image
                    src="/images/hero_slide_2.png"
                    alt="Jewellery under ₹999"
                    fill
                    sizes="220px"
                    className={styles.budgetCardImg}
                  />
                </div>
                <span className={styles.budgetCardBtn}>
                  SHOP NOW <span>→</span>
                </span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => scrollBudget('right')}
              className={`${styles.sliderNavBtn} ${styles.sliderNavNext}`}
              aria-label="Next budget option"
            >
              ›
            </button>
          </div>

          <div className={styles.budgetBadgesBar}>
            <div className={styles.budgetBadgeItem}>
              <span className={styles.budgetBadgeIcon}>🏵️</span>
              <span>PREMIUM QUALITY</span>
            </div>
            <div className={styles.budgetBadgeItem}>
              <span className={styles.budgetBadgeIcon}>💎</span>
              <span>TRENDY DESIGNS</span>
            </div>
            <div className={styles.budgetBadgeItem}>
              <span className={styles.budgetBadgeIcon}>🏷️</span>
              <span>AFFORDABLE PRICES</span>
            </div>
            <div className={styles.budgetBadgeItem}>
              <span className={styles.budgetBadgeIcon}>🎁</span>
              <span>PERFECT FOR EVERY OCCASION</span>
            </div>
          </div>
        </section>

        {/* 3. SHOP BY CATEGORY SECTION */}
        <section id="shop-by-category" style={{ scrollMarginTop: '80px' }}>
          <div className={styles.sectionHeader}>
            <div className={styles.dividerLine}>
              <span className={styles.dividerDiamond}>◆</span>
            </div>
            <h2 className={styles.sectionTitle}>SHOP BY CATEGORY</h2>
          </div>

          {/* Filter Bar & Sort */}
          <div className={styles.filterBar}>
            <div className={styles.filterTabs}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setVisibleCount(12);
                  }}
                  className={`${styles.tabButton} ${activeCategory === cat.id ? styles.tabButtonActive : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className={styles.sortWrapper}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="popular">POPULAR ∨</option>
                <option value="name">NAME A-Z ∨</option>
              </select>
            </div>
          </div>

          {/* 4-Column Category Grid */}
          <div className={styles.categoryGrid}>
            {visibleCards.map((card) => (
              <Link
                key={card.id}
                href={`/category/${card.slug}`}
                className={styles.categoryCard}
              >
                {/* Badge if present */}
                {card.badge === 'BESTSELLER' && (
                  <span className={`${styles.cardBadge} ${styles.badgeBestseller}`}>BESTSELLER</span>
                )}
                {card.badge === 'NEW' && (
                  <span className={`${styles.cardBadge} ${styles.badgeNew}`}>NEW</span>
                )}

                <img
                  src={card.image}
                  alt={card.name}
                  className={styles.categoryCardImage}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
                <div className={styles.categoryCardOverlay}></div>
                <div className={styles.categoryCardContent}>
                  <h3 className={styles.categoryCardTitle}>{card.name}</h3>
                  <span className={styles.categoryCardCount}>{card.count}</span>
                  <span className={styles.categoryCardAction}>
                    SHOP COLLECTION <span>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < sortedCards.length && (
            <div className={styles.loadMoreWrapper}>
              <button
                onClick={() => setVisibleCount(prev => prev + 4)}
                className={styles.loadMoreBtn}
              >
                LOAD MORE COLLECTIONS <span>↻</span>
              </button>
            </div>
          )}
        </section>

        {/* 4. NEW ARRIVALS WIDE BANNER */}
        <section className={styles.newArrivalsBanner}>
          <div className={styles.newArrivalsContent}>
            <span className={styles.newArrivalsTag}>JUST IN</span>
            <h2 className={styles.newArrivalsTitle}>NEW ARRIVALS</h2>
            <p className={styles.newArrivalsDesc}>
              Be the first to explore our latest designs crafted with love and perfection.
            </p>
            <Link href="#shop-by-category" className={styles.newArrivalsBtn}>
              EXPLORE NOW →
            </Link>
          </div>
        </section>

        {/* 5. INSTAGRAM SECTION */}
        <section className={styles.instagramSection}>
          <div className={styles.instagramHeader}>
            <h2 className={styles.instagramTitle}>FOLLOW OUR JOURNEY</h2>
            <span className={styles.instagramHandle}>@DEERAGLOW ◆</span>
          </div>

          <div className={styles.instagramWrapper}>
            <div className={styles.instagramGrid}>
              {[
                '/images/featured_rings_bg.png',
                '/images/hero_slide_1.png',
                '/images/featured_necklaces_bg.png',
                '/images/hero_slide_2.png',
                '/images/featured_earrings_bg.png',
                '/images/category_banner_jewellery.png',
                '/images/featured_bracelets_bg.png',
                '/images/hero_slide_3.png'
              ].map((imgUrl, idx) => (
                <div key={idx} className={styles.instagramItem}>
                  <Image
                    src={imgUrl}
                    alt={`Instagram post ${idx + 1}`}
                    fill
                    sizes="120px"
                    className={styles.instagramImg}
                  />
                </div>
              ))}
            </div>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramBtn}
            >
              VIEW INSTAGRAM →
            </a>
          </div>
        </section>

        {/* 6. TRUST FEATURES BAR */}
        <section className={styles.trustBar}>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🚚</span>
            <div>
              <h4 className={styles.trustTitle}>FREE SHIPPING</h4>
              <p className={styles.trustSubtitle}>On orders above ₹999</p>
            </div>
          </div>

          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🔄</span>
            <div>
              <h4 className={styles.trustTitle}>EASY RETURNS</h4>
              <p className={styles.trustSubtitle}>14 days return policy</p>
            </div>
          </div>

          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🔒</span>
            <div>
              <h4 className={styles.trustTitle}>SECURE PAYMENT</h4>
              <p className={styles.trustSubtitle}>100% secure payments</p>
            </div>
          </div>

          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🎧</span>
            <div>
              <h4 className={styles.trustTitle}>CUSTOMER SUPPORT</h4>
              <p className={styles.trustSubtitle}>24/7 support available</p>
            </div>
          </div>
        </section>

      </div>

      {/* 7. WHAT OUR CUSTOMERS LOVE (FULL CUSTOMER EXPERIENCE SECTION) */}
      <CustomerExperience />
    </main>
  );
}
