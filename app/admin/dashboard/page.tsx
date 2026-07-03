"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
}

interface Discount {
  id: number;
  title: string;
  summary: string;
  discount_type: string;
  status: string;
  used_count: number;
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

interface Collection {
  id: number;
  name: string;
  description: string;
  slug: string;
}

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'drafts' | 'abandoned' | 'products' | 'collections' | 'files' | 'discounts' | 'customers' | 'growth' | 'content' | 'analytics' | 'settings'>('orders');
  
  // Collapsible Dropdown States
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(true);
  const [isProductsExpanded, setIsProductsExpanded] = useState(true);
  const [isCustomersExpanded, setIsCustomersExpanded] = useState(false);

  // Data Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [abandoned, setAbandoned] = useState<AbandonedCheckout[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  
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
  const [mediaFiles, setMediaFiles] = useState<{ id: number, url: string, filename: string, created_at: string }[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaSelectorMode, setMediaSelectorMode] = useState<'product' | 'general'>('product');

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
  const [showNewPostForm, setShowNewPostForm] = useState(false);

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

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
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
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
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
      const res = await fetch('/api/admin/media');
      if (res.ok) {
        const data = await res.json();
        setMediaFiles(data);
      }
    } catch (err) {
      console.error('Error loading media files:', err);
    } finally {
      setLoadingMedia(false);
    }
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

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('deeksha_admin_logged_in') === 'true';
    if (!isLoggedIn) {
      router.push('/admin');
    } else {
      setAuthorized(true);
      fetchProducts();
      fetchOrders();
      fetchDrafts();
      fetchAbandoned();
      fetchDiscounts();
      fetchCollections();
      fetchMediaFiles();
      fetchSettings();
    }
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

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Product deleted successfully!');
        fetchProducts();
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCatalogProductIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedCatalogProductIds.length} products?`)) return;
    
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
      alert(`Successfully deleted ${successCount} products.`);
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Error performing bulk delete.");
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

  // Create Discount Code
  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscountTitle || !newDiscountSummary) return;

    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDiscountTitle.toUpperCase().replace(/\s+/g, ''),
          summary: newDiscountSummary,
          discount_type: selectedDiscountType
        })
      });

      if (res.ok) {
        setNewDiscountTitle('');
        setNewDiscountSummary('');
        setShowCreateDiscountForm(false);
        fetchDiscounts();
        alert('Discount code successfully created!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Blog Post
  const handleCreateBlogPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle) return;

    const newPost: BlogPost = {
      id: blogPosts.length + 1,
      title: newPostTitle,
      author: 'Deeksha Sharma',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Published'
    };

    setBlogPosts([newPost, ...blogPosts]);
    setNewPostTitle('');
    setShowNewPostForm(false);
    alert('Blog post published successfully!');
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

  if (!authorized) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f6f6f6', alignItems: 'center', justifyContent: 'center', color: '#1a1a1a', fontFamily: 'sans-serif' }}>
        <p>Verifying admin session...</p>
      </div>
    );
  }

  const filteredProducts = products.filter(prod => {
    const query = productSearchQuery.toLowerCase();
    return (
      prod.name.toLowerCase().includes(query) ||
      prod.collection.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f6f6f6', color: '#1a1a1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* 1. Left Shopify Sidebar */}
      <aside style={{ width: '240px', backgroundColor: '#ebebeb', borderRight: '1px solid #dcdcdc', display: 'flex', flexDirection: 'column', padding: '16px 0', flexShrink: 0 }}>
        
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
              setActiveTab('orders');
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
                onClick={() => setActiveTab('drafts')}
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
                onClick={() => setActiveTab('abandoned')}
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
              setActiveTab('products');
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
                onClick={() => setActiveTab('collections')}
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
                onClick={() => setActiveTab('products')}
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
                onClick={() => setActiveTab('files')}
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
              {['Segments', 'Companies'].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px 8px 36px',
                    color: '#6d6d6d',
                    fontSize: '13px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'background 0.1s ease'
                  }}
                  onClick={() => alert(`${item} segment loading is coming soon.`)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* Growth Tab */}
          <button
            onClick={() => setActiveTab('growth')}
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
            onClick={() => setActiveTab('discounts')}
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
            onClick={() => setActiveTab('content')}
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
            onClick={() => setActiveTab('analytics')}
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
            onClick={() => setActiveTab('settings')}
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
      <main style={{ flexGrow: 1, padding: '32px 40px', overflowY: 'auto' }}>
        
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
                        <tr key={order.id} style={{ borderBottom: '1px solid #e3e3e3' }}>
                          <td style={{ padding: '12px 16px' }}><input type="checkbox" /></td>
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
                        <tr key={checkout.id} style={{ borderBottom: '1px solid #e3e3e3' }}>
                          <td style={{ padding: '12px 16px' }}><input type="checkbox" /></td>
                          <td style={{ padding: '12px 16px', fontWeight: '600' }}>{checkout.checkout_number}</td>
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
                              onClick={() => handleSendRecoveryEmail(checkout.id, checkout.email)}
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
                  onClick={() => setShowDiscountTypeModal(true)}
                  style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Create discount
                </button>
              </div>
            </div>

            {/* Custom create form if type selected */}
            {showCreateDiscountForm && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 16px 0' }}>Configure: {selectedDiscountType}</h3>
                <form onSubmit={handleCreateDiscount} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Discount Code Title</label>
                    <input type="text" value={newDiscountTitle} onChange={e => setNewDiscountTitle(e.target.value)} required placeholder="e.g. FESTIVE30" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Summary Text</label>
                    <input type="text" value={newDiscountSummary} onChange={e => setNewDiscountSummary(e.target.value)} required placeholder="e.g. 30% off select candles" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', width: '260px' }} />
                  </div>
                  <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    Save Code
                  </button>
                  <button type="button" onClick={() => setShowCreateDiscountForm(false)} style={{ backgroundColor: 'transparent', border: '1px solid #ccc', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
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
                    </tr>
                  </thead>
                  <tbody>
                    {loadingDiscounts ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9e9e9e' }}>Loading discounts catalog...</td>
                      </tr>
                    ) : discounts.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9e9e9e' }}>No discounts configured.</td>
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

        {/* TAB 1.9: CUSTOMERS MANAGER */}
        {activeTab === 'customers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>👥</span>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Customers</h1>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #e3e3e3', color: '#6d6d6d' }}>
                    <th style={{ padding: '12px 16px' }}>Name</th>
                    <th style={{ padding: '12px 16px' }}>Email Address</th>
                    <th style={{ padding: '12px 16px' }}>Orders placed</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Jyoti Soni', email: 'jyoti.soni@gmail.com', orders: 4, spent: '₹5,865.05', status: 'Active' },
                    { name: 'Akshay Agrawal', email: 'akshay.agrawal@gmail.com', orders: 5, spent: '₹0.00', status: 'In progress' },
                    { name: 'Shan Mohd', email: 'shan.mohd@gmail.com', orders: 1, spent: '₹399.00', status: 'Active' },
                    { name: 'Shantanu Ghosh', email: 'shantanu.g@gmail.com', orders: 1, spent: '₹0.00', status: 'Inactive' }
                  ].map((cust, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e3e3e3' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>{cust.name}</td>
                      <td style={{ padding: '12px 16px', color: '#6d6d6d' }}>{cust.email}</td>
                      <td style={{ padding: '12px 16px' }}>{cust.orders} orders</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '12px',
                          backgroundColor: cust.status === 'Active' ? '#e2ece9' : '#ffe8d6',
                          color: cust.status === 'Active' ? '#2d5c4d' : '#a65d00'
                        }}>{cust.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>{cust.spent}</td>
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
              <button 
                onClick={() => setShowNewPostForm(true)}
                style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
              >
                Create Blog Post
              </button>
            </div>

            {/* Quick Post form */}
            {showNewPostForm && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 16px 0' }}>Write New Article</h3>
                <form onSubmit={handleCreateBlogPost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#6d6d6d' }}>Article Title</label>
                    <input type="text" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} required placeholder="e.g. Scenting Your Living Spaces: Tips & Tricks" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      Publish Article
                    </button>
                    <button type="button" onClick={() => setShowNewPostForm(false)} style={{ backgroundColor: 'transparent', border: '1px solid #ccc', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Content Lists */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              {/* Blog Posts list */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px' }}>Active Blog Articles</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {blogPosts.map((post) => (
                    <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f9f9f9', paddingBottom: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '13px', display: 'block' }}>{post.title}</strong>
                        <span style={{ fontSize: '11px', color: '#6d6d6d' }}>{post.date} • {post.author}</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#2d5c4d', backgroundColor: '#e2ece9', padding: '2px 8px', borderRadius: '10px' }}>{post.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation structure links preview */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid #e3e3e3', paddingBottom: '10px' }}>Store Navigation Menus</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  {[
                    { menu: 'Main Menu', links: 'Home • Shop • Fragrance • Occasions • About Us • Blogs' },
                    { menu: 'Footer Collection List', links: 'Scented Candles • Soy Wax • Jar Candles • Luxury Collection' },
                    { menu: 'Footer Scent Categories', links: 'Vanilla • Lavender • Rose • Jasmine • Sandalwood • Coffee' }
                  ].map((nav, idx) => (
                    <div key={idx} style={{ padding: '10px', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
                      <strong style={{ display: 'block', marginBottom: '4px' }}>{nav.menu}</strong>
                      <span style={{ color: '#6d6d6d', fontSize: '12px' }}>{nav.links}</span>
                    </div>
                  ))}
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
                              const formData = new FormData();
                              formData.append('file', file);
                              try {
                                const uploadRes = await fetch('/api/admin/media', {
                                  method: 'POST',
                                  body: formData
                                });
                                if (uploadRes.ok) {
                                  const data = await uploadRes.json();
                                  setGalleryImages((prev) => [...prev.filter(img => img !== '/images/hero_candle.png'), data.url]);
                                  fetchMediaFiles();
                                } else {
                                  alert('Failed to upload image.');
                                }
                              } catch (err) {
                                alert('Error uploading file.');
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
                        <label style={{ fontWeight: '600', color: '#6d6d6d' }}>Accordion: Ingredients & How It's Made</label>
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
                  Catalog Listing
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
                        ✏️ Bulk Edit
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
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background-color 0.2s',
                          height: '32px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffdcd9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffebe9'}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <button 
                      type="button"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px 14px', 
                        border: '1px solid #cccccc', 
                        borderRadius: '6px', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        backgroundColor: '#ffffff', 
                        cursor: 'pointer',
                        color: '#1a1a1a',
                        transition: 'all 0.2s',
                        height: '36px'
                      }}
                    >
                      <span>All</span>
                      <span style={{ fontSize: '10px', color: '#6d6d6d' }}>↕</span>
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
                  <p style={{ color: '#9e9e9e', fontSize: '13px' }}>No products found in store catalog.</p>
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
                                  backgroundColor: '#e2ece9', 
                                  color: '#2d5c4d' 
                                }}>
                                  Active
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
                                    onClick={() => handleEditProductClick(prod)}
                                    style={{ background: 'transparent', border: 'none', color: '#2196f3', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                  >
                                    Delete
                                  </button>
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
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          const uploadRes = await fetch('/api/admin/media', {
                            method: 'POST',
                            body: formData
                          });
                          if (uploadRes.ok) {
                            successCount++;
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }
                      if (successCount > 0) {
                        fetchMediaFiles();
                        alert(`Successfully uploaded ${successCount} files!`);
                      }
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Media Files Catalog grid */}
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
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>Select Media Asset</h3>
                <button 
                  onClick={() => setShowMediaModal(false)}
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
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          const uploadRes = await fetch('/api/admin/media', {
                            method: 'POST',
                            body: formData
                          });
                          if (uploadRes.ok) {
                            const data = await uploadRes.json();
                            if (mediaSelectorMode === 'product') {
                              setGalleryImages((prev) => [...prev.filter(img => img !== '/images/hero_candle.png'), data.url]);
                            }
                            fetchMediaFiles();
                            setShowMediaModal(false);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Scrollable Gallery */}
              <div style={{ overflowY: 'auto', flexGrow: 1, padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
                {mediaFiles.filter(file => {
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
                        backgroundColor: '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1a1a1a';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e3e3e3';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div style={{ height: '80px', width: '100%', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={file.url} alt={file.filename} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ padding: '6px', fontSize: '10px', color: '#6d6d6d', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }} title={file.filename}>
                        {file.filename}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

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
