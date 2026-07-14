"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface Product {
  id: number;
  name: string;
  slug: string;
  collection: string;
  price: number;
  rating: number;
  reviews_count: number;
  description: string;
  image_url: string;
  features: string;
  tagline?: string;
  fragrances?: string;
  dimensions?: string;
  weight?: string;
  burn_hours?: string;
  acc_burn_time?: string;
  acc_ingredients?: string;
  acc_instructions?: string;
  acc_shipping?: string;
  images?: string;
  deleted_at?: string | null;
}

interface Order {
  id: number;
  order_number: string;
  date_str: string;
  customer: string;
  channel: string;
  total_price: string;
  payment_status: string;
  fulfillment_status: string;
  items_count: string;
  delivery_status: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
  order_items?: string;
}

interface OrderItem {
  product_id?: number;
  name: string;
  image_url: string;
  quantity: number;
  selected_fragrance?: string;
  price: string;
  total: string;
}

interface Draft {
  id: number;
  draft_number: string;
  date_str: string;
  customer: string;
  total_price: string;
  status: string;
  items_count: string;
}

interface AbandonedCheckout {
  id: number;
  checkout_number: string;
  date_str: string;
  customer: string;
  email: string;
  total_price: string;
  items_count: string;
  recovery_status: string;
  client_reference?: string;
  phone?: string;
  address?: string;
  checkout_items?: string;
}

interface Discount {
  id: number;
  title: string;
  summary: string;
  discount_type: string;
  status: string;
  used_count: number;
  value_type?: 'fixed' | 'percentage';
  value_amount?: string | number;
  minimum_order_value?: string | number;
}

interface Campaign {
  name: string;
  impressions: string;
  clicks: string;
  conversions: number;
  spend: string;
  sales: string;
  roi: string;
}

interface BlogPost {
  id: number;
  title: string;
  author: string;
  date: string;
  status: string;
}

interface NavigationMenu {
  id: number;
  menu: string;
  links: string;
}

interface Collection {
  id: number;
  name: string;
  description: string;
  slug: string;
}

interface MediaFile {
  id: number;
  url: string;
  filename: string;
  created_at: string;
}

