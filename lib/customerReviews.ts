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

export const CUSTOMER_REVIEWS_STORAGE_KEY = 'deeksha_customer_reviews';

export const defaultCustomerReviews: CustomerReview[] = [
  {
    id: 'review-priya-mehra',
    name: 'Priya Mehra',
    city: 'Delhi',
    time: '3 days ago',
    helpful: 24,
    avatar: '/images/cozy_room_glow.png',
    quote: 'The coffee fragrance actually smells like a freshly brewed cafe. Everyone who visited my home asked where the fragrance was coming from.',
    rating: 5,
    verified: true,
    productName: 'Iced Coffee Soy Wax Candle',
    productImage: '/images/hero_candle.png'
  },
  {
    id: 'review-aditya-rane',
    name: 'Aditya Rane',
    city: 'Mumbai',
    time: '1 week ago',
    helpful: 18,
    avatar: '/images/hero_candle.png',
    quote: 'Bought this as a gift for my sister and she loved it! The packaging is so premium and the wooden wick crackle is super relaxing.',
    rating: 5,
    verified: true,
    productName: 'Iced Coffee Soy Wax Candle',
    productImage: '/images/hero_candle.png'
  },
  {
    id: 'review-sneha-kapoor',
    name: 'Sneha Kapoor',
    city: 'Bengaluru',
    time: '2 weeks ago',
    helpful: 31,
    avatar: '/images/rose_candle.png',
    quote: 'Finally found a candle that burns clean and lasts long. 40+ hours is real! My evenings are now more calm and cozy.',
    rating: 5,
    verified: true,
    productName: 'Iced Coffee Soy Wax Candle',
    productImage: '/images/hero_candle.png'
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
    avatar: typeof item.avatar === 'string' && item.avatar ? item.avatar : '/images/hero_candle.png',
    quote: item.quote || '',
    rating: typeof item.rating === 'number' && item.rating >= 1 && item.rating <= 5 ? item.rating : 5,
    verified: typeof item.verified === 'boolean' ? item.verified : true,
    productId: typeof item.productId === 'number' ? item.productId : undefined,
    productName: typeof item.productName === 'string' && item.productName ? item.productName : 'Deeksha Candle',
    productImage: typeof item.productImage === 'string' && item.productImage ? item.productImage : '/images/hero_candle.png'
  }));

  return reviews.length > 0 ? reviews : defaultCustomerReviews;
}
