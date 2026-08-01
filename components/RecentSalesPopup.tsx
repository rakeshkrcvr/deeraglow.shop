'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  CUSTOMER_NOTIFICATIONS_STORAGE_KEY,
  PurchaseNotification,
  defaultPurchaseNotifications,
  normalizePurchaseNotifications
} from '@/lib/purchaseNotifications';
import { useCart } from '@/context/CartContext';
import styles from './RecentSalesPopup.module.css';

// Fisher-Yates Shuffle helper for array of indices
function generateShuffledOrder(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export default function RecentSalesPopup() {
  const { isCartOpen } = useCart();
  const [notifications, setNotifications] = useState<PurchaseNotification[]>(defaultPurchaseNotifications);
  const [visible, setVisible] = useState(false);
  const [currentSale, setCurrentSale] = useState<PurchaseNotification | null>(null);

  const shuffledQueueRef = useRef<number[]>([]);
  const pointerRef = useRef(0);

  const loadAndShuffleNotifications = () => {
    try {
      const saved = localStorage.getItem(CUSTOMER_NOTIFICATIONS_STORAGE_KEY);
      let list: PurchaseNotification[] = defaultPurchaseNotifications;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 50) {
          list = normalizePurchaseNotifications(parsed);
        } else {
          localStorage.setItem(CUSTOMER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(defaultPurchaseNotifications));
          list = defaultPurchaseNotifications;
        }
      } else {
        localStorage.setItem(CUSTOMER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(defaultPurchaseNotifications));
      }
      setNotifications(list);
      shuffledQueueRef.current = generateShuffledOrder(list.length);
      pointerRef.current = 0;
    } catch {
      setNotifications(defaultPurchaseNotifications);
      shuffledQueueRef.current = generateShuffledOrder(defaultPurchaseNotifications.length);
      pointerRef.current = 0;
    }
  };

  const loadSyncedNotifications = async () => {
    try {
      const response = await fetch('/api/admin/purchase-notifications', { cache: 'no-store' });
      if (!response.ok) return;

      const data = await response.json() as { notifications?: PurchaseNotification[] | null };
      if (!Array.isArray(data.notifications) || data.notifications.length < 50) return;

      const list = normalizePurchaseNotifications(data.notifications);
      localStorage.setItem(CUSTOMER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
      setNotifications(list);
      shuffledQueueRef.current = generateShuffledOrder(list.length);
      pointerRef.current = 0;
    } catch {
      // The saved browser copy remains available when the API is temporarily unavailable.
    }
  };

  useEffect(() => {
    loadAndShuffleNotifications();
    void loadSyncedNotifications();
    window.addEventListener('storage', loadAndShuffleNotifications);
    window.addEventListener('deeksha-notifications-updated', loadAndShuffleNotifications);
    return () => {
      window.removeEventListener('storage', loadAndShuffleNotifications);
      window.removeEventListener('deeksha-notifications-updated', loadAndShuffleNotifications);
    };
  }, []);

  const triggerNextPopup = () => {
    if (notifications.length === 0) return;

    if (
      shuffledQueueRef.current.length !== notifications.length ||
      pointerRef.current >= shuffledQueueRef.current.length
    ) {
      shuffledQueueRef.current = generateShuffledOrder(notifications.length);
      pointerRef.current = 0;
    }

    const nextIndex = shuffledQueueRef.current[pointerRef.current];
    pointerRef.current += 1;

    const nextNotif = notifications[nextIndex] || notifications[0];

    setCurrentSale(nextNotif);
    setVisible(true);

    // Hide after 6 seconds
    setTimeout(() => {
      setVisible(false);
    }, 6000);
  };

  useEffect(() => {
    if (notifications.length === 0) return;

    const initialTimer = setTimeout(() => {
      triggerNextPopup();
    }, 4000);

    const interval = setInterval(() => {
      triggerNextPopup();
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [notifications]);

  if (!currentSale || isCartOpen) return null;

  const productUrl = currentSale.productSlug
    ? `/products/${currentSale.productSlug}`
    : '/collections';

  return (
    <div className={`${styles.popupWrapper} ${visible ? styles.visible : ''}`}>
      <Link
        href={productUrl}
        className={styles.popupCard}
        onClick={() => setVisible(false)}
      >
        <div className={styles.imageContainer}>
          <img src={currentSale.productImage || '/images/earrings_category.png'} alt={currentSale.productName} className={styles.productImg} />
        </div>

        <div className={styles.contentCol}>
          <div className={styles.customerName}>
            {currentSale.customerName} from {currentSale.city}
          </div>
          <div className={styles.purchasedLabel}>purchased</div>
          <div className={styles.productTitle}>{currentSale.productName}</div>
          <div className={styles.metaRow}>
            <span>{currentSale.timeAgo}</span>
            {currentSale.verified !== false && (
              <svg className={styles.verifiedBadge} width="12" height="12" viewBox="0 0 24 24" fill="#b8860b">
                <circle cx="12" cy="12" r="10" fill="#b8860b" />
                <path d="m9 12 2 2 4-4" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setVisible(false);
          }}
          className={styles.closeBtn}
          aria-label="Close notification"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </Link>
    </div>
  );
}
