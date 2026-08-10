'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Collection {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  collection: string;
  price: number;
  compare_price?: number | null;
  inventory?: number | null;
  rating: number;
  reviews_count: number;
  description: string;
  image_url: string;
  images?: string;
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
  deleted_at?: string | null;
}

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [authorized, setAuthorized] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  // A collection must be chosen deliberately. Defaulting to "Rings" caused
  // every newly created product to be assigned there unintentionally.
  const [collection, setCollection] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [inventory, setInventory] = useState('10');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>(['']);
  const [imageUrlError, setImageUrlError] = useState('');
  
  // Custom specifications
  const [tagline, setTagline] = useState('100% tarnish-free — 925 sterling silver — premium cubic zirconia');
  const [fragrances, setFragrances] = useState('925 Sterling Silver, Gold Plated, Cubic Zirconia');
  const [dimensions, setDimensions] = useState('Adjustable Ring Size / Standard Size');
  const [weight, setWeight] = useState('15 gms');
  const [burnHours, setBurnHours] = useState('Tarnish-Free Polish');
  const [accBurnTime, setAccBurnTime] = useState('Tarnish-free polish lifetime durability');
  const [accIngredients, setAccIngredients] = useState("925 Sterling Silver base, 18k gold plating, AAA+ cubic zirconia, skin-friendly and completely lead and nickel free. Crafted to ensure lifetime durability and shine.");
  const [accInstructions, setAccInstructions] = useState("Avoid direct contact with water, sweat, perfumes, or harsh chemicals. Clean gently with a dry microfibre cloth and store in an airtight zip-lock bag when not in use.");
  const [accShipping, setAccShipping] = useState("Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the jewellery is completely unused and in its original packaging.");

  const [collections, setCollections] = useState<Collection[]>([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function fetchCollections() {
    try {
      const res = await fetch('/api/admin/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  }

  // 1. Auth check
  useEffect(() => {
    void (async () => {
      // Yield before updating state so this effect only synchronizes browser-only
      // session state after hydration.
      await Promise.resolve();
      const isLoggedIn = localStorage.getItem('deeksha_admin_logged_in') === 'true';
      if (!isLoggedIn) {
        setHasCheckedAuth(true);
        router.push('/admin');
      } else {
        setAuthorized(true);
        setHasCheckedAuth(true);
        await fetchCollections();
      }
    })();
  }, [router]);

  // 2. Fetch product details if in edit mode
  useEffect(() => {
    if (!authorized || !editId) return;

    const fetchProductForEdit = async () => {
      setLoadingProduct(true);
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data: Product[] = await res.json();
          const target = data.find(p => p.id === parseInt(editId, 10));
          if (target) {
            setName(target.name || '');
            setCollection(target.collection || '');
            setPrice(target.price ? target.price.toString() : '');
            setComparePrice(target.compare_price ? target.compare_price.toString() : '');
            setInventory(target.inventory?.toString() ?? '10');
            setDescription(target.description || '');
            setFeatures(target.features || '');
            setImageUrl(target.image_url || '');
            const existingAdditionalImages = (target.images || '')
              .split(',')
              .map((url) => url.trim())
              .filter((url) => url && url !== target.image_url);
            setAdditionalImageUrls(existingAdditionalImages.length > 0 ? existingAdditionalImages : ['']);

            setTagline(target.tagline || '100% tarnish-free — 925 sterling silver — premium cubic zirconia');
            setFragrances(target.fragrances || '925 Sterling Silver, Gold Plated, Cubic Zirconia');
            setDimensions(target.dimensions || 'Adjustable Ring Size / Standard Size');
            setWeight(target.weight || '15 gms');
            setBurnHours(target.burn_hours || 'Tarnish-Free Polish');
            setAccBurnTime(target.acc_burn_time || 'Tarnish-free polish lifetime durability');
            setAccIngredients(target.acc_ingredients || '925 Sterling Silver base, 18k gold plating, AAA+ cubic zirconia, skin-friendly and completely lead and nickel free. Crafted to ensure lifetime durability and shine.');
            setAccInstructions(target.acc_instructions || 'Avoid direct contact with water, sweat, perfumes, or harsh chemicals. Clean gently with a dry microfibre cloth and store in an airtight zip-lock bag when not in use.');
            setAccShipping(target.acc_shipping || 'Free standard shipping on orders over ₹999. Deliveries take 3-5 working days. Returns are accepted within 7 days of delivery if the jewellery is completely unused and in its original packaging.');
          }
        }
      } catch (err) {
        console.error('Error loading product for edit:', err);
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProductForEdit();
  }, [authorized, editId]);

  // 3. Auto-restore local draft for new products
  useEffect(() => {
    if (!editId && authorized) {
      void (async () => {
        // Yield before applying the local draft to avoid a synchronous effect
        // state update and keep hydration deterministic.
        await Promise.resolve();
        const savedDraft = localStorage.getItem('deeraglow_new_product_draft');
        if (savedDraft) {
          try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.name && !name) setName(parsed.name);
          if (parsed.price && !price) setPrice(parsed.price);
          if (parsed.comparePrice && !comparePrice) setComparePrice(parsed.comparePrice);
          if (parsed.inventory !== undefined && inventory === '10') setInventory(parsed.inventory);
          if (parsed.description && !description) setDescription(parsed.description);
          if (parsed.features && !features) setFeatures(parsed.features);
          if (parsed.collection && !collection) setCollection(parsed.collection);
          if (parsed.imageUrl && !imageUrl) setImageUrl(parsed.imageUrl);
          if (Array.isArray(parsed.additionalImageUrls)) setAdditionalImageUrls(parsed.additionalImageUrls);
          } catch (e) {
            console.error('Error parsing draft:', e);
          }
        }
      })();
    }
  }, [authorized, editId]);

  // Auto-save draft on change for new product
  useEffect(() => {
    if (!editId && (name || price || description || features || imageUrl || additionalImageUrls.some(Boolean))) {
      const draftData = { name, collection, price, comparePrice, inventory, description, features, imageUrl, additionalImageUrls };
      localStorage.setItem('deeraglow_new_product_draft', JSON.stringify(draftData));
    }
  }, [name, collection, price, comparePrice, inventory, description, features, imageUrl, additionalImageUrls, editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setImageUrlError('');
    setSubmitting(true);

    if (!name || !collection || !price || !description || !features) {
      setFormError('Please fill out all required fields.');
      setSubmitting(false);
      return;
    }

    const trimmedImageUrl = imageUrl.trim();
    if (trimmedImageUrl && !isValidImageUrl(trimmedImageUrl)) {
      const error = 'Enter a valid HTTP or HTTPS image URL.';
      setImageUrlError(error);
      setFormError(error);
      setSubmitting(false);
      return;
    }

    const trimmedAdditionalImageUrls = additionalImageUrls.map((url) => url.trim()).filter(Boolean);
    if (trimmedAdditionalImageUrls.some((url) => !isValidImageUrl(url))) {
      const error = 'Every additional image link must be a valid HTTP or HTTPS URL.';
      setImageUrlError(error);
      setFormError(error);
      setSubmitting(false);
      return;
    }

    try {
      const method = editId ? 'PUT' : 'POST';
      const payload = {
        name,
        collection,
        price,
        compare_price: comparePrice,
        inventory,
        description,
        image_url: trimmedImageUrl,
        features,
        tagline,
        fragrances,
        dimensions,
        weight,
        burn_hours: burnHours,
        acc_burn_time: accBurnTime,
        acc_ingredients: accIngredients,
        acc_instructions: accInstructions,
        acc_shipping: accShipping,
        // Keep the cover image first so the storefront gallery starts with it.
        images: [trimmedImageUrl, ...trimmedAdditionalImageUrls].filter(Boolean).join(','),
      };

      const body = editId ? { id: parseInt(editId, 10), ...payload } : payload;

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFormSuccess(editId ? 'Product updated successfully!' : 'Product added successfully!');
        if (!editId) {
          localStorage.removeItem('deeraglow_new_product_draft');
        }

        setTimeout(() => {
          router.push('/admin/dashboard?tab=products');
        }, 1200);
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

  if (!hasCheckedAuth || !authorized) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f6f6f6', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#666' }}>Verifying admin session...</p>
      </div>
    );
  }

  const isValidImageUrl = (value: string) => {
    if (value.startsWith('/') && !value.startsWith('//')) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const showImagePreview = Boolean(imageUrl.trim()) && isValidImageUrl(imageUrl.trim());

  const navigateToDashboard = () => {
    setIsSidebarOpen(false);
    router.push('/admin/dashboard');
  };

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8', color: '#1a1a1a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="admin-mobile-topbar">
        <button
          type="button"
          className="admin-menu-button"
          aria-label="Open admin menu"
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>
        <div>
          <strong>Deera Glow</strong>
          <span>Store Admin</span>
        </div>
      </div>

      <button
        type="button"
        aria-label="Close admin menu"
        className={`admin-sidebar-scrim ${isSidebarOpen ? 'is-open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`admin-sidebar ${isSidebarOpen ? 'is-open' : ''}`} style={{ width: '240px', backgroundColor: '#ebebeb', borderRight: '1px solid #dcdcdc', display: 'flex', flexDirection: 'column', padding: '16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px 20px', borderBottom: '1px solid #dcdcdc', marginBottom: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: '#3e0030', color: '#c5a880', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>D</div>
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>Deera Glow</h2>
            <span style={{ fontSize: '11px', color: '#6d6d6d' }}>Store Admin</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1, padding: '0 8px' }}>
          {[
            ['📥', 'Orders'],
            ['🏷️', 'Products'],
            ['👥', 'Customers'],
            ['📈', 'Growth'],
            ['🏷️', 'Discounts'],
            ['✍️', 'Content'],
            ['📊', 'Analytics'],
            ['⚙️', 'Settings']
          ].map(([icon, label]) => (
            <button
              key={label}
              type="button"
              onClick={navigateToDashboard}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', border: 'none',
                background: label === 'Products' ? '#e1e1e1' : 'transparent', color: '#1a1a1a', fontSize: '13px',
                fontWeight: label === 'Products' ? '600' : '500', cursor: 'pointer', textAlign: 'left', width: '100%'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '16px' }}>{icon}</span>{label}</span>
              {(label === 'Orders' || label === 'Products' || label === 'Customers') && <span style={{ fontSize: '10px', color: '#6d6d6d' }}>▶</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: '0 16px' }}>
          <button type="button" onClick={() => { localStorage.removeItem('deeksha_admin_logged_in'); router.push('/admin'); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dcdcdc', background: '#ffffff', color: '#ff4d4d', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </aside>

      <div style={{ flexGrow: 1, minWidth: 0 }}>
      
      {/* Top Fixed Admin Bar */}
      <header className="product-editor-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e3e3e3',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={() => {
              router.push('/admin/dashboard?tab=products');
            }}
            style={{
              backgroundColor: '#f1f1f1',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#1a1a1a'
            }}
          >
            ← Back to Inventory
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#1a1a1a' }}>
              {editId ? 'Edit Product' : 'Add Product'}
            </h1>
            <span style={{ fontSize: '11px', color: '#6d6d6d' }}>
              Deera Glow Catalog & Inventory
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard?tab=products')}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cccccc',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#1a1a1a'
            }}
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: '#202020',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Saving...' : editId ? 'Save Changes' : 'Save Product'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main" style={{ padding: '32px 40px 64px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {loadingProduct ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
            <p>Loading product details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {formError && (
              <div style={{ backgroundColor: '#ffe8d6', color: '#a65d00', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500' }}>
                ⚠️ {formError}
              </div>
            )}
            {formSuccess && (
              <div style={{ backgroundColor: '#e2ece9', color: '#2d5c4d', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500' }}>
                ✓ {formSuccess} Navigating back to inventory...
              </div>
            )}

            {/* CARD 1: Basic Info */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: '#1a1a1a', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                Basic Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', color: '#444' }}>Product Title / Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Royal Pearl Drop Earrings"
                    style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', color: '#444' }}>Collection *</label>
                    <select
                      value={collection}
                      onChange={(e) => setCollection(e.target.value)}
                      required
                      style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: '#ffffff', fontSize: '14px' }}
                    >
                      {collections.length === 0 ? (
                        <option value="">No collections available</option>
                      ) : (
                        <>
                          <option value="" disabled>Select a collection</option>
                          {collections.map((coll) => (
                            <option key={coll.id} value={coll.name}>{coll.name}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', color: '#444' }}>Price (₹) *</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      placeholder="899"
                      style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }}
                    />

                    <label style={{ fontWeight: '600', color: '#444', marginTop: '8px' }}>Compare Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                      placeholder="e.g. 1304"
                      style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <span style={{ color: '#777', fontSize: '11px' }}>Enter a higher price to display it with a strike-through.</span>

                    <label style={{ fontWeight: '600', color: '#444', marginTop: '8px' }}>Inventory</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      required
                      placeholder="10"
                      style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <span style={{ color: '#777', fontSize: '11px' }}>Set to 0 to mark this product as sold out.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', color: '#444' }}>Highlights Tagline *</label>
                  <input
                    type="text"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    required
                    placeholder="e.g. 925 Sterling Silver • 18k Gold Plated • Tarnish Free"
                    style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', color: '#444' }}>Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    placeholder="Describe the design, craftsmanship, and aesthetic details of this jewellery piece..."
                    style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical', fontSize: '13px', lineHeight: '1.5' }}
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: Product image URLs */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0', color: '#1a1a1a' }}>
                Product Images
              </h2>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#777' }}>
                Paste direct image links. The image files are not uploaded; only their URL strings are stored in Neon.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', color: '#444' }}>Image URL</label>
                <input
                  type="url"
                  inputMode="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageUrlError('');
                  }}
                  placeholder="https://example.com/products/product-1.webp"
                  aria-invalid={Boolean(imageUrlError)}
                  style={{ padding: '10px 14px', border: `1px solid ${imageUrlError ? '#c23b3b' : '#ccc'}`, borderRadius: '6px', fontSize: '14px' }}
                />
                <span style={{ color: '#777', fontSize: '11px' }}>Optional. Use a publicly accessible HTTP/HTTPS image URL.</span>
                {imageUrlError && <span role="alert" style={{ color: '#b42318', fontSize: '12px' }}>{imageUrlError}</span>}
              </div>

              {showImagePreview && (
                <div style={{ marginTop: '16px', width: 'min(260px, 100%)', aspectRatio: '1', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fafafa' }}>
                  <img src={imageUrl.trim()} alt="Product image preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <label style={{ fontWeight: '600', color: '#444' }}>Additional Image Links</label>
                  <button
                    type="button"
                    onClick={() => setAdditionalImageUrls((urls) => [...urls, ''])}
                    style={{ padding: '7px 11px', border: '1px solid #3e0030', borderRadius: '6px', background: '#fff', color: '#3e0030', fontWeight: '600', cursor: 'pointer' }}
                  >
                    + Add image link
                  </button>
                </div>
                <span style={{ color: '#777', fontSize: '11px' }}>Add as many public HTTP/HTTPS image links as needed. They will appear in the product gallery.</span>
                {additionalImageUrls.map((url, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="url"
                      inputMode="url"
                      value={url}
                      onChange={(e) => setAdditionalImageUrls((urls) => urls.map((currentUrl, currentIndex) => currentIndex === index ? e.target.value : currentUrl))}
                      placeholder={`Additional image link ${index + 1}`}
                      style={{ flex: 1, padding: '10px 14px', border: `1px solid ${imageUrlError ? '#c23b3b' : '#ccc'}`, borderRadius: '6px', fontSize: '14px' }}
                    />
                    {additionalImageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setAdditionalImageUrls((urls) => urls.filter((_, currentIndex) => currentIndex !== index))}
                        aria-label={`Remove additional image link ${index + 1}`}
                        style={{ padding: '9px 11px', border: '1px solid #c23b3b', borderRadius: '6px', background: '#fff', color: '#b42318', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 3: Specifications & Accordions */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: '#1a1a1a', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                Specifications & Product Accordions
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', color: '#444' }}>Subtitle Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. 100% tarnish-free — 925 sterling silver — premium cubic zirconia"
                    style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontWeight: '700', color: '#1a1a1a' }}>Select Finish</span>
                  <span style={{ color: '#777', fontSize: '12px' }}>These comma-separated options appear as finish buttons on the product page.</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', color: '#444' }}>Materials (Comma separated)</label>
                    <input
                      type="text"
                      value={fragrances}
                      onChange={(e) => setFragrances(e.target.value)}
                      placeholder="Gold Plated, Silver, Rose Gold"
                      style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', color: '#444' }}>Dimensions</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="Adjustable Ring Size / Standard Size"
                      style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', color: '#444' }}>Jewellery Weight</label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="15 gms"
                      style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', color: '#444' }}>Durability / Polish</label>
                    <input
                      type="text"
                      value={burnHours}
                      onChange={(e) => setBurnHours(e.target.value)}
                      placeholder="Tarnish-Free Polish"
                      style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', color: '#444' }}>Accordion: Durability & Polish</label>
                  <input
                    type="text"
                    value={accBurnTime}
                    onChange={(e) => setAccBurnTime(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', color: '#444' }}>Accordion: Materials & Craftsmanship</label>
                  <textarea
                    value={accIngredients}
                    onChange={(e) => setAccIngredients(e.target.value)}
                    rows={2}
                    style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', color: '#444' }}>Accordion: Care Instructions</label>
                  <textarea
                    value={accInstructions}
                    onChange={(e) => setAccInstructions(e.target.value)}
                    rows={2}
                    style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: '600', color: '#444' }}>Accordion: Shipping & Returns</label>
                  <textarea
                    value={accShipping}
                    onChange={(e) => setAccShipping(e.target.value)}
                    rows={2}
                    style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard?tab=products')}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cccccc',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: '#202020',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
              >
                {submitting ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
              </button>
            </div>

          </form>
        )}
        </div>
      </main>

      </div>

    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f6f6f6', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading Product Editor...</p>
      </div>
    }>
      <ProductFormContent />
    </Suspense>
  );
}
