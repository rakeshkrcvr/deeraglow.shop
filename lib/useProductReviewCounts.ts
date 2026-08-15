"use client";

import { useEffect, useState } from 'react';
import {
  CUSTOMER_REVIEWS_STORAGE_KEY,
  normalizeCustomerReviews,
} from '@/lib/customerReviews';

export function useProductReviewCounts() {
  const [reviewCounts, setReviewCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const loadReviewCounts = () => {
      try {
        const stored = localStorage.getItem(CUSTOMER_REVIEWS_STORAGE_KEY);
        const reviews = stored ? normalizeCustomerReviews(JSON.parse(stored)) : [];
        const counts = reviews.reduce<Record<number, number>>((result, review) => {
          if (typeof review.productId === 'number' && review.productId > 0) {
            result[review.productId] = (result[review.productId] || 0) + 1;
          }
          return result;
        }, {});
        setReviewCounts(counts);
      } catch {
        setReviewCounts({});
      }
    };

    loadReviewCounts();
    window.addEventListener('storage', loadReviewCounts);
    window.addEventListener('deeksha-reviews-updated', loadReviewCounts);
    return () => {
      window.removeEventListener('storage', loadReviewCounts);
      window.removeEventListener('deeksha-reviews-updated', loadReviewCounts);
    };
  }, []);

  return (productId: number) => reviewCounts[productId] || 0;
}
