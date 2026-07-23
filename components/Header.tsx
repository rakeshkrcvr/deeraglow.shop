"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/products';
import styles from './Header.module.css';

type RazorpayResponse = { razorpay_payment_id: string };
type Discount = {
  id: number;
  title: string;
  summary: string;
  discount_type: string;
  status: string;
  used_count: number;
  value_type?: 'fixed' | 'percentage';
  value_amount?: string | number;
  minimum_order_value?: string | number;
};
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  notes: { address: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function Header() {
  const { cartItems, cartCount, cartSubtotal, isCartOpen, setIsCartOpen, clearCart, addToCart, updateQuantity } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(179); // 2m 59s
  const [headerLogoUrl, setHeaderLogoUrl] = useState('');
  const [crossSellProducts, setCrossSellProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState('');

  // Checkout Drawer states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [abandonedCheckoutReference, setAbandonedCheckoutReference] = useState('');

  // Delivery address fields
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [deliveryFirstName, setDeliveryFirstName] = useState('');
  const [deliveryLastName, setDeliveryLastName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryApartment, setDeliveryApartment] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);

  const automaticCoupon = 'BUY 2 GET 2 FREE';

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

  React.useEffect(() => {
    const fetchCrossSellProducts = async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) return;

        const products = await res.json() as Product[];
        setCrossSellProducts(products.map(product => ({
          ...product,
          price: Number(product.price)
        })));
      } catch (err) {
        console.error('Error loading cart product suggestions:', err);
      }
    };

    fetchCrossSellProducts();
  }, []);

  React.useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await fetch('/api/admin/discounts', { cache: 'no-store' });
        if (!res.ok) return;

        const data = await res.json() as Discount[];
        setDiscounts(data);
      } catch (err) {
        console.error('Error loading discount codes:', err);
      }
    };

    fetchDiscounts();
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

  const createCheckoutReference = () => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  const buildCustomerName = () => [deliveryFirstName, deliveryLastName].map(value => value.trim()).filter(Boolean).join(' ');
  const buildDeliveryAddress = () => [
    deliveryAddress.trim(),
    deliveryApartment.trim(),
    [deliveryCity.trim(), deliveryState.trim()].filter(Boolean).join(', '),
    deliveryPincode.trim() ? `PIN ${deliveryPincode.trim()}` : ''
  ].filter(Boolean).join('\n');
  const normalizedPhone = deliveryPhone.replace(/\D/g, '').slice(-10);
  const customerPhone = normalizedPhone ? `+91 ${normalizedPhone}` : deliveryPhone.trim();

  const saveOrderToDb = async (paymentId: string) => {
    const customerName = buildCustomerName();
    const deliveryAddressText = buildDeliveryAddress();
    const activeCoupon = appliedDiscount?.title || automaticCoupon;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerName,
          total_price: `₹${estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          payment_status: 'Paid',
          items_count: `${cartCount} item${cartCount > 1 ? 's' : ''}`,
          channel: 'Deeksha<>Razorpay',
          customer_email: deliveryEmail.trim(),
          customer_phone: customerPhone,
          shipping_address: deliveryAddressText,
          billing_address: deliveryAddressText,
          notes: [
            `Razorpay payment ID: ${paymentId}`,
            `First name: ${deliveryFirstName.trim()}`,
            `Last name: ${deliveryLastName.trim()}`,
            `Email: ${deliveryEmail.trim()}`,
            `Phone: ${customerPhone}`,
            `Coupon: ${activeCoupon}`,
            `Save info: ${saveInfo ? 'Yes' : 'No'}`
          ].join('\n'),
          order_items: cartItems.map(item => ({
            product_id: item.product.id,
            name: item.product.name,
            image_url: item.product.image_url,
            quantity: item.quantity,
            selected_fragrance: item.selectedFragrance,
            price: `₹${Number(item.product.price).toLocaleString('en-IN')}`,
            total: `₹${(Number(item.product.price) * item.quantity).toLocaleString('en-IN')}`
          }))
        })
      });
      if (res.ok) {
        console.log("Order saved to database successfully with payment ID:", paymentId);
      }
    } catch (err) {
      console.error("Error saving order to database:", err);
    }
  };

  const markDiscountUsed = async () => {
    if (!appliedDiscount) return;

    try {
      await fetch('/api/admin/discounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appliedDiscount.id })
      });
    } catch (err) {
      console.error('Error marking discount as used:', err);
    }
  };

  const handleProceedToRazorpay = async () => {
    const isCheckoutFormValid =
      deliveryEmail.trim().includes('@') &&
      deliveryFirstName.trim() !== '' &&
      deliveryLastName.trim() !== '' &&
      deliveryAddress.trim() !== '' &&
      deliveryCity.trim() !== '' &&
      deliveryState.trim() !== '' &&
      deliveryPincode.trim() !== '' &&
      normalizedPhone.length === 10;

    if (!isCheckoutFormValid) {
      alert('Please fill all delivery details before payment.');
      return;
    }

    const customerName = buildCustomerName();
    const deliveryAddressText = buildDeliveryAddress();

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
        name: "Deera Glow",
        description: `Order Payment for ${cartCount} items`,
        image: "/images/category_banner_jewelry.png",
        handler: async function (response: RazorpayResponse) {
          setIsProcessingCheckout(false);
          await markDiscountUsed();
          await saveOrderToDb(response.razorpay_payment_id);
          setCheckoutSuccess(true);
        },
        prefill: {
          name: customerName,
          email: deliveryEmail.trim(),
          contact: normalizedPhone
        },
        notes: {
          address: deliveryAddressText
        },
        theme: {
          color: "#3e0030"
        },
        modal: {
          ondismiss: function () {
            setIsProcessingCheckout(false);
          }
        }
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout script is not loaded yet.');
      }

      const rzp = new window.Razorpay(options);
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

  const offerLabel = 'Buy 2 Get 2 Free';
  const isBuy2Get2Unlocked = cartCount >= 2;
  const unlockedMessage = isBuy2Get2Unlocked
    ? '🎉 Unlocked Buy 2 Get 2 Free'
    : cartCount === 1
      ? 'Add 1 more product to unlock Buy 2 Get 2 Free!'
      : 'Add 2 products to unlock Buy 2 Get 2 Free!';
  const progressPercent = Math.min((cartCount / 2) * 100, 100);
  const eligibleFreeGiftUnits = Math.floor(cartCount / 4) * 2;

  // Cart summary calculations
  const cartItemKey = (productId: number, selectedFragrance: string) => `${productId}-${selectedFragrance}`;
  const freeGiftValuesByItem = new Map<string, number>();
  const discountCandidates = cartItems
    .flatMap(item => Array.from({ length: item.quantity }, () => item))
    .sort((a, b) => a.product.price - b.product.price)
    .slice(0, eligibleFreeGiftUnits);

  discountCandidates.forEach(item => {
    const key = cartItemKey(item.product.id, item.selectedFragrance);
    freeGiftValuesByItem.set(key, (freeGiftValuesByItem.get(key) || 0) + item.product.price);
  });

  const automaticSaved = Array.from(freeGiftValuesByItem.values()).reduce((acc, value) => acc + value, 0);
  const couponBaseTotal = Math.max(cartSubtotal - automaticSaved, 0);
  const appliedDiscountValue = Number(appliedDiscount?.value_amount || 0);
  const appliedDiscountMinimumOrder = Number(appliedDiscount?.minimum_order_value || 0);
  const appliedDiscountRawAmount = appliedDiscount
    ? appliedDiscount.value_type === 'percentage'
      ? couponBaseTotal * (appliedDiscountValue / 100)
      : appliedDiscountValue
    : 0;
  const manualDiscountAmount = appliedDiscount && couponBaseTotal >= appliedDiscountMinimumOrder
    ? Math.min(Math.max(appliedDiscountRawAmount, 0), couponBaseTotal)
    : 0;
  const totalSaved = automaticSaved + manualDiscountAmount;
  const estimatedTotal = Math.max(couponBaseTotal - manualDiscountAmount, 0);
  const offerCompareTotal = cartSubtotal;
  const savePercent = offerCompareTotal > 0 ? Math.round((totalSaved / offerCompareTotal) * 100) : 0;

  const getItemFreeGiftValue = (productId: number, selectedFragrance: string) => {
    return freeGiftValuesByItem.get(cartItemKey(productId, selectedFragrance)) || 0;
  };

  const cartProductIds = new Set(cartItems.map(item => item.product.id));
  const availableCrossSells = crossSellProducts.filter(product => !cartProductIds.has(product.id));
  const crossSellPages = Math.max(1, Math.ceil(availableCrossSells.length / 3));
  const boundedSlideIndex = Math.min(slideIndex, crossSellPages - 1);
  const displayedCrossSells = availableCrossSells.slice(boundedSlideIndex * 3, boundedSlideIndex * 3 + 3);

  const applyCouponCode = () => {
    const normalizedCode = couponCode.trim().toUpperCase();
    const discount = discounts.find((item) => item.title.toUpperCase() === normalizedCode);

    setCouponMessage('');
    setCouponError('');

    if (!normalizedCode) {
      setCouponError('Enter a coupon code.');
      return;
    }

    if (!discount) {
      setCouponError('Coupon code is not valid.');
      setAppliedDiscount(null);
      return;
    }

    if (discount.status !== 'Active') {
      setCouponError('This coupon is not active.');
      setAppliedDiscount(null);
      return;
    }

    if (discount.discount_type === 'Buy X get Y') {
      setCouponMessage('Buy 2 Get 2 Free is already applied automatically.');
      setAppliedDiscount(null);
      return;
    }

    const minimumOrderValue = Number(discount.minimum_order_value || 0);
    if (couponBaseTotal < minimumOrderValue) {
      setCouponError(`Add ₹${(minimumOrderValue - couponBaseTotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })} more to use this coupon.`);
      setAppliedDiscount(null);
      return;
    }

    const valueAmount = Number(discount.value_amount || 0);
    if (valueAmount <= 0) {
      setCouponError('Coupon is missing a discount value.');
      setAppliedDiscount(null);
      return;
    }

    setAppliedDiscount(discount);
    setCouponCode(discount.title);
    setCouponMessage(`${discount.title} applied. You saved ${discount.value_type === 'percentage'
        ? `${valueAmount}%`
        : `₹${valueAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      }.`);
  };

  const removeAppliedCoupon = () => {
    setAppliedDiscount(null);
    setCouponMessage('');
    setCouponError('');
  };

  React.useEffect(() => {
    if (!isCheckoutOpen || checkoutSuccess || cartCount === 0 || !abandonedCheckoutReference) return;

    const hasCheckoutDetails = [
      deliveryEmail,
      deliveryFirstName,
      deliveryLastName,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryPincode,
      deliveryPhone
    ].some((value) => value.trim() !== '');

    if (!hasCheckoutDetails) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        await fetch('/api/admin/abandoned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_reference: abandonedCheckoutReference,
            email: deliveryEmail,
            first_name: deliveryFirstName,
            last_name: deliveryLastName,
            address: deliveryAddress,
            apartment: deliveryApartment,
            city: deliveryCity,
            state: deliveryState,
            pincode: deliveryPincode,
            phone: deliveryPhone,
            total_price: `₹${estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            items_count: `${cartCount} item${cartCount > 1 ? 's' : ''}`,
            checkout_items: cartItems.map(item => ({
              product_id: item.product.id,
              name: item.product.name,
              image_url: item.product.image_url,
              quantity: item.quantity,
              selected_fragrance: item.selectedFragrance,
              price: `₹${Number(item.product.price).toLocaleString('en-IN')}`,
              total: `₹${(Number(item.product.price) * item.quantity).toLocaleString('en-IN')}`
            }))
          }),
          signal: controller.signal
        });
      } catch (err) {
        if ((err as DOMException).name !== 'AbortError') {
          console.error('Error saving abandoned checkout:', err);
        }
      }
    }, 800);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    isCheckoutOpen,
    checkoutSuccess,
    cartCount,
    estimatedTotal,
    abandonedCheckoutReference,
    deliveryEmail,
    deliveryFirstName,
    deliveryLastName,
    deliveryAddress,
    deliveryApartment,
    deliveryCity,
    deliveryState,
    deliveryPincode,
    deliveryPhone,
    cartItems
  ]);

  return (
    <>
      {/* Top Banner Bar */}
      <div className={styles.promoBar}>
        <div className={`container ${styles.promoContainer}`}>
          <div className={styles.promoItem}>
            <span>Buy 2 Get 2 Free</span>
          </div>
          <div className={styles.promoItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <span>100% Secure Checkout</span>
          </div>
          <div className={styles.promoItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
            <span>Premium Handcrafted Jewelry</span>
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
              <img src={normalizedHeaderLogoUrl} alt="Deera Glow" className={styles.logoImage} />
            ) : (
              <>
                <span className={styles.logoTitle}>D E E R A  G L O W</span>
                <span className={styles.logoSubtitle}>PREMIUM ARTIFICIAL JEWELRY</span>
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
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l4 4 4-4" /></svg>
              </span>
              <div className={styles.dropdownMenu}>
                <Link href="/category/all-jewelry" onClick={() => setMobileMenuOpen(false)}>All Jewelry</Link>
                <Link href="/category/best-sellers" onClick={() => setMobileMenuOpen(false)}>Best Sellers</Link>
                <Link href="/category/new-arrivals" onClick={() => setMobileMenuOpen(false)}>New Arrivals</Link>
                <Link href="/category/rings" onClick={() => setMobileMenuOpen(false)}>Rings</Link>
                <Link href="/category/necklaces" onClick={() => setMobileMenuOpen(false)}>Necklaces</Link>
                <Link href="/category/earrings" onClick={() => setMobileMenuOpen(false)}>Earrings</Link>
              </div>
            </div>

            {/* Material Dropdown */}
            <div className={styles.dropdown}>
              <span className={styles.navLink}>
                Material
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l4 4 4-4" /></svg>
              </span>
              <div className={styles.dropdownMenu}>
                <Link href="/category/sterling-silver" onClick={() => setMobileMenuOpen(false)}>Sterling Silver</Link>
                <Link href="/category/gold-plated" onClick={() => setMobileMenuOpen(false)}>Gold Plated</Link>
                <Link href="/category/rose-gold" onClick={() => setMobileMenuOpen(false)}>Rose Gold</Link>
                <Link href="/category/cubic-zirconia" onClick={() => setMobileMenuOpen(false)}>Cubic Zirconia</Link>
                <Link href="/category/pearls" onClick={() => setMobileMenuOpen(false)}>Pearls</Link>
              </div>
            </div>

            {/* Occasions Dropdown */}
            <div className={styles.dropdown}>
              <span className={styles.navLink}>
                Occasions
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l4 4 4-4" /></svg>
              </span>
              <div className={styles.dropdownMenu}>
                <Link href="/category/daily-wear" onClick={() => setMobileMenuOpen(false)}>Daily Wear</Link>
                <Link href="/category/office-wear" onClick={() => setMobileMenuOpen(false)}>Office Wear</Link>
                <Link href="/category/party-wear" onClick={() => setMobileMenuOpen(false)}>Party Wear</Link>
                <Link href="/category/festive-wear" onClick={() => setMobileMenuOpen(false)}>Festive Wear</Link>
                <Link href="/category/anniversary-gifts" onClick={() => setMobileMenuOpen(false)}>Anniversary Gifts</Link>
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
                  <div className={`${styles.milestoneCircle} ${cartCount >= 1 ? styles.activeCircle : ''}`}>
                    {cartCount >= 1 ? '✓' : '%'}
                  </div>
                  <div className={styles.milestoneLabelPrice}>1 Item</div>
                  <div className={styles.milestoneLabelName}>Regular Price</div>
                </div>

                <div className={styles.milestoneTick} style={{ left: '66.6%' }}>
                  <div className={`${styles.milestoneCircle} ${cartCount >= 2 ? styles.activeCircle : ''}`}>
                    {cartCount >= 2 ? '✓' : '%'}
                  </div>
                  <div className={styles.milestoneLabelPrice}>2 Items</div>
                  <div className={styles.milestoneLabelName}>Get 2 Free</div>
                </div>

                <div className={styles.milestoneTick} style={{ left: '100%' }}>
                  <div className={`${styles.milestoneCircle} ${cartCount >= 2 ? styles.activeCircle : ''}`}>
                    {cartCount >= 2 ? '✓' : '%'}
                  </div>
                  <div className={styles.milestoneLabelPrice} style={{ right: 0, whiteSpace: 'nowrap' }}>Offer</div>
                  <div className={styles.milestoneLabelName} style={{ right: 0, whiteSpace: 'nowrap' }}>Buy 2 Get 2</div>
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
                  <p className={styles.emptySub}>Fill it with premium, handcrafted jewelry designed for you.</p>
                  <button className={styles.shopBtn} onClick={() => setIsCartOpen(false)}>
                    Browse Jewelry
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.itemsScrollContainer}>
                    {cartItems.map((item) => {
                      const itemBasePrice = item.product.price;
                      const itemSubtotal = itemBasePrice * item.quantity;
                      const itemGiftValue = getItemFreeGiftValue(item.product.id, item.selectedFragrance);
                      const itemEstimatedTotal = itemSubtotal - itemGiftValue;

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
                                ₹ {itemEstimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>

                            {/* Row 2: Fragrance selection (subtle) and Compare Price */}
                            <div className={styles.itemRowAlignTop}>
                              <span className={styles.itemMeta}>Option: {item.selectedFragrance}</span>
                              {itemGiftValue > 0 && (
                                <div className={styles.itemComparePrice}>
                                  ₹ {itemSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              )}
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
                            {itemGiftValue > 0 && (
                              <div className={styles.itemRowAlignCenter} style={{ marginTop: '10px' }}>
                                <div className={styles.itemCouponBadge}>
                                  <svg className={styles.tagIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                  </svg>
                                  <span>{offerLabel}</span>
                                </div>
                                <div className={styles.itemSavingsAmount}>
                                  Free ₹{itemGiftValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Related Products Cross-sell Slider */}
                  {displayedCrossSells.length > 0 && (
                    <div className={styles.crossSellSection}>
                      <div className={styles.crossSellHeader}>
                        <h3>Complete Your Ritual</h3>
                        <div className={styles.crossSellArrows}>
                          <button
                            type="button"
                            onClick={() => setSlideIndex(prev => (prev === 0 ? crossSellPages - 1 : prev - 1))}
                            className={styles.arrowBtn}
                            aria-label="Previous suggestions"
                            disabled={crossSellPages <= 1}
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={() => setSlideIndex(prev => (prev + 1) % crossSellPages)}
                            className={styles.arrowBtn}
                            aria-label="Next suggestions"
                            disabled={crossSellPages <= 1}
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
                              onClick={() => addToCart(prod, 1, 'Standard')}
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.couponBox}>
                    <div className={styles.couponBoxHeader}>
                      <span>Discount Coupon</span>
                      {appliedDiscount && (
                        <button type="button" onClick={removeAppliedCoupon} className={styles.couponRemoveBtn}>
                          Remove
                        </button>
                      )}
                    </div>
                    <div className={styles.couponInputRow}>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                          setCouponMessage('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            applyCouponCode();
                          }
                        }}
                        placeholder="Enter coupon code"
                        className={styles.couponInput}
                      />
                      <button type="button" onClick={applyCouponCode} className={styles.couponApplyBtn}>
                        Apply
                      </button>
                    </div>
                    {appliedDiscount && manualDiscountAmount > 0 && (
                      <div className={styles.couponSuccess}>
                        {appliedDiscount.title} applied. Saved ₹{manualDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                    {couponMessage && !appliedDiscount && <div className={styles.couponSuccess}>{couponMessage}</div>}
                    {couponError && <div className={styles.couponError}>{couponError}</div>}
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
                      ₹{offerCompareTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      {isBuy2Get2Unlocked && (
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
                      setAbandonedCheckoutReference(createCheckoutReference());
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

                  <button
                    className={styles.clearBtn}
                    onClick={() => {
                      setAbandonedCheckoutReference('');
                      clearCart();
                    }}
                  >
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
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '36px', color: 'var(--accent)' }}>✓</span>
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
                    <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', fontFamily: 'serif' }}>Deera Glow</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: 'var(--primary)',
                      backgroundColor: 'var(--accent-light)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      marginBottom: '2px'
                    }}>
                      ₹{totalSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })} saved so far • {cartCount} items
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {offerCompareTotal > 0 && (
                        <span style={{ fontSize: '11px', textDecoration: 'line-through', color: '#8c8c8c' }}>
                          ₹{offerCompareTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
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

                  {/* Champagne/Gold Savings Message */}
                  <div style={{
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--primary)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    textAlign: 'center',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
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
                        boxSizing: 'border-box',
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={deliveryFirstName}
                        onChange={(e) => setDeliveryFirstName(e.target.value)}
                        style={{
                          width: '100%',
                          minWidth: 0,
                          boxSizing: 'border-box',
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
                          width: '100%',
                          minWidth: 0,
                          boxSizing: 'border-box',
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
                        boxSizing: 'border-box',
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
                        boxSizing: 'border-box',
                        padding: '10px 12px',
                        border: '1px solid #cccccc',
                        borderRadius: '8px',
                        fontSize: '13px',
                        outline: 'none',
                        color: '#1a1a1a'
                      }}
                    />

                    {/* City, State & PIN code row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="City"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        style={{
                          width: '100%',
                          minWidth: 0,
                          boxSizing: 'border-box',
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
                          width: '100%',
                          minWidth: 0,
                          boxSizing: 'border-box',
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
                          width: '100%',
                          minWidth: 0,
                          boxSizing: 'border-box',
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
                        onChange={(e) => setDeliveryPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                      <span>Coupon</span>
                      <span>{appliedDiscount ? appliedDiscount.title : automaticCoupon}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                          setCouponMessage('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            applyCouponCode();
                          }
                        }}
                        placeholder="Enter coupon code"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          boxSizing: 'border-box',
                          padding: '10px 12px',
                          border: '1px solid #cccccc',
                          borderRadius: '8px',
                          fontSize: '13px',
                          outline: 'none',
                          color: '#1a1a1a'
                        }}
                      />
                      <button
                        type="button"
                        onClick={applyCouponCode}
                        style={{
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0 14px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Apply
                      </button>
                      {appliedDiscount && (
                        <button
                          type="button"
                          onClick={removeAppliedCoupon}
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#6d6d6d',
                            border: '1px solid #cccccc',
                            borderRadius: '8px',
                            padding: '0 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {appliedDiscount && manualDiscountAmount > 0 && (
                      <div style={{ fontSize: '11px', color: '#2d5c4d', fontWeight: '600' }}>
                        {appliedDiscount.title} applied. You saved ₹{manualDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
                      </div>
                    )}
                    {couponMessage && !appliedDiscount && (
                      <div style={{ fontSize: '11px', color: '#2d5c4d', fontWeight: '600' }}>{couponMessage}</div>
                    )}
                    {couponError && (
                      <div style={{ fontSize: '11px', color: '#b42318', fontWeight: '600' }}>{couponError}</div>
                    )}
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