type AdminTab = 'orders' | 'drafts' | 'abandoned' | 'products' | 'collections' | 'files' | 'discounts' | 'customers' | 'growth' | 'content' | 'analytics' | 'settings';

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  
  // Collapsible Dropdown States
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(false);
  const [isProductsExpanded, setIsProductsExpanded] = useState(false);
  const [isCustomersExpanded, setIsCustomersExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editableOrder, setEditableOrder] = useState<Order | null>(null);
  const [editableOrderItems, setEditableOrderItems] = useState<OrderItem[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [abandoned, setAbandoned] = useState<AbandonedCheckout[]>([]);
  const [selectedAbandonedCheckout, setSelectedAbandonedCheckout] = useState<AbandonedCheckout | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>(defaultCustomerReviews);
  const [customerMoments, setCustomerMoments] = useState<CustomerMoment[]>(defaultCustomerMoments);
  const [customerVideos, setCustomerVideos] = useState<CustomerVideo[]>(defaultCustomerVideos);
  const [uploadingMomentPhotos, setUploadingMomentPhotos] = useState(false);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    city: '',
    rating: '5',
    quote: '',
    avatar: '',
    helpful: '0',
    productId: '',
    verified: true
  });
  const [videoForm, setVideoForm] = useState({
    title: '',
    author: '',
    duration: '',
    videoUrl: '',
    thumbnail: '',
    link: '',
    verified: true
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [loadingAbandoned, setLoadingAbandoned] = useState(true);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);
  
  const router = useRouter();

  // New Product Form States
  const [name, setName] = useState('');
  const [collection, setCollection] = useState('Ritual Collection');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/hero_candle.png');
  const [galleryImages, setGalleryImages] = useState<string[]>(['/images/hero_candle.png']);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [duplicatingProductId, setDuplicatingProductId] = useState<number | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [catalogView, setCatalogView] = useState<'active' | 'trash'>('active');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Bulk Edit States
  const [selectedCatalogProductIds, setSelectedCatalogProductIds] = useState<number[]>([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkCollection, setBulkCollection] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Specifications & Accordions States
  const [tagline, setTagline] = useState('100% natural soy wax — wooden wick — 30-40 hours burn time');
  const [fragrances, setFragrances] = useState('Oud, Jasmin, Rose, Vanilla');
  const [dimensions, setDimensions] = useState('W: 2.5 inch x H: 3 inch');
  const [weight, setWeight] = useState('350 gms');
  const [burnHours, setBurnHours] = useState('32 Hrs');
  const [accBurnTime, setAccBurnTime] = useState('32 Hours average');
  const [accIngredients, setAccIngredients] = useState("100% natural soy wax, phthalate-free premium fragrance oils, cotton-core crackling wooden wicks, reusable amber glass jars. No paraffin, no artificial dyes. Every jar is hand-poured and cured for 48 hours before it ships.");
  const [accInstructions, setAccInstructions] = useState("Trim the wooden wick to 1/4 inch before each burn. Allow the wax to melt to the edges on first burn to avoid tunneling. Never burn for more than 4 hours at a time. Keep away from drafts, children, and pets.");
  const [accShipping, setAccShipping] = useState("Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the candle is completely unburned and in its original packaging.");

  // New Draft Form States
  const [draftCustomer, setDraftCustomer] = useState('');
  const [draftPrice, setDraftPrice] = useState('');
  const [draftItems, setDraftItems] = useState('1 item');
  const [showDraftModal, setShowDraftModal] = useState(false);

  // Discount Modal & Creation States
  const [showDiscountTypeModal, setShowDiscountTypeModal] = useState(false);
  const [showCreateDiscountForm, setShowCreateDiscountForm] = useState(false);
  const [selectedDiscountType, setSelectedDiscountType] = useState('Amount off products');
  const [newDiscountTitle, setNewDiscountTitle] = useState('');
  const [newDiscountSummary, setNewDiscountSummary] = useState('');
  const [newDiscountValueType, setNewDiscountValueType] = useState<'fixed' | 'percentage'>('fixed');
  const [newDiscountValue, setNewDiscountValue] = useState('');
  const [newDiscountMinimumOrder, setNewDiscountMinimumOrder] = useState('');
  const [newDiscountStatus, setNewDiscountStatus] = useState<'Active' | 'Expired'>('Active');
  const [editingDiscountId, setEditingDiscountId] = useState<number | null>(null);

  // Collections CRUD Form States
  const [collName, setCollName] = useState('');
  const [collDesc, setCollDesc] = useState('');
  const [editingCollId, setEditingCollId] = useState<number | null>(null);
  const [showCollForm, setShowCollForm] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [tempSelectedProductIds, setTempSelectedProductIds] = useState<number[]>([]);

  // Media Files States
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [mediaError, setMediaError] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaSelectorMode, setMediaSelectorMode] = useState<'product' | 'hero' | 'general'>('product');
  const [heroMediaTargetIndex, setHeroMediaTargetIndex] = useState<number | null>(null);

  // Settings States
  const [storeName, setStoreName] = useState('Deeksha Candles');
  const [storeEmail, setStoreEmail] = useState('contact@deekshacandles.in');
  const [storeAddress, setStoreAddress] = useState('D-12, Lajpat Nagar, New Delhi, India');
  const [storeCurrency, setStoreCurrency] = useState('INR (₹)');
  const [isGokwikActive, setIsGokwikActive] = useState(true);
  const [isCodActive, setIsCodActive] = useState(true);
  
  // Integration API states
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [shiprocketEmail, setShiprocketEmail] = useState('');
  const [shiprocketPassword, setShiprocketPassword] = useState('');
  const [shiprocketToken, setShiprocketToken] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Marketing Tracking Pixels & Tags
  const [googleTagId, setGoogleTagId] = useState('');
  const [googleTagCode, setGoogleTagCode] = useState('');
  const [facebookPixelId, setFacebookPixelId] = useState('');
  const [facebookPixelCode, setFacebookPixelCode] = useState('');

  // Simulated Google & Facebook OAuth Modal states
  const [googleConnectedEmail, setGoogleConnectedEmail] = useState('');
  const [facebookConnectedUser, setFacebookConnectedUser] = useState('');
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [showFacebookPopup, setShowFacebookPopup] = useState(false);
  const [googleSelectedAccount, setGoogleSelectedAccount] = useState('');
  const [facebookSelectedPixel, setFacebookSelectedPixel] = useState('');

  // Logos & Socials configurations
  const [logoHeaderUrl, setLogoHeaderUrl] = useState('');
  const [logoFooterUrl, setLogoFooterUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [pinterestUrl, setPinterestUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [heroEyebrow, setHeroEyebrow] = useState('DEEKSHA RITUALS');
  const [heroTitle, setHeroTitle] = useState('The Art of');
  const [heroItalicTitle, setHeroItalicTitle] = useState('Slow Burning');
  const [heroDescription, setHeroDescription] = useState('Ancestral scents mindfully crafted in small batches. Poured with 100% organic soy wax, pure botanical extracts, and wood wicks to ground your soul and illuminate your sanctuary.');
  const [heroPrimaryButtonText, setHeroPrimaryButtonText] = useState('Discover Our Rituals');
  const [heroPrimaryButtonHref, setHeroPrimaryButtonHref] = useState('#products');
  const [heroSecondaryButtonText, setHeroSecondaryButtonText] = useState('Our Philosophy');
  const [heroSecondaryButtonHref, setHeroSecondaryButtonHref] = useState('#story');
  const [heroFloatingTag, setHeroFloatingTag] = useState('Batch No. 042 / Sandalwood');
  const [heroSliderImages, setHeroSliderImages] = useState<string[]>(['/images/hero_candle.png']);
  const [contentSuccess, setContentSuccess] = useState('');
  const [contentError, setContentError] = useState('');

  // Campaigns Mock Data (Growth)
  const campaigns: Campaign[] = [
    { name: 'Instagram Influencer Collab', impressions: '142,500', clicks: '8,420', conversions: 184, spend: '₹25,000', sales: '₹1,24,000', roi: '4.96x' },
    { name: 'Diwali Early Bird Google Ads', impressions: '280,000', clicks: '14,280', conversions: 312, spend: '₹40,000', sales: '₹2,18,000', roi: '5.45x' },
    { name: 'Facebook Scented Blends Retargeting', impressions: '64,200', clicks: '3,810', conversions: 96, spend: '₹15,000', sales: '₹68,400', roi: '4.56x' }
  ];

  // Blog Posts Mock Data (Content)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    { id: 1, title: 'How to Trim Candle Wicks for a Clean Burn', author: 'Deeksha Sharma', date: 'Jul 2, 2026', status: 'Published' },
    { id: 2, title: 'Choosing the Right Aromatherapy Scent for Sleep', author: 'Deeksha Sharma', date: 'Jun 28, 2026', status: 'Published' },
    { id: 3, title: 'Why Soy Wax is Better than Paraffin Wax', author: 'Rohan Sen', date: 'Jun 24, 2026', status: 'Published' }
  ]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('Deeksha Sharma');
  const [newPostDate, setNewPostDate] = useState('');
  const [newPostStatus, setNewPostStatus] = useState('Published');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [navigationMenus, setNavigationMenus] = useState<NavigationMenu[]>([
    { id: 1, menu: 'Main Menu', links: 'Home - Shop - Fragrance - Occasions - About Us - Blogs' },
    { id: 2, menu: 'Footer Collection List', links: 'Scented Candles - Soy Wax - Jar Candles - Luxury Collection' },
    { id: 3, menu: 'Footer Scent Categories', links: 'Vanilla - Lavender - Rose - Jasmine - Sandalwood - Coffee' }
  ]);
  const [navMenuName, setNavMenuName] = useState('');
  const [navMenuLinks, setNavMenuLinks] = useState('');
  const [editingNavMenuId, setEditingNavMenuId] = useState<number | null>(null);
  const [showNavMenuForm, setShowNavMenuForm] = useState(false);

  // Analytics graph values (hover state)
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const salesHistory = [
    { day: 'Mon', sales: 12400 },
    { day: 'Tue', sales: 18900 },
    { day: 'Wed', sales: 8500 },
    { day: 'Thu', sales: 24500 },
    { day: 'Fri', sales: 31000 },
    { day: 'Sat', sales: 42000 },
    { day: 'Sun', sales: 38000 }
  ];

  const selectAdminTab = (tab: AdminTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.innerWidth < 900) {
      setIsSidebarOpen(false);
    }
  };

  const saveCustomerReviews = (nextReviews: CustomerReview[]) => {
    setCustomerReviews(nextReviews);
    localStorage.setItem(CUSTOMER_REVIEWS_STORAGE_KEY, JSON.stringify(nextReviews));
    window.dispatchEvent(new Event('deeksha-reviews-updated'));
  };

  const saveCustomerMoments = (nextMoments: CustomerMoment[]) => {
    setCustomerMoments(nextMoments);
    localStorage.setItem(CUSTOMER_MOMENTS_STORAGE_KEY, JSON.stringify(nextMoments));
    window.dispatchEvent(new Event('deeksha-moments-updated'));
  };

  const saveCustomerVideos = (nextVideos: CustomerVideo[]) => {
    setCustomerVideos(nextVideos);
    localStorage.setItem(CUSTOMER_VIDEOS_STORAGE_KEY, JSON.stringify(nextVideos));
    window.dispatchEvent(new Event('deeksha-videos-updated'));
  };

  const loadCustomerReviews = () => {
    try {
      const savedReviews = localStorage.getItem(CUSTOMER_REVIEWS_STORAGE_KEY);
      if (savedReviews) {
        setCustomerReviews(normalizeCustomerReviews(JSON.parse(savedReviews)));
      } else {
        localStorage.setItem(CUSTOMER_REVIEWS_STORAGE_KEY, JSON.stringify(defaultCustomerReviews));
        setCustomerReviews(defaultCustomerReviews);
      }
    } catch {
      setCustomerReviews(defaultCustomerReviews);
    }
  };

  const loadCustomerMoments = () => {
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

  const loadCustomerVideos = () => {
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

  const resetReviewForm = () => {
    setEditingReviewId(null);
    setReviewForm({
      name: '',
      city: '',
      rating: '5',
      quote: '',
      avatar: '',
      helpful: '0',
      productId: products[0]?.id ? String(products[0].id) : '',
      verified: true
    });
  };

  const handleEditReview = (review: CustomerReview) => {
    setEditingReviewId(review.id);
    setReviewForm({
      name: review.name,
      city: review.city,
      rating: String(review.rating),
      quote: review.quote,
      avatar: review.avatar,
      helpful: String(review.helpful),
      productId: review.productId ? String(review.productId) : '',
      verified: review.verified
    });
    setShowReviewForm(true);
  };

  const handleSaveReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedProduct = products.find(product => String(product.id) === reviewForm.productId);
    const fallbackReview = editingReviewId ? customerReviews.find(review => review.id === editingReviewId) : null;
    const nextReview: CustomerReview = {
      id: editingReviewId || `review-${Date.now()}`,
      name: reviewForm.name.trim() || 'Happy Customer',
      city: reviewForm.city.trim() || 'India',
      time: editingReviewId ? fallbackReview?.time || 'Just now' : 'Just now',
      helpful: Number(reviewForm.helpful) || 0,
      avatar: reviewForm.avatar.trim() || selectedProduct?.image_url || fallbackReview?.avatar || '/images/hero_candle.png',
      quote: reviewForm.quote.trim(),
      rating: Number(reviewForm.rating) || 5,
      verified: reviewForm.verified,
      productId: selectedProduct?.id || fallbackReview?.productId,
      productName: selectedProduct?.name || fallbackReview?.productName || 'Deeksha Candle',
      productImage: selectedProduct?.image_url || fallbackReview?.productImage || '/images/hero_candle.png'
    };

    if (!nextReview.quote) return;

    const nextReviews = editingReviewId
      ? customerReviews.map(review => review.id === editingReviewId ? nextReview : review)
      : [nextReview, ...customerReviews];

    saveCustomerReviews(nextReviews);
    resetReviewForm();
    setShowReviewForm(false);
  };

  const handleDeleteReview = (id: string) => {
    if (!confirm('Delete this review?')) return;
    saveCustomerReviews(customerReviews.filter(review => review.id !== id));
  };

  const handleUploadMomentPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingMomentPhotos(true);
    try {
      const uploadedMoments: CustomerMoment[] = [];
      for (const file of Array.from(files)) {
        const data = await uploadMediaFile(file);
        const imageSlug = `${data.filename}-${data.url}-${uploadedMoments.length}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        uploadedMoments.push({
          id: `moment-${imageSlug || uploadedMoments.length}`,
          image: data.url,
          alt: data.filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') || 'Customer candle moment'
        });
      }
      saveCustomerMoments([...uploadedMoments, ...customerMoments]);
      await fetchMediaFiles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error uploading customer photos.');
    } finally {
      setUploadingMomentPhotos(false);
    }
  };

  const handleDeleteMomentPhoto = (id: string) => {
    if (!confirm('Remove this customer photo from the product gallery?')) return;
    saveCustomerMoments(customerMoments.filter(moment => moment.id !== id));
  };

  const resetVideoForm = () => {
    setEditingVideoId(null);
    setVideoForm({
      title: '',
      author: '',
      duration: '',
      videoUrl: '',
      thumbnail: '',
      link: '',
      verified: true
    });
  };

  const handleEditCustomerVideo = (video: CustomerVideo) => {
    setEditingVideoId(video.id);
    setVideoForm({
      title: video.title,
      author: video.author,
      duration: video.duration,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail,
      link: video.link,
      verified: video.verified
    });
    setShowVideoForm(true);
  };

  const handleSaveCustomerVideo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fallbackVideo = editingVideoId ? customerVideos.find(video => video.id === editingVideoId) : null;
    const videoUrl = videoForm.videoUrl.trim();

    if (!videoUrl) return;

    const nextVideo: CustomerVideo = {
      id: editingVideoId || `video-${Date.now()}`,
      title: videoForm.title.trim() || fallbackVideo?.title || 'Customer Video',
      author: videoForm.author.trim() || fallbackVideo?.author || 'Customer',
      duration: videoForm.duration.trim() || fallbackVideo?.duration || '0:20',
      videoUrl,
      thumbnail: videoForm.thumbnail.trim() || fallbackVideo?.thumbnail || '/images/hero_candle.png',
      link: videoForm.link.trim() || videoUrl,
      verified: videoForm.verified
    };

    const nextVideos = editingVideoId
      ? customerVideos.map(video => video.id === editingVideoId ? nextVideo : video)
      : [nextVideo, ...customerVideos];

    saveCustomerVideos(nextVideos);
    resetVideoForm();
    setShowVideoForm(false);
  };

  const handleDeleteCustomerVideo = (id: string) => {
    if (!confirm('Delete this customer video?')) return;
    saveCustomerVideos(customerVideos.filter(video => video.id !== id));
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setSelectedOrder((current) => {
          if (!current) return null;
          return data.find((order: Order) => order.id === current.id) || current;
        });
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const parseOrderItems = (order?: Order | null): OrderItem[] => {
    if (!order?.order_items) return [];
    try {
      const parsed = JSON.parse(order.order_items);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is OrderItem => (
        typeof item === 'object' &&
        item !== null &&
        typeof item.name === 'string' &&
        typeof item.image_url === 'string'
      )).map(item => ({
        ...item,
        quantity: Number(item.quantity) || 1,
        price: item.price || '₹0',
        total: item.total || item.price || '₹0'
      }));
    } catch {
      return [];
    }
  };

  const parseAbandonedCheckoutItems = (checkout?: AbandonedCheckout | null): OrderItem[] => {
    if (!checkout?.checkout_items) return [];
    try {
      const parsed = JSON.parse(checkout.checkout_items);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is OrderItem => (
        typeof item === 'object' &&
        item !== null &&
        typeof item.name === 'string'
      )).map(item => ({
        ...item,
        image_url: item.image_url || '/images/hero_candle.png',
        quantity: Number(item.quantity) || 1,
        price: item.price || '₹0',
        total: item.total || item.price || '₹0'
      }));
    } catch {
      return [];
    }
  };

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditableOrder({ ...order });
    setEditableOrderItems(parseOrderItems(order));
    setOrderDetailError('');
  };

  const handleOrderFieldChange = (field: keyof Order, value: string) => {
    setEditableOrder(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleOrderItemChange = (index: number, field: keyof OrderItem, value: string) => {
    setEditableOrderItems(prev => prev.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      if (field === 'quantity') {
        return { ...item, quantity: Math.max(parseInt(value, 10) || 1, 1) };
      }
      return { ...item, [field]: value };
    }));
  };

  const handleSaveOrderDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableOrder) return;

    setSavingOrder(true);
    setOrderDetailError('');
    try {
      const itemsCount = editableOrderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      const payload = {
        ...editableOrder,
        items_count: `${itemsCount} item${itemsCount === 1 ? '' : 's'}`,
        order_items: editableOrderItems
      };
      const updatedOrder: Order = {
        ...editableOrder,
        items_count: payload.items_count,
        order_items: JSON.stringify(editableOrderItems)
      };

      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to update order.');
      }

      await fetchOrders();
      setSelectedOrder(updatedOrder);
      setEditableOrder(updatedOrder);
      alert('Order details updated successfully.');
    } catch (err) {
      console.error(err);
      setOrderDetailError(err instanceof Error ? err.message : 'Failed to update order.');
    } finally {
      setSavingOrder(false);
    }
  };

  const fetchDrafts = async () => {
    try {
      setLoadingDrafts(true);
      const res = await fetch('/api/admin/drafts');
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);
      }
    } catch (err) {
      console.error('Error loading drafts:', err);
    } finally {
      setLoadingDrafts(false);
    }
  };

  const fetchAbandoned = async () => {
    try {
      setLoadingAbandoned(true);
      const res = await fetch('/api/admin/abandoned');
      if (res.ok) {
        const data = await res.json();
        setAbandoned(data);
        setSelectedAbandonedCheckout((current) => {
          if (!current) return null;
          return data.find((checkout: AbandonedCheckout) => checkout.id === current.id) || current;
        });
      }
    } catch (err) {
      console.error('Error loading abandoned checkouts:', err);
    } finally {
      setLoadingAbandoned(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      setLoadingDiscounts(true);
      const res = await fetch('/api/admin/discounts');
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data);
      }
    } catch (err) {
      console.error('Error loading discounts:', err);
    } finally {
      setLoadingDiscounts(false);
    }
  };

  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      const res = await fetch('/api/admin/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
        if (data.length > 0 && !collection) {
          setCollection(data[0].name);
        }
      }
    } catch (err) {
      console.error('Error loading collections:', err);
    } finally {
      setLoadingCollections(false);
    }
  };

  const fetchMediaFiles = async () => {
    try {
      setLoadingMedia(true);
      setMediaError('');
      const res = await fetch('/api/admin/media', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMediaFiles(data);
      } else {
        const data = await res.json().catch(() => null);
        setMediaError(data?.error || 'Failed to load media files.');
      }
    } catch (err) {
      console.error('Error loading media files:', err);
      setMediaError('Network error loading media files.');
    } finally {
      setLoadingMedia(false);
    }
  };

  const uploadMediaFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const uploadRes = await fetch('/api/admin/media', {
      method: 'POST',
      body: formData
    });
    const data = await uploadRes.json().catch(() => null);

    if (!uploadRes.ok) {
      throw new Error(data?.error || 'Failed to upload image.');
    }

    if (data?.file) {
      setMediaFiles((prev) => [data.file, ...prev.filter((item) => item.id !== data.file.id)]);
    }

    if (!data?.file?.url && !data?.url) {
      throw new Error('Upload finished, but the server did not return an image URL.');
    }

    return {
      url: data?.file?.url || data?.url,
      filename: data?.file?.filename || data?.filename || file.name
    };
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setIsGokwikActive(data.isGokwikActive === 'true');
        setIsCodActive(data.isCodActive === 'true');
        setRazorpayKeyId(data.razorpayKeyId || '');
        setRazorpayKeySecret(data.razorpayKeySecret || '');
        setShiprocketEmail(data.shiprocketEmail || '');
        setShiprocketPassword(data.shiprocketPassword || '');
        setShiprocketToken(data.shiprocketToken || '');
        setGoogleTagId(data.googleTagId || '');
        setGoogleTagCode(data.googleTagCode || '');
        setFacebookPixelId(data.facebookPixelId || '');
        setFacebookPixelCode(data.facebookPixelCode || '');
        if (data.googleTagId) {
          setGoogleConnectedEmail('deeksha.candles.ads@gmail.com');
          setGoogleSelectedAccount('Deeksha Candles - Ads Account (481-229-4820)');
        } else {
          setGoogleConnectedEmail('');
          setGoogleSelectedAccount('');
        }
        if (data.facebookPixelId) {
          setFacebookConnectedUser('Deeksha Sharma');
          setFacebookSelectedPixel('Deeksha Candles Pixel (ID: 928374928374829)');
        } else {
          setFacebookConnectedUser('');
          setFacebookSelectedPixel('');
        }
        setLogoHeaderUrl(data.logoHeaderUrl || '');
        setLogoFooterUrl(data.logoFooterUrl || '');
        setInstagramUrl(data.instagramUrl || '');
        setFacebookUrl(data.facebookUrl || '');
        setPinterestUrl(data.pinterestUrl || '');
        setTwitterUrl(data.twitterUrl || '');
        setYoutubeUrl(data.youtubeUrl || '');
        setHeroEyebrow(data.heroEyebrow || 'DEEKSHA RITUALS');
        setHeroTitle(data.heroTitle || 'The Art of');
        setHeroItalicTitle(data.heroItalicTitle || 'Slow Burning');
        setHeroDescription(data.heroDescription || 'Ancestral scents mindfully crafted in small batches. Poured with 100% organic soy wax, pure botanical extracts, and wood wicks to ground your soul and illuminate your sanctuary.');
        setHeroPrimaryButtonText(data.heroPrimaryButtonText || 'Discover Our Rituals');
        setHeroPrimaryButtonHref(data.heroPrimaryButtonHref || '#products');
        setHeroSecondaryButtonText(data.heroSecondaryButtonText || 'Our Philosophy');
        setHeroSecondaryButtonHref(data.heroSecondaryButtonHref || '#story');
        setHeroFloatingTag(data.heroFloatingTag || 'Batch No. 042 / Sandalwood');
        try {
          const parsedImages = JSON.parse(data.heroSliderImages || '[]');
          setHeroSliderImages(Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages.filter((image): image is string => typeof image === 'string') : ['/images/hero_candle.png']);
        } catch {
          setHeroSliderImages(['/images/hero_candle.png']);
        }
        try {
          const parsedPosts = JSON.parse(data.contentBlogPosts || '[]');
          if (Array.isArray(parsedPosts)) {
            setBlogPosts(parsedPosts.filter((post): post is BlogPost => (
              typeof post === 'object' &&
              post !== null &&
              typeof post.id === 'number' &&
              typeof post.title === 'string' &&
              typeof post.author === 'string' &&
              typeof post.date === 'string' &&
              typeof post.status === 'string'
            )));
          }
        } catch {}
        try {
          const parsedMenus = JSON.parse(data.contentNavigationMenus || '[]');
          if (Array.isArray(parsedMenus)) {
            setNavigationMenus(parsedMenus.filter((menu): menu is NavigationMenu => (
              typeof menu === 'object' &&
              menu !== null &&
              typeof menu.id === 'number' &&
              typeof menu.menu === 'string' &&
              typeof menu.links === 'string'
            )));
          }
        } catch {}
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (updatedSettings: Record<string, string>) => {
    setSettingsSuccess('');
    setSettingsError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        setSettingsSuccess('Settings updated successfully!');
        setTimeout(() => setSettingsSuccess(''), 3000);
        fetchSettings(); // refresh states
      } else {
        setSettingsError('Failed to save settings.');
      }
    } catch (err) {
      setSettingsError('Network error saving settings.');
    }
  };

  const applyHeroImageSelection = (imageUrl: string) => {
    setHeroSliderImages((prev) => {
      const nextImages = [...prev.filter(Boolean)];
      if (heroMediaTargetIndex === null) {
        if (!nextImages.includes(imageUrl)) {
          nextImages.push(imageUrl);
        }
        return nextImages.length > 0 ? nextImages : ['/images/hero_candle.png'];
      }

      nextImages[heroMediaTargetIndex] = imageUrl;
      return nextImages.length > 0 ? nextImages : ['/images/hero_candle.png'];
    });
    setHeroMediaTargetIndex(null);
  };

  const handleSaveHeroContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentSuccess('');
    setContentError('');

    if (heroSliderImages.length === 0) {
      setContentError('Please add at least one slider image.');
      return;
    }

    const updatedContent = {
      heroEyebrow,
      heroTitle,
      heroItalicTitle,
      heroDescription,
      heroPrimaryButtonText,
      heroPrimaryButtonHref,
      heroSecondaryButtonText,
      heroSecondaryButtonHref,
      heroFloatingTag,
      heroSliderImages: JSON.stringify(heroSliderImages.filter(Boolean))
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContent)
      });

      if (res.ok) {
        setContentSuccess('Home page content updated successfully.');
        await fetchSettings();
      } else {
        const data = await res.json().catch(() => null);
        setContentError(data?.error || 'Failed to update content.');
      }
    } catch (err) {
      console.error(err);
      setContentError('Network error saving content.');
    }
  };

  const saveContentLists = async (nextPosts: BlogPost[], nextMenus: NavigationMenu[]) => {
    setContentSuccess('');
    setContentError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentBlogPosts: JSON.stringify(nextPosts),
          contentNavigationMenus: JSON.stringify(nextMenus)
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to save content lists.');
      }

      setContentSuccess('Content list updated successfully.');
    } catch (err) {
      console.error(err);
      setContentError(err instanceof Error ? err.message : 'Failed to save content lists.');
      throw err;
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('deeksha_admin_logged_in') === 'true';
    if (!isLoggedIn) {
      setHasCheckedAuth(true);
      router.push('/admin');
    } else {
      setAuthorized(true);
      setHasCheckedAuth(true);
      void Promise.resolve().then(() => {
        fetchProducts();
        fetchOrders();
        fetchDrafts();
        fetchAbandoned();
        fetchDiscounts();
        fetchCollections();
        fetchMediaFiles();
        fetchSettings();
        loadCustomerReviews();
        loadCustomerMoments();
        loadCustomerVideos();
      });
    }
  }, []);

  useEffect(() => {
    loadCustomerReviews();
    loadCustomerMoments();
    loadCustomerVideos();
    const refreshReviews = () => loadCustomerReviews();
    const refreshMoments = () => loadCustomerMoments();
    const refreshVideos = () => loadCustomerVideos();
    window.addEventListener('storage', refreshReviews);
    window.addEventListener('storage', refreshMoments);
    window.addEventListener('storage', refreshVideos);
    window.addEventListener('deeksha-reviews-updated', refreshReviews);
    window.addEventListener('deeksha-moments-updated', refreshMoments);
    window.addEventListener('deeksha-videos-updated', refreshVideos);
    return () => {
      window.removeEventListener('storage', refreshReviews);
      window.removeEventListener('storage', refreshMoments);
      window.removeEventListener('storage', refreshVideos);
      window.removeEventListener('deeksha-reviews-updated', refreshReviews);
      window.removeEventListener('deeksha-moments-updated', refreshMoments);
      window.removeEventListener('deeksha-videos-updated', refreshVideos);
    };
  }, []);

  useEffect(() => {
    const closeSidebarOnDesktop = () => {
      if (window.innerWidth >= 900) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', closeSidebarOnDesktop);
    return () => window.removeEventListener('resize', closeSidebarOnDesktop);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('deeksha_admin_logged_in');
    router.push('/admin');
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    if (!name || !collection || !price || !description || !features || galleryImages.length === 0) {
      setFormError('Please fill out all fields.');
      setSubmitting(false);
      return;
    }

    try {
      const coverImage = galleryImages[0] || '/images/hero_candle.png';
      const method = editingProductId ? 'PUT' : 'POST';
      const payload = {
        name, collection, price, description, image_url: coverImage, features,
        tagline, fragrances, dimensions, weight, burn_hours: burnHours,
        acc_burn_time: accBurnTime, acc_ingredients: accIngredients,
        acc_instructions: accInstructions, acc_shipping: accShipping,
        images: galleryImages.join(',')
      };
      const body = editingProductId ? { id: editingProductId, ...payload } : payload;

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFormSuccess(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
        
        const resetForm = () => {
          setName('');
          setPrice('');
          setDescription('');
          setFeatures('');
          setImageUrl('/images/hero_candle.png');
          setGalleryImages(['/images/hero_candle.png']);
          setTagline('100% natural soy wax — wooden wick — 30-40 hours burn time');
          setFragrances('Oud, Jasmin, Rose, Vanilla');
          setDimensions('W: 2.5 inch x H: 3 inch');
          setWeight('350 gms');
          setBurnHours('32 Hrs');
          setAccBurnTime('32 Hours average');
          setAccIngredients("100% natural soy wax, phthalate-free premium fragrance oils, cotton-core crackling wooden wicks, reusable amber glass jars. No paraffin, no artificial dyes. Every jar is hand-poured and cured for 48 hours before it ships.");
          setAccInstructions("Trim the wooden wick to 1/4 inch before each burn. Allow the wax to melt to the edges on first burn to avoid tunneling. Never burn for more than 4 hours at a time. Keep away from drafts, children, and pets.");
          setAccShipping("Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the candle is completely unburned and in its original packaging.");
        };

        resetForm();
        setEditingProductId(null);
        fetchProducts();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to save product.');
      }
    } catch (err) {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProductClick = (prod: Product) => {
    setSelectedDetailProduct(null);
    setEditingProductId(prod.id);
    setName(prod.name);
    setCollection(prod.collection);
    setPrice(prod.price.toString());
    setDescription(prod.description);
    setFeatures(prod.features);
    setImageUrl(prod.image_url);
    if (prod.images && prod.images.trim()) {
      setGalleryImages(prod.images.split(',').map(s => s.trim()).filter(Boolean));
    } else {
      setGalleryImages([prod.image_url || '/images/hero_candle.png']);
    }
    
    // Set custom spec states
    setTagline(prod.tagline || '100% natural soy wax — wooden wick — 30-40 hours burn time');
    setFragrances(prod.fragrances || 'Oud, Jasmin, Rose, Vanilla');
    setDimensions(prod.dimensions || 'W: 2.5 inch x H: 3 inch');
    setWeight(prod.weight || '350 gms');
    setBurnHours(prod.burn_hours || '32 Hrs');
    setAccBurnTime(prod.acc_burn_time || '32 Hours average');
    setAccIngredients(prod.acc_ingredients || '100% natural soy wax, phthalate-free premium fragrance oils, cotton-core crackling wooden wicks, reusable amber glass jars. No paraffin, no artificial dyes. Every jar is hand-poured and cured for 48 hours before it ships.');
    setAccInstructions(prod.acc_instructions || 'Trim the wooden wick to 1/4 inch before each burn. Allow the wax to melt to the edges on first burn to avoid tunneling. Never burn for more than 4 hours at a time. Keep away from drafts, children, and pets.');
    setAccShipping(prod.acc_shipping || 'Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the candle is completely unburned and in its original packaging.');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDuplicateProductName = (productName: string) => {
    const baseName = `${productName} Copy`;
    let duplicateName = baseName;
    let copyNumber = 2;
    const existingProductNames = new Set(products.filter(product => !product.deleted_at).map(product => product.name.trim().toLowerCase()));

    while (existingProductNames.has(duplicateName.trim().toLowerCase())) {
      duplicateName = `${baseName} ${copyNumber}`;
      copyNumber++;
    }

    return duplicateName;
  };

  const handleDuplicateProduct = async (prod: Product) => {
    setFormError('');
    setFormSuccess('');
    setDuplicatingProductId(prod.id);

    try {
      const payload = {
        name: getDuplicateProductName(prod.name),
        collection: prod.collection,
        price: prod.price,
        description: prod.description,
        image_url: prod.image_url,
        features: prod.features,
        tagline: prod.tagline || '100% natural soy wax — wooden wick — 30-40 hours burn time',
        fragrances: prod.fragrances || 'Oud, Jasmin, Rose, Vanilla',
        dimensions: prod.dimensions || 'W: 2.5 inch x H: 3 inch',
        weight: prod.weight || '350 gms',
        burn_hours: prod.burn_hours || '32 Hrs',
        acc_burn_time: prod.acc_burn_time || '32 Hours average',
        acc_ingredients: prod.acc_ingredients || '100% natural soy wax, phthalate-free premium fragrance oils, cotton-core crackling wooden wicks, reusable amber glass jars. No paraffin, no artificial dyes. Every jar is hand-poured and cured for 48 hours before it ships.',
        acc_instructions: prod.acc_instructions || 'Trim the wooden wick to 1/4 inch before each burn. Allow the wax to melt to the edges on first burn to avoid tunneling. Never burn for more than 4 hours at a time. Keep away from drafts, children, and pets.',
        acc_shipping: prod.acc_shipping || 'Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the candle is completely unburned and in its original packaging.',
        images: prod.images || prod.image_url
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormSuccess(`Duplicated "${prod.name}" successfully.`);
        fetchProducts();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to duplicate product.');
      }
    } catch (err) {
      setFormError('Network error. Please try again.');
    } finally {
      setDuplicatingProductId(null);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Move this product to trash? It will not show on the live store.')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Product moved to trash.');
        setSelectedCatalogProductIds(prev => prev.filter(productId => productId !== id));
        fetchProducts();
      } else {
        alert('Failed to move product to trash.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const handleRestoreProduct = async (id: number) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'restore' }),
      });

      if (res.ok) {
        alert('Product restored successfully.');
        setSelectedCatalogProductIds(prev => prev.filter(productId => productId !== id));
        fetchProducts();
      } else {
        alert('Failed to restore product.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const handlePermanentDeleteProduct = async (id: number) => {
    if (!confirm('Permanently delete this product? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}&permanent=true`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Product permanently deleted.');
        setSelectedCatalogProductIds(prev => prev.filter(productId => productId !== id));
        fetchProducts();
      } else {
        alert('Failed to permanently delete product.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCatalogProductIds.length === 0) return;
    if (!confirm(`Move ${selectedCatalogProductIds.length} products to trash? They will not show on the live store.`)) return;
    
    setLoadingProducts(true);
    try {
      let successCount = 0;
      for (const id of selectedCatalogProductIds) {
        const res = await fetch(`/api/admin/products?id=${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          successCount++;
        }
      }
      setSelectedCatalogProductIds([]);
      fetchProducts();
      alert(`Moved ${successCount} products to trash.`);
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Error performing bulk delete.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedCatalogProductIds.length === 0) return;
    setLoadingProducts(true);
    try {
      let successCount = 0;
      for (const id of selectedCatalogProductIds) {
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: 'restore' })
        });
        if (res.ok) {
          successCount++;
        }
      }
      setSelectedCatalogProductIds([]);
      fetchProducts();
      alert(`Restored ${successCount} products.`);
    } catch (err) {
      console.error("Bulk restore error:", err);
      alert("Error restoring products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedCatalogProductIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedCatalogProductIds.length} products? This cannot be undone.`)) return;
    setLoadingProducts(true);
    try {
      let successCount = 0;
      for (const id of selectedCatalogProductIds) {
        const res = await fetch(`/api/admin/products?id=${id}&permanent=true`, {
          method: 'DELETE'
        });
        if (res.ok) {
          successCount++;
        }
      }
      setSelectedCatalogProductIds([]);
      fetchProducts();
      alert(`Permanently deleted ${successCount} products.`);
    } catch (err) {
      console.error("Bulk permanent delete error:", err);
      alert("Error permanently deleting products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCatalogProductIds.length === 0) return;
    if (!bulkPrice && !bulkCollection) {
      alert("Please specify at least one field to update.");
      return;
    }
    
    setBulkUpdating(true);
    try {
      let successCount = 0;
      
      for (const id of selectedCatalogProductIds) {
        const prod = products.find(p => p.id === id);
        if (!prod) continue;
        
        const payload = {
          id: prod.id,
          name: prod.name,
          collection: bulkCollection || prod.collection,
          price: bulkPrice ? parseInt(bulkPrice, 10) : prod.price,
          description: prod.description,
          image_url: prod.image_url,
          features: prod.features,
          tagline: prod.tagline || '100% natural soy wax — wooden wick — 30-40 hours burn time',
          fragrances: prod.fragrances || 'Oud, Jasmin, Rose, Vanilla',
          dimensions: prod.dimensions || 'W: 2.5 inch x H: 3 inch',
          weight: prod.weight || '350 gms',
          burn_hours: prod.burn_hours || '32 Hrs',
          acc_burn_time: prod.acc_burn_time || '32 Hours average',
          acc_ingredients: prod.acc_ingredients || '100% natural soy wax, phthalate-free premium fragrance oils...',
          acc_instructions: prod.acc_instructions || 'Trim the wooden wick...',
          acc_shipping: prod.acc_shipping || 'Free standard shipping...',
          images: prod.images || ''
        };
        
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          successCount++;
        }
      }
      
      setBulkPrice('');
      setBulkCollection('');
      setShowBulkEditModal(false);
      setSelectedCatalogProductIds([]);
      fetchProducts();
      alert(`Successfully updated ${successCount} products.`);
    } catch (err) {
      console.error("Bulk update error:", err);
      alert("Error performing bulk update.");
    } finally {
      setBulkUpdating(false);
    }
  };

  // Draft Creation
  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftCustomer || !draftPrice) return;

    try {
      const res = await fetch('/api/admin/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: draftCustomer,
          total_price: `₹${parseFloat(draftPrice).toFixed(2)}`,
          items_count: draftItems
        })
      });

      if (res.ok) {
        setShowDraftModal(false);
        setDraftCustomer('');
        setDraftPrice('');
        fetchDrafts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark Draft as Paid -> Converts to Order
  const handleCompleteDraft = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/drafts?id=${id}`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert('Draft order paid and completed! Moved to active Orders list.');
        fetchDrafts();
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Recovery Email
  const handleSendRecoveryEmail = async (id: number, email: string) => {
    try {
      const res = await fetch(`/api/admin/abandoned?id=${id}`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert(`Recovery discount code successfully emailed to ${email}!`);
        fetchAbandoned();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetDiscountForm = () => {
    setNewDiscountTitle('');
    setNewDiscountSummary('');
    setNewDiscountValueType('fixed');
    setNewDiscountValue('');
    setNewDiscountMinimumOrder('');
    setNewDiscountStatus('Active');
    setEditingDiscountId(null);
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscountId(discount.id);
    setSelectedDiscountType(discount.discount_type || 'Amount off products');
    setNewDiscountTitle(discount.title);
    setNewDiscountSummary(discount.summary);
    setNewDiscountValueType(discount.value_type === 'percentage' ? 'percentage' : 'fixed');
    setNewDiscountValue(String(discount.value_amount ?? ''));
    setNewDiscountMinimumOrder(String(discount.minimum_order_value ?? ''));
    setNewDiscountStatus(discount.status === 'Expired' ? 'Expired' : 'Active');
    setShowDiscountTypeModal(false);
    setShowCreateDiscountForm(true);
  };

  // Create or update Discount Code
  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscountTitle || !newDiscountSummary || !newDiscountValue) return;

    try {
      const isEditingDiscount = editingDiscountId !== null;
      const method = isEditingDiscount ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/discounts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDiscountId,
          title: newDiscountTitle.toUpperCase().replace(/\s+/g, ''),
          summary: newDiscountSummary,
          discount_type: selectedDiscountType,
          value_type: newDiscountValueType,
          value_amount: newDiscountValue,
          minimum_order_value: newDiscountMinimumOrder || '0',
          status: newDiscountStatus
        })
      });

      if (res.ok) {
        resetDiscountForm();
        setShowCreateDiscountForm(false);
        fetchDiscounts();
        alert(isEditingDiscount ? 'Discount code successfully updated!' : 'Discount code successfully created!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetBlogForm = () => {
    setNewPostTitle('');
    setNewPostAuthor('Deeksha Sharma');
    setNewPostDate('');
    setNewPostStatus('Published');
    setEditingPostId(null);
    setShowNewPostForm(false);
  };

  const handleEditBlogPostClick = (post: BlogPost) => {
    setNewPostTitle(post.title);
    setNewPostAuthor(post.author);
    setNewPostDate(post.date);
    setNewPostStatus(post.status);
    setEditingPostId(post.id);
    setShowNewPostForm(true);
  };

  // Create / Update Blog Post
  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle) return;

    const formattedDate = newPostDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const nextPosts = editingPostId
      ? blogPosts.map(post => post.id === editingPostId ? { ...post, title: newPostTitle, author: newPostAuthor, date: formattedDate, status: newPostStatus } : post)
      : [
          {
            id: blogPosts.length > 0 ? Math.max(...blogPosts.map(post => post.id)) + 1 : 1,
            title: newPostTitle,
            author: newPostAuthor,
            date: formattedDate,
            status: newPostStatus
          },
          ...blogPosts
        ];

    setBlogPosts(nextPosts);
    await saveContentLists(nextPosts, navigationMenus);
    resetBlogForm();
  };

  const handleDeleteBlogPost = async (id: number) => {
    if (!confirm('Delete this blog article?')) return;
    const nextPosts = blogPosts.filter(post => post.id !== id);
    setBlogPosts(nextPosts);
    await saveContentLists(nextPosts, navigationMenus);
  };

  const resetNavMenuForm = () => {
    setNavMenuName('');
    setNavMenuLinks('');
    setEditingNavMenuId(null);
    setShowNavMenuForm(false);
  };

  const handleEditNavMenuClick = (menu: NavigationMenu) => {
    setNavMenuName(menu.menu);
    setNavMenuLinks(menu.links);
    setEditingNavMenuId(menu.id);
    setShowNavMenuForm(true);
  };

  const handleSaveNavigationMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navMenuName || !navMenuLinks) return;

    const nextMenus = editingNavMenuId
      ? navigationMenus.map(menu => menu.id === editingNavMenuId ? { ...menu, menu: navMenuName, links: navMenuLinks } : menu)
      : [
          ...navigationMenus,
          {
            id: navigationMenus.length > 0 ? Math.max(...navigationMenus.map(menu => menu.id)) + 1 : 1,
            menu: navMenuName,
            links: navMenuLinks
          }
        ];

    setNavigationMenus(nextMenus);
    await saveContentLists(blogPosts, nextMenus);
    resetNavMenuForm();
  };

  const handleDeleteNavigationMenu = async (id: number) => {
    if (!confirm('Delete this navigation menu?')) return;
    const nextMenus = navigationMenus.filter(menu => menu.id !== id);
    setNavigationMenus(nextMenus);
    await saveContentLists(blogPosts, nextMenus);
  };

  // Collections CRUD Handlers
  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collName || !collDesc) return;

    try {
      const method = editingCollId ? 'PUT' : 'POST';
      const body = editingCollId 
        ? { id: editingCollId, name: collName, description: collDesc, productIds: selectedProductIds }
        : { name: collName, description: collDesc, productIds: selectedProductIds };

      const res = await fetch('/api/admin/collections', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setCollName('');
        setCollDesc('');
        setEditingCollId(null);
        setShowCollForm(false);
        fetchCollections();
        alert(editingCollId ? 'Collection updated!' : 'New Collection added!');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save collection.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCollectionClick = (coll: Collection) => {
    setCollName(coll.name);
    setCollDesc(coll.description);
    setEditingCollId(coll.id);
    
    // Find products currently in this collection
    const associatedIds = products
      .filter(p => p.collection.toLowerCase() === coll.name.toLowerCase())
      .map(p => p.id);
    setSelectedProductIds(associatedIds);
    
    setShowCollForm(true);
  };

  const handleDeleteCollection = async (id: number) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const res = await fetch(`/api/admin/collections?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Collection deleted successfully!');
        fetchCollections();
      } else {
        alert('Failed to delete collection.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!hasCheckedAuth || !authorized) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f6f6f6', alignItems: 'center', justifyContent: 'center', color: '#1a1a1a', fontFamily: 'sans-serif' }}>
        <p>Verifying admin session...</p>
      </div>
    );
  }

  const activeProductsCount = products.filter(product => !product.deleted_at).length;
  const trashedProductsCount = products.filter(product => product.deleted_at).length;
  const visibleCatalogProducts = products.filter(product => catalogView === 'trash' ? product.deleted_at : !product.deleted_at);
  const filteredProducts = visibleCatalogProducts.filter(prod => {
    const query = productSearchQuery.toLowerCase();
    return (
      prod.name.toLowerCase().includes(query) ||
      prod.collection.toLowerCase().includes(query)
    );
  });
  const filteredCustomerReviews = customerReviews.filter(review => {
    const query = reviewSearchQuery.toLowerCase();
    return (
      review.name.toLowerCase().includes(query) ||
      review.city.toLowerCase().includes(query) ||
      review.quote.toLowerCase().includes(query) ||
      review.productName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f6f6f6', color: '#1a1a1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div className="admin-mobile-topbar">
        <button
          type="button"
          className="admin-menu-button"
          aria-label="Open dashboard menu"
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>
        <div>
          <strong>Deeksha Candles</strong>
          <span>Store Admin</span>
        </div>
      </div>

      <button
        type="button"
        aria-label="Close dashboard menu"
        className={`admin-sidebar-scrim ${isSidebarOpen ? 'is-open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      {/* 1. Left Shopify Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'is-open' : ''}`} style={{ width: '240px', backgroundColor: '#ebebeb', borderRight: '1px solid #dcdcdc', display: 'flex', flexDirection: 'column', padding: '16px 0', flexShrink: 0 }}>
        
        {/* Brand/Store Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px 20px 16px', borderBottom: '1px solid #dcdcdc', marginBottom: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: '#0b1a11', color: '#c5a880', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            D
          </div>
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>Deeksha Candles</h2>
            <span style={{ fontSize: '11px', color: '#6d6d6d' }}>Store Admin</span>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1, padding: '0 8px', overflowY: 'auto' }}>
          
          {/* Orders Collapsible Header */}
          <button
            onClick={() => {
              setIsOrdersExpanded(!isOrdersExpanded);
              selectAdminTab('orders');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: (activeTab === 'orders' || activeTab === 'drafts' || activeTab === 'abandoned') ? '#e1e1e1' : 'transparent',
              color: '#1a1a1a',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.1s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>📥</span>
              <span>Orders</span>
            </div>
            <span style={{ fontSize: '10px', color: '#6d6d6d' }}>{isOrdersExpanded ? '▼' : '▶'}</span>
          </button>

          {/* Collapsible Nested list for Orders */}
          {isOrdersExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px', marginBottom: '4px' }}>
              <button
                onClick={() => selectAdminTab('drafts')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'drafts' ? '#ffffff' : 'transparent',
                  color: activeTab === 'drafts' ? '#1a1a1a' : '#6d6d6d',
                  fontSize: '13px',
                  fontWeight: activeTab === 'drafts' ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <span>Drafts</span>
              </button>

              <button
                onClick={() => selectAdminTab('abandoned')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'abandoned' ? '#ffffff' : 'transparent',
                  color: activeTab === 'abandoned' ? '#1a1a1a' : '#6d6d6d',
                  fontSize: '13px',
                  fontWeight: activeTab === 'abandoned' ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <span>Abandoned checkouts</span>
              </button>
            </div>
          )}

          {/* Products Collapsible Header */}
          <button
            onClick={() => {
              setIsProductsExpanded(!isProductsExpanded);
              selectAdminTab('products');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: (activeTab === 'products' || activeTab === 'collections') ? '#e1e1e1' : 'transparent',
              color: '#1a1a1a',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.1s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>🏷️</span>
              <span>Products</span>
            </div>
            <span style={{ fontSize: '10px', color: '#6d6d6d' }}>{isProductsExpanded ? '▼' : '▶'}</span>
          </button>

          {/* Collapsible Nested list for Products */}
          {isProductsExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px', marginBottom: '4px' }}>
              <button
                onClick={() => selectAdminTab('collections')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'collections' ? '#ffffff' : 'transparent',
                  color: activeTab === 'collections' ? '#1a1a1a' : '#6d6d6d',
                  fontSize: '13px',
                  fontWeight: activeTab === 'collections' ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <span>Collections</span>
              </button>

              <button
                onClick={() => selectAdminTab('products')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'products' ? '#ffffff' : 'transparent',
                  color: activeTab === 'products' ? '#1a1a1a' : '#6d6d6d',
                  fontSize: '13px',
                  fontWeight: activeTab === 'products' ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <span>Inventory</span>
              </button>

              {['Purchase orders', 'Transfers', 'Gift cards'].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px 8px 36px',
                    color: '#a0a0a0',
                    fontSize: '13px',
                    cursor: 'not-allowed',
                    userSelect: 'none'
                  }}
                >
                  {item}
                </div>
              ))}

              {/* Active Files Tab */}
              <button
                type="button"
                onClick={() => selectAdminTab('files')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'files' ? '#ffffff' : 'transparent',
                  color: activeTab === 'files' ? '#1a1a1a' : '#6d6d6d',
                  fontSize: '13px',
                  fontWeight: activeTab === 'files' ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <span>Files</span>
              </button>
            </div>
          )}

          {/* Collapsible Customers Header */}
          <button
            onClick={() => {
              setIsCustomersExpanded(!isCustomersExpanded);
              setActiveTab('customers');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'customers' ? '#e1e1e1' : 'transparent',
              color: '#1a1a1a',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.1s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>👥</span>
              <span>Customers</span>
            </div>
            <span style={{ fontSize: '10px', color: '#6d6d6d' }}>{isCustomersExpanded ? '▼' : '▶'}</span>
          </button>

          {/* Nested Sub-links under Customers */}
          {isCustomersExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px', marginBottom: '4px' }}>
              <button
                type="button"
                onClick={() => selectAdminTab('customers')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'customers' ? '#ffffff' : 'transparent',
                  color: activeTab === 'customers' ? '#1a1a1a' : '#6d6d6d',
                  fontSize: '13px',
                  fontWeight: activeTab === 'customers' ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                Reviews
              </button>
              {['Segments', 'Companies'].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px 8px 36px',
                    color: '#9c9c9c',
                    fontSize: '13px',
                    cursor: 'not-allowed',
                    borderRadius: '8px',
                    transition: 'background 0.1s ease'
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* Growth Tab */}
          <button
            onClick={() => selectAdminTab('growth')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'growth' ? '#ffffff' : 'transparent',
              color: '#1a1a1a',
              fontSize: '13px',
              fontWeight: activeTab === 'growth' ? '600' : '500',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              boxShadow: activeTab === 'growth' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span style={{ fontSize: '16px' }}>📈</span>
            <span>Growth</span>
          </button>

          {/* Discounts Tab Link */}
          <button
            onClick={() => selectAdminTab('discounts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'discounts' ? '#ffffff' : 'transparent',
              color: '#1a1a1a',
              fontSize: '13px',
              fontWeight: activeTab === 'discounts' ? '600' : '500',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              boxShadow: activeTab === 'discounts' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span style={{ fontSize: '16px' }}>🏷️</span>
            <span>Discounts</span>
          </button>

          {/* Content Tab */}
          <button
            onClick={() => selectAdminTab('content')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'content' ? '#ffffff' : 'transparent',
              color: '#1a1a1a',
              fontSize: '13px',
              fontWeight: activeTab === 'content' ? '600' : '500',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              boxShadow: activeTab === 'content' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span style={{ fontSize: '16px' }}>✍️</span>
            <span>Content</span>
          </button>

          {/* Analytics Tab */}
          <button
            onClick={() => selectAdminTab('analytics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'analytics' ? '#ffffff' : 'transparent',
              color: '#1a1a1a',
              fontSize: '13px',
              fontWeight: activeTab === 'analytics' ? '600' : '500',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              boxShadow: activeTab === 'analytics' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span style={{ fontSize: '16px' }}>📊</span>
            <span>Analytics</span>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => selectAdminTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'settings' ? '#ffffff' : 'transparent',
              color: '#1a1a1a',
              fontSize: '13px',
              fontWeight: activeTab === 'settings' ? '600' : '500',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              boxShadow: activeTab === 'settings' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span style={{ fontSize: '16px' }}>⚙️</span>
            <span>Settings</span>
          </button>

        </nav>

        {/* Logout */}
        <div style={{ padding: '0 16px' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '8px', 
              border: '1px solid #dcdcdc', 
              background: '#ffffff', 
              color: '#ff4d4d', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Area */}
      <main className="admin-main" style={{ flexGrow: 1, padding: '32px 40px', overflowY: 'auto' }}>
        
        {/* TAB 1: ORDERS DASHBOARD */}
        {activeTab === 'orders' && (
          <div>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📥</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Orders</h1>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                  Export
                </button>
                <button style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                  More actions ▾
                </button>
                <button 
                  onClick={() => alert("Quick order creation popup is under maintenance.")}
                  style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Create order
                </button>
              </div>
            </div>

            {/* Performance Analytics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '16px', position: 'relative' }}>
                <span style={{ fontSize: '11px', color: '#6d6d6d', fontWeight: '500' }}>Today</span>
                <p style={{ fontSize: '15px', fontWeight: '700', margin: '4px 0 0 0' }}>All Channels</p>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: '#2196f3', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}></div>
              </div>
              {[
                { title: 'Orders', val: orders.length, sub: '—' },
                { title: 'Items ordered', val: orders.reduce((acc, order) => acc + (parseInt(order.items_count) || 0), 0), sub: '—' },
                { title: 'Returns', val: '₹0.00', sub: '—' },
                { title: 'Orders fulfilled', val: orders.filter(o => o.fulfillment_status === 'Fulfilled').length, sub: '—' },
                { title: 'Orders delivered', val: orders.filter(o => o.delivery_status === 'Delivered').length, sub: '—' }
              ].map((stat, idx) => (
                <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '16px', position: 'relative' }}>
                  <span style={{ fontSize: '11px', color: '#6d6d6d', fontWeight: '500' }}>{stat.title}</span>
                  <p style={{ fontSize: '18px', fontWeight: '700', margin: '4px 0 0 0' }}>{stat.val} <span style={{ fontSize: '12px', color: '#9e9e9e', fontWeight: 'normal' }}>{stat.sub}</span></p>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: '#2196f3', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}></div>
                </div>
              ))}
            </div>

            {/* Main Orders Table */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              
              {/* Filter bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e3e3e3', padding: '12px 16px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #1a1a1a', paddingBottom: '14px', marginBottom: '-13px' }}>All</span>
                  <input 
                    type="text" 
                    placeholder="🔍 Search and filter orders..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ marginLeft: '16px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', width: '280px' }}
                  />
                </div>
                <span style={{ fontSize: '14px', cursor: 'pointer' }}>⚙️</span>
              </div>

              {/* Table rendering */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #e3e3e3', color: '#6d6d6d' }}>
                      <th style={{ padding: '12px 16px', width: '30px' }}><input type="checkbox" /></th>
                      <th style={{ padding: '12px 16px' }}>Order</th>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Customer</th>
                      <th style={{ padding: '12px 16px' }}>Channel</th>
                      <th style={{ padding: '12px 16px' }}>Total</th>
                      <th style={{ padding: '12px 16px' }}>Payment status</th>
                      <th style={{ padding: '12px 16px' }}>Fulfillment status</th>
                      <th style={{ padding: '12px 16px' }}>Items</th>
                      <th style={{ padding: '12px 16px' }}>Delivery status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingOrders ? (
                      <tr>
                        <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: '#9e9e9e' }}>Loading orders from Neon database...</td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: '#9e9e9e' }}>No matching orders found.</td>
                      </tr>
                    ) : (
                      orders.filter(order => 
                        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        order.channel.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => handleOpenOrder(order)}
                          style={{ borderBottom: '1px solid #e3e3e3', cursor: 'pointer', transition: 'background-color 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '12px 16px' }}><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                          <td style={{ padding: '12px 16px', fontWeight: '600' }}>{order.order_number}</td>
                          <td style={{ padding: '12px 16px', color: '#6d6d6d' }}>{order.date_str}</td>
                          <td style={{ padding: '12px 16px' }}>{order.customer}</td>
                          <td style={{ padding: '12px 16px', color: '#6d6d6d' }}>{order.channel}</td>
                          <td style={{ padding: '12px 16px', fontWeight: '600' }}>{order.total_price}</td>
                          
                          {/* Payment status badge */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ 
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              backgroundColor: order.payment_status === 'Paid' ? '#e2ece9' : '#ffe8d6',
                              color: order.payment_status === 'Paid' ? '#2d5c4d' : '#a65d00'
                            }}>
                              {order.payment_status}
                            </span>
                          </td>

                          {/* Fulfillment status badge */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ 
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              backgroundColor: order.fulfillment_status === 'In progress' ? '#e1f5fe' : order.fulfillment_status === 'Fulfilled' ? '#e2ece9' : '#e3e3e3',
                              color: order.fulfillment_status === 'In progress' ? '#0288d1' : order.fulfillment_status === 'Fulfilled' ? '#2d5c4d' : '#6d6d6d'
                            }}>
                              {order.fulfillment_status}
                            </span>
                          </td>

                          <td style={{ padding: '12px 16px', color: '#6d6d6d' }}>{order.items_count}</td>
                          
                          {/* Delivery status badge */}
                          <td style={{ padding: '12px 16px' }}>
                            {order.delivery_status ? (
                              <span style={{ 
                                fontSize: '11px',
                                fontWeight: '600',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                backgroundColor: '#e2ece9',
                                color: '#2d5c4d'
                              }}>
                                {order.delivery_status}
                              </span>
                            ) : (
                              <span style={{ color: '#ccc' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {selectedOrder && editableOrder && (
              <div
                role="dialog"
                aria-modal="true"
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.35)',
                  zIndex: 3000,
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
                onClick={() => {
                  setSelectedOrder(null);
                  setEditableOrder(null);
                }}
              >
                <form
                  onSubmit={handleSaveOrderDetails}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: 'min(760px, 100%)',
                    height: '100vh',
                    overflowY: 'auto',
                    backgroundColor: '#ffffff',
                    boxShadow: '-12px 0 30px rgba(0,0,0,0.18)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: '#ffffff', borderBottom: '1px solid #e3e3e3', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div>
                      <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700' }}>Order {selectedOrder.order_number}</h2>
                      <p style={{ margin: 0, color: '#6d6d6d', fontSize: '13px' }}>{selectedOrder.date_str} - {selectedOrder.customer}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(null);
                        setEditableOrder(null);
                      }}
                      style={{ width: '34px', height: '34px', border: '1px solid #cccccc', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '18px' }}
                    >
                      x
                    </button>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orderDetailError && (
                      <div style={{ backgroundColor: '#ffebe9', color: '#b42318', padding: '10px 12px', borderRadius: '6px', fontSize: '13px' }}>
                        {orderDetailError}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                      <div style={{ backgroundColor: '#f8faf9', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ color: '#6d6d6d', fontSize: '11px', marginBottom: '4px' }}>Total</div>
                        <input value={editableOrder.total_price} onChange={e => handleOrderFieldChange('total_price', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: '700', fontSize: '16px', outline: 'none' }} />
                      </div>
                      <div style={{ backgroundColor: '#f8faf9', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ color: '#6d6d6d', fontSize: '11px', marginBottom: '4px' }}>Payment</div>
                        <select value={editableOrder.payment_status} onChange={e => handleOrderFieldChange('payment_status', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: '700', outline: 'none' }}>
                          <option>Paid</option>
                          <option>Payment pending</option>
                          <option>Refunded</option>
                          <option>Failed</option>
                        </select>
                      </div>
                      <div style={{ backgroundColor: '#f8faf9', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ color: '#6d6d6d', fontSize: '11px', marginBottom: '4px' }}>Fulfillment</div>
                        <select value={editableOrder.fulfillment_status} onChange={e => handleOrderFieldChange('fulfillment_status', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: '700', outline: 'none' }}>
                          <option>Fulfilled</option>
                          <option>In progress</option>
                          <option>Not required</option>
                          <option>Unfulfilled</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e3e3e3', borderRadius: '8px', padding: '18px' }}>
                      <h3 style={{ margin: '0 0 14px 0', fontSize: '15px' }}>Customer Details</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', color: '#6d6d6d' }}>
                          Customer Name
                          <input value={editableOrder.customer} onChange={e => handleOrderFieldChange('customer', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', color: '#6d6d6d' }}>
                          Email
                          <input value={editableOrder.customer_email || ''} onChange={e => handleOrderFieldChange('customer_email', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', color: '#6d6d6d' }}>
                          Phone
                          <input value={editableOrder.customer_phone || ''} onChange={e => handleOrderFieldChange('customer_phone', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', color: '#6d6d6d' }}>
                          Channel
                          <input value={editableOrder.channel} onChange={e => handleOrderFieldChange('channel', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                        </label>
                        <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', color: '#6d6d6d' }}>
                          Shipping Address
                          <textarea value={editableOrder.shipping_address || ''} onChange={e => handleOrderFieldChange('shipping_address', e.target.value)} rows={3} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit' }} />
                        </label>
                        <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', color: '#6d6d6d' }}>
                          Billing Address
                          <textarea value={editableOrder.billing_address || ''} onChange={e => handleOrderFieldChange('billing_address', e.target.value)} rows={3} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit' }} />
                        </label>
                        <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', color: '#6d6d6d' }}>
                          Notes
                          <textarea value={editableOrder.notes || ''} onChange={e => handleOrderFieldChange('notes', e.target.value)} rows={3} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit' }} />
                        </label>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e3e3e3', borderRadius: '8px', padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px' }}>Ordered Products</h3>
                        <button type="button" onClick={() => setEditableOrderItems(prev => [...prev, { name: 'New Product', image_url: '/images/hero_candle.png', quantity: 1, selected_fragrance: '', price: '₹0', total: '₹0' }])} style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          Add Item
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {editableOrderItems.length === 0 ? (
                          <p style={{ margin: 0, color: '#8c8c8c', fontSize: '13px' }}>No products captured for this order.</p>
                        ) : editableOrderItems.map((item, index) => (
                          <div key={`${item.name}-${index}`} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '12px', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ position: 'relative', width: '72px', height: '72px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e3e3e3', backgroundColor: '#f6f6f6' }}>
                              <Image src={item.image_url || '/images/hero_candle.png'} alt={item.name} fill style={{ objectFit: 'cover' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 110px', gap: '8px', alignItems: 'end' }}>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>
                                Product
                                <input value={item.name} onChange={e => handleOrderItemChange(index, 'name', e.target.value)} style={{ padding: '7px 9px', border: '1px solid #ccc', borderRadius: '6px' }} />
                              </label>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>
                                Qty
                                <input type="number" min="1" value={item.quantity} onChange={e => handleOrderItemChange(index, 'quantity', e.target.value)} style={{ padding: '7px 9px', border: '1px solid #ccc', borderRadius: '6px' }} />
                              </label>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>
                                Price
                                <input value={item.price} onChange={e => handleOrderItemChange(index, 'price', e.target.value)} style={{ padding: '7px 9px', border: '1px solid #ccc', borderRadius: '6px' }} />
                              </label>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>
                                Total
                                <input value={item.total} onChange={e => handleOrderItemChange(index, 'total', e.target.value)} style={{ padding: '7px 9px', border: '1px solid #ccc', borderRadius: '6px' }} />
                              </label>
                              <label style={{ gridColumn: '1 / 4', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>
                                Fragrance
                                <input value={item.selected_fragrance || ''} onChange={e => handleOrderItemChange(index, 'selected_fragrance', e.target.value)} style={{ padding: '7px 9px', border: '1px solid #ccc', borderRadius: '6px' }} />
                              </label>
                              <label style={{ gridColumn: '1 / 4', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>
                                Product Image URL
                                <input value={item.image_url} onChange={e => handleOrderItemChange(index, 'image_url', e.target.value)} style={{ padding: '7px 9px', border: '1px solid #ccc', borderRadius: '6px' }} />
                              </label>
                              <button type="button" onClick={() => setEditableOrderItems(prev => prev.filter((_, itemIndex) => itemIndex !== index))} style={{ backgroundColor: '#ffebe9', color: '#ff4d4d', border: 'none', borderRadius: '6px', padding: '8px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e3e3e3', borderRadius: '8px', padding: '18px' }}>
                      <h3 style={{ margin: '0 0 14px 0', fontSize: '15px' }}>Order Status</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '13px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', color: '#6d6d6d' }}>
                          Order Number
                          <input value={editableOrder.order_number} onChange={e => handleOrderFieldChange('order_number', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', color: '#6d6d6d' }}>
                          Date
                          <input value={editableOrder.date_str} onChange={e => handleOrderFieldChange('date_str', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', color: '#6d6d6d' }}>
                          Delivery
                          <select value={editableOrder.delivery_status || ''} onChange={e => handleOrderFieldChange('delivery_status', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                            <option value="">None</option>
                            <option>Delivered</option>
                            <option>Shipped</option>
                            <option>In transit</option>
                            <option>Cancelled</option>
                          </select>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div style={{ position: 'sticky', bottom: 0, backgroundColor: '#ffffff', borderTop: '1px solid #e3e3e3', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={() => { setEditableOrder({ ...selectedOrder }); setEditableOrderItems(parseOrderItems(selectedOrder)); }} style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '9px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      Reset
                    </button>
                    <button type="submit" disabled={savingOrder} style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '9px 16px', fontSize: '13px', fontWeight: '600', cursor: savingOrder ? 'not-allowed' : 'pointer', opacity: savingOrder ? 0.7 : 1 }}>
                      {savingOrder ? 'Saving...' : 'Save Order Details'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* TAB 1.5: DRAFTS MANAGER */}
        {activeTab === 'drafts' && (
          <div>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📝</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Draft Orders</h1>
              </div>
              
              <button 
                onClick={() => setShowDraftModal(true)}
                style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
              >
                Create Draft
              </button>
            </div>

            {/* Quick Draft Creation Inline Form */}
            {showDraftModal && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 16px 0' }}>Create Manual Draft Invoice</h3>
                <form onSubmit={handleCreateDraft} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Customer Name</label>
                    <input type="text" value={draftCustomer} onChange={e => setDraftCustomer(e.target.value)} required placeholder="Nikita Sen" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Total Price (₹)</label>
                    <input type="number" value={draftPrice} onChange={e => setDraftPrice(e.target.value)} required placeholder="899" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Items Description</label>
                    <input type="text" value={draftItems} onChange={e => setDraftItems(e.target.value)} required placeholder="1 item" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    Save Draft
                  </button>
                  <button type="button" onClick={() => setShowDraftModal(false)} style={{ backgroundColor: 'transparent', border: '1px solid #ccc', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {/* Drafts table */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #e3e3e3', color: '#6d6d6d' }}>
                      <th style={{ padding: '12px 16px', width: '30px' }}><input type="checkbox" /></th>
                      <th style={{ padding: '12px 16px' }}>Draft</th>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Customer</th>
                      <th style={{ padding: '12px 16px' }}>Total</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Items</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingDrafts ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#9e9e9e' }}>Loading drafts...</td>
                      </tr>
                    ) : drafts.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#9e9e9e' }}>No drafts open.</td>
                      </tr>
                    ) : (
                      drafts.map((draft) => (
                        <tr key={draft.id} style={{ borderBottom: '1px solid #e3e3e3' }}>
                          <td style={{ padding: '12px 16px' }}><input type="checkbox" /></td>
                          <td style={{ padding: '12px 16px', fontWeight: '600' }}>{draft.draft_number}</td>
                          <td style={{ padding: '12px 16px', color: '#6d6d6d' }}>{draft.date_str}</td>
                          <td style={{ padding: '12px 16px' }}>{draft.customer}</td>
                          <td style={{ padding: '12px 16px', fontWeight: '600' }}>{draft.total_price}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '12px', backgroundColor: '#ffe8d6', color: '#a65d00' }}>
                              {draft.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#6d6d6d' }}>{draft.items_count}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button 
                              onClick={() => handleCompleteDraft(draft.id)}
                              style={{ backgroundColor: '#2d5c4d', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              ✓ Mark as Paid
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 1.6: ABANDONED CHECKOUTS */}
        {activeTab === 'abandoned' && (
          <div>
            {/* Header section */}
            <div style={{ display: 'flex', borderBottom: 'none', marginBottom: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>🛒</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Abandoned Checkouts</h1>
              </div>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #e3e3e3', color: '#6d6d6d' }}>
                      <th style={{ padding: '12px 16px', width: '30px' }}><input type="checkbox" /></th>
                      <th style={{ padding: '12px 16px' }}>Checkout</th>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Customer</th>
                      <th style={{ padding: '12px 16px' }}>Email</th>
                      <th style={{ padding: '12px 16px' }}>Total Cart Value</th>
                      <th style={{ padding: '12px 16px' }}>Items</th>
                      <th style={{ padding: '12px 16px' }}>Recovery status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAbandoned ? (
                      <tr>
                        <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#9e9e9e' }}>Loading abandoned checkouts...</td>
                      </tr>
                    ) : abandoned.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#9e9e9e' }}>No abandoned checkouts found.</td>
                      </tr>
                    ) : (
                      abandoned.map((checkout) => (
                        <tr
                          key={checkout.id}
                          onClick={() => setSelectedAbandonedCheckout(checkout)}
                          style={{ borderBottom: '1px solid #e3e3e3', cursor: 'pointer', transition: 'background-color 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '12px 16px' }}><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                          <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1f4d3a', textDecoration: 'underline' }}>{checkout.checkout_number}</td>
                          <td style={{ padding: '12px 16px', color: '#6d6d6d' }}>{checkout.date_str}</td>
                          <td style={{ padding: '12px 16px' }}>{checkout.customer}</td>
                          <td style={{ padding: '12px 16px', color: '#6d6d6d' }}>{checkout.email}</td>
                          <td style={{ padding: '12px 16px', fontWeight: '600' }}>{checkout.total_price}</td>
                          <td style={{ padding: '12px 16px', color: '#6d6d6d' }}>{checkout.items_count}</td>
                          
                          {/* Recovery status badge */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ 
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              backgroundColor: checkout.recovery_status === 'Sent' ? '#e2ece9' : '#ffe8d6',
                              color: checkout.recovery_status === 'Sent' ? '#2d5c4d' : '#a65d00'
                            }}>
                              {checkout.recovery_status}
                            </span>
                          </td>

                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendRecoveryEmail(checkout.id, checkout.email);
                              }}
                              style={{ 
                                backgroundColor: checkout.recovery_status === 'Sent' ? '#e3e3e3' : '#1a1a1a', 
                                color: checkout.recovery_status === 'Sent' ? '#6d6d6d' : '#ffffff', 
                                border: 'none', 
                                borderRadius: '4px', 
                                padding: '6px 12px', 
                                fontSize: '11px', 
                                fontWeight: '600', 
                                cursor: checkout.recovery_status === 'Sent' ? 'not-allowed' : 'pointer' 
                              }}
                              disabled={checkout.recovery_status === 'Sent'}
                            >
                              {checkout.recovery_status === 'Sent' ? 'Resend Email' : '✉ Send Recovery'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 1.7: COLLECTIONS MANAGER (With FULL CRUD additions!) */}
        {activeTab === 'collections' && (
          <div>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>🕯️</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Collections</h1>
              </div>
              <button 
                onClick={() => {
                  setCollName('');
                  setCollDesc('');
                  setEditingCollId(null);
                  setShowCollForm(!showCollForm);
                }}
                style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
              >
                {showCollForm ? 'Cancel' : 'Create Collection'}
              </button>
            </div>

            {/* Create/Edit Collection Form Panel */}
            {showCollForm && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 16px 0' }}>
                  {editingCollId ? 'Edit Collection Details' : 'Pave New Candle Collection'}
                </h3>
                <form onSubmit={handleSaveCollection} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '300px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Collection Name</label>
                    <input 
                      type="text" value={collName} onChange={e => setCollName(e.target.value)} required placeholder="e.g. Scented Candles"
                      style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Description</label>
                    <textarea 
                      value={collDesc} onChange={e => setCollDesc(e.target.value)} required rows={3} placeholder="Describe the aesthetics of this collection..."
                      style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'none' }}
                    />
                  </div>

                  {/* Products Association Section (Shopify Style) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    <label style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>Products</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flexGrow: 1 }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c', fontSize: '14px' }}>🔍</span>
                        <input 
                          type="text" 
                          placeholder="Search products" 
                          onClick={() => {
                            setTempSelectedProductIds([...selectedProductIds]);
                            setModalSearchQuery('');
                            setShowBrowseModal(true);
                          }}
                          readOnly
                          style={{ 
                            width: '100%', 
                            padding: '10px 12px 10px 36px', 
                            border: '1px solid #cccccc', 
                            borderRadius: '8px', 
                            fontSize: '13px',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                          }}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setTempSelectedProductIds([...selectedProductIds]);
                          setModalSearchQuery('');
                          setShowBrowseModal(true);
                        }}
                        style={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #cccccc', 
                          borderRadius: '8px', 
                          padding: '10px 20px', 
                          fontSize: '13px',
                          fontWeight: '600', 
                          color: '#1a1a1a',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f6f6f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        Browse
                      </button>
                    </div>

                    {/* List of currently selected products below the search bar */}
                    {selectedProductIds.length > 0 && (
                      <div style={{ 
                        marginTop: '8px', 
                        border: '1px solid #e3e3e3', 
                        borderRadius: '8px', 
                        backgroundColor: '#ffffff', 
                        display: 'flex', 
                        flexDirection: 'column'
                      }}>
                        {selectedProductIds.map((prodId) => {
                          const prod = products.find(p => p.id === prodId);
                          if (!prod) return null;
                          return (
                            <div 
                              key={prod.id} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                padding: '8px 12px', 
                                borderBottom: '1px solid #e3e3e3',
                                fontSize: '13px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img 
                                  src={prod.image_url} 
                                  alt={prod.name} 
                                  style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} 
                                />
                                <div>
                                  <div style={{ fontWeight: '500', color: '#1a1a1a' }}>{prod.name}</div>
                                  <span style={{ fontSize: '11px', color: '#8c8c8c' }}>{prod.features}</span>
                                </div>
                              </div>
                              <button 
                                type="button"
                                onClick={() => setSelectedProductIds(selectedProductIds.filter(id => id !== prodId))}
                                style={{ 
                                  background: 'transparent', 
                                  border: 'none', 
                                  color: '#ff4d4d', 
                                  fontSize: '16px', 
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Shopify-style Browse Products Modal */}
                  {showBrowseModal && (
                    <div style={{ 
                      position: 'fixed', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      bottom: 0, 
                      backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      zIndex: 2000
                    }}>
                      <div style={{ 
                        width: '520px', 
                        backgroundColor: '#ffffff', 
                        borderRadius: '12px', 
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        maxHeight: '80vh',
                        overflow: 'hidden'
                      }}>
                        {/* Modal Header */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '16px 20px', 
                          borderBottom: '1px solid #e3e3e3' 
                        }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>Add products</h3>
                          <button 
                            type="button"
                            onClick={() => setShowBrowseModal(false)}
                            style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#8c8c8c' }}
                          >
                            ✕
                          </button>
                        </div>

                        {/* Modal Search Bar */}
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid #e3e3e3', backgroundColor: '#f9f9f9' }}>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c', fontSize: '14px' }}>🔍</span>
                            <input 
                              type="text" 
                              placeholder="Search products" 
                              value={modalSearchQuery}
                              onChange={(e) => setModalSearchQuery(e.target.value)}
                              style={{ 
                                width: '100%', 
                                padding: '8px 12px 8px 36px', 
                                border: '1px solid #cccccc', 
                                borderRadius: '6px', 
                                fontSize: '13px' 
                              }}
                            />
                          </div>
                        </div>

                        {/* Modal Product List */}
                        <div style={{ overflowY: 'auto', flexGrow: 1, padding: '8px 0' }}>
                          {products.filter(prod => {
                            if (!modalSearchQuery) return true;
                            return prod.name.toLowerCase().includes(modalSearchQuery.toLowerCase());
                          }).length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#8c8c8c', fontSize: '13px' }}>
                              No products match your search.
                            </div>
                          ) : (
                            products.filter(prod => {
                              if (!modalSearchQuery) return true;
                              return prod.name.toLowerCase().includes(modalSearchQuery.toLowerCase());
                            }).map((prod) => {
                              const isChecked = tempSelectedProductIds.includes(prod.id);
                              return (
                                <label 
                                  key={prod.id} 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px', 
                                    padding: '10px 20px', 
                                    cursor: 'pointer', 
                                    borderBottom: '1px solid #f6f6f6',
                                    transition: 'background 0.1s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setTempSelectedProductIds([...tempSelectedProductIds, prod.id]);
                                      } else {
                                        setTempSelectedProductIds(tempSelectedProductIds.filter(id => id !== prod.id));
                                      }
                                    }}
                                    style={{ width: '16px', height: '16px' }}
                                  />
                                  <img 
                                    src={prod.image_url} 
                                    alt={prod.name} 
                                    style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} 
                                  />
                                  <div style={{ flexGrow: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>{prod.name}</div>
                                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                      Collection: {prod.collection || 'Unassigned'} • ₹{prod.price}
                                    </div>
                                  </div>
                                </label>
                              );
                            })
                          )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ 
                          padding: '12px 20px', 
                          borderTop: '1px solid #e3e3e3', 
                          display: 'flex', 
                          justifyContent: 'flex-end', 
                          gap: '10px',
                          backgroundColor: '#f9f9f9'
                        }}>
                          <button 
                            type="button"
                            onClick={() => setShowBrowseModal(false)}
                            style={{ 
                              backgroundColor: '#ffffff', 
                              border: '1px solid #cccccc', 
                              borderRadius: '6px', 
                              padding: '8px 16px', 
                              fontSize: '13px', 
                              cursor: 'pointer' 
                            }}
                          >
                            Cancel
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedProductIds(tempSelectedProductIds);
                              setShowBrowseModal(false);
                            }}
                            style={{ 
                              backgroundColor: '#1a1a1a', 
                              color: '#ffffff', 
                              border: 'none', 
                              borderRadius: '6px', 
                              padding: '8px 20px', 
                              fontSize: '13px', 
                              fontWeight: '600', 
                              cursor: 'pointer' 
                            }}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      {editingCollId ? 'Update Collection' : 'Create Collection'}
                    </button>
                    <button type="button" onClick={() => { setShowCollForm(false); setEditingCollId(null); }} style={{ backgroundColor: 'transparent', border: '1px solid #ccc', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Collections Grid rendering */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {loadingCollections ? (
                <p style={{ color: '#9e9e9e', fontSize: '13px' }}>Loading collections catalog...</p>
              ) : collections.length === 0 ? (
                <p style={{ color: '#9e9e9e', fontSize: '13px' }}>No collections configured.</p>
              ) : (
                collections.map((coll) => (
                  <div key={coll.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#0b1a11' }}>{coll.name}</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => handleEditCollectionClick(coll)}
                            style={{ background: 'transparent', border: 'none', color: '#2196f3', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCollection(coll.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ff4d4d', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6d6d6d', margin: '0 0 16px 0', minHeight: '3.6em', overflow: 'hidden', lineHeight: '1.4' }}>{coll.description}</p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#9e9e9e' }}>Active Catalog Products</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: '#e2ece9', color: '#2d5c4d', padding: '3px 8px', borderRadius: '12px' }}>
                        {products.filter(p => p.collection.toLowerCase() === coll.name.toLowerCase()).length} items
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 1.8: DISCOUNTS MANAGER */}
        {activeTab === 'discounts' && (
          <div>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>🏷️</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Discounts</h1>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                  Export
                </button>
                <button 
                  onClick={() => {
                    resetDiscountForm();
                    setShowDiscountTypeModal(true);
                  }}
                  style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Create discount
                </button>
              </div>
            </div>

            {/* Custom create form if type selected */}
            {showCreateDiscountForm && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 16px 0' }}>{editingDiscountId ? 'Edit' : 'Configure'}: {selectedDiscountType}</h3>
                <form onSubmit={handleCreateDiscount} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Discount Code Title</label>
                    <input type="text" value={newDiscountTitle} onChange={e => setNewDiscountTitle(e.target.value)} required placeholder="e.g. FESTIVE30" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Discount Value Type</label>
                    <select value={newDiscountValueType} onChange={e => setNewDiscountValueType(e.target.value as 'fixed' | 'percentage')} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }}>
                      <option value="fixed">Fixed amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>{newDiscountValueType === 'percentage' ? 'Percent Off' : 'Amount Off'}</label>
                    <input type="number" min="0" step="0.01" value={newDiscountValue} onChange={e => setNewDiscountValue(e.target.value)} required placeholder={newDiscountValueType === 'percentage' ? 'e.g. 10' : 'e.g. 50'} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', width: '110px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Minimum Cart</label>
                    <input type="number" min="0" step="0.01" value={newDiscountMinimumOrder} onChange={e => setNewDiscountMinimumOrder(e.target.value)} placeholder="0" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', width: '110px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Status</label>
                    <select value={newDiscountStatus} onChange={e => setNewDiscountStatus(e.target.value as 'Active' | 'Expired')} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }}>
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Summary Text</label>
                    <input type="text" value={newDiscountSummary} onChange={e => setNewDiscountSummary(e.target.value)} required placeholder="e.g. 30% off select candles" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', width: '260px' }} />
                  </div>
                  <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    {editingDiscountId ? 'Update Code' : 'Save Code'}
                  </button>
                  <button type="button" onClick={() => { resetDiscountForm(); setShowCreateDiscountForm(false); }} style={{ backgroundColor: 'transparent', border: '1px solid #ccc', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {/* Discounts list table */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', overflow: 'hidden' }}>
              
              <div style={{ borderBottom: '1px solid #e3e3e3', padding: '12px 16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #1a1a1a', paddingBottom: '14px', marginBottom: '-13px' }}>All</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #e3e3e3', color: '#6d6d6d' }}>
                      <th style={{ padding: '12px 16px', width: '30px' }}><input type="checkbox" /></th>
                      <th style={{ padding: '12px 16px' }}>Title</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Type</th>
                      <th style={{ padding: '12px 16px' }}>Combinations</th>
                      <th style={{ padding: '12px 16px' }}>Used</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingDiscounts ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#9e9e9e' }}>Loading discounts catalog...</td>
                      </tr>
                    ) : discounts.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#9e9e9e' }}>No discounts configured.</td>
                      </tr>
                    ) : (
                      discounts.map((disc) => (
                        <tr key={disc.id} style={{ borderBottom: '1px solid #e3e3e3' }}>
                          <td style={{ padding: '12px 16px' }}><input type="checkbox" /></td>
                          <td style={{ padding: '12px 16px' }}>
                            <strong style={{ display: 'block', color: '#0b1a11' }}>{disc.title}</strong>
                            <span style={{ fontSize: '11px', color: '#6d6d6d' }}>{disc.summary}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: '600', 
                              padding: '4px 8px', 
                              borderRadius: '12px', 
                              backgroundColor: disc.status === 'Active' ? '#e2ece9' : '#ffe8d6', 
                              color: disc.status === 'Active' ? '#2d5c4d' : '#a65d00' 
                            }}>
                              {disc.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#6d6d6d' }}>{disc.discount_type}</td>
                          <td style={{ padding: '12px 16px', color: '#ccc' }}>✉ 📦</td>
                          <td style={{ padding: '12px 16px', fontWeight: '600' }}>{disc.used_count} used</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleEditDiscount(disc)}
                              style={{ backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Select discount type popup modal */}
            {showDiscountTypeModal && (
              <div style={{ 
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <div style={{ 
                  backgroundColor: '#ffffff', width: '90%', maxWidth: '540px', 
                  borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
                  border: '1px solid #ccc'
                }}>
                  
                  {/* Modal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e3e3e3' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Select discount type</h3>
                    <button 
                      onClick={() => setShowDiscountTypeModal(false)}
                      style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6d6d6d' }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* List Options */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {[
                      { type: 'Amount off products', desc: 'Discount specific products or collections of products' },
                      { type: 'Buy X get Y', desc: 'Discount specific products or collections of products' },
                      { type: 'Amount off order', desc: 'Discount the total order amount' },
                      { type: 'Free shipping', desc: 'Offer free shipping on an order' },
                      { type: 'Kwik COD & Checkout', desc: 'Configure automatic cash on delivery discounts' },
                      { type: 'discount-customization', desc: 'Custom discount scripts' },
                      { type: 'Judge.me Reviews', desc: 'Reward customers who leave review ratings' },
                      { type: 'Enable a referrals campaign', desc: 'Display a referral link after your customers complete a purchase' }
                    ].map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedDiscountType(opt.type);
                          setShowDiscountTypeModal(false);
                          setShowCreateDiscountForm(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '14px 24px',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          transition: 'background 0.1s ease',
                          width: '100%'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span style={{ fontSize: '16px' }}>🏷️</span>
                        <div>
                          <strong style={{ display: 'block', fontSize: '13px', color: '#1a1a1a', fontWeight: '600', marginBottom: '2px' }}>{opt.type}</strong>
                          <span style={{ fontSize: '11px', color: '#6d6d6d' }}>{opt.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', backgroundColor: '#f9f9f9', borderTop: '1px solid #e3e3e3' }}>
                    <button 
                      onClick={() => setShowDiscountTypeModal(false)}
                      style={{ 
                        border: '1px solid #ccc', backgroundColor: '#ffffff', color: '#1a1a1a', 
                        borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', 
                        cursor: 'pointer' 
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 1.9: CUSTOMER REVIEWS MANAGER */}
        {activeTab === 'customers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>👥</span>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Customer Reviews</h1>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6d6d6d' }}>Manage all product-page reviews from one place.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetReviewForm();
                  setShowReviewForm(!showReviewForm);
                }}
                style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                {showReviewForm ? 'Close Form' : 'Add Review'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Total reviews', value: customerReviews.length },
                { label: 'Verified', value: customerReviews.filter(review => review.verified).length },
                { label: '5 star', value: customerReviews.filter(review => review.rating === 5).length },
                { label: 'Helpful votes', value: customerReviews.reduce((sum, review) => sum + review.helpful, 0) }
              ].map(card => (
                <div key={card.label} style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '16px' }}>
                  <p style={{ margin: '0 0 6px', color: '#6d6d6d', fontSize: '12px' }}>{card.label}</p>
                  <strong style={{ display: 'block', fontSize: '24px', lineHeight: 1 }}>{card.value}</strong>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '18px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Real Moments Photos</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6d6d6d' }}>These photos appear in the product page gallery and popup.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => saveCustomerMoments(defaultCustomerMoments)}
                    style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Reset defaults
                  </button>
                  <label style={{ backgroundColor: '#1a1a1a', color: '#ffffff', borderRadius: '6px', padding: '8px 14px', fontSize: '13px', fontWeight: '600', cursor: uploadingMomentPhotos ? 'wait' : 'pointer', opacity: uploadingMomentPhotos ? 0.7 : 1 }}>
                    {uploadingMomentPhotos ? 'Uploading...' : 'Upload photos'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingMomentPhotos}
                      onChange={async (e) => {
                        await handleUploadMomentPhotos(e.target.files);
                        e.target.value = '';
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                {customerMoments.map((moment, index) => (
                  <div key={moment.id} style={{ border: '1px solid #e3e3e3', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fafafa' }}>
                    <img src={moment.image} alt={moment.alt} style={{ width: '100%', aspectRatio: '1.35 / 1', objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '9px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6d6d6d' }}>Photo {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteMomentPhoto(moment.id)}
                        style={{ backgroundColor: '#ffebe9', color: '#d72c0d', border: '1px solid #ffd0cc', borderRadius: '5px', padding: '5px 8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '18px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Real Moments Videos</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6d6d6d' }}>These videos appear in customer video cards and the product page Instagram section.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => saveCustomerVideos(defaultCustomerVideos)}
                    style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Reset defaults
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetVideoForm();
                      setShowVideoForm(!showVideoForm);
                    }}
                    style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {showVideoForm ? 'Close form' : 'Add video'}
                  </button>
                </div>
              </div>

              {showVideoForm && (
                <form onSubmit={handleSaveCustomerVideo} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '16px', padding: '14px', border: '1px solid #e3e3e3', borderRadius: '8px', backgroundColor: '#fafafa', fontSize: '13px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Video title
                    <input value={videoForm.title} onChange={e => setVideoForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Unboxing Experience" style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Customer name
                    <input value={videoForm.author} onChange={e => setVideoForm(prev => ({ ...prev, author: e.target.value }))} placeholder="Neha S." style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Duration
                    <input value={videoForm.duration} onChange={e => setVideoForm(prev => ({ ...prev, duration: e.target.value }))} placeholder="0:24" style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Thumbnail URL
                    <input value={videoForm.thumbnail} onChange={e => setVideoForm(prev => ({ ...prev, thumbnail: e.target.value }))} placeholder="/images/hero_candle.png" style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px' }} />
                  </label>
                  <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Video URL
                    <input value={videoForm.videoUrl} onChange={e => setVideoForm(prev => ({ ...prev, videoUrl: e.target.value }))} required placeholder="https://example.com/customer-video.mp4" style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px' }} />
                  </label>
                  <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Link on video
                    <input value={videoForm.link} onChange={e => setVideoForm(prev => ({ ...prev, link: e.target.value }))} placeholder="https://instagram.com/reel/..." style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px' }} />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                    <input type="checkbox" checked={videoForm.verified} onChange={e => setVideoForm(prev => ({ ...prev, verified: e.target.checked }))} />
                    Verified purchase
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={() => { resetVideoForm(); setShowVideoForm(false); }} style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      {editingVideoId ? 'Save video' : 'Add video'}
                    </button>
                  </div>
                </form>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {customerVideos.map((video, index) => (
                  <div key={video.id} style={{ border: '1px solid #e3e3e3', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fafafa' }}>
                    <video src={video.videoUrl} poster={video.thumbnail} muted playsInline controls style={{ width: '100%', aspectRatio: '1.55 / 1', objectFit: 'cover', display: 'block', backgroundColor: '#111111' }} />
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '13px' }}>Video {index + 1}: {video.title}</strong>
                        <span style={{ display: 'block', marginTop: '3px', fontSize: '12px', color: '#6d6d6d' }}>by {video.author} • {video.duration}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: video.verified ? '#2d5c4d' : '#8c8c8c' }}>{video.verified ? 'Verified Purchase' : 'Not verified'}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={() => handleEditCustomerVideo(video)} style={{ backgroundColor: '#ffffff', color: '#1a1a1a', border: '1px solid #cccccc', borderRadius: '5px', padding: '5px 8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteCustomerVideo(video.id)} style={{ backgroundColor: '#ffebe9', color: '#d72c0d', border: '1px solid #ffd0cc', borderRadius: '5px', padding: '5px 8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showReviewForm && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700' }}>{editingReviewId ? 'Edit Review' : 'Add Customer Review'}</h3>
                <form onSubmit={handleSaveReview} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', fontSize: '13px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Customer name
                    <input value={reviewForm.name} onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))} placeholder="sunny" style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    City
                    <input value={reviewForm.city} onChange={e => setReviewForm(prev => ({ ...prev, city: e.target.value }))} placeholder="delhi" style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Product
                    <select value={reviewForm.productId} onChange={e => setReviewForm(prev => ({ ...prev, productId: e.target.value }))} style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                      <option value="">Generic Deeksha Candle</option>
                      {products.filter(product => !product.deleted_at).map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Rating
                    <select value={reviewForm.rating} onChange={e => setReviewForm(prev => ({ ...prev, rating: e.target.value }))} style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                      <option value="5">5 stars</option>
                      <option value="4">4 stars</option>
                      <option value="3">3 stars</option>
                      <option value="2">2 stars</option>
                      <option value="1">1 star</option>
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Customer photo path
                    <input value={reviewForm.avatar} onChange={e => setReviewForm(prev => ({ ...prev, avatar: e.target.value }))} placeholder="/images/cozy_room_glow.png" style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Helpful count
                    <input type="number" min="0" value={reviewForm.helpful} onChange={e => setReviewForm(prev => ({ ...prev, helpful: e.target.value }))} style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px' }} />
                  </label>
                  <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: '600' }}>
                    Review text
                    <textarea value={reviewForm.quote} onChange={e => setReviewForm(prev => ({ ...prev, quote: e.target.value }))} required rows={4} placeholder="mujhe bahut jada pasand aayi h ye candle..." style={{ padding: '9px 12px', border: '1px solid #cccccc', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit' }} />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                    <input type="checkbox" checked={reviewForm.verified} onChange={e => setReviewForm(prev => ({ ...prev, verified: e.target.checked }))} />
                    Verified purchase
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={() => { resetReviewForm(); setShowReviewForm(false); }} style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '9px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '9px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{editingReviewId ? 'Save Review' : 'Create Review'}</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <input
                value={reviewSearchQuery}
                onChange={e => setReviewSearchQuery(e.target.value)}
                placeholder="Search reviews by customer, city, product, or text"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cccccc', borderRadius: '6px', fontSize: '13px' }}
              />
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #e3e3e3', color: '#6d6d6d' }}>
                    <th style={{ padding: '12px 16px' }}>Customer</th>
                    <th style={{ padding: '12px 16px' }}>Product</th>
                    <th style={{ padding: '12px 16px' }}>Review</th>
                    <th style={{ padding: '12px 16px' }}>Rating</th>
                    <th style={{ padding: '12px 16px' }}>Helpful</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomerReviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#8c8c8c' }}>No reviews found.</td>
                    </tr>
                  ) : filteredCustomerReviews.map((review) => (
                    <tr key={review.id} style={{ borderBottom: '1px solid #e3e3e3', verticalAlign: 'top' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <img src={review.avatar} alt={review.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', backgroundColor: '#f1f1f1' }} />
                          <div>
                            <div style={{ fontWeight: '700' }}>{review.name}</div>
                            <div style={{ color: '#6d6d6d', fontSize: '12px' }}>{review.city} • {review.time}</div>
                            {review.verified && <span style={{ display: 'inline-block', marginTop: '4px', color: '#2d7d46', fontSize: '11px', fontWeight: '700' }}>Verified</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: '220px' }}>
                          <img src={review.productImage} alt={review.productName} style={{ width: '46px', height: '46px', borderRadius: '6px', objectFit: 'cover', backgroundColor: '#f1f1f1' }} />
                          <span style={{ fontWeight: '600' }}>{review.productName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#3d3d3d', maxWidth: '360px', lineHeight: 1.5 }}>{review.quote}</td>
                      <td style={{ padding: '12px 16px', color: '#d59a3d', whiteSpace: 'nowrap' }}>{'★'.repeat(review.rating)}</td>
                      <td style={{ padding: '12px 16px' }}>{review.helpful}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button type="button" onClick={() => handleEditReview(review)} style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                          <button type="button" onClick={() => handleDeleteReview(review.id)} style={{ backgroundColor: '#ffebe9', color: '#d72c0d', border: '1px solid #ffd0cc', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2.1: GROWTH & MARKETING */}
        {activeTab === 'growth' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📈</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Growth & Marketing</h1>
              </div>
            </div>

            {/* Campaign conversion stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
              
              {/* Active Campaigns list */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px' }}>Active Campaigns</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {campaigns.map((camp, idx) => (
                    <div key={idx} style={{ border: '1px solid #f0f0f0', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '14px', color: '#0b1a11' }}>{camp.name}</strong>
                        <span style={{ fontSize: '12px', color: '#2d5c4d', fontWeight: '700', backgroundColor: '#e2ece9', padding: '2px 8px', borderRadius: '10px' }}>ROI: {camp.roi}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '12px', color: '#6d6d6d' }}>
                        <div>
                          <span>Impressions</span>
                          <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#1a1a1a' }}>{camp.impressions}</p>
                        </div>
                        <div>
                          <span>Conversions</span>
                          <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#1a1a1a' }}>{camp.conversions}</p>
                        </div>
                        <div>
                          <span>Spend</span>
                          <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#1a1a1a' }}>{camp.spend}</p>
                        </div>
                        <div>
                          <span>Sales Revenue</span>
                          <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#1a1a1a' }}>{camp.sales}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px' }}>Conversion Funnel</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  {[
                    { label: 'Store Sessions', val: '24,582', pct: 100 },
                    { label: 'Added to Cart', val: '1,852', pct: 7.5 },
                    { label: 'Reached Checkout', val: '924', pct: 3.7 },
                    { label: 'Purchased / Converted', val: '452', pct: 1.8 }
                  ].map((step, idx) => (
                    <div key={idx} style={{ fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span>{step.label}</span>
                        <strong>{step.val} <span style={{ fontWeight: 'normal', color: '#6d6d6d' }}>({step.pct}%)</span></strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${step.pct * (idx === 0 ? 1 : 10)}%`, height: '100%', backgroundColor: '#2d5c4d', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2.2: CONTENT MANAGER */}
        {activeTab === 'content' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>✍️</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Content & Page Management</h1>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="/" target="_blank" rel="noreferrer" style={{ backgroundColor: '#ffffff', color: '#1a1a1a', border: '1px solid #cccccc', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
                  View Home Page
                </a>
                <button
                  type="button"
                  onClick={() => {
                    resetBlogForm();
                    setShowNewPostForm(true);
                  }}
                  style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Create Blog Post
                </button>
              </div>
            </div>

            {/* Quick Post form */}
            {showNewPostForm && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 16px 0' }}>{editingPostId ? 'Edit Article' : 'Write New Article'}</h3>
                <form onSubmit={handleCreateBlogPost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Article Title</label>
                    <input type="text" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} required placeholder="e.g. Scenting Your Living Spaces: Tips & Tricks" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Author</label>
                      <input type="text" value={newPostAuthor} onChange={e => setNewPostAuthor(e.target.value)} required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Display Date</label>
                      <input type="text" value={newPostDate} onChange={e => setNewPostDate(e.target.value)} placeholder="Jul 6, 2026" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Status</label>
                      <select value={newPostStatus} onChange={e => setNewPostStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', backgroundColor: '#ffffff' }}>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      {editingPostId ? 'Update Article' : 'Publish Article'}
                    </button>
                    <button type="button" onClick={resetBlogForm} style={{ backgroundColor: 'transparent', border: '1px solid #ccc', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <form onSubmit={handleSaveHeroContent} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '32px', alignItems: 'start' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px' }}>Home Hero Content</h3>

                {contentSuccess && (
                  <div style={{ backgroundColor: '#e2ece9', color: '#2d5c4d', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
                    {contentSuccess}
                  </div>
                )}
                {contentError && (
                  <div style={{ backgroundColor: '#ffebe9', color: '#b42318', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
                    {contentError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Eyebrow</label>
                    <input value={heroEyebrow} onChange={e => setHeroEyebrow(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Floating Tag</label>
                    <input value={heroFloatingTag} onChange={e => setHeroFloatingTag(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Title</label>
                    <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Italic Title</label>
                    <input value={heroItalicTitle} onChange={e => setHeroItalicTitle(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Description</label>
                    <textarea value={heroDescription} onChange={e => setHeroDescription(e.target.value)} rows={4} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Primary Button Text</label>
                    <input value={heroPrimaryButtonText} onChange={e => setHeroPrimaryButtonText(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Primary Button Link</label>
                    <input value={heroPrimaryButtonHref} onChange={e => setHeroPrimaryButtonHref(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Secondary Button Text</label>
                    <input value={heroSecondaryButtonText} onChange={e => setHeroSecondaryButtonText(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Secondary Button Link</label>
                    <input value={heroSecondaryButtonHref} onChange={e => setHeroSecondaryButtonHref(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                  </div>
                </div>

                <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '18px' }}>
                  Save Page Content
                </button>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px' }}>Hero Image Slider</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {heroSliderImages.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '12px', padding: '10px', border: '1px solid #e3e3e3', borderRadius: '8px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '88px', height: '88px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f6f6f6' }}>
                        <Image src={imageUrl} alt={`Hero slider image ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', color: '#6d6d6d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '8px' }}>{imageUrl}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <button type="button" onClick={() => { setModalSearchQuery(''); setMediaSelectorMode('hero'); setHeroMediaTargetIndex(index); setShowMediaModal(true); }} style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                            Change
                          </button>
                          <button type="button" disabled={index === 0} onClick={() => setHeroSliderImages(prev => { const next = [...prev]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })} style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.5 : 1 }}>
                            Up
                          </button>
                          <button type="button" disabled={index === heroSliderImages.length - 1} onClick={() => setHeroSliderImages(prev => { const next = [...prev]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next; })} style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: index === heroSliderImages.length - 1 ? 'not-allowed' : 'pointer', opacity: index === heroSliderImages.length - 1 ? 0.5 : 1 }}>
                            Down
                          </button>
                          <button type="button" disabled={heroSliderImages.length === 1} onClick={() => setHeroSliderImages(prev => prev.filter((_, imageIndex) => imageIndex !== index))} style={{ backgroundColor: '#ffebe9', color: '#ff4d4d', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: heroSliderImages.length === 1 ? 'not-allowed' : 'pointer', opacity: heroSliderImages.length === 1 ? 0.5 : 1 }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => { setModalSearchQuery(''); setMediaSelectorMode('hero'); setHeroMediaTargetIndex(null); setShowMediaModal(true); }} style={{ width: '100%', marginTop: '14px', backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  Add Slider Image
                </button>
              </div>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Active Blog Articles</h3>
                  <button type="button" onClick={() => { resetBlogForm(); setShowNewPostForm(true); }} style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    Add Article
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {blogPosts.length === 0 ? (
                    <p style={{ margin: 0, color: '#8c8c8c', fontSize: '13px' }}>No blog articles yet.</p>
                  ) : (
                    blogPosts.map((post) => (
                      <div key={post.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>{post.title}</strong>
                          <span style={{ fontSize: '11px', color: '#6d6d6d' }}>{post.date} - {post.author}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: post.status === 'Published' ? '#2d5c4d' : '#6d6d6d', backgroundColor: post.status === 'Published' ? '#e2ece9' : '#f1f1f1', padding: '2px 8px', borderRadius: '10px' }}>{post.status}</span>
                          <button type="button" onClick={() => handleEditBlogPostClick(post)} style={{ background: 'transparent', border: 'none', color: '#2196f3', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteBlogPost(post.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Store Navigation Menus</h3>
                  <button type="button" onClick={() => { resetNavMenuForm(); setShowNavMenuForm(true); }} style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    Add Menu
                  </button>
                </div>

                {showNavMenuForm && (
                  <form onSubmit={handleSaveNavigationMenu} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', border: '1px solid #e3e3e3', borderRadius: '8px', marginBottom: '14px', backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Menu Name</label>
                      <input value={navMenuName} onChange={e => setNavMenuName(e.target.value)} required placeholder="Main Menu" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Links</label>
                      <textarea value={navMenuLinks} onChange={e => setNavMenuLinks(e.target.value)} required rows={3} placeholder="Home - Shop - About Us" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        {editingNavMenuId ? 'Update Menu' : 'Create Menu'}
                      </button>
                      <button type="button" onClick={resetNavMenuForm} style={{ backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  {navigationMenus.length === 0 ? (
                    <p style={{ margin: 0, color: '#8c8c8c', fontSize: '13px' }}>No navigation menus yet.</p>
                  ) : (
                    navigationMenus.map((nav) => (
                      <div key={nav.id} style={{ padding: '10px', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ display: 'block', marginBottom: '4px' }}>{nav.menu}</strong>
                            <span style={{ color: '#6d6d6d', fontSize: '12px' }}>{nav.links}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <button type="button" onClick={() => handleEditNavMenuClick(nav)} style={{ background: 'transparent', border: 'none', color: '#2196f3', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                              Edit
                            </button>
                            <button type="button" onClick={() => handleDeleteNavigationMenu(nav.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2.3: ANALYTICS DETAIL PANEL */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📊</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Analytics Dashboard</h1>
              </div>
            </div>

            {/* Sales Graph Widget */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 20px 0', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px' }}>Weekly Sales Performance</h3>
              
              <div style={{ height: '30px', color: '#2d5c4d', fontWeight: '700', fontSize: '14px', marginBottom: '10px' }}>
                {hoveredBarIndex !== null ? (
                  <span>Sales on {salesHistory[hoveredBarIndex].day}: ₹{salesHistory[hoveredBarIndex].sales.toLocaleString()}</span>
                ) : (
                  <span style={{ color: '#9e9e9e', fontWeight: 'normal' }}>Hover bars to view specific sales figures</span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', borderBottom: '1px solid #ccc', padding: '0 12px 10px 12px' }}>
                {salesHistory.map((item, idx) => {
                  const maxSales = Math.max(...salesHistory.map(s => s.sales));
                  const percentHeight = (item.sales / maxSales) * 100;
                  return (
                    <div 
                      key={idx} 
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      <div style={{ 
                        width: '45px', 
                        height: `${percentHeight * 1.5}px`, 
                        backgroundColor: hoveredBarIndex === idx ? 'var(--accent)' : '#2d5c4d',
                        borderRadius: '4px 4px 0 0',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease, height 0.3s ease'
                      }}></div>
                      <span style={{ fontSize: '11px', marginTop: '8px', color: '#6d6d6d', fontWeight: '600' }}>{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance metric blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {[
                { title: 'Total Sales', val: '₹3,42,850.00', indicator: '+14% vs last month', green: true },
                { title: 'Online store sessions', val: '14,832', indicator: '+8% vs last month', green: true },
                { title: 'Returning customer rate', val: '28.4%', indicator: 'Stable', green: true },
                { title: 'Average order value (AOV)', val: '₹1,240.00', indicator: '-2% vs last month', green: false }
              ].map((metric, idx) => (
                <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '20px' }}>
                  <span style={{ fontSize: '12px', color: '#6d6d6d', fontWeight: '500' }}>{metric.title}</span>
                  <p style={{ fontSize: '20px', fontWeight: '700', margin: '8px 0' }}>{metric.val}</p>
                  <span style={{ fontSize: '11px', color: metric.green ? '#2d5c4d' : '#a65d00', fontWeight: '600' }}>{metric.indicator}</span>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2.4: STORE SETTINGS PANEL */}
        {activeTab === 'settings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>⚙️</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Store Settings</h1>
              </div>
            </div>

            {settingsSuccess && (
              <div style={{ padding: '12px 16px', backgroundColor: '#e2ece9', color: '#2d5c4d', borderRadius: '6px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                {settingsSuccess}
              </div>
            )}
            {settingsError && (
              <div style={{ padding: '12px 16px', backgroundColor: '#fde8e8', color: '#9b1c1c', borderRadius: '6px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                {settingsError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Left Column: Store Information & Active Gateways */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Store Information */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px' }}>Store Information</h3>
                  <form onSubmit={e => { e.preventDefault(); alert('Store configurations updated successfully!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Store Name</label>
                      <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Contact Email</label>
                      <input type="email" value={storeEmail} onChange={e => setStoreEmail(e.target.value)} required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Business Address</label>
                      <input type="text" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Currency</label>
                      <select value={storeCurrency} onChange={e => setStoreCurrency(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', background: '#ffffff' }}>
                        <option value="INR (₹)">INR (₹)</option>
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                      </select>
                    </div>

                    <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '8px' }}>
                      Save Configurations
                    </button>
                  </form>
                </div>

                {/* Active Checkout Gateways */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px' }}>Active Checkout Gateways</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid #f0f0f0', borderRadius: '8px', transition: 'all 0.2s' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '14px', color: '#1a1a1a' }}>Gokwik Super Checkout</strong>
                        <span style={{ fontSize: '11px', color: '#6d6d6d', marginTop: '2px', display: 'block' }}>Single-click cod & pre-paid checkout funnel</span>
                      </div>
                      <button 
                        onClick={() => {
                          const val = !isGokwikActive;
                          setIsGokwikActive(val);
                          handleSaveSettings({ isGokwikActive: val.toString() });
                        }}
                        style={{ 
                          border: 'none', borderRadius: '14px', padding: '6px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                          backgroundColor: isGokwikActive ? '#e2ece9' : '#ffe8d6',
                          color: isGokwikActive ? '#2d5c4d' : '#a65d00',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isGokwikActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid #f0f0f0', borderRadius: '8px', transition: 'all 0.2s' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '14px', color: '#1a1a1a' }}>Cash on Delivery (COD)</strong>
                        <span style={{ fontSize: '11px', color: '#6d6d6d', marginTop: '2px', display: 'block' }}>Support cash payments upon product delivery</span>
                      </div>
                      <button 
                        onClick={() => {
                          const val = !isCodActive;
                          setIsCodActive(val);
                          handleSaveSettings({ isCodActive: val.toString() });
                        }}
                        style={{ 
                          border: 'none', borderRadius: '14px', padding: '6px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                          backgroundColor: isCodActive ? '#e2ece9' : '#ffe8d6',
                          color: isCodActive ? '#2d5c4d' : '#a65d00',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isCodActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Column: API Integrations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Razorpay Integration */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Razorpay Integration</h3>
                    <span style={{ backgroundColor: '#3399FF', color: '#ffffff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>Razorpay</span>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); handleSaveSettings({ razorpayKeyId, razorpayKeySecret }); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Key ID</label>
                      <input 
                        type="text" 
                        value={razorpayKeyId} 
                        onChange={e => setRazorpayKeyId(e.target.value)} 
                        placeholder="rzp_live_..." 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Key Secret</label>
                      <input 
                        type="password" 
                        value={razorpayKeySecret} 
                        onChange={e => setRazorpayKeySecret(e.target.value)} 
                        placeholder="••••••••••••••••" 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                    </div>

                    <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '6px' }}>
                      Save Razorpay Keys
                    </button>
                  </form>
                </div>

                {/* Shiprocket Integration */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Shiprocket Integration</h3>
                    <span style={{ backgroundColor: '#7A22A5', color: '#ffffff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>Shiprocket</span>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); handleSaveSettings({ shiprocketEmail, shiprocketPassword, shiprocketToken }); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Account Email / Username</label>
                      <input 
                        type="email" 
                        value={shiprocketEmail} 
                        onChange={e => setShiprocketEmail(e.target.value)} 
                        placeholder="shipping@deekshacandles.in" 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Password</label>
                      <input 
                        type="password" 
                        value={shiprocketPassword} 
                        onChange={e => setShiprocketPassword(e.target.value)} 
                        placeholder="••••••••" 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>API Token / Channel ID</label>
                      <input 
                        type="text" 
                        value={shiprocketToken} 
                        onChange={e => setShiprocketToken(e.target.value)} 
                        placeholder="API Authentication Token" 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                    </div>

                    <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '6px' }}>
                      Save Shiprocket Credentials
                    </button>
                  </form>
                </div>

                {/* Website Branding (Logos) */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Website Branding</h3>
                    <span style={{ backgroundColor: '#ff9800', color: '#ffffff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>Logos</span>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); handleSaveSettings({ logoHeaderUrl, logoFooterUrl }); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Header Logo URL</label>
                      <input 
                        type="text" 
                        value={logoHeaderUrl} 
                        onChange={e => setLogoHeaderUrl(e.target.value)} 
                        placeholder="https://example.com/logo-header.png" 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                      {logoHeaderUrl && (
                        <div style={{ marginTop: '6px', border: '1px dashed #ccc', padding: '6px', borderRadius: '4px', textAlign: 'center', backgroundColor: '#fafafa' }}>
                          <img src={logoHeaderUrl} alt="Header Preview" style={{ maxHeight: '35px', objectFit: 'contain' }} />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Footer Logo URL</label>
                      <input 
                        type="text" 
                        value={logoFooterUrl} 
                        onChange={e => setLogoFooterUrl(e.target.value)} 
                        placeholder="https://example.com/logo-footer.png" 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                      {logoFooterUrl && (
                        <div style={{ marginTop: '6px', border: '1px dashed #ccc', padding: '6px', borderRadius: '4px', textAlign: 'center', backgroundColor: '#fafafa' }}>
                          <img src={logoFooterUrl} alt="Footer Preview" style={{ maxHeight: '35px', objectFit: 'contain' }} />
                        </div>
                      )}
                    </div>

                    <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '6px' }}>
                      Save Logo Settings
                    </button>
                  </form>
                </div>

                {/* Social Media Links */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Social Media Links</h3>
                    <span style={{ backgroundColor: '#e91e63', color: '#ffffff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>Socials</span>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); handleSaveSettings({ instagramUrl, facebookUrl, pinterestUrl, twitterUrl, youtubeUrl }); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Instagram URL</label>
                      <input 
                        type="text" 
                        value={instagramUrl} 
                        onChange={e => setInstagramUrl(e.target.value)} 
                        placeholder="https://instagram.com/your-brand" 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Facebook URL</label>
                      <input 
                        type="text" 
                        value={facebookUrl} 
                        onChange={e => setFacebookUrl(e.target.value)} 
                        placeholder="https://facebook.com/your-brand" 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Pinterest URL</label>
                      <input 
                        type="text" 
                        value={pinterestUrl} 
                        onChange={e => setPinterestUrl(e.target.value)} 
                        placeholder="https://pinterest.com/your-brand" 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Twitter / X URL</label>
                      <input 
                        type="text" 
                        value={twitterUrl} 
                        onChange={e => setTwitterUrl(e.target.value)} 
                        placeholder="https://twitter.com/your-brand" 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>YouTube URL</label>
                      <input 
                        type="text" 
                        value={youtubeUrl} 
                        onChange={e => setYoutubeUrl(e.target.value)} 
                        placeholder="https://youtube.com/your-brand" 
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                      />
                    </div>

                    <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '6px' }}>
                      Save Social Links
                    </button>
                  </form>
                </div>

                {/* Marketing & Pixels Integration */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Marketing & Pixels Integration</h3>
                    <span style={{ backgroundColor: '#2d5c4d', color: '#ffffff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>Analytics</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '13px' }}>
                    
                    {/* Google Tag Configuration */}
                    <div style={{ border: '1px solid #e3e3e3', borderRadius: '8px', padding: '16px', backgroundColor: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>🔍</span>
                          <strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Google Ads & Tag Manager</strong>
                        </div>
                        {googleConnectedEmail ? (
                          <span style={{ fontSize: '11px', color: '#2d5c4d', backgroundColor: '#e2ece9', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                            Connected
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#6d6d6d', backgroundColor: '#f1f1f1', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                            Disconnected
                          </span>
                        )}
                      </div>

                      {googleConnectedEmail && (
                        <div style={{ backgroundColor: '#f0f4f2', border: '1px solid #d4e2da', padding: '10px', borderRadius: '6px', fontSize: '12px', color: '#2d5c4d', marginBottom: '12px' }}>
                          <strong>Account:</strong> {googleConnectedEmail} <br />
                          <strong>Selected property:</strong> {googleSelectedAccount}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                        {googleConnectedEmail ? (
                          <button
                            type="button"
                            onClick={() => {
                              setGoogleConnectedEmail('');
                              setGoogleSelectedAccount('');
                              setGoogleTagId('');
                              handleSaveSettings({ googleTagId: '' });
                            }}
                            style={{ backgroundColor: '#ffffff', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Disconnect Google Account
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowGooglePopup(true)}
                            style={{ backgroundColor: '#4285F4', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Login with Google Account
                          </button>
                        )}
                      </div>

                      <form onSubmit={e => { e.preventDefault(); handleSaveSettings({ googleTagId, googleTagCode }); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontWeight: '600', color: '#6d6d6d', fontSize: '11px' }}>Google Tag ID (Measurement ID / Conversion ID)</label>
                          <input 
                            type="text" 
                            value={googleTagId} 
                            onChange={e => setGoogleTagId(e.target.value)} 
                            placeholder="e.g. G-XXXXXXXXXX or AW-XXXXXXXXXX" 
                            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontWeight: '600', color: '#6d6d6d', fontSize: '11px' }}>Custom Google Tag Code script (optional)</label>
                          <textarea 
                            value={googleTagCode} 
                            onChange={e => setGoogleTagCode(e.target.value)} 
                            placeholder="<!-- Paste Google Tag script here -->" 
                            rows={3}
                            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', resize: 'vertical' }} 
                          />
                        </div>

                        <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start' }}>
                          Save Google Tag Configuration
                        </button>
                      </form>
                    </div>

                    {/* Facebook Pixel Configuration */}
                    <div style={{ border: '1px solid #e3e3e3', borderRadius: '8px', padding: '16px', backgroundColor: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>👥</span>
                          <strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Meta (Facebook) Pixel</strong>
                        </div>
                        {facebookConnectedUser ? (
                          <span style={{ fontSize: '11px', color: '#2d5c4d', backgroundColor: '#e2ece9', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                            Connected
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#6d6d6d', backgroundColor: '#f1f1f1', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                            Disconnected
                          </span>
                        )}
                      </div>

                      {facebookConnectedUser && (
                        <div style={{ backgroundColor: '#f0f4f2', border: '1px solid #d4e2da', padding: '10px', borderRadius: '6px', fontSize: '12px', color: '#2d5c4d', marginBottom: '12px' }}>
                          <strong>Account:</strong> {facebookConnectedUser} <br />
                          <strong>Selected pixel:</strong> {facebookSelectedPixel}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                        {facebookConnectedUser ? (
                          <button
                            type="button"
                            onClick={() => {
                              setFacebookConnectedUser('');
                              setFacebookSelectedPixel('');
                              setFacebookPixelId('');
                              handleSaveSettings({ facebookPixelId: '' });
                            }}
                            style={{ backgroundColor: '#ffffff', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Disconnect Facebook Account
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowFacebookPopup(true)}
                            style={{ backgroundColor: '#1877F2', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Login with Facebook Account
                          </button>
                        )}
                      </div>

                      <form onSubmit={e => { e.preventDefault(); handleSaveSettings({ facebookPixelId, facebookPixelCode }); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontWeight: '600', color: '#6d6d6d', fontSize: '11px' }}>Meta Pixel ID</label>
                          <input 
                            type="text" 
                            value={facebookPixelId} 
                            onChange={e => setFacebookPixelId(e.target.value)} 
                            placeholder="e.g. 928374928374829" 
                            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }} 
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontWeight: '600', color: '#6d6d6d', fontSize: '11px' }}>Custom Meta Pixel Code script (optional)</label>
                          <textarea 
                            value={facebookPixelCode} 
                            onChange={e => setFacebookPixelCode(e.target.value)} 
                            placeholder="<!-- Paste Meta Pixel script here -->" 
                            rows={3}
                            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', resize: 'vertical' }} 
                          />
                        </div>

                        <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start' }}>
                          Save Meta Pixel Configuration
                        </button>
                      </form>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGER (CANDLE INVENTORY) */}
        {activeTab === 'products' && (() => {
          const isAllSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedCatalogProductIds.includes(p.id));
          const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
              const allIds = filteredProducts.map(p => p.id);
              setSelectedCatalogProductIds(prev => Array.from(new Set([...prev, ...allIds])));
            } else {
              const filteredIds = filteredProducts.map(p => p.id);
              setSelectedCatalogProductIds(prev => prev.filter(id => !filteredIds.includes(id)));
            }
          };
          const handleSelectRow = (productId: number) => {
            setSelectedCatalogProductIds(prev => {
              if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
              } else {
                return [...prev, productId];
              }
            });
          };

          return (
            <div>
            
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>🏷️</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Inventory Catalog</h1>
              </div>
            </div>

            {/* Vertical layout: Add form and Catalog Listing stacked vertically and full-width */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Add form */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px' }}>
                  {editingProductId ? 'Edit Candle Details' : 'Add New Candle'}
                </h3>

                {formError && (
                  <div style={{ backgroundColor: '#ffe8d6', color: '#a65d00', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
                    ⚠️ {formError}
                  </div>
                )}
                {formSuccess && (
                  <div style={{ backgroundColor: '#e2ece9', color: '#2d5c4d', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
                    ✓ {formSuccess}
                  </div>
                )}

                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Candle Name</label>
                    <input 
                      type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Vanilla Bourbon Extract"
                      style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Collection</label>
                      <select 
                        value={collection} onChange={(e) => setCollection(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', background: '#ffffff' }}
                      >
                        {collections.map((coll) => (
                          <option key={coll.id} value={coll.name}>{coll.name}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Price (₹)</label>
                      <input 
                        type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="899"
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Scent Notes</label>
                    <input 
                      type="text" value={features} onChange={(e) => setFeatures(e.target.value)} required placeholder="Vanilla • Amber • Bourbon"
                      style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Product Media Gallery</label>
                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#8c8c8c' }}>
                      Add multiple images. Drag and drop to reorder. The first image will be the primary cover image.
                    </p>
                    
                    {/* Gallery Grid */}
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '12px', 
                      minHeight: '110px', 
                      padding: '16px', 
                      border: '2px dashed #e3e3e3', 
                      borderRadius: '8px', 
                      backgroundColor: '#fafafa',
                      alignItems: 'center'
                    }}>
                      {galleryImages.length === 0 ? (
                        <div style={{ width: '100%', textAlign: 'center', color: '#8c8c8c', fontSize: '12px', padding: '20px 0' }}>
                          No images selected. Upload files or select from media library.
                        </div>
                      ) : (
                        galleryImages.map((imgUrl, index) => (
                          <div 
                            key={`${imgUrl}-${index}`}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', index.toString());
                              e.currentTarget.style.opacity = '0.5';
                            }}
                            onDragEnd={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.style.borderColor = '#1a1a1a';
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.style.borderColor = 'transparent';
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.style.borderColor = 'transparent';
                              const sourceIdxStr = e.dataTransfer.getData('text/plain');
                              if (sourceIdxStr === '') return;
                              const sourceIdx = parseInt(sourceIdxStr, 10);
                              if (sourceIdx === index) return;
                              
                              const newImages = [...galleryImages];
                              const [dragged] = newImages.splice(sourceIdx, 1);
                              newImages.splice(index, 0, dragged);
                              setGalleryImages(newImages);
                            }}
                            style={{ 
                              position: 'relative', 
                              width: '90px', 
                              height: '90px', 
                              borderRadius: '8px', 
                              overflow: 'hidden', 
                              border: '2px solid transparent',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              cursor: 'grab',
                              transition: 'all 0.2s ease',
                              backgroundColor: '#ffffff'
                            }}
                          >
                            <img 
                              src={imgUrl} 
                              alt={`Product image ${index + 1}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            
                            {/* Cover Badge */}
                            {index === 0 && (
                              <div style={{ 
                                position: 'absolute', 
                                bottom: '4px', 
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                backgroundColor: '#1a1a1a', 
                                color: '#ffffff', 
                                fontSize: '8px', 
                                fontWeight: '700', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                pointerEvents: 'none'
                              }}>
                                Cover
                              </div>
                            )}

                            {/* Delete overlay */}
                            <button
                              type="button"
                              onClick={() => {
                                setGalleryImages((prev) => prev.filter((_, idx) => idx !== index));
                              }}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: '#ffffff',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '9px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                fontWeight: 'bold'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e03e3e'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
                              title="Remove image"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button 
                        type="button"
                        onClick={() => {
                          setModalSearchQuery('');
                          setMediaSelectorMode('product');
                          setShowMediaModal(true);
                        }}
                        style={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #cccccc', 
                          borderRadius: '6px', 
                          padding: '8px 14px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#1a1a1a';
                          e.currentTarget.style.backgroundColor = '#fafafa';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#cccccc';
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }}
                      >
                        <span>🖼️</span> Browse Media
                      </button>
                      <label 
                        style={{ 
                          backgroundColor: '#1a1a1a', 
                          color: '#ffffff', 
                          borderRadius: '6px', 
                          padding: '8px 14px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          cursor: 'pointer',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333333'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                      >
                        <span>📤</span> Upload File
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              try {
                                const data = await uploadMediaFile(file);
                                setGalleryImages((prev) => [...prev.filter(img => img !== '/images/hero_candle.png'), data.url]);
                                await fetchMediaFiles();
                              } catch (err) {
                                alert(err instanceof Error ? err.message : 'Error uploading file.');
                              } finally {
                                e.target.value = '';
                              }
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Description</label>
                    <textarea 
                      value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} placeholder="Describe the aroma and burn characteristics..."
                      style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'none' }}
                    />
                  </div>

                  {/* Specifications Section */}
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '6px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '700', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Specifications & Details</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Subtitle / Highlights Tagline</label>
                        <input 
                          type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} required placeholder="e.g. 100% natural soy wax — wooden wick — 30-40 hours burn time"
                          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Fragrances (Comma separated)</label>
                          <input 
                            type="text" value={fragrances} onChange={(e) => setFragrances(e.target.value)} required placeholder="Oud, Jasmin, Rose, Vanilla"
                            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Dimensions</label>
                          <input 
                            type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)} required placeholder="W: 2.5 inch x H: 3 inch"
                            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Wax Weight</label>
                          <input 
                            type="text" value={weight} onChange={(e) => setWeight(e.target.value)} required placeholder="350 gms"
                            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Burning Hours</label>
                          <input 
                            type="text" value={burnHours} onChange={(e) => setBurnHours(e.target.value)} required placeholder="32 Hrs"
                            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                          />
                        </div>
                      </div>

                      {/* Accordions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Accordion: Burn Time Description</label>
                        <input 
                          type="text" value={accBurnTime} onChange={(e) => setAccBurnTime(e.target.value)} required placeholder="32 Hours average"
                          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Accordion: Ingredients & How It&apos;s Made</label>
                        <textarea 
                          value={accIngredients} onChange={(e) => setAccIngredients(e.target.value)} required rows={2} placeholder="Ingredients..."
                          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Accordion: Burning Instructions</label>
                        <textarea 
                          value={accInstructions} onChange={(e) => setAccInstructions(e.target.value)} required rows={2} placeholder="Instructions..."
                          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Accordion: Shipping & Returns</label>
                        <textarea 
                          value={accShipping} onChange={(e) => setAccShipping(e.target.value)} required rows={2} placeholder="Shipping info..."
                          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'none' }}
                        />
                      </div>

                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button 
                      type="submit" disabled={submitting}
                      style={{ flexGrow: 1, backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {submitting ? 'Saving...' : editingProductId ? 'Update Product' : 'Add Product'}
                    </button>
                    {editingProductId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingProductId(null);
                          setName('');
                          setPrice('');
                          setDescription('');
                          setFeatures('');
                          setImageUrl('/images/hero_candle.png');
                          setTagline('100% natural soy wax — wooden wick — 30-40 hours burn time');
                          setFragrances('Oud, Jasmin, Rose, Vanilla');
                          setDimensions('W: 2.5 inch x H: 3 inch');
                          setWeight('350 gms');
                          setBurnHours('32 Hrs');
                          setAccBurnTime('32 Hours average');
                          setAccIngredients("100% natural soy wax, phthalate-free premium fragrance oils, cotton-core crackling wooden wicks, reusable amber glass jars. No paraffin, no artificial dyes. Every jar is hand-poured and cured for 48 hours before it ships.");
                          setAccInstructions("Trim the wooden wick to 1/4 inch before each burn. Allow the wax to melt to the edges on first burn to avoid tunneling. Never burn for more than 4 hours at a time. Keep away from drafts, children, and pets.");
                          setAccShipping("Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the candle is completely unburned and in its original packaging.");
                        }}
                        style={{ backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '6px', padding: '10px', fontSize: '13px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Product list */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px' }}>
                  Catalog Listing {catalogView === 'trash' ? 'Trash' : ''}
                </h3>

                {/* Search & Filter Bar OR Bulk Actions Bar */}
                {selectedCatalogProductIds.length > 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    backgroundColor: '#f4f6f8', 
                    border: '1px solid #1a1a1a', 
                    borderRadius: '6px', 
                    padding: '8px 16px', 
                    marginBottom: '16px',
                    height: '48px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                        {selectedCatalogProductIds.length} product{selectedCatalogProductIds.length > 1 ? 's' : ''} selected
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setSelectedCatalogProductIds([])}
                        style={{ background: 'transparent', border: 'none', color: '#6d6d6d', textDecoration: 'underline', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Clear selection
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {catalogView === 'active' ? (
                        <>
                          <button 
                            type="button"
                            onClick={() => {
                              setBulkPrice('');
                              setBulkCollection('');
                              setShowBulkEditModal(true);
                            }}
                            style={{ 
                              backgroundColor: '#ffffff', 
                              border: '1px solid #cccccc', 
                              borderRadius: '6px', 
                              padding: '6px 12px', 
                              fontSize: '12px', 
                              fontWeight: '600', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s',
                              height: '32px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cccccc'}
                          >
                            Bulk Edit
                          </button>
                          <button 
                            type="button"
                            onClick={handleBulkDelete}
                            style={{ 
                              backgroundColor: '#ffebe9', 
                              color: '#ff4d4d',
                              border: 'none', 
                              borderRadius: '6px', 
                              padding: '6px 12px', 
                              fontSize: '12px', 
                              fontWeight: '600', 
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              height: '32px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffdcd9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffebe9'}
                          >
                            Move to Trash
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={handleBulkRestore} style={{ backgroundColor: '#e2ece9', color: '#2d5c4d', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', height: '32px' }}>
                            Restore
                          </button>
                          <button type="button" onClick={handleBulkPermanentDelete} style={{ backgroundColor: '#ffebe9', color: '#ff4d4d', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', height: '32px' }}>
                            Delete Forever
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <button 
                      type="button"
                      onClick={() => {
                        setCatalogView('active');
                        setSelectedCatalogProductIds([]);
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px 14px', 
                        border: catalogView === 'active' ? '1px solid #1a1a1a' : '1px solid #cccccc', 
                        borderRadius: '6px', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        backgroundColor: catalogView === 'active' ? '#f4f6f8' : '#ffffff', 
                        cursor: 'pointer',
                        color: '#1a1a1a',
                        transition: 'all 0.2s',
                        height: '36px'
                      }}
                    >
                      <span>Active ({activeProductsCount})</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setCatalogView('trash');
                        setSelectedCatalogProductIds([]);
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px 14px', 
                        border: catalogView === 'trash' ? '1px solid #1a1a1a' : '1px solid #cccccc', 
                        borderRadius: '6px', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        backgroundColor: catalogView === 'trash' ? '#f4f6f8' : '#ffffff', 
                        cursor: 'pointer',
                        color: '#1a1a1a',
                        height: '36px'
                      }}
                    >
                      Trash ({trashedProductsCount})
                    </button>

                    <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c', fontSize: '13px' }}>🔍</span>
                      <input 
                        type="text" 
                        placeholder="Search and filter" 
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '8px 12px 8px 36px', 
                          border: '1px solid #cccccc', 
                          borderRadius: '6px', 
                          fontSize: '13px',
                          outline: 'none',
                          color: '#1a1a1a',
                          height: '36px'
                        }}
                      />
                    </div>
                  </div>
                )}

                {loadingProducts ? (
                  <p style={{ color: '#9e9e9e', fontSize: '13px' }}>Loading catalog...</p>
                ) : filteredProducts.length === 0 ? (
                  <p style={{ color: '#9e9e9e', fontSize: '13px' }}>{catalogView === 'trash' ? 'No products in trash.' : 'No products found in store catalog.'}</p>
                ) : (
                  <div style={{ border: '1px solid #e3e3e3', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e3e3e3', color: '#6d6d6d', fontWeight: '600' }}>
                          <th style={{ padding: '12px 16px', width: '48px' }}>
                            <input 
                              type="checkbox" 
                              checked={isAllSelected}
                              onChange={handleSelectAll}
                              style={{ cursor: 'pointer' }}
                            />
                          </th>
                          <th style={{ padding: '12px 16px' }}>Product</th>
                          <th style={{ padding: '12px 16px' }}>Status</th>
                          <th style={{ padding: '12px 16px' }}>Inventory</th>
                          <th style={{ padding: '12px 16px' }}>Category</th>
                          <th style={{ padding: '12px 16px' }}>Price</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((prod) => {
                          const isSelected = selectedCatalogProductIds.includes(prod.id);
                          return (
                            <tr key={prod.id} style={{ borderBottom: '1px solid #e3e3e3', transition: 'background-color 0.2s', backgroundColor: isSelected ? '#f4f6f8' : 'transparent' }}>
                              <td style={{ padding: '12px 16px' }}>
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(prod.id)}
                                  style={{ cursor: 'pointer' }}
                                />
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e3e3e3', flexShrink: 0 }}>
                                    <Image src={prod.image_url} alt={prod.name} fill style={{ objectFit: 'cover' }} />
                                  </div>
                                  <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{prod.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ 
                                  display: 'inline-block', 
                                  padding: '2px 8px', 
                                  borderRadius: '12px', 
                                  fontSize: '11px', 
                                  fontWeight: '600', 
                                  backgroundColor: prod.deleted_at ? '#f1f1f1' : '#e2ece9', 
                                  color: prod.deleted_at ? '#6d6d6d' : '#2d5c4d' 
                                }}>
                                  {prod.deleted_at ? 'Trashed' : 'Active'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ color: '#2e7d32', fontWeight: '500' }}>10 in stock</span>
                              </td>
                              <td style={{ padding: '12px 16px', color: '#6d6d6d' }}>
                                {prod.collection}
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1a1a1a' }}>
                                ₹{prod.price}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => setSelectedDetailProduct(prod)}
                                    style={{ background: 'transparent', border: 'none', color: '#1a1a1a', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                  >
                                    View
                                  </button>
                                  {catalogView === 'active' ? (
                                    <>
                                  <button 
                                    onClick={() => handleEditProductClick(prod)}
                                    style={{ background: 'transparent', border: 'none', color: '#2196f3', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDuplicateProduct(prod)}
                                    disabled={duplicatingProductId === prod.id}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#2d5c4d',
                                      cursor: duplicatingProductId === prod.id ? 'not-allowed' : 'pointer',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      opacity: duplicatingProductId === prod.id ? 0.6 : 1
                                    }}
                                  >
                                    {duplicatingProductId === prod.id ? 'Copying...' : 'Duplicate'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                  >
                                    Delete
                                  </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleRestoreProduct(prod.id)}
                                        style={{ background: 'transparent', border: 'none', color: '#2d5c4d', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                      >
                                        Restore
                                      </button>
                                      <button
                                        onClick={() => handlePermanentDeleteProduct(prod.id)}
                                        style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                      >
                                        Delete Forever
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {selectedDetailProduct && (
                <div
                  role="dialog"
                  aria-modal="true"
                  style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    zIndex: 1000
                  }}
                  onClick={() => setSelectedDetailProduct(null)}
                >
                  <div
                    style={{ width: 'min(720px, 100%)', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e3e3e3', boxShadow: '0 16px 40px rgba(0,0,0,0.18)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '20px 24px', borderBottom: '1px solid #e3e3e3' }}>
                      <div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', lineHeight: 1.35 }}>{selectedDetailProduct.name}</h3>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', backgroundColor: selectedDetailProduct.deleted_at ? '#f1f1f1' : '#e2ece9', color: selectedDetailProduct.deleted_at ? '#6d6d6d' : '#2d5c4d' }}>
                          {selectedDetailProduct.deleted_at ? 'Trashed' : 'Active'}
                        </span>
                      </div>
                      <button type="button" onClick={() => setSelectedDetailProduct(null)} style={{ width: '32px', height: '32px', border: '1px solid #cccccc', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>
                        x
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '20px', padding: '24px' }}>
                      <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e3e3e3', backgroundColor: '#f6f6f6' }}>
                        <Image src={selectedDetailProduct.image_url} alt={selectedDetailProduct.name} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <div style={{ display: 'grid', gap: '14px', fontSize: '13px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                          <div>
                            <div style={{ color: '#6d6d6d', marginBottom: '4px' }}>Price</div>
                            <strong>₹{selectedDetailProduct.price}</strong>
                          </div>
                          <div>
                            <div style={{ color: '#6d6d6d', marginBottom: '4px' }}>Category</div>
                            <strong>{selectedDetailProduct.collection}</strong>
                          </div>
                          <div>
                            <div style={{ color: '#6d6d6d', marginBottom: '4px' }}>Slug</div>
                            <strong>{selectedDetailProduct.slug}</strong>
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#6d6d6d', marginBottom: '4px' }}>Description</div>
                          <p style={{ margin: 0, lineHeight: 1.55 }}>{selectedDetailProduct.description}</p>
                        </div>
                        <div>
                          <div style={{ color: '#6d6d6d', marginBottom: '4px' }}>Features</div>
                          <p style={{ margin: 0, lineHeight: 1.55 }}>{selectedDetailProduct.features}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
                          {!selectedDetailProduct.deleted_at && (
                            <a href={`/products/${selectedDetailProduct.slug}`} target="_blank" rel="noreferrer" style={{ color: '#2196f3', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                              Open live product page
                            </a>
                          )}
                          <button type="button" onClick={() => handleEditProductClick(selectedDetailProduct)} disabled={!!selectedDetailProduct.deleted_at} style={{ background: 'transparent', border: 'none', color: selectedDetailProduct.deleted_at ? '#a0a0a0' : '#2d5c4d', cursor: selectedDetailProduct.deleted_at ? 'not-allowed' : 'pointer', padding: 0, fontSize: '13px', fontWeight: '600' }}>
                            Edit product
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
          );
        })()}

        {/* TAB 1.9: FILES / MEDIA LIBRARY MANAGER */}
        {activeTab === 'files' && (
          <div>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📁</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Files</h1>
              </div>
              <label 
                style={{ 
                  backgroundColor: '#1a1a1a', 
                  color: '#ffffff', 
                  borderRadius: '6px', 
                  padding: '8px 16px', 
                  fontSize: '13px', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Upload files
                <input 
                  type="file" 
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files) {
                      const filesArray = Array.from(e.target.files);
                      let successCount = 0;
                      for (const file of filesArray) {
                        try {
                          await uploadMediaFile(file);
                          successCount++;
                        } catch (err) {
                          console.error(err);
                          setMediaError(err instanceof Error ? err.message : 'Error uploading file.');
                        }
                      }
                      if (successCount > 0) {
                        await fetchMediaFiles();
                        alert(`Successfully uploaded ${successCount} files!`);
                      }
                      e.target.value = '';
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Media Files Catalog grid */}
            {mediaError && (
              <div style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#fff4f4', color: '#b42318', border: '1px solid #ffd6d6', fontSize: '13px' }}>
                {mediaError}
              </div>
            )}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '20px' 
            }}>
              {loadingMedia ? (
                <p style={{ color: '#9e9e9e', fontSize: '13px' }}>Loading files...</p>
              ) : mediaFiles.length === 0 ? (
                <p style={{ color: '#9e9e9e', fontSize: '13px' }}>No files uploaded yet.</p>
              ) : (
                mediaFiles.map((file) => (
                  <div 
                    key={file.id} 
                    style={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e3e3e3', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ 
                      height: '140px', 
                      backgroundColor: '#f5f5f5', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderBottom: '1px solid #e3e3e3',
                      position: 'relative'
                    }}>
                      <img 
                        src={file.url} 
                        alt={file.filename} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.filename}>
                          {file.filename}
                        </div>
                        <span style={{ fontSize: '10px', color: '#8c8c8c' }}>{file.url}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + file.url);
                            alert('Link copied to clipboard!');
                          }}
                          style={{ 
                            flexGrow: 1, 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #cccccc', 
                            borderRadius: '4px', 
                            padding: '4px 8px', 
                            fontSize: '11px', 
                            fontWeight: '600', 
                            cursor: 'pointer' 
                          }}
                        >
                          🔗 Link
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm('Delete this file? This will remove it from the server.')) {
                              try {
                                const res = await fetch(`/api/admin/media?id=${file.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  fetchMediaFiles();
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          style={{ 
                            backgroundColor: '#ffebe9', 
                            border: 'none', 
                            borderRadius: '4px', 
                            padding: '4px 8px', 
                            fontSize: '11px', 
                            fontWeight: '600', 
                            color: '#ff4d4d',
                            cursor: 'pointer' 
                          }}
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Media Selector Modal popup */}
        {showMediaModal && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 3000
          }}>
            <div style={{ 
              width: '600px', 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)', 
              display: 'flex', 
              flexDirection: 'column', 
              maxHeight: '85vh',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e3e3e3' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>{mediaSelectorMode === 'hero' ? 'Select Hero Slider Image' : 'Select Media Asset'}</h3>
                <button 
                  onClick={() => {
                    setShowMediaModal(false);
                    setHeroMediaTargetIndex(null);
                  }}
                  style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#8c8c8c' }}
                >
                  ✕
                </button>
              </div>

              {/* Search and upload bar */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #e3e3e3', backgroundColor: '#f9f9f9', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c', fontSize: '14px' }}>🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search media files" 
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px 8px 36px', 
                      border: '1px solid #cccccc', 
                      borderRadius: '6px', 
                      fontSize: '13px' 
                    }}
                  />
                </div>
                <label 
                  style={{ 
                    backgroundColor: '#1a1a1a', 
                    color: '#ffffff', 
                    borderRadius: '6px', 
                    padding: '8px 16px', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Upload File
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        try {
                          const data = await uploadMediaFile(file);
                          if (mediaSelectorMode === 'product') {
                            setGalleryImages((prev) => [...prev.filter(img => img !== '/images/hero_candle.png'), data.url]);
                          } else if (mediaSelectorMode === 'hero') {
                            applyHeroImageSelection(data.url);
                          }
                          await fetchMediaFiles();
                          setShowMediaModal(false);
                        } catch (err) {
                          console.error(err);
                          alert(err instanceof Error ? err.message : 'Error uploading file.');
                        } finally {
                          e.target.value = '';
                        }
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Scrollable Gallery */}
              <div style={{ overflowY: 'auto', flexGrow: 1, padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 128px)', justifyContent: 'center', gap: '16px', alignItems: 'start' }}>
                {mediaError ? (
                  <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: '#b42318', fontSize: '13px' }}>
                    {mediaError}
                  </div>
                ) : mediaFiles.filter(file => {
                  if (!modalSearchQuery) return true;
                  return file.filename.toLowerCase().includes(modalSearchQuery.toLowerCase());
                }).length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: '#8c8c8c', fontSize: '13px' }}>
                    No matching media assets found.
                  </div>
                ) : (
                  mediaFiles.filter(file => {
                    if (!modalSearchQuery) return true;
                    return file.filename.toLowerCase().includes(modalSearchQuery.toLowerCase());
                  }).map((file) => (
                    <div 
                      key={file.id} 
                      onClick={() => {
                        if (mediaSelectorMode === 'product') {
                          setGalleryImages((prev) => {
                            if (prev.includes(file.url)) return prev;
                            return [...prev.filter(img => img !== '/images/hero_candle.png'), file.url];
                          });
                        } else if (mediaSelectorMode === 'hero') {
                          applyHeroImageSelection(file.url);
                        }
                        setShowMediaModal(false);
                      }}
                      style={{ 
                        border: '1px solid #e3e3e3', 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '128px',
                        height: '154px',
                        minWidth: 0,
                        backgroundColor: '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1a1a1a';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e3e3e3';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ width: '128px', height: '128px', padding: '8px', boxSizing: 'border-box', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={file.url} alt={file.filename} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }} />
                      </div>
                      <div style={{ padding: '5px 6px', fontSize: '10px', color: '#6d6d6d', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center', boxSizing: 'border-box', lineHeight: '14px' }} title={file.filename}>
                        {file.filename}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {selectedAbandonedCheckout && (() => {
          const checkoutItems = parseAbandonedCheckoutItems(selectedAbandonedCheckout);

          return (
            <div
              role="dialog"
              aria-modal="true"
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 3000, display: 'flex', justifyContent: 'flex-end' }}
              onClick={() => setSelectedAbandonedCheckout(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: 'min(720px, 100%)', height: '100vh', overflowY: 'auto', backgroundColor: '#ffffff', boxShadow: '-12px 0 30px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: '#ffffff', borderBottom: '1px solid #e3e3e3', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700' }}>Checkout {selectedAbandonedCheckout.checkout_number}</h2>
                    <p style={{ margin: 0, color: '#6d6d6d', fontSize: '13px' }}>{selectedAbandonedCheckout.date_str} - {selectedAbandonedCheckout.customer}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedAbandonedCheckout(null)} style={{ width: '34px', height: '34px', border: '1px solid #cccccc', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '18px' }}>
                    x
                  </button>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                    <div style={{ backgroundColor: '#f8faf9', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ color: '#6d6d6d', fontSize: '11px', marginBottom: '4px' }}>Total Cart Value</div>
                      <div style={{ fontWeight: '700', fontSize: '16px' }}>{selectedAbandonedCheckout.total_price}</div>
                    </div>
                    <div style={{ backgroundColor: '#f8faf9', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ color: '#6d6d6d', fontSize: '11px', marginBottom: '4px' }}>Items</div>
                      <div style={{ fontWeight: '700', fontSize: '16px' }}>{selectedAbandonedCheckout.items_count}</div>
                    </div>
                    <div style={{ backgroundColor: '#f8faf9', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ color: '#6d6d6d', fontSize: '11px', marginBottom: '4px' }}>Recovery</div>
                      <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '12px', backgroundColor: selectedAbandonedCheckout.recovery_status === 'Sent' ? '#e2ece9' : '#ffe8d6', color: selectedAbandonedCheckout.recovery_status === 'Sent' ? '#2d5c4d' : '#a65d00' }}>
                        {selectedAbandonedCheckout.recovery_status}
                      </span>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e3e3e3', borderRadius: '8px', padding: '18px' }}>
                    <h3 style={{ margin: '0 0 14px 0', fontSize: '15px' }}>Customer Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                      <div>
                        <div style={{ color: '#6d6d6d', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Name</div>
                        <div>{selectedAbandonedCheckout.customer || 'Not provided'}</div>
                      </div>
                      <div>
                        <div style={{ color: '#6d6d6d', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Email</div>
                        <div>{selectedAbandonedCheckout.email || 'Not provided'}</div>
                      </div>
                      <div>
                        <div style={{ color: '#6d6d6d', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Phone</div>
                        <div>{selectedAbandonedCheckout.phone || 'Not provided'}</div>
                      </div>
                      <div>
                        <div style={{ color: '#6d6d6d', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Client Reference</div>
                        <div style={{ wordBreak: 'break-word' }}>{selectedAbandonedCheckout.client_reference || 'Not captured'}</div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ color: '#6d6d6d', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Address</div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{selectedAbandonedCheckout.address || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e3e3e3', borderRadius: '8px', padding: '18px' }}>
                    <h3 style={{ margin: '0 0 14px 0', fontSize: '15px' }}>Abandoned Products</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {checkoutItems.length === 0 ? (
                        <p style={{ margin: 0, color: '#8c8c8c', fontSize: '13px' }}>No products captured for this checkout.</p>
                      ) : checkoutItems.map((item, index) => (
                        <div key={`${item.name}-${index}`} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '12px', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '12px' }}>
                          <div style={{ position: 'relative', width: '72px', height: '72px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e3e3e3', backgroundColor: '#f6f6f6' }}>
                            <Image src={item.image_url || '/images/hero_candle.png'} alt={item.name} fill style={{ objectFit: 'cover' }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.name}</div>
                                <div style={{ color: '#6d6d6d', fontSize: '12px', marginTop: '4px' }}>
                                  {item.selected_fragrance ? `Fragrance: ${item.selected_fragrance}` : 'Fragrance not selected'}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.total}</div>
                                <div style={{ color: '#6d6d6d', fontSize: '12px', marginTop: '4px' }}>{item.quantity} x {item.price}</div>
                              </div>
                            </div>
                            {item.product_id && (
                              <div style={{ color: '#8c8c8c', fontSize: '11px', marginTop: '10px' }}>Product ID: {item.product_id}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ position: 'sticky', bottom: 0, backgroundColor: '#ffffff', borderTop: '1px solid #e3e3e3', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleSendRecoveryEmail(selectedAbandonedCheckout.id, selectedAbandonedCheckout.email)}
                    disabled={selectedAbandonedCheckout.recovery_status === 'Sent'}
                    style={{ backgroundColor: selectedAbandonedCheckout.recovery_status === 'Sent' ? '#e3e3e3' : '#1a1a1a', color: selectedAbandonedCheckout.recovery_status === 'Sent' ? '#6d6d6d' : '#ffffff', border: 'none', borderRadius: '6px', padding: '9px 16px', fontSize: '13px', fontWeight: '600', cursor: selectedAbandonedCheckout.recovery_status === 'Sent' ? 'not-allowed' : 'pointer' }}
                  >
                    {selectedAbandonedCheckout.recovery_status === 'Sent' ? 'Recovery Sent' : 'Send Recovery Email'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Bulk Edit Modal popup */}
        {showBulkEditModal && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 3000
          }}>
            <div style={{ 
              width: '450px', 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e3e3e3' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                  Bulk Edit {selectedCatalogProductIds.length} Products
                </h3>
                <button 
                  onClick={() => setShowBulkEditModal(false)}
                  style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#8c8c8c' }}
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleBulkUpdate} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Update Price (₹) for selected products</label>
                  <input 
                    type="number" 
                    placeholder="Leave blank to keep existing prices"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Update Collection for selected products</label>
                  <select 
                    value={bulkCollection}
                    onChange={(e) => setBulkCollection(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: '#ffffff' }}
                  >
                    <option value="">Leave blank to keep existing collections</option>
                    {collections.map((coll) => (
                      <option key={coll.id} value={coll.name}>{coll.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button"
                    onClick={() => setShowBulkEditModal(false)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '6px', 
                      border: '1px solid #cccccc', 
                      backgroundColor: '#ffffff', 
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={bulkUpdating}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '6px', 
                      border: 'none', 
                      backgroundColor: '#1a1a1a', 
                      color: '#ffffff', 
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    {bulkUpdating ? 'Saving...' : 'Apply Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        </main>
      </div>
  );
}
