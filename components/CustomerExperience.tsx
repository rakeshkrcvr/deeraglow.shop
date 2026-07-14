"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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
import styles from './CustomerExperience.module.css';

interface ReviewFormData {
  name: string;
  city: string;
  rating: string;
  quote: string;
  avatar: string;
  verified: boolean;
}

export default function CustomerExperience() {
  // Modal & Slide States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState<boolean>(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState<number>(0);
  const [activeMomentIndex, setActiveMomentIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  
  // Data States
  const [reviewCards, setReviewCards] = useState<CustomerReview[]>(defaultCustomerReviews);
  const [customerMoments, setCustomerMoments] = useState<CustomerMoment[]>(defaultCustomerMoments);
  const [customerVideos, setCustomerVideos] = useState<CustomerVideo[]>(defaultCustomerVideos);
  const [unmutedVideoIds, setUnmutedVideoIds] = useState<Record<string, boolean>>({});
  
  // Form State
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    name: '',
    city: '',
    rating: '5',
    quote: '',
    avatar: '',
    verified: true
  });

  // Load reviews from localStorage on mount and register custom listeners
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

  // Load moments from localStorage
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

  // Load videos from localStorage
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

  // Review slider computed details
  const totalReviewCount = 1284 + Math.max(0, reviewCards.length - defaultCustomerReviews.length);
  const visibleReviewCards = [0, 1, 2]
    .map(offset => reviewCards[(activeReviewIndex + offset) % reviewCards.length])
    .filter(Boolean);

  const activeMoment = customerMoments[activeMomentIndex] || customerMoments[0] || defaultCustomerMoments[0];
  const previewCustomerVideos = customerVideos.slice(0, 3);

  const reviewStats = [
    { icon: '👥', value: '5,000+', label: 'Happy Customers' },
    { icon: '☆', value: '4.9/5', label: 'Average Rating' },
    { icon: '◒', value: '100%', label: 'Natural Soy Wax' },
    { icon: '◷', value: '40+', label: 'Hours Burn Time' },
    { icon: '□', value: 'Premium', label: 'Gift Packaging' },
    { icon: '▱', value: 'Pan India', label: 'Free Shipping' }
  ];

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
      avatar: reviewForm.avatar.trim().startsWith('/') ? reviewForm.avatar.trim() : '/images/hero_candle.png',
      quote: reviewForm.quote.trim(),
      rating: Number(reviewForm.rating),
      verified: reviewForm.verified,
      productId: 0,
      productName: 'Signature Soy Wax Candle',
      productImage: '/images/hero_candle.png'
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
    <div className={styles.customerExperienceContainer}>
      {/* Section: Testimonials & Reviews */}
      <section className={styles.testimonialsSection}>
        <div className="container">
          
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

          {/* Customer Reviews Writing Modal */}
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
                      placeholder="Tell us what you loved about the candle..."
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

          {/* Lightbox photo modal */}
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

          {/* Real Moments Photo Gallery Block */}
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

          {/* Customer Video Testimonials Block */}
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

          {/* Trust stats badge strip */}
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

        </div>
      </section>

      {/* Section: Before vs After Deeksha */}
      <section className={styles.comparisonSection}>
        <div className="container">
          
          <div className={styles.storyHeader}>
            <span className={styles.storySubtitle}>EXPERIENCE THE DIFFERENCE</span>
            <h2 className={styles.storyTitle}>Before vs After Deeksha</h2>
            <div className={styles.storyLine}></div>
            <p className={styles.comparisonSubTitle}>A small change that transforms your whole space & mood.</p>
          </div>

          <div className={styles.comparisonContainer}>
            <div className={styles.comparisonSliderGrid}>
              
              {/* Left Side: Before Text list */}
              <div className={styles.beforeTextCol}>
                <div className={styles.columnHeader}>
                  <span className={styles.beforeBadge}>BEFORE</span>
                  <h3>Ordinary Life</h3>
                  <p className={styles.colSub}>Dull. Stressful. Uninspired.</p>
                </div>
                <ul className={styles.featuresList}>
                  <li>
                    <span className={styles.featureEmoji}>🙁</span>
                    <div>
                      <strong>Stress & Tired Mind</strong>
                      <p>Long day, no time for yourself</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>🏠</span>
                    <div>
                      <strong>Dull & Uninviting Space</strong>
                      <p>Feels empty and lifeless</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>💨</span>
                    <div>
                      <strong>No Pleasant Aroma</strong>
                      <p>Stale air & unwanted odors</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>🛌</span>
                    <div>
                      <strong>Hard to Relax</strong>
                      <p>Mind is restless, sleep is hard</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>🎁</span>
                    <div>
                      <strong>Ordinary Routine</strong>
                      <p>Just another regular day</p>
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
                      src="/images/dull_room_bw.png" 
                      alt="Dull Ordinary Life" 
                      className={styles.sliderImg} 
                    />
                    <div className={styles.imageLabelLeft}>DULL & GRAY</div>
                  </div>
                  
                  {/* After (warm glow) */}
                  <div 
                    className={styles.afterImageContainer} 
                    style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                  >
                    <img 
                      src="/images/cozy_room_glow.png" 
                      alt="Cozy Deeksha Ambience" 
                      className={styles.sliderImg} 
                    />
                    <div className={styles.imageLabelRight}>DEEKSHA GLOW</div>
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
                  <h3>Deeksha Moments</h3>
                  <p className={styles.colSub}>Warm. Relaxing. Magical.</p>
                </div>
                <ul className={styles.featuresList}>
                  <li>
                    <span className={styles.featureEmoji}>😊</span>
                    <div>
                      <strong>Calm & Relaxed Mind</strong>
                      <p>Instantly feel peaceful & light</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>🏠</span>
                    <div>
                      <strong>Warm & Cozy Ambience</strong>
                      <p>Transforms your space beautifully</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>🌸</span>
                    <div>
                      <strong>Luxurious Fragrance</strong>
                      <p>Long-lasting, premium aroma</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>🧘</span>
                    <div>
                      <strong>Better Sleep & Well-being</strong>
                      <p>Helps you unwind & relax</p>
                    </div>
                  </li>
                  <li>
                    <span className={styles.featureEmoji}>🎁</span>
                    <div>
                      <strong>Special Moments</strong>
                      <p>Makes every moment memorable</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>

            {/* Bottom Row: Why Thousands Choose Deeksha */}
            <div className={styles.chooseSection}>
              <h3 className={styles.chooseTitle}>Why Thousands Choose Deeksha</h3>
              <div className={styles.chooseGrid}>
                <div className={styles.chooseCard}>
                  <span className={styles.chooseIcon}>🏅</span>
                  <div>
                    <h4>Premium Quality</h4>
                    <p>Finest ingredients for the best experience</p>
                  </div>
                </div>
                <div className={styles.chooseCard}>
                  <span className={styles.chooseIcon}>⏳</span>
                  <div>
                    <h4>Long Lasting Burn</h4>
                    <p>30–40 hours of pure bliss</p>
                  </div>
                </div>
                <div className={styles.chooseCard}>
                  <span className={styles.chooseIcon}>🍃</span>
                  <div>
                    <h4>Clean & Safe</h4>
                    <p>Non-toxic, low smoke & eco-friendly</p>
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
                    <p>Made with care in every candle</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section: Instagram Video Grid */}
      <section id="instagram" className={styles.instagramSection}>
        <div className="container">
          
          <div className={styles.storyHeader}>
            <span className={styles.storySubtitle}>#DEEKSHACANDLES ON INSTAGRAM</span>
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

        </div>
      </section>
    </div>
  );
}
