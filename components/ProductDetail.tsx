"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/products';
import CustomerExperience from '@/components/CustomerExperience';
import {
  CUSTOMER_REVIEWS_STORAGE_KEY,
  CustomerReview,
  defaultCustomerReviews,
  normalizeCustomerReviews
} from '@/lib/customerReviews';
import {
  CUSTOMER_MOMENTS_STORAGE_KEY,
  CustomerMoment,
  defaultCustomerMoments,
  normalizeCustomerMoments
} from '@/lib/customerMoments';
import {
  CUSTOMER_VIDEOS_STORAGE_KEY,
  CustomerVideo,
  defaultCustomerVideos,
  normalizeCustomerVideos
} from '@/lib/customerVideos';
import styles from './ProductDetail.module.css';

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
}

interface ReviewFormData {
  name: string;
  city: string;
  rating: string;
  quote: string;
  avatar: string;
  verified: boolean;
}

export default function ProductDetail({ product, allProducts }: ProductDetailProps) {
  const { addToCart, setIsCartOpen } = useCart();
  
  // Interactivity States
  const [quantity, setQuantity] = useState<number>(1);
  const [adding, setAdding] = useState<boolean>(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [selectedFinish, setSelectedFinish] = useState<string>('Gold Plated');
  const [showStickyActions, setShowStickyActions] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState<boolean>(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState<number>(0);
  const [activeMomentIndex, setActiveMomentIndex] = useState<number>(0);
  const [reviewCards, setReviewCards] = useState<CustomerReview[]>(defaultCustomerReviews);
  const [customerMoments, setCustomerMoments] = useState<CustomerMoment[]>(defaultCustomerMoments);
  const [customerVideos, setCustomerVideos] = useState<CustomerVideo[]>(defaultCustomerVideos);
  const [unmutedVideoIds, setUnmutedVideoIds] = useState<Record<string, boolean>>({});
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    name: '',
    city: '',
    rating: '5',
    quote: '',
    avatar: '',
    verified: true
  });

  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>('ingredients');

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyActions(window.scrollY > 200);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadReviews = () => {
      try {
        const savedReviews = localStorage.getItem(CUSTOMER_REVIEWS_STORAGE_KEY);
        if (savedReviews) {
          setReviewCards(normalizeCustomerReviews(JSON.parse(savedReviews)));
        }
      } catch {
        setReviewCards(defaultCustomerReviews);
      }
    };
    loadReviews();
  }, []);

  const currentPrice = product.price;
  const originalPrice = Math.round(currentPrice * 1.45);
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    setAdding(true);
    addToCart({
      ...product,
      name: `${product.name} (${selectedFinish})`,
    }, quantity);
    setIsCartOpen(true);
    setTimeout(() => setAdding(false), 1200);
  };

  const handleBuyNow = () => {
    addToCart({
      ...product,
      name: `${product.name} (${selectedFinish})`,
    }, quantity);
    setIsCartOpen(true);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  // Get product gallery images
  const pool = [
    product.image_url || '/images/rings_category.png',
    '/images/bracelets_category.png',
    '/images/necklaces_category.png',
    '/images/earrings_category.png',
    '/images/charm_category.png'
  ];
  let images = [product.image_url || '/images/rings_category.png'];
  if (product.images && product.images.trim()) {
    images = product.images.split(',').map(img => img.trim()).filter(Boolean);
  } else {
    images = [product.image_url || '/images/rings_category.png', pool[1], pool[2], pool[3], pool[4]];
  }

  const categoryName = product.collection || 'Earrings';

  return (
    <div className={styles.productDetailContainer}>
      <div className="container">
        
        {/* Top Breadcrumb Navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.separator}>›</span>
          <span className={styles.breadcrumbLink}>Jewelry</span>
          <span className={styles.separator}>›</span>
          <Link href={`/category/${categoryName.toLowerCase()}`} className={styles.breadcrumbLink}>{categoryName}</Link>
          <span className={styles.separator}>›</span>
          <span className={styles.activeBreadcrumb}>{product.name}</span>
        </nav>

        {/* Main 2-Column Split */}
        <div className={styles.layoutGrid}>
          
          {/* Left Column: Product Gallery & Badges */}
          <div className={styles.galleryColumn}>
            <div className={styles.galleryFlexWrapper}>
              
              {/* Thumbnail Vertical Column */}
              <div className={styles.thumbnailsVertical}>
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    type="button"
                    className={`${styles.thumbBtn} ${activeImgIndex === idx ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImgIndex(idx)}
                  >
                    <Image 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      width={64} 
                      height={64} 
                      className={styles.thumbImg} 
                    />
                    {idx === 2 && <span className={styles.videoPlayThumb}>▶</span>}
                  </button>
                ))}
              </div>

              {/* Main Image Box */}
              <div className={styles.mainImageCard}>
                <div className={styles.imageTagsContainer}>
                  <span className={styles.bestSellerImgTag}>🔥 BEST SELLER</span>
                  <span className={styles.buy2Get2ImgTag}>🎁 BUY 2 GET 2 FREE</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={styles.wishlistHeartBtn}
                  aria-label="Add to Wishlist"
                >
                  {isWishlisted ? '❤️' : '♡'}
                </button>

                <Image 
                  src={images[activeImgIndex]} 
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 520px"
                  className={styles.mainImg}
                />
              </div>

            </div>

            {/* Media Action Buttons Row */}
            <div className={styles.mediaActionsRow}>
              <button type="button" className={styles.mediaBtn}>🔍 Zoom</button>
              <button type="button" className={styles.mediaBtn}>🔄 360° View</button>
              <button type="button" className={styles.mediaBtn}>▶ Video</button>
              <button type="button" className={styles.mediaBtn}>↗ Share</button>
            </div>

            {/* 4 Feature Badges Card Below Gallery */}
            <div className={styles.galleryBadgesCard}>
              <div className={styles.galleryBadgeItem}>
                <span className={styles.galleryBadgeIcon}>💎</span>
                <div>
                  <strong>100% Quality Assured</strong>
                  <p>Premium Quality</p>
                </div>
              </div>
              <div className={styles.galleryBadgeItem}>
                <span className={styles.galleryBadgeIcon}>🏵️</span>
                <div>
                  <strong>925 Sterling Silver</strong>
                  <p>Hallmarked</p>
                </div>
              </div>
              <div className={styles.galleryBadgeItem}>
                <span className={styles.galleryBadgeIcon}>🎁</span>
                <div>
                  <strong>Gift Packaging</strong>
                  <p>Premium Box</p>
                </div>
              </div>
              <div className={styles.galleryBadgeItem}>
                <span className={styles.galleryBadgeIcon}>✨</span>
                <div>
                  <strong>Lifetime Shine</strong>
                  <p>Tarnish Free</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Details & Purchase Options */}
          <div className={styles.infoColumn}>
            
            {/* Top Badges */}
            <div className={styles.topBadgesRow}>
              <span className={styles.badgePillGold}>🏆 Bestseller</span>
              <span className={styles.badgePillOutline}>⭐ Top Rated</span>
            </div>

            {/* Title & Tagline */}
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.subtitle}>{product.tagline || 'Timeless elegance for every occasion'}</p>

            {/* Rating & Verified Buyers */}
            <div className={styles.ratingRow}>
              <span className={styles.stars}>★★★★★</span>
              <strong className={styles.ratingScore}>{product.rating || '4.9'}</strong>
              <span className={styles.ratingCount}>({(product.reviews_count || 1284).toLocaleString()} Reviews)</span>
              <span className={styles.ratingSep}>|</span>
              <span className={styles.verifiedText}>✓ Verified Buyers</span>
            </div>

            {/* Buy 2 Get 2 Free Promo Box */}
            <div className={styles.promoBox}>
              <div className={styles.promoHeader}>
                <span className={styles.promoGiftIcon}>🎁</span>
                <strong>BUY 2 GET 2 FREE — ADD 4 TO CART, PAY FOR 2</strong>
              </div>
              <span className={styles.promoSubText}>Limited time offer • No code required</span>
            </div>

            {/* Price Row */}
            <div className={styles.priceRow}>
              <span className={styles.priceVal}>₹{currentPrice}</span>
              <span className={styles.originalPriceVal}>₹{originalPrice}</span>
              <span className={styles.discountBadgeTag}>{discountPercent}% OFF</span>
            </div>

            {/* Social Proof Bar */}
            <div className={styles.socialProofBar}>
              <span>🔥 284 Sold this week</span>
              <span>👁 18 People viewing now</span>
              <span>⏰ Sale ends in 05:12:48</span>
            </div>

            {/* 4 Guarantees Box */}
            <div className={styles.guaranteesBox}>
              <div className={styles.guaranteeItem}>
                <span className={styles.guaranteeIcon}>🚚</span>
                <div>
                  <strong>Free Shipping</strong>
                  <p>On all orders</p>
                </div>
              </div>

              <div className={styles.guaranteeItem}>
                <span className={styles.guaranteeIcon}>🔄</span>
                <div>
                  <strong>7 Days Returns</strong>
                  <p>Easy return policy</p>
                </div>
              </div>

              <div className={styles.guaranteeItem}>
                <span className={styles.guaranteeIcon}>🛡️</span>
                <div>
                  <strong>6 Months Warranty</strong>
                  <p>On all jewellery</p>
                </div>
              </div>

              <div className={styles.guaranteeItem}>
                <span className={styles.guaranteeIcon}>🔒</span>
                <div>
                  <strong>Secure Checkout</strong>
                  <p>100% protected</p>
                </div>
              </div>
            </div>

            {/* Select Finish */}
            <div className={styles.finishSection}>
              <label className={styles.finishLabel}>SELECT FINISH</label>
              <div className={styles.finishGrid}>
                {['Gold Plated', 'Silver', 'Rose Gold'].map((finish) => (
                  <button
                    key={finish}
                    type="button"
                    className={`${styles.finishBtn} ${selectedFinish === finish ? styles.finishActive : ''}`}
                    onClick={() => setSelectedFinish(finish)}
                  >
                    {finish}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & Action Buttons */}
            {(() => {
              const freeUnits = Math.floor(quantity / 4) * 2;
              const paidUnits = quantity - freeUnits;
              const effectiveTotalPrice = paidUnits * currentPrice;
              const rawTotalPrice = quantity * currentPrice;

              return (
                <div className={styles.purchaseActionsRow}>
                  <div className={styles.qtyBox}>
                    <label className={styles.qtyLabel}>QUANTITY</label>
                    <div className={styles.qtyStepper}>
                      <button type="button" onClick={handleDecrement} className={styles.qtyBtn}>−</button>
                      <span className={styles.qtyNum}>{quantity}</span>
                      <button type="button" onClick={handleIncrement} className={styles.qtyBtn}>+</button>
                    </div>
                  </div>

                  <div className={styles.mainBtnsGroup}>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className={styles.addCartBtn}
                    >
                      <span className={styles.cartIcon}>🛒</span>
                      {adding ? 'ADDED ✓' : freeUnits > 0 ? `ADD TO CART — ₹${effectiveTotalPrice.toLocaleString('en-IN')} (${freeUnits} FREE)` : `ADD TO CART — ₹${rawTotalPrice.toLocaleString('en-IN')}`}
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className={styles.buyNowBtn}
                    >
                      <span>⚡ BUY NOW</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Accepted Payments */}
            <div className={styles.paymentsRow}>
              <span className={styles.paymentsTitle}>Secure Checkout With</span>
              <div className={styles.paymentBadges}>
                <span className={styles.payBadge}>VISA</span>
                <span className={styles.payBadge}>Mastercard</span>
                <span className={styles.payBadge}>UPI</span>
                <span className={styles.payBadge}>GPay</span>
                <span className={styles.payBadge}>PhonePe</span>
                <span className={styles.payBadge}>Paytm</span>
              </div>
            </div>

            {/* Stock Urgency Progress Box */}
            <div className={styles.stockProgressBox}>
              <div className={styles.stockHeader}>
                <span>🔥 <strong>Only 7 Pieces Left</strong></span>
                <span>Next Restock in 18 Days</span>
              </div>
              <div className={styles.stockTrack}>
                <div className={styles.stockBar} style={{ width: '80%' }}></div>
              </div>
              <span className={styles.stockPercentText}>80% Sold</span>
            </div>

            {/* Description & Accordions */}
            <div className={styles.accordions}>
              <div className={styles.accordionCard}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('ingredients')}>
                  <span>Materials & Craftsmanship</span>
                  <span className={styles.accordionIcon}>{openAccordion === 'ingredients' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'ingredients' && (
                  <div className={styles.accordionBody}>
                    <p>
                      {product.acc_ingredients || "925 Sterling Silver base, 18k gold plating, AAA+ cubic zirconia, skin-friendly and completely lead and nickel free. Crafted to ensure lifetime durability and shine."}
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.accordionCard}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('burning')}>
                  <span>Jewelry Care Instructions</span>
                  <span className={styles.accordionIcon}>{openAccordion === 'burning' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'burning' && (
                  <div className={styles.accordionBody}>
                    <p>
                      {product.acc_instructions || "Avoid direct contact with water, sweat, perfumes, or harsh chemicals. Clean gently with a dry microfibre cloth and store in an airtight zip-lock bag when not in use."}
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.accordionCard}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('shipping')}>
                  <span>Shipping & Returns</span>
                  <span className={styles.accordionIcon}>{openAccordion === 'shipping' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'shipping' && (
                  <div className={styles.accordionBody}>
                    <p>
                      {product.acc_shipping || "Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the jewelry is completely unused and in its original packaging."}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Full-Width 4 Features Card */}
        <section className={styles.bottomFeaturesBar}>
          <div className={styles.bottomFeatureItem}>
            <span className={styles.bottomFeatureIcon}>💎</span>
            <div>
              <h4>Premium Quality</h4>
              <p>Finest materials for long lasting shine</p>
            </div>
          </div>

          <div className={styles.bottomFeatureItem}>
            <span className={styles.bottomFeatureIcon}>🍃</span>
            <div>
              <h4>Skin Friendly</h4>
              <p>Nickel free & hypoallergenic safe for all skin types</p>
            </div>
          </div>

          <div className={styles.bottomFeatureItem}>
            <span className={styles.bottomFeatureIcon}>💧</span>
            <div>
              <h4>Tarnish Free</h4>
              <p>Waterproof & sweatproof for everyday wear</p>
            </div>
          </div>

          <div className={styles.bottomFeatureItem}>
            <span className={styles.bottomFeatureIcon}>🎁</span>
            <div>
              <h4>Gift Ready</h4>
              <p>Comes in a premium box perfect for gifting</p>
            </div>
          </div>
        </section>

        {/* Section: WHY DEERA GLOW - Designed to Make You Shine */}
        <section className={styles.brandStorySection}>
          <div className={styles.storyHeader}>
            <span className={styles.storySubtitle}>WHY DEERA GLOW</span>
            <h2 className={styles.storyTitle}>Designed to make you shine</h2>
            <div className={styles.storyLine}></div>
          </div>

          <div className={styles.storyGrid}>
            <div className={styles.storyCard}>
              <span className={styles.storyCardIcon}>✨</span>
              <h3>Premium Quality</h3>
              <p>Crafted with high-quality materials and fine finishes, our artificial jewelry is designed to offer lasting beauty, comfort, and everyday elegance.</p>
            </div>

            <div className={styles.storyCard}>
              <span className={styles.storyCardIcon}>💎</span>
              <h3>Trendy & Timeless Designs</h3>
              <p>From everyday essentials to statement pieces, our carefully curated collection blends the latest trends with timeless elegance for every occasion.</p>
            </div>

            <div className={styles.storyCard}>
              <span className={styles.storyCardIcon}>❤️</span>
              <h3>Made for Every Occasion</h3>
              <p>Whether it&apos;s a wedding, festival, party, or everyday wear, Deera Glow offers stylish jewelry that completes your look with confidence and grace.</p>
            </div>
          </div>
        </section>

      </div>

      {/* Customer Experience Section (What Our Customers Love, Real Moments, Watch Videos, Trust Stats) */}
      <CustomerExperience />
    </div>
  );
}
