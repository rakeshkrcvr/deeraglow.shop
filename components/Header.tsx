"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

export default function Header() {
  const { cartItems, cartCount, cartSubtotal, isCartOpen, setIsCartOpen, clearCart, addToCart, updateQuantity } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(179); // 2m 59s
  const [headerLogoUrl, setHeaderLogoUrl] = useState('');

  // Checkout Drawer states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  
  // Delivery address fields (pre-filled with values from user's Screenshot 4)
  const [deliveryEmail, setDeliveryEmail] = useState('rakeshkrcvr@gmail.com');
  const [deliveryFirstName, setDeliveryFirstName] = useState('Rakesh');
  const [deliveryLastName, setDeliveryLastName] = useState('Kumar');
  const [deliveryAddress, setDeliveryAddress] = useState('110084 Tomar Colony Kamal Pur Burari');
  const [deliveryApartment, setDeliveryApartment] = useState('House No 213');
  const [deliveryCity, setDeliveryCity] = useState('Delhi');
  const [deliveryState, setDeliveryState] = useState('Delhi');
  const [deliveryPincode, setDeliveryPincode] = useState('110084');
  const [deliveryPhone, setDeliveryPhone] = useState('9318416649');
  const [saveInfo, setSaveInfo] = useState(true);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('2999 - FREE GIFT + EXTRA 15%');
  
  React.useEffect(() => {
    if (!isCartOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 179; // Loop back to 2m 59s
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCartOpen]);

  React.useEffect(() => {
    // Check if script is already present
    if (document.getElementById('razorpay-checkout-script')) return;
    
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  React.useEffect(() => {
    const fetchLogoSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        if (!res.ok) return;

        const settings = await res.json();
        if (typeof settings.logoHeaderUrl === 'string') {
          setHeaderLogoUrl(settings.logoHeaderUrl);
        }
      } catch (err) {
        console.error('Error loading header logo:', err);
      }
    };

    fetchLogoSettings();
  }, []);

  const normalizeAssetUrl = (url: string) => {
    if (!url) return '';

    try {
      const parsedUrl = new URL(url);
      const currentHostname = typeof window === 'undefined' ? '' : window.location.hostname;
      if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === currentHostname) {
        return `${parsedUrl.pathname}${parsedUrl.search}`;
      }
    } catch {
      return url;
    }

    return url;
  };

  const normalizedHeaderLogoUrl = normalizeAssetUrl(headerLogoUrl);

  const saveOrderToDb = async (paymentId: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: `${deliveryFirstName} ${deliveryLastName}`,
          total_price: `₹${estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          payment_status: 'Paid',
          items_count: `${cartCount} item${cartCount > 1 ? 's' : ''}`,
          channel: 'Deeksha<>Razorpay'
        })
      });
      if (res.ok) {
        console.log("Order saved to database successfully with payment ID:", paymentId);
      }
    } catch (err) {
      console.error("Error saving order to database:", err);
    }
  };

  const handleProceedToRazorpay = async () => {
    setIsProcessingCheckout(true);
    try {
      const settingsRes = await fetch('/api/admin/settings');
      const settingsData = await settingsRes.json();
      const keyId = settingsData.razorpayKeyId;
      
      if (!keyId) {
        alert("Razorpay Key ID is not configured in Admin Dashboard > Settings.");
        setIsProcessingCheckout(false);
        return;
      }

      const options = {
        key: keyId,
        amount: Math.round(estimatedTotal * 100), // amount in paisa
        currency: "INR",
        name: "Deeksha Candles",
        description: `Order Payment for ${cartCount} items`,
        image: "/images/hero_candle.png",
        handler: function (response: any) {
          setIsProcessingCheckout(false);
          setCheckoutSuccess(true);
          saveOrderToDb(response.razorpay_payment_id);
        },
        prefill: {
          name: `${deliveryFirstName} ${deliveryLastName}`,
          email: deliveryEmail,
          contact: deliveryPhone
        },
        notes: {
          address: `${deliveryAddress}, ${deliveryApartment}, ${deliveryCity}, ${deliveryState} - ${deliveryPincode}`
        },
        theme: {
          color: "#0b1a11"
        },
        modal: {
          ondismiss: function () {
            setIsProcessingCheckout(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay trigger error:", err);
      alert("Failed to initialize Razorpay checkout. Please make sure the Key ID is correct.");
      setIsProcessingCheckout(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`;
  };

  // Tier Discount logic
  let activeDiscountPercent = 0;
  let activeDiscountLabel = '';
  let unlockedMessage = '';
  
  if (cartSubtotal >= 2999) {
    activeDiscountPercent = 15;
    activeDiscountLabel = '2999 - Free Gift + Extra 15%';
    unlockedMessage = '🎉 Unlocked Free Gift + 15% Discount';
  } else if (cartSubtotal >= 1999) {
    activeDiscountPercent = 10;
    activeDiscountLabel = '1999 - Extra 10%';
    unlockedMessage = '🎉 Unlocked Extra 10% Discount';
  } else if (cartSubtotal >= 999) {
    activeDiscountPercent = 5;
    activeDiscountLabel = '999 - Extra 5%';
    unlockedMessage = '🎉 Unlocked Extra 5% Discount';
  } else {
    activeDiscountPercent = 0;
    activeDiscountLabel = '';
    unlockedMessage = `Add ₹${999 - cartSubtotal} more to unlock Extra 5% Discount!`;
  }

  // Calculate Progress Percent
  let progressPercent = 0;
  if (cartSubtotal === 0) {
    progressPercent = 0;
  } else if (cartSubtotal < 999) {
    progressPercent = (cartSubtotal / 999) * 33.3;
  } else if (cartSubtotal < 1999) {
    progressPercent = 33.3 + ((cartSubtotal - 999) / 1000) * 33.3;
  } else if (cartSubtotal < 2999) {
    progressPercent = 66.6 + ((cartSubtotal - 1999) / 1000) * 33.4;
  } else {
    progressPercent = 100;
  }

  // Cart summary calculations
  let compareTotal = 0;
  let estimatedTotal = 0;
  
  cartItems.forEach(item => {
    const itemComparePrice = Math.round(item.product.price * 2.3);
    const itemSellingPrice = item.product.price * (1 - activeDiscountPercent / 100);
    compareTotal += itemComparePrice * item.quantity;
    estimatedTotal += itemSellingPrice * item.quantity;
  });

  const totalSaved = compareTotal - estimatedTotal;
  const savePercent = compareTotal > 0 ? Math.round((totalSaved / compareTotal) * 100) : 0;

  const CROSS_SELL_PRODUCTS = [
    { id: 1, name: "Sandalwood Sacred Ritual", price: 899, image_url: "/images/hero_candle.png", slug: "sandalwood-sacred-ritual" },
    { id: 2, name: "Lavender & Midnight Oud", price: 849, image_url: "/images/lavender_candle.png", slug: "lavender-midnight-oud" },
    { id: 3, name: "Jasmine & Crushed Mint", price: 799, image_url: "/images/jasmine_candle.png", slug: "jasmine-crushed-mint" },
    { id: 4, name: "Eucalyptus & Silver Cedar", price: 949, image_url: "/images/eucalyptus_candle.png", slug: "eucalyptus-silver-cedar" },
    { id: 5, name: "Amber Vanilla & Warm Tobacco", price: 999, image_url: "/images/vanilla_candle.png", slug: "amber-vanilla-warm-tobacco" },
    { id: 6, name: "Mystic Rose & Smoke Oud", price: 899, image_url: "/images/rose_candle.png", slug: "mystic-rose-smoke-oud" }
  ];

  const displayedCrossSells = slideIndex === 0 
    ? CROSS_SELL_PRODUCTS.slice(0, 3) 
    : CROSS_SELL_PRODUCTS.slice(3, 6);

  return (
    <>
      {/* Top Banner Bar */}
      <div className={styles.promoBar}>
        <div className={`container ${styles.promoContainer}`}>
          <div className={styles.promoItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Free Shipping on Orders Over ₹999</span>
          </div>
          <div className={styles.promoItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>100% Secure Checkout</span>
          </div>
          <div className={styles.promoItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span>Hand-Poured Natural Soy Wax</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className={styles.header}>
        <div className={`container ${styles.headerContainer}`}>
          
          {/* Mobile Menu Button */}
          <button 
            className={styles.menuToggle} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className={`${styles.hamburger} ${mobileMenuOpen ? styles.open : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          {/* Logo */}
          <Link href="/" className={styles.logoContainer}>
            {normalizedHeaderLogoUrl ? (
              <img src={normalizedHeaderLogoUrl} alt="Deeksha Candles" className={styles.logoImage} />
            ) : (
              <>
                <span className={styles.logoTitle}>D E E K S H A</span>
                <span className={styles.logoSubtitle}>ARTISANAL ILLUMINATION</span>
              </>
            )}
          </Link>

          {/* Desktop Navigation links */}
          <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navActive : ''}`}>
            <Link href="/" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>Home</Link>
            
            {/* Shop Dropdown */}
            <div className={styles.dropdown}>
              <span className={styles.navLink}>
                Shop
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l4 4 4-4"/></svg>
              </span>
              <div className={styles.dropdownMenu}>
                <Link href="/category/all-candles" onClick={() => setMobileMenuOpen(false)}>All Candles</Link>
                <Link href="/category/best-sellers" onClick={() => setMobileMenuOpen(false)}>Best Sellers</Link>
                <Link href="/category/new-arrivals" onClick={() => setMobileMenuOpen(false)}>New Arrivals</Link>
                <Link href="/category/luxury-collection" onClick={() => setMobileMenuOpen(false)}>Luxury Collection</Link>
                <Link href="/category/gift-sets" onClick={() => setMobileMenuOpen(false)}>Gift Sets</Link>
                <Link href="/category/combo-packs" onClick={() => setMobileMenuOpen(false)}>Combo Packs</Link>
              </div>
            </div>

            {/* Fragrance Dropdown */}
            <div className={styles.dropdown}>
              <span className={styles.navLink}>
                Fragrance
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l4 4 4-4"/></svg>
              </span>
              <div className={styles.dropdownMenu}>
                <Link href="/category/vanilla" onClick={() => setMobileMenuOpen(false)}>Vanilla</Link>
                <Link href="/category/lavender" onClick={() => setMobileMenuOpen(false)}>Lavender</Link>
                <Link href="/category/rose" onClick={() => setMobileMenuOpen(false)}>Rose</Link>
                <Link href="/category/jasmine" onClick={() => setMobileMenuOpen(false)}>Jasmine</Link>
                <Link href="/category/sandalwood" onClick={() => setMobileMenuOpen(false)}>Sandalwood</Link>
                <Link href="/category/coffee" onClick={() => setMobileMenuOpen(false)}>Coffee</Link>
              </div>
            </div>

            {/* Occasions Dropdown */}
            <div className={styles.dropdown}>
              <span className={styles.navLink}>
                Occasions
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l4 4 4-4"/></svg>
              </span>
              <div className={styles.dropdownMenu}>
                <Link href="/category/birthday" onClick={() => setMobileMenuOpen(false)}>Birthday</Link>
                <Link href="/category/anniversary" onClick={() => setMobileMenuOpen(false)}>Anniversary</Link>
                <Link href="/category/housewarming" onClick={() => setMobileMenuOpen(false)}>Housewarming</Link>
                <Link href="/category/diwali" onClick={() => setMobileMenuOpen(false)}>Diwali</Link>
                <Link href="/category/valentines" onClick={() => setMobileMenuOpen(false)}>Valentine's</Link>
              </div>
            </div>

            <Link href="/about" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            <Link href="/blogs" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>Blogs</Link>
            <Link href="/contact" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </nav>

          {/* Header Icons */}
          <div className={styles.iconContainer}>
            {/* Search (Decorative for visual fidelity) */}
            <button className={styles.iconButton} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* Profile (Decorative) */}
            <button className={styles.iconButton} aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

            {/* Cart Icon with Counter */}
            <button 
              className={styles.cartButton} 
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open shopping cart with ${cartCount} items`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsCartOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            {/* Urgency countdown timer at the top of the drawer */}
            <div className={styles.urgencyCountdownBar}>
              Hurry! Your Offer will expire in <span className={styles.timerBold}>{formatTime(timeLeft)}</span>
            </div>

            <div className={styles.drawerHeader}>
              <h2>Your Shopping Cart</h2>
              <button 
                className={styles.closeDrawer} 
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Reward tiers milestone section */}
            <div className={styles.offerMilestonesSection}>
              <div className={styles.milestoneUnlockedTitle}>
                {unlockedMessage}
              </div>
              <div className={styles.tierProgressBarContainer}>
                <div className={styles.tierProgressBarLine}>
                  <div className={styles.tierProgressBarFill} style={{ width: `${progressPercent}%` }}></div>
                </div>
                
                <div className={styles.milestoneTick} style={{ left: '0%' }}>
                  <div className={`${styles.milestoneCircle} ${styles.activeCircle}`}>%</div>
                  <div className={styles.milestoneLabelPrice}>₹0</div>
                </div>
                
                <div className={styles.milestoneTick} style={{ left: '33.3%' }}>
                  <div className={`${styles.milestoneCircle} ${cartSubtotal >= 999 ? styles.activeCircle : ''}`}>
                    {cartSubtotal >= 999 ? '✓' : '%'}
                  </div>
                  <div className={styles.milestoneLabelPrice}>₹999</div>
                  <div className={styles.milestoneLabelName}>Extra 5%</div>
                </div>

                <div className={styles.milestoneTick} style={{ left: '66.6%' }}>
                  <div className={`${styles.milestoneCircle} ${cartSubtotal >= 1999 ? styles.activeCircle : ''}`}>
                    {cartSubtotal >= 1999 ? '✓' : '%'}
                  </div>
                  <div className={styles.milestoneLabelPrice}>₹1,999</div>
                  <div className={styles.milestoneLabelName}>Extra 10%</div>
                </div>

                <div className={styles.milestoneTick} style={{ left: '100%' }}>
                  <div className={`${styles.milestoneCircle} ${cartSubtotal >= 2999 ? styles.activeCircle : ''}`}>
                    {cartSubtotal >= 2999 ? '✓' : '%'}
                  </div>
                  <div className={styles.milestoneLabelPrice} style={{ right: 0, whiteSpace: 'nowrap' }}>₹2,999</div>
                  <div className={styles.milestoneLabelName} style={{ right: 0, whiteSpace: 'nowrap' }}>Free Gift + 15%</div>
                </div>
              </div>
            </div>

            <div className={styles.drawerContent}>
              {cartCount === 0 ? (
                <div className={styles.emptyCart}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <p>Your cart is empty.</p>
                  <p className={styles.emptySub}>Fill it with the soothing essence of hand-crafted wicks.</p>
                  <button className={styles.shopBtn} onClick={() => setIsCartOpen(false)}>
                    Browse Candles
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.itemsScrollContainer}>
                    {cartItems.map((item) => {
                      const itemBasePrice = item.product.price;
                      const itemComparePriceSingle = Math.round(itemBasePrice * 2.3);
                      const itemDiscountedPriceSingle = itemBasePrice * (1 - activeDiscountPercent / 100);
                      const itemTierDiscountAmount = itemBasePrice * (activeDiscountPercent / 100);
                      
                      return (
                        <div key={`${item.product.id}-${item.selectedFragrance}`} className={styles.cartItem}>
                          <div className={styles.itemImageContainer}>
                            <img src={item.product.image_url} alt={item.product.name} className={styles.itemImg} />
                          </div>
                          
                          <div className={styles.itemContentArea}>
                            {/* Row 1: Title and Final Price */}
                            <div className={styles.itemRowAlignTop}>
                              <h3 className={styles.itemTitle}>{item.product.name}</h3>
                              <div className={styles.itemFinalPrice}>
                                ₹ {(itemDiscountedPriceSingle * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                            
                            {/* Row 2: Fragrance selection (subtle) and Compare Price */}
                            <div className={styles.itemRowAlignTop}>
                              <span className={styles.itemMeta}>Fragrance: {item.selectedFragrance}</span>
                              <div className={styles.itemComparePrice}>
                                ₹ {(itemComparePriceSingle * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                            
                            {/* Row 3: Quantity selector */}
                            <div className={styles.itemRowAlignCenter}>
                              <div className={styles.qtyBox}>
                                <button 
                                  type="button"
                                  className={styles.qtyBtn} 
                                  onClick={() => updateQuantity(item.product.id, item.selectedFragrance, item.quantity - 1)}
                                >
                                  −
                                </button>
                                <span className={styles.qtyVal}>{item.quantity}</span>
                                <button 
                                  type="button"
                                  className={styles.qtyBtn} 
                                  onClick={() => updateQuantity(item.product.id, item.selectedFragrance, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            {/* Row 4: Coupon Applied Badge & Tier Savings */}
                            {activeDiscountPercent > 0 && (
                              <div className={styles.itemRowAlignCenter} style={{ marginTop: '10px' }}>
                                <div className={styles.itemCouponBadge}>
                                  <svg className={styles.tagIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                  </svg>
                                  <span>{activeDiscountLabel}</span>
                                </div>
                                <div className={styles.itemSavingsAmount}>
                                  -₹{(itemTierDiscountAmount * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Related Products Cross-sell Slider */}
                  <div className={styles.crossSellSection}>
                    <div className={styles.crossSellHeader}>
                      <h3>Complete Your Ritual</h3>
                      <div className={styles.crossSellArrows}>
                        <button 
                          type="button"
                          onClick={() => setSlideIndex(prev => (prev === 0 ? 1 : 0))} 
                          className={styles.arrowBtn}
                          aria-label="Previous suggestions"
                        >
                          ‹
                        </button>
                        <button 
                          type="button"
                          onClick={() => setSlideIndex(prev => (prev === 1 ? 0 : 1))} 
                          className={styles.arrowBtn}
                          aria-label="Next suggestions"
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    <div className={styles.crossSellGrid}>
                      {displayedCrossSells.map((prod) => (
                        <div key={prod.id} className={styles.crossSellCard}>
                          <div className={styles.crossSellImageContainer}>
                            <img src={prod.image_url} alt={prod.name} className={styles.crossSellImage} />
                          </div>
                          <h4 className={styles.crossSellName}>{prod.name}</h4>
                          <span className={styles.crossSellPrice}>₹{prod.price}</span>
                          <button 
                            type="button"
                            className={styles.crossSellAddBtn}
                            onClick={() => {
                              const fullProd = {
                                id: prod.id,
                                name: prod.name,
                                slug: prod.slug,
                                price: prod.price,
                                image_url: prod.image_url,
                                collection: 'Scented Candles',
                                rating: 4.8,
                                reviews_count: 18,
                                description: 'Aromatic luxury candle designed to elevate your mood.',
                                features: 'Scented • Soy Wax • Cotton Wick'
                              };
                              addToCart(fullProd, 1, 'Vanilla');
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {cartCount > 0 && (
              <div className={styles.drawerFooter}>
                {/* Redesigned checkout summary section */}
                <div className={styles.cartSummaryRedesigned}>
                  <div className={styles.summarySavePillRow}>
                    <div className={styles.summarySavePill}>
                      Save ₹{totalSaved.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ({savePercent}% OFF)
                    </div>
                  </div>
                  
                  <div className={styles.originalTotalRow}>
                    <span></span>
                    <span className={styles.originalTotalPriceText}>
                      ₹{compareTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className={styles.estimatedTotalRow}>
                    <div className={styles.estimatedTotalLabelWrapper}>
                      <div className={styles.rupeeBadgeIcon}>₹</div>
                      <div className={styles.estimatedTotalLabelTextCol}>
                        <div className={styles.estimatedTotalLabelTitle}>Estimated Total</div>
                        <div className={styles.freeShippingLabel}>✔️ FREE SHIPPING!</div>
                      </div>
                    </div>
                    <div className={styles.estimatedTotalAmountCol}>
                      <div className={styles.estimatedTotalAmountValue}>
                        ₹{estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      {activeDiscountPercent > 0 && (
                        <div className={styles.estimatedTotalOffPercent}>
                          {savePercent}% OFF
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Secure Checkout Rounded pill button */}
                  <button 
                    className={styles.checkoutBtnPill} 
                    onClick={() => {
                      setCheckoutSuccess(false);
                      setIsCheckoutOpen(true);
                    }}
                  >
                    <span className={styles.checkoutBtnText}>PROCEED TO CHECKOUT</span>
                    <div className={styles.paymentLogosWrapper}>
                      <div className={`${styles.paymentLogoCircle} ${styles.gpayCircle}`}>GPay</div>
                      <div className={`${styles.paymentLogoCircle} ${styles.applepayCircle}`}>Pay</div>
                      <div className={`${styles.paymentLogoCircle} ${styles.paytmCircle}`}>Paytm</div>
                    </div>
                  </button>
                  
                  <button className={styles.clearBtn} onClick={clearCart}>
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}      {/* Checkout Drawer Overlay Modal */}
      {isCheckoutOpen && (() => {
        const isFormValid = 
          deliveryEmail.trim().includes('@') &&
          deliveryFirstName.trim() !== '' &&
          deliveryLastName.trim() !== '' &&
          deliveryAddress.trim() !== '' &&
          deliveryCity.trim() !== '' &&
          deliveryState.trim() !== '' &&
          deliveryPincode.trim() !== '' &&
          deliveryPhone.trim().length >= 10;

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 5000,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            color: '#1a1a1a'
          }}>
            {/* Inject spin keyframes */}
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>

            {checkoutSuccess ? (
              /* Success State */
              <div style={{
                width: '460px',
                maxWidth: '90vw',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                padding: '40px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#e2ece9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '36px', color: '#2d5c4d' }}>✓</span>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 12px 0', color: '#1a1a1a' }}>Order Placed! 🎉</h2>
                <p style={{ fontSize: '14px', color: '#6d6d6d', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                  Thank you for your order, <strong>{deliveryFirstName} {deliveryLastName}</strong>. Your order has been registered, and payment is completed.
                </p>
                
                <div style={{ width: '100%', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'left', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#6d6d6d' }}>Total Paid:</span>
                    <strong style={{ color: '#1a1a1a' }}>₹{estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#6d6d6d' }}>Payment Gateway:</span>
                    <span style={{ fontWeight: '600', color: '#3399FF' }}>Razorpay Secure</span>
                  </div>
                  <div style={{ borderTop: '1px solid #e3e3e3', paddingTop: '8px', marginTop: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Shipping Address:</div>
                    <div style={{ color: '#6d6d6d' }}>{deliveryAddress}, {deliveryApartment ? deliveryApartment + ', ' : ''}{deliveryCity}, {deliveryState} - {deliveryPincode}</div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    clearCart();
                    setIsCheckoutOpen(false);
                    setCheckoutSuccess(false);
                    setIsCartOpen(false);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              /* Checkout Flow State with form inputs */
              <div style={{
                width: '460px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                backgroundColor: '#f6f6f6',
                borderRadius: '16px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                
                {/* Spinner Overlay */}
                {isProcessingCheckout && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 6000,
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '3px solid #e3e3e3',
                      borderTopColor: '#1a1a1a',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                      Securing payment details...
                    </div>
                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                      Connecting to Razorpay
                    </div>
                  </div>
                )}

                {/* Header */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid #e3e3e3',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <button 
                    onClick={() => setIsCheckoutOpen(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: '#6d6d6d',
                      padding: '8px'
                    }}
                  >
                    ←
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', fontFamily: 'serif' }}>DEEKSHA CANDLES</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ 
                      fontSize: '10px', 
                      fontWeight: '700', 
                      color: '#2d5c4d', 
                      backgroundColor: '#e2ece9', 
                      borderRadius: '4px', 
                      padding: '2px 6px',
                      marginBottom: '2px'
                    }}>
                      ₹{totalSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })} saved so far • {cartCount} items
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {compareTotal > 0 && (
                        <span style={{ fontSize: '11px', textDecoration: 'line-through', color: '#8c8c8c' }}>
                          ₹{compareTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      )}
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>
                        ₹{estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scrollable Container */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Green Savings Message */}
                  <div style={{
                    backgroundColor: '#e2ece9',
                    color: '#2d5c4d',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    textAlign: 'center',
                    border: '1px solid rgba(45, 92, 77, 0.1)'
                  }}>
                    You saved ₹{totalSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>

                  {/* Contact Section */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e3e3e3', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Contact</h4>
                      <span style={{ fontSize: '12px', color: '#6d6d6d' }}>
                        Already have an account? <span style={{ color: '#ff4d4d', cursor: 'pointer', textDecoration: 'underline' }}>Sign in</span>
                      </span>
                    </div>
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={deliveryEmail}
                      onChange={(e) => setDeliveryEmail(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '10px 12px', 
                        border: '1px solid #cccccc', 
                        borderRadius: '8px', 
                        fontSize: '13px',
                        outline: 'none',
                        color: '#1a1a1a'
                      }}
                    />
                  </div>

                  {/* Delivery Address Section */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e3e3e3', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Delivery Details</h4>
                    
                    {/* First & Last Name row */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="First Name" 
                        value={deliveryFirstName}
                        onChange={(e) => setDeliveryFirstName(e.target.value)}
                        style={{ 
                          flex: 1,
                          padding: '10px 12px', 
                          border: '1px solid #cccccc', 
                          borderRadius: '8px', 
                          fontSize: '13px',
                          outline: 'none',
                          color: '#1a1a1a'
                        }}
                      />
                      <input 
                        type="text" 
                        placeholder="Last Name" 
                        value={deliveryLastName}
                        onChange={(e) => setDeliveryLastName(e.target.value)}
                        style={{ 
                          flex: 1,
                          padding: '10px 12px', 
                          border: '1px solid #cccccc', 
                          borderRadius: '8px', 
                          fontSize: '13px',
                          outline: 'none',
                          color: '#1a1a1a'
                        }}
                      />
                    </div>

                    {/* Address */}
                    <input 
                      type="text" 
                      placeholder="Address (Area and Street)" 
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '10px 12px', 
                        border: '1px solid #cccccc', 
                        borderRadius: '8px', 
                        fontSize: '13px',
                        outline: 'none',
                        color: '#1a1a1a'
                      }}
                    />

                    {/* Apartment / Suite */}
                    <input 
                      type="text" 
                      placeholder="Apartment, suite, unit, etc. (optional)" 
                      value={deliveryApartment}
                      onChange={(e) => setDeliveryApartment(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '10px 12px', 
                        border: '1px solid #cccccc', 
                        borderRadius: '8px', 
                        fontSize: '13px',
                        outline: 'none',
                        color: '#1a1a1a'
                      }}
                    />

                    {/* City, State & PIN code row */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="City" 
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        style={{ 
                          flex: 1.2,
                          padding: '10px 12px', 
                          border: '1px solid #cccccc', 
                          borderRadius: '8px', 
                          fontSize: '13px',
                          outline: 'none',
                          color: '#1a1a1a'
                        }}
                      />
                      <input 
                        type="text" 
                        placeholder="State" 
                        value={deliveryState}
                        onChange={(e) => setDeliveryState(e.target.value)}
                        style={{ 
                          flex: 1,
                          padding: '10px 12px', 
                          border: '1px solid #cccccc', 
                          borderRadius: '8px', 
                          fontSize: '13px',
                          outline: 'none',
                          color: '#1a1a1a'
                        }}
                      />
                      <input 
                        type="text" 
                        placeholder="PIN code" 
                        value={deliveryPincode}
                        onChange={(e) => setDeliveryPincode(e.target.value)}
                        style={{ 
                          flex: 1,
                          padding: '10px 12px', 
                          border: '1px solid #cccccc', 
                          borderRadius: '8px', 
                          fontSize: '13px',
                          outline: 'none',
                          color: '#1a1a1a'
                        }}
                      />
                    </div>

                    {/* Phone */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cccccc', borderRadius: '8px', padding: '6px 12px', backgroundColor: '#ffffff' }}>
                      <span style={{ fontSize: '13px', color: '#6d6d6d', borderRight: '1px solid #e3e3e3', paddingRight: '8px', marginRight: '8px' }}>
                        +91
                      </span>
                      <input 
                        type="tel" 
                        placeholder="Phone Number (10 digits)" 
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        style={{ 
                          border: 'none', 
                          outline: 'none', 
                          fontSize: '13px', 
                          color: '#1a1a1a', 
                          width: '100%' 
                        }}
                      />
                    </div>

                    {/* Save info Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <input 
                        type="checkbox" 
                        id="saveInfo" 
                        checked={saveInfo}
                        onChange={(e) => setSaveInfo(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label htmlFor="saveInfo" style={{ fontSize: '12px', color: '#6d6d6d', cursor: 'pointer', userSelect: 'none' }}>
                        Save this information for next time
                      </label>
                    </div>
                  </div>

                  {/* Offers & Rewards Coupon Status */}
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e3e3e3', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: '600', color: '#2d5c4d' }}>
                      <span>Coupon Applied:</span>
                      <span>"{appliedCoupon}"</span>
                    </div>
                  </div>

                  {/* Continue button */}
                  <button 
                    onClick={handleProceedToRazorpay}
                    disabled={!isFormValid}
                    style={{
                      width: '100%',
                      backgroundColor: isFormValid ? '#1a1a1a' : '#cccccc',
                      color: isFormValid ? '#ffffff' : '#666666',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '14px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isFormValid ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      marginBottom: '10px'
                    }}
                  >
                    Pay ₹{estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </button>

                  {/* Gokwik Brand trust info */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6d6d6d' }}>
                      <span>🔒</span>
                      <span>100% data security and encryption by Razorpay</span>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderTop: '1px solid #e3e3e3',
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '11px',
                  color: '#8c8c8c'
                }}>
                  <div>Secure Checkout powered by Razorpay</div>
                </div>

              </div>
            )}
          </div>
        );
      })()}
    </>
  );
}
