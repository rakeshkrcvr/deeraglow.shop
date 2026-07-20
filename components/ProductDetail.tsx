"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/products';
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
  const { addToCart } = useCart();
  
  // Interactivity States
  const [quantity, setQuantity] = useState<number>(1);
  const [adding, setAdding] = useState<boolean>(false);
  const [addingRelatedId, setAddingRelatedId] = useState<number | null>(null);
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
  
  const fragrancesList = useMemo(() => (
    (product.fragrances || 'Oud, Jasmin, Rose, Vanilla')
      .split(',')
      .map(f => f.trim())
      .filter(Boolean)
  ), [product.fragrances]);

  const [selectedFragranceByProduct, setSelectedFragranceByProduct] = useState<Record<number, string>>({});
  const selectedFragrance = selectedFragranceByProduct[product.id] || fragrancesList[0] || 'Vanilla';

  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [activeImgIndexByProduct, setActiveImgIndexByProduct] = useState<Record<number, number>>({});
  const activeImgIndex = activeImgIndexByProduct[product.id] || 0;
  const setActiveImgIndex = (nextIndex: number | ((prev: number) => number)) => {
    setActiveImgIndexByProduct(prev => {
      const currentIndex = prev[product.id] || 0;
      return {
        ...prev,
        [product.id]: typeof nextIndex === 'function' ? nextIndex(currentIndex) : nextIndex
      };
    });
  };
  
  // Accordion Toggle States
  const [openAccordion, setOpenAccordion] = useState<string | null>('ingredients');

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyActions(window.scrollY > 24);
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
        } else {
          localStorage.setItem(CUSTOMER_REVIEWS_STORAGE_KEY, JSON.stringify(defaultCustomerReviews));
        }
      } catch {
        setReviewCards(defaultCustomerReviews);
      }
    };

    loadReviews();
    window.addEventListener('storage', loadReviews);
    window.addEventListener('deeksha-reviews-updated', loadReviews);
    return () => {
      window.removeEventListener('storage', loadReviews);
      window.removeEventListener('deeksha-reviews-updated', loadReviews);
    };
  }, []);

  useEffect(() => {
    const loadMoments = () => {
      try {
        const savedMoments = localStorage.getItem(CUSTOMER_MOMENTS_STORAGE_KEY);
        if (savedMoments) {
          setCustomerMoments(normalizeCustomerMoments(JSON.parse(savedMoments)));
        } else {
          localStorage.setItem(CUSTOMER_MOMENTS_STORAGE_KEY, JSON.stringify(defaultCustomerMoments));
          setCustomerMoments(defaultCustomerMoments);
        }
      } catch {
        setCustomerMoments(defaultCustomerMoments);
      }
    };

    loadMoments();
    window.addEventListener('storage', loadMoments);
    window.addEventListener('deeksha-moments-updated', loadMoments);
    return () => {
      window.removeEventListener('storage', loadMoments);
      window.removeEventListener('deeksha-moments-updated', loadMoments);
    };
  }, []);

  useEffect(() => {
    const loadVideos = () => {
      try {
        const savedVideos = localStorage.getItem(CUSTOMER_VIDEOS_STORAGE_KEY);
        if (savedVideos) {
          setCustomerVideos(normalizeCustomerVideos(JSON.parse(savedVideos)));
        } else {
          localStorage.setItem(CUSTOMER_VIDEOS_STORAGE_KEY, JSON.stringify(defaultCustomerVideos));
          setCustomerVideos(defaultCustomerVideos);
        }
      } catch {
        setCustomerVideos(defaultCustomerVideos);
      }
    };

    loadVideos();
    window.addEventListener('storage', loadVideos);
    window.addEventListener('deeksha-videos-updated', loadVideos);
    return () => {
      window.removeEventListener('storage', loadVideos);
      window.removeEventListener('deeksha-videos-updated', loadVideos);
    };
  }, []);

  const currentPrice = product.price;
  const originalPrice = Math.round(currentPrice * 1.4); // 30% mark-up for discount look
  const discountPercent = 30;

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    setAdding(true);
    addToCart(product, quantity, selectedFragrance || 'Standard');
    setTimeout(() => {
      setAdding(false);
    }, 1500);
  };

  const handleAddRelatedToCart = (id: number) => {
    const relatedProd = allProducts.find(p => p.id === id);
    if (relatedProd) {
      setAddingRelatedId(id);
      addToCart(relatedProd, 1, 'Standard');
      setTimeout(() => {
        setAddingRelatedId(null);
      }, 1500);
    }
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedFragrance || 'Standard');
    setTimeout(() => {
      alert(`Proceeding to checkout with ${quantity} × ${product.name} (${selectedFragrance || 'Standard'} Option) for ₹${currentPrice * quantity}!`);
    }, 500);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  // Split scent notes feature
  const scentNotes = product.features.split('•').map(note => note.trim());

  // Filter 3 related products
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id)
    .slice(0, 3);

  const totalReviewCount = 1284 + Math.max(0, reviewCards.length - defaultCustomerReviews.length);
  const visibleReviewCards = [0, 1, 2]
    .map(offset => reviewCards[(activeReviewIndex + offset) % reviewCards.length])
    .filter(Boolean);
  const activeMoment = customerMoments[activeMomentIndex] || customerMoments[0] || defaultCustomerMoments[0];

  const previewCustomerVideos = customerVideos.slice(0, 3);

  const reviewStats = [
    { icon: '👥', value: '5,000+', label: 'Happy Customers' },
    { icon: '☆', value: '4.9/5', label: 'Average Rating' },
    { icon: '✨', value: '925', label: 'Sterling Silver' },
    { icon: '💎', value: 'Premium', label: 'Cubic Zirconia' },
    { icon: '□', value: 'Premium', label: 'Gift Packaging' },
    { icon: '▱', value: 'Pan India', label: 'Free Shipping' }
  ];

  // Get product gallery images
  const pool = [
    '/images/rings_category.png',
    '/images/bracelets_category.png',
    '/images/necklaces_category.png',
    '/images/earrings_category.png',
    '/images/charm_category.png',
    '/images/rings_category.png'
  ];
  const otherImages = pool.filter(img => img !== product.image_url);
  
  let images = [product.image_url];
  if (product.images && product.images.trim()) {
    images = product.images.split(',').map(img => img.trim()).filter(Boolean);
  } else {
    images = [product.image_url, otherImages[0], otherImages[1], otherImages[2]];
  }

  const handleReviewFormChange = (field: keyof ReviewFormData, value: string | boolean) => {
    setReviewForm(prev => ({ ...prev, [field]: value }));
  };

  const handleReviewSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const submittedReview: CustomerReview = {
      id: `review-${Date.now()}`,
      name: reviewForm.name.trim() || 'Happy Customer',
      city: reviewForm.city.trim() || 'India',
      time: 'Just now',
      helpful: 0,
      avatar: reviewForm.avatar.trim().startsWith('/') ? reviewForm.avatar.trim() : product.image_url,
      quote: reviewForm.quote.trim(),
      rating: Number(reviewForm.rating),
      verified: reviewForm.verified,
      productId: product.id,
      productName: product.name,
      productImage: product.image_url
    };

    if (!submittedReview.quote) return;

    setReviewCards(prev => {
      const nextReviews = [submittedReview, ...prev];
      localStorage.setItem(CUSTOMER_REVIEWS_STORAGE_KEY, JSON.stringify(nextReviews));
      window.dispatchEvent(new Event('deeksha-reviews-updated'));
      return nextReviews;
    });
    setActiveReviewIndex(0);
    setReviewForm({
      name: '',
      city: '',
      rating: '5',
      quote: '',
      avatar: '',
      verified: true
    });
    setIsReviewModalOpen(false);
  };

  const showPreviousReviews = () => {
    setActiveReviewIndex(prev => (prev === 0 ? reviewCards.length - 1 : prev - 1));
  };

  const showNextReviews = () => {
    setActiveReviewIndex(prev => (prev + 1) % reviewCards.length);
  };

  const openPhotoGallery = (index = 0) => {
    setActiveMomentIndex(index);
    setIsPhotoGalleryOpen(true);
  };

  const toggleVideoSound = (videoId: string) => {
    setUnmutedVideoIds(prev => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  return (
    <div className={styles.productDetailContainer}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.separator}>/</span>
          <span className={styles.breadcrumbLink}>Jewelry</span>
          <span className={styles.separator}>/</span>
          <span className={styles.activeBreadcrumb}>{product.name}</span>
        </nav>

        {/* Main 2-Column Split */}
        <div className={styles.layoutGrid}>
          
          {/* Left Column: Product Image Card with Thumbnails Slider */}
          <div className={styles.galleryColumn}>
            <div className={styles.imageCard}>
              <div className={styles.glowOverlay}></div>
              <Image 
                src={images[activeImgIndex]} 
                alt={product.name}
                width={500}
                height={500}
                priority
                className={styles.mainImg}
              />
            </div>
            
            {/* Thumbnail Slider Row */}
            <div className={styles.thumbnailSliderContainer}>
              <button 
                type="button"
                className={styles.sliderArrow} 
                onClick={() => setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                aria-label="Previous image"
              >
                ‹
              </button>
              <div className={styles.thumbnailsWrapper}>
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    type="button"
                    className={`${styles.thumbnailCard} ${activeImgIndex === idx ? styles.activeThumbnail : ''}`}
                    onClick={() => setActiveImgIndex(idx)}
                  >
                    <Image 
                      src={img} 
                      alt={`Product thumbnail ${idx + 1}`} 
                      width={80} 
                      height={80} 
                      className={styles.thumbnailImg} 
                    />
                  </button>
                ))}
              </div>
              <button 
                type="button"
                className={styles.sliderArrow} 
                onClick={() => setActiveImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                aria-label="Next image"
              >
                ›
              </button>
            </div>

            <div className={styles.batchBadgeContainer}>
              <span>Handcrafted in small batches</span>
            </div>
          </div>

          {/* Right Column: Scent Details & Purchase Options */}
          <div className={styles.infoColumn}>
            
            {/* Top Badges & Titles */}
            <span className={styles.editorialBadge}>BEST SELLER • LIMITED WINTER BATCH</span>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.tagline}>{product.tagline || '925 sterling silver — anti-tarnish — premium cubic zirconia'}</p>

            {/* Ratings Summary */}
            <div className={styles.ratingRow}>
              <span className={styles.stars}>★★★★★</span>
              <span className={styles.ratingVal}>{product.rating}</span>
              <span className={styles.reviewCount}>— {product.reviews_count + 1160} reviews</span>
            </div>

            {/* Offer Tag */}
            <div className={styles.offerBadge}>
              <span className={styles.offerIcon}>🏷️</span>
              <span className={styles.offerText}>BUY 2 GET 2 FREE — Add 4 to cart, pay for 2</span>
            </div>

            {/* Price Tags */}
            <div className={styles.priceRow}>
              <span className={styles.price}>₹{currentPrice}</span>
              <span className={styles.originalPrice}>₹{originalPrice}</span>
              <span className={styles.discountBadge}>{discountPercent}% OFF</span>
            </div>
            <p className={styles.taxSub}>Inclusive of all taxes • Batch #14, poured 2 days ago</p>

            {/* Alert Banner */}
            <div className={styles.alertBanner}>
              <span className={styles.redDot}></span>
              <p>Only <strong>7 pieces</strong> left in this batch — next handcrafted run isn&apos;t for 3 weeks.</p>
            </div>

            {/* Scent Notes Section */}
            <div className={styles.notesSection}>
              <h3 className={styles.sectionLabel}>Style & Features</h3>
              <div className={styles.notesList}>
                {scentNotes.map((note, index) => (
                  <span key={index} className={styles.notePill}>{note}</span>
                ))}
              </div>
            </div>

            {/* Product Specifications Block (Requested specifications) */}
            <div className={styles.specsBlock}>
              <h3 className={styles.sectionLabel}>Specifications</h3>
              <div className={styles.specsList}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Material:</span>
                  <span className={styles.specValue}>{product.fragrances || '925 Sterling Silver, Gold Plated, Cubic Zirconia'}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specValue}>Available Options</span>
                </div>
              </div>
            </div>

            {/* Option Selector Option */}
            <div className={styles.fragranceSection}>
              <h3 className={styles.sectionLabel}>Select Option / Size</h3>
              <div className={styles.fragranceGrid}>
                {fragrancesList.map((frag) => (
                  <button 
                    key={frag}
                    type="button"
                    className={`${styles.fragranceCard} ${selectedFragrance === frag ? styles.fragranceSelected : ''}`}
                    onClick={() => setSelectedFragranceByProduct(prev => ({ ...prev, [product.id]: frag }))}
                  >
                    {frag}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Actions row */}
            <div className={`${styles.actionsSection} ${showStickyActions ? styles.stickyActionsVisible : ''}`}>
              
              {/* Qty Selector */}
              <div className={styles.qtyContainer}>
                <button className={styles.qtyBtn} onClick={handleDecrement} aria-label="Decrease quantity">−</button>
                <span className={styles.qtyVal}>{quantity}</span>
                <button className={styles.qtyBtn} onClick={handleIncrement} aria-label="Increase quantity">+</button>
              </div>

              {/* Add to Cart button */}
              <button 
                className={`${styles.addBtn} ${adding ? styles.btnAdding : ''}`}
                onClick={handleAddToCart}
                disabled={adding}
              >
                {adding ? "Added to Cart ✓" : `Add to cart — ₹${currentPrice * quantity}`}
              </button>

            </div>

            {/* Buy it Now Button */}
            <button className={`${styles.buyNowBtn} ${showStickyActions ? styles.stickyActionsVisible : ''}`} onClick={handleBuyNow}>
              Buy it now
            </button>

            {/* Core Trust Grid (As requested by the user) */}
            <div className={styles.trustGrid}>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>💍</span>
                <div className={styles.trustText}>
                  <h4>Handcrafted with Love</h4>
                  <p>Premium quality artificial jewelry</p>
                </div>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>✨</span>
                <div className={styles.trustText}>
                  <h4>Tarnish Free Polish</h4>
                  <p>Long-lasting luxurious shine</p>
                </div>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>🍃</span>
                <div className={styles.trustText}>
                  <h4>Skin Friendly</h4>
                  <p>Nickel-free & hypoallergenic</p>
                </div>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>🚚</span>
                <div className={styles.trustText}>
                  <h4>Free Shipping</h4>
                  <p>On prepaid orders</p>
                </div>
              </div>
            </div>

            {/* Description & Fit Accordion Group */}
            <div className={styles.accordions}>
              
              {/* Care Accordion */}
              <div className={styles.accordionCard}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('burntime')}>
                  <span>Finish & Polish</span>
                  <span className={styles.accordionIcon}>{openAccordion === 'burntime' ? '−' : '+'}</span>
                </button>
                {openAccordion === 'burntime' && (
                  <div className={styles.accordionBody}>
                    <p className={styles.metaLabel}>{product.acc_burn_time || 'Anti-tarnish, high-shine premium finish'}</p>
                    <div className={styles.progressContainer}>
                      <div 
                        className={styles.progressBar} 
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Materials Accordion */}
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

              {/* Care Instructions Accordion */}
              <div className={styles.accordionCard}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('burning')}>
                  <span>Jewelry care instructions</span>
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

              {/* Shipping & Returns Accordion */}
              <div className={styles.accordionCard}>
                <button className={styles.accordionHeader} onClick={() => toggleAccordion('shipping')}>
                  <span>Shipping & returns</span>
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

        {/* Section: Made Slow, On Purpose */}
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
      <p>Whether it's a wedding, festival, party, or everyday wear, Deera Glow offers stylish jewelry that completes your look with confidence and grace.</p>
    </div>
  </div>
</section>

        {/* Section: What Customers Are Saying */}
        <section className={styles.testimonialsSection}>
          <div className={styles.customerLoveHeader}>
            <div className={styles.customerLoveScore}>
              <span>★★★★★</span>
              <strong>4.9/5</strong>
            </div>
            <h2>What Our Customers Love</h2>
            <p>Based on {totalReviewCount.toLocaleString('en-IN')} verified reviews from happy customers</p>
          </div>

          <div className={styles.customerLoveGrid}>
            <div className={styles.reviewSlider}>
              <div className={styles.reviewSliderTop}>
                <span>{activeReviewIndex + 1} / {reviewCards.length}</span>
                <div className={styles.reviewSliderControls}>
                  <button type="button" onClick={showPreviousReviews} aria-label="Previous reviews">‹</button>
                  <button type="button" onClick={showNextReviews} aria-label="Next reviews">›</button>
                </div>
              </div>

              <div className={styles.reviewSlideTrack}>
                {visibleReviewCards.map((review) => (
                  <article key={`${review.name}-${review.time}-${review.quote}`} className={styles.reviewCard}>
                    <div className={styles.reviewTop}>
                      <Image src={review.avatar} alt={review.name} width={64} height={64} className={styles.reviewAvatar} />
                      <div className={styles.reviewIdentity}>
                        <strong>{review.name}</strong>
                        <span>⌖ {review.city}</span>
                        {review.verified && <em>✓ Verified Purchase</em>}
                      </div>
                      <time>{review.time}</time>
                    </div>
                    <div className={styles.reviewStars}>{'★'.repeat(review.rating)}</div>
                    <p className={styles.reviewQuote}>{review.quote}</p>
                    <div className={styles.reviewProduct}>
                      <div>
                        <span>Bought:</span>
                        <strong>{review.productName}</strong>
                      </div>
                      <Image src={review.productImage} alt={review.productName} width={88} height={88} className={styles.reviewProductImage} />
                    </div>
                    <div className={styles.helpfulRow}>♥ Helpful ({review.helpful})</div>
                  </article>
                ))}
              </div>
            </div>

            <aside className={styles.ratingPanel}>
              <h3>Customer Rating</h3>
              <strong className={styles.ratingNumber}>4.9/5</strong>
              <div className={styles.ratingStars}>★★★★★</div>
              <p>Based on {totalReviewCount.toLocaleString('en-IN')}<br />verified reviews</p>
              {[
                ['5', '95%', '95%'],
                ['4', '4%', '4%'],
                ['3', '1%', '1%'],
                ['2', '0%', '0%'],
                ['1', '0%', '0%']
              ].map(([star, width, percent]) => (
                <div key={star} className={styles.ratingBarRow}>
                  <span>{star} ★</span>
                  <div className={styles.ratingTrack}>
                    <div style={{ width }}></div>
                  </div>
                  <strong>{percent}</strong>
                </div>
              ))}
              <button type="button" className={styles.reviewButton}>See all reviews →</button>
              <button type="button" className={styles.writeReviewButton} onClick={() => setIsReviewModalOpen(true)}>Write a review</button>
            </aside>
          </div>

          {isReviewModalOpen && (
            <div className={styles.reviewModalBackdrop} role="presentation" onClick={() => setIsReviewModalOpen(false)}>
              <div className={styles.reviewModal} role="dialog" aria-modal="true" aria-labelledby="review-modal-title" onClick={(event) => event.stopPropagation()}>
                <div className={styles.reviewModalHeader}>
                  <div>
                    <span>Share your experience</span>
                    <h3 id="review-modal-title">Write a review</h3>
                  </div>
                  <button type="button" onClick={() => setIsReviewModalOpen(false)} aria-label="Close review form">×</button>
                </div>

                <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
                  <div className={styles.reviewFormGrid}>
                    <label>
                      Name
                      <input
                        value={reviewForm.name}
                        onChange={(event) => handleReviewFormChange('name', event.target.value)}
                        placeholder="Priya Mehra"
                      />
                    </label>
                    <label>
                      City
                      <input
                        value={reviewForm.city}
                        onChange={(event) => handleReviewFormChange('city', event.target.value)}
                        placeholder="Delhi"
                      />
                    </label>
                  </div>

                  <label>
                    Rating
                    <select value={reviewForm.rating} onChange={(event) => handleReviewFormChange('rating', event.target.value)}>
                      <option value="5">5 stars</option>
                      <option value="4">4 stars</option>
                      <option value="3">3 stars</option>
                      <option value="2">2 stars</option>
                      <option value="1">1 star</option>
                    </select>
                  </label>

                  <label>
                    Review
                    <textarea
                      value={reviewForm.quote}
                      onChange={(event) => handleReviewFormChange('quote', event.target.value)}
                      placeholder="Tell us what you loved about the jewelry..."
                      required
                      rows={5}
                    />
                  </label>

                  <label>
                    Photo path
                    <input
                      value={reviewForm.avatar}
                      onChange={(event) => handleReviewFormChange('avatar', event.target.value)}
                      placeholder="/images/cozy_room_glow.png"
                    />
                  </label>

                  <label className={styles.reviewCheckbox}>
                    <input
                      type="checkbox"
                      checked={reviewForm.verified}
                      onChange={(event) => handleReviewFormChange('verified', event.target.checked)}
                    />
                    Verified purchase
                  </label>

                  <div className={styles.reviewFormActions}>
                    <button type="button" onClick={() => setIsReviewModalOpen(false)}>Cancel</button>
                    <button type="submit">Add review</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isPhotoGalleryOpen && (
            <div className={styles.photoModalBackdrop} role="presentation" onClick={() => setIsPhotoGalleryOpen(false)}>
              <div className={styles.photoModal} role="dialog" aria-modal="true" aria-labelledby="photo-modal-title" onClick={(event) => event.stopPropagation()}>
                <div className={styles.photoModalHeader}>
                  <div>
                    <span>Customer Photos</span>
                    <h3 id="photo-modal-title">Real Moments, Real Homes</h3>
                  </div>
                  <button type="button" onClick={() => setIsPhotoGalleryOpen(false)} aria-label="Close photo gallery">×</button>
                </div>

                <div className={styles.photoModalBody}>
                  <div className={styles.photoModalPreview}>
                    <Image
                      src={activeMoment.image}
                      alt={activeMoment.alt}
                      width={980}
                      height={640}
                      className={styles.photoModalImage}
                    />
                  </div>

                  <div className={styles.photoModalGrid}>
                    {customerMoments.map((moment, index) => (
                      <button
                        key={moment.id}
                        type="button"
                        className={`${styles.photoModalThumb} ${index === activeMomentIndex ? styles.photoModalThumbActive : ''}`}
                        onClick={() => setActiveMomentIndex(index)}
                        aria-label={`Show photo ${index + 1}`}
                      >
                        <Image src={moment.image} alt={moment.alt} width={160} height={110} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.customerMediaBlock}>
            <div className={styles.customerMediaHeading}>
              <div>
                <h3>Real Moments, Real Homes</h3>
                <p>Loved by 1,000+ customers</p>
              </div>
              <button type="button" onClick={() => openPhotoGallery(0)}>View all photos →</button>
            </div>
            <div className={styles.customerPhotoGrid}>
              {customerMoments.slice(0, 8).map((moment, index) => (
                <button
                  key={moment.id}
                  type="button"
                  className={styles.customerPhotoButton}
                  onClick={() => openPhotoGallery(index)}
                >
                  <Image src={moment.image} alt={moment.alt} width={180} height={120} className={styles.customerPhoto} />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.customerMediaBlock}>
            <div className={styles.customerMediaHeading}>
              <h3>Watch What Our Customers Say</h3>
              <a href="#instagram">View all videos →</a>
            </div>
            <div className={styles.customerVideoGrid}>
              {previewCustomerVideos.map((video) => (
                <article key={video.id} className={styles.customerVideoCard}>
                  <div className={styles.videoThumb}>
                    <video
                      src={video.videoUrl}
                      poster={video.thumbnail}
                      loop
                      muted={!unmutedVideoIds[video.id]}
                      autoPlay
                      playsInline
                    />
                    <span className={styles.playButton}>▶</span>
                    <button
                      type="button"
                      className={styles.videoMuteButton}
                      onClick={() => toggleVideoSound(video.id)}
                      aria-label={unmutedVideoIds[video.id] ? 'Mute video' : 'Unmute video'}
                    >
                      {unmutedVideoIds[video.id] ? '🔊' : '🔇'}
                    </button>
                    <time>{video.duration}</time>
                  </div>
                  <div className={styles.videoInfo}>
                    <h4>{video.title}</h4>
                    <p>by {video.author}</p>
                    {video.verified && <span>✓ Verified Purchase</span>}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.reviewStatsStrip}>
            {reviewStats.map((stat) => (
              <div key={stat.label} className={styles.reviewStat}>
                <span>{stat.icon}</span>
                <div>
                  <strong>{stat.value}</strong>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Before vs After Deera Glow */}
        <section className={styles.comparisonSection}>
          <div className={styles.storyHeader}>
            <span className={styles.storySubtitle}>EXPERIENCE THE DIFFERENCE</span>
            <h2 className={styles.storyTitle}>Before vs After Deera Glow</h2>
            <div className={styles.storyLine}></div>
            <p className={styles.comparisonSubTitle}>A small change that transforms your whole look & confidence.</p>
          </div>

          <div className={styles.comparisonContainer}>
            {/* Split Grid: Left Text | Center Slider | Right Text */}
            <div className={styles.comparisonSliderGrid}>
              
              {/* Left Side: Before Text list */}
              <div className={styles.beforeTextCol}>
                <div className={styles.columnHeader}>
                  <span className={styles.beforeBadge}>BEFORE</span>
                  <h3>Ordinary Life</h3>
                  <p className={styles.colSub}>Dull. Plain. Uninspired.</p>
                </div>
                <ul className={styles.featuresList}>
                  <li>
                    <span className={styles.featureEmoji}>🙁</span>
                    <div>
                      <strong>Dull & Plain Outfits</strong>
                      <p>Regular daily wear feels incomplete</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>💍</span>
                    <div>
                      <strong>Uninspired Styling</strong>
                      <p>Struggling to find the right signature piece</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>💫</span>
                    <div>
                      <strong>Fading & Tarnishing</strong>
                      <p>Cheap jewelry tarnishes after a few wears</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>🍃</span>
                    <div>
                      <strong>Skin Irritations</strong>
                      <p>Nickel-heavy accessories cause redness</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>😔</span>
                    <div>
                      <strong>Lack of Confidence</strong>
                      <p>Lacking that final elegant touch to stand out</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Center: Interactive Before/After Image Slider */}
              <div className={styles.sliderCenterCol}>
                <div className={styles.imageSlider}>
                  {/* Before (desaturated) */}
                  <div className={styles.beforeImageContainer}>
                    <img 
                      src="/images/category_banner_jewelry.png" 
                      alt="Dull Ordinary Look" 
                      className={styles.sliderImg} 
                      style={{ filter: 'grayscale(100%) contrast(90%) brightness(80%)' }}
                    />
                    <div className={styles.imageLabelLeft}>PLAIN LOOK</div>
                  </div>
                  
                  {/* After (warm glow) */}
                  <div 
                    className={styles.afterImageContainer} 
                    style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                  >
                    <img 
                      src="/images/category_banner_jewelry.png" 
                      alt="Vibrant Deera Glow Look" 
                      className={styles.sliderImg} 
                    />
                    <div className={styles.imageLabelRight}>DEERA GLOW</div>
                  </div>

                  {/* Drag Line divider */}
                  <div 
                    className={styles.sliderLine} 
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className={styles.sliderHandle}>
                      <span className={styles.sliderHandleArrow}>↔</span>
                    </div>
                  </div>

                  {/* Range input Overlay */}
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderPosition} 
                    onChange={(e) => setSliderPosition(parseInt(e.target.value, 10))}
                    className={styles.rangeInput}
                    aria-label="Image comparison slider"
                  />
                </div>
              </div>

              {/* Right Side: After Text list */}
              <div className={styles.afterTextCol}>
                <div className={styles.columnHeader}>
                  <span className={styles.afterBadge}>AFTER</span>
                  <h3>Deera Glow Moments</h3>
                  <p className={styles.colSub}>Elegant. Shining. Beautiful.</p>
                </div>
                <ul className={styles.featuresList}>
                  <li>
                    <span className={styles.featureEmoji}>😊</span>
                    <div>
                      <strong>Stunning Signature Look</strong>
                      <p>Instantly feel complete, styled & graceful</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>✨</span>
                    <div>
                      <strong>Compliment Magnet</strong>
                      <p>Beautiful handcrafted details that turn heads</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>🛡️</span>
                    <div>
                      <strong>Anti-Tarnish Polish</strong>
                      <p>Stays bright with long-lasting protective coating</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>🍃</span>
                    <div>
                      <strong>Skin-Friendly Comfort</strong>
                      <p>Hypoallergenic, lead-free & nickel-free silver base</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>👑</span>
                    <div>
                      <strong>Boosted Confidence</strong>
                      <p>Stand out and command attention in any room</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>

            {/* Bottom Row: Why Thousands Choose Deera Glow */}
            <div className={styles.chooseSection}>
              <h3 className={styles.chooseTitle}>Why Thousands Choose Deera Glow</h3>
              <div className={styles.chooseGrid}>
                <div className={styles.chooseCard}>
                  <span className={styles.chooseIcon}>🏅</span>
                  <div>
                    <h4>Premium Quality</h4>
                    <p>Finest metals & stones for daily wear</p>
                  </div>
                </div>
                <div className={styles.chooseCard}>
                  <span className={styles.chooseIcon}>🛡️</span>
                  <div>
                    <h4>Anti-Tarnish Polish</h4>
                    <p>Long lasting shine & protection</p>
                  </div>
                </div>
                <div className={styles.chooseCard}>
                  <span className={styles.chooseIcon}>🍃</span>
                  <div>
                    <h4>Skin Friendly</h4>
                    <p>Nickel-free, lead-free & hypoallergenic</p>
                  </div>
                </div>
                <div className={styles.chooseCard}>
                  <span className={styles.chooseIcon}>🎁</span>
                  <div>
                    <h4>Luxury Packaging</h4>
                    <p>Perfect for gifting & special moments</p>
                  </div>
                </div>
                <div className={styles.chooseCard}>
                  <span className={styles.chooseIcon}>🧡</span>
                  <div>
                    <h4>Handcrafted with Love</h4>
                    <p>Crafted with care in every piece</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section: Instagram Video Slider */}
        <section id="instagram" className={styles.instagramSection}>
          <div className={styles.storyHeader}>
            <span className={styles.storySubtitle}># ON INSTAGRAM</span>
            <h2 className={styles.storyTitle}>Capture the Glow</h2>
            <div className={styles.storyLine}></div>
          </div>
          
          <div className={styles.instagramGrid}>
            {customerVideos.map((video) => (
              <div key={video.id} className={styles.instagramCard}>
                <video 
                  src={video.videoUrl}
                  poster={video.thumbnail}
                  loop 
                  muted={!unmutedVideoIds[`instagram-${video.id}`]}
                  autoPlay
                  playsInline 
                  className={styles.instagramVideo}
                />
                <button
                  type="button"
                  className={styles.instagramMuteButton}
                  onClick={() => toggleVideoSound(`instagram-${video.id}`)}
                  aria-label={unmutedVideoIds[`instagram-${video.id}`] ? 'Mute video' : 'Unmute video'}
                >
                  {unmutedVideoIds[`instagram-${video.id}`] ? '🔊' : '🔇'}
                </button>
                <a href={video.link} target="_blank" rel="noopener noreferrer" className={styles.instagramOverlay}>
                  <div className={styles.instagramHoverContent}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.instagramSvg}>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4.75 4.75 0 1 1 12.63 8 4.75 4.75 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span className={styles.instagramHandle}>{video.title}</span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Related Products (using identical home page cards theme) */}
        <section className={styles.relatedSection}>
          <div className={styles.storyHeader}>
            <span className={styles.storySubtitle}>RECOMMENDED FOR YOU</span>
            <h2 className={styles.storyTitle}>Related Products</h2>
            <div className={styles.storyLine}></div>
          </div>
          
          <div className={styles.relatedProductsGrid}>
            {relatedProducts.map((p, index) => {
              const isAddingRelated = addingRelatedId === p.id;
              const originalPrice = Math.round((p.price / 0.7) / 100) * 100 - 1;
              const discountPercent = Math.round(((originalPrice - p.price) / originalPrice) * 100);
              
              return (
                <div key={p.id} className={styles.jewelryCard}>
                  
                  {/* Image Container with Badges */}
                  <div className={styles.imageSection}>
                    {index === 0 && (
                      <div className={styles.bestSellerBadge}>
                        <span>★ BEST SELLER</span>
                      </div>
                    )}

                    <button className={styles.wishlistBtn} aria-label="Add to wishlist">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>

                    <Link href={`/products/${p.slug}`} className={styles.imageLink}>
                      <div className={styles.imageContainer}>
                        <Image 
                          src={p.image_url} 
                          alt={p.name}
                          width={400}
                          height={400}
                          className={styles.image}
                        />
                      </div>
                    </Link>
                  </div>

                  {/* Content details */}
                  <div className={styles.info}>
                    <span className={styles.features}>{p.collection.toUpperCase()}</span>
                    
                    <Link href={`/products/${p.slug}`}>
                      <h3 className={styles.productName}>{p.name}</h3>
                    </Link>
                    
                    <div className={styles.ratingRow}>
                      <div className={styles.stars}>★★★★★</div>
                      <span className={styles.ratingValue}>{p.rating}</span>
                      <span className={styles.ratingSeparator}>|</span>
                      <span className={styles.reviewsCount}>{p.reviews_count} Reviews</span>
                    </div>

                    <div className={styles.priceRow}>
                      <span className={styles.price}>₹{p.price}</span>
                      <span className={styles.originalPrice}>₹{originalPrice}</span>
                      <span className={styles.discountBadge}>{discountPercent}% OFF</span>
                    </div>

                    <div className={styles.divider}></div>

                    {/* Action row matching second image */}
                    <div className={styles.actionRow}>
                      <button 
                        className={styles.addBagBtn}
                        onClick={() => handleAddRelatedToCart(p.id)}
                        disabled={isAddingRelated}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.btnIcon}>
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span>{isAddingRelated ? "ADDED" : "ADD TO BAG"}</span>
                      </button>

                      <button 
                        className={styles.buyNowBtn}
                        onClick={() => {
                          handleAddRelatedToCart(p.id);
                          setTimeout(() => {
                            alert(`Proceeding to checkout with ${p.name}!`);
                          }, 500);
                        }}
                      >
                        <span>BUY NOW</span>
                        <span className={styles.arrow}>→</span>
                      </button>

                      <Link href={`/products/${p.slug}`} className={styles.quickViewLink}>
                        <button className={styles.quickViewBtn} type="button">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          <span className={styles.quickViewText}>QUICK VIEW</span>
                        </button>
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
