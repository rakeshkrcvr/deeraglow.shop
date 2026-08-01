"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product } from '@/lib/products';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedFragrance: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product?: Product, quantity?: number, selectedFragrance?: string) => void;
  removeFromCart: (productId: number, selectedFragrance: string) => void;
  updateQuantity: (productId: number, selectedFragrance: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const parseSavedCartItems = (): CartItem[] => {
  const savedItems = localStorage.getItem('deeraglow_cart_items');
  if (!savedItems) return [];

  try {
    return JSON.parse(savedItems);
  } catch (e) {
    console.error("Failed to parse cart items:", e);
    return [];
  }
};

const writeCartItems = (items: CartItem[]) => {
  localStorage.setItem('deeraglow_cart_items', JSON.stringify(items));
  localStorage.setItem('deeraglow_cart_count', items.reduce((acc, item) => acc + item.quantity, 0).toString());
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const cartNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load cart from localStorage, then refresh each product from the live catalog.
  useEffect(() => {
    let isCancelled = false;

    void Promise.resolve().then(() => {
      if (!isCancelled) {
        setCartItems(parseSavedCartItems());
      }
    });

    const syncCartWithCatalog = async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) return;

        const products = await res.json() as Product[];
        const productById = new Map(products.map(product => [product.id, product]));
        const productBySlug = new Map(products.map(product => [product.slug, product]));
        const currentItems = parseSavedCartItems();

        const syncedItems = currentItems.flatMap((item) => {
          const liveProduct = productById.get(item.product.id) || productBySlug.get(item.product.slug);
          if (!liveProduct) return [];

          return [{
            ...item,
            product: {
              ...liveProduct,
              price: Number(liveProduct.price)
            }
          }];
        });

        if (!isCancelled) {
          setCartItems(syncedItems);
          writeCartItems(syncedItems);
        }
      } catch (err) {
        console.error("Failed to sync cart products:", err);
      }
    };

    syncCartWithCatalog();

    return () => {
      isCancelled = true;
    };
  }, []);

  const saveCartItems = (items: CartItem[]) => {
    setCartItems(items);
    writeCartItems(items);
  };

  const showCartNotice = (productName: string) => {
    if (cartNoticeTimer.current) clearTimeout(cartNoticeTimer.current);
    setCartNotice(productName);
    cartNoticeTimer.current = setTimeout(() => setCartNotice(null), 3200);
  };

  useEffect(() => () => {
    if (cartNoticeTimer.current) clearTimeout(cartNoticeTimer.current);
  }, []);

  const addToCart = (product?: Product, quantity: number = 1, selectedFragrance: string = 'Standard') => {
    let targetProduct = product;
    if (!targetProduct) {
      targetProduct = {
        id: 16,
        name: "Royal Pearl Drops",
        slug: "royal-pearl-drops",
        collection: "Earrings",
        price: 899,
        rating: 4.9,
        reviews_count: 124,
        description: "Elegant double-layered drops with premium faux pearls and shimmering crystal settings.",
        image_url: "/images/earrings_category.png",
        features: "Pearl • Drop • Gold Plated"
      };
    }

    const newItems = [...cartItems];
    const existingIndex = newItems.findIndex(
      item => item.product.id === targetProduct!.id && item.selectedFragrance === selectedFragrance
    );

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems.push({ product: targetProduct, quantity, selectedFragrance });
    }

    saveCartItems(newItems);
    showCartNotice(targetProduct.name);
  };

  const removeFromCart = (productId: number, selectedFragrance: string) => {
    const newItems = cartItems.filter(
      item => !(item.product.id === productId && item.selectedFragrance === selectedFragrance)
    );
    saveCartItems(newItems);
  };

  const updateQuantity = (productId: number, selectedFragrance: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId, selectedFragrance);
      return;
    }
    const newItems = cartItems.map(item => {
      if (item.product.id === productId && item.selectedFragrance === selectedFragrance) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCartItems(newItems);
  };

  const clearCart = () => {
    saveCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartCount, 
      cartSubtotal, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      isCartOpen, 
      setIsCartOpen 
    }}>
      {children}
      {cartNotice && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: '88px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: 'calc(100vw - 40px)',
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#1f1421',
            color: '#ffffff',
            border: '1px solid rgba(216, 180, 126, 0.65)',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.28)',
            fontFamily: 'inherit'
          }}
        >
          <span aria-hidden="true" style={{ color: '#dfc297', fontSize: '18px', lineHeight: 1 }}>✓</span>
          <span><strong>Added to cart</strong><br /><small style={{ color: '#eadac1' }}>{cartNotice}</small></span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
