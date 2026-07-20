export interface CustomerReview {
  id: string;
  name: string;
  city: string;
  time: string;
  helpful: number;
  avatar: string;
  quote: string;
  rating: number;
  verified: boolean;
  productId?: number;
  productName: string;
  productImage: string;
}

export const CUSTOMER_REVIEWS_STORAGE_KEY = 'deeraglow_customer_reviews';

export const defaultCustomerReviews: CustomerReview[] = [
  {
    id: 'review-priya-mehra',
    name: 'Priya Mehra',
    city: 'Delhi',
    time: '3 days ago',
    helpful: 24,
    avatar: '/images/earrings_category.png',
    quote: 'The Royal Pearl Drops are absolutely stunning! They look so elegant and premium, and the polish hasn\'t faded at all even after multiple wears.',
    rating: 5,
    verified: true,
    productName: 'Royal Pearl Drops',
    productImage: '/images/earrings_category.png'
  },
  {
    id: 'review-aditya-rane',
    name: 'Aditya Rane',
    city: 'Mumbai',
    time: '1 week ago',
    helpful: 18,
    avatar: '/images/rings_category.png',
    quote: 'Bought the Golden Solitaire Ring as a gift for my sister and she loved it! The packaging is extremely premium and looks like real gold.',
    rating: 5,
    verified: true,
    productName: 'Golden Solitaire Ring',
    productImage: '/images/rings_category.png'
  },
  {
    id: 'review-sneha-kapoor',
    name: 'Sneha Kapoor',
    city: 'Bengaluru',
    time: '2 weeks ago',
    helpful: 31,
    avatar: '/images/necklaces_category.png',
    quote: 'This necklace has become my everyday go-to. It is so lightweight, minimalist, and goes with everything. Highly recommend Deera Glow!',
    rating: 5,
    verified: true,
    productName: 'Classic Heart Pendant',
    productImage: '/images/necklaces_category.png'
  }
];

export function normalizeCustomerReviews(value: unknown): CustomerReview[] {
  if (!Array.isArray(value)) return defaultCustomerReviews;

  const reviews = value.filter((item): item is Partial<CustomerReview> => (
    typeof item === 'object' &&
    item !== null &&
    typeof item.name === 'string' &&
    typeof item.quote === 'string'
  )).map((item, index) => ({
    id: typeof item.id === 'string' && item.id ? item.id : `review-${Date.now()}-${index}`,
    name: item.name || 'Happy Customer',
    city: typeof item.city === 'string' && item.city ? item.city : 'India',
    time: typeof item.time === 'string' && item.time ? item.time : 'Just now',
    helpful: typeof item.helpful === 'number' ? item.helpful : 0,
    avatar: typeof item.avatar === 'string' && item.avatar ? item.avatar : '/images/rings_category.png',
    quote: item.quote || '',
    rating: typeof item.rating === 'number' && item.rating >= 1 && item.rating <= 5 ? item.rating : 5,
    verified: typeof item.verified === 'boolean' ? item.verified : true,
    productId: typeof item.productId === 'number' ? item.productId : undefined,
    productName: typeof item.productName === 'string' && item.productName ? item.productName : 'Deera Glow Jewelry',
    productImage: typeof item.productImage === 'string' && item.productImage ? item.productImage : '/images/rings_category.png'
  }));

  return reviews.length > 0 ? reviews : defaultCustomerReviews;
}
