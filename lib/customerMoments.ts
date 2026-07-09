export interface CustomerMoment {
  id: string;
  image: string;
  alt: string;
}

export const CUSTOMER_MOMENTS_STORAGE_KEY = 'deeksha_customer_moments';

export const defaultCustomerMoments: CustomerMoment[] = [
  { id: 'moment-hero-candle', image: '/images/hero_candle.png', alt: 'Customer candle moment 1' },
  { id: 'moment-cozy-room', image: '/images/cozy_room_glow.png', alt: 'Customer candle moment 2' },
  { id: 'moment-vanilla', image: '/images/vanilla_candle.png', alt: 'Customer candle moment 3' },
  { id: 'moment-lavender', image: '/images/lavender_candle.png', alt: 'Customer candle moment 4' },
  { id: 'moment-eucalyptus', image: '/images/eucalyptus_candle.png', alt: 'Customer candle moment 5' },
  { id: 'moment-rose', image: '/images/rose_candle.png', alt: 'Customer candle moment 6' },
  { id: 'moment-jasmine', image: '/images/jasmine_candle.png', alt: 'Customer candle moment 7' },
  { id: 'moment-cozy-room-repeat', image: '/images/cozy_room_glow.png', alt: 'Customer candle moment 8' }
];

export function normalizeCustomerMoments(value: unknown): CustomerMoment[] {
  if (!Array.isArray(value)) return defaultCustomerMoments;

  const moments = value.filter((item): item is Partial<CustomerMoment> => (
    typeof item === 'object' &&
    item !== null &&
    typeof item.image === 'string' &&
    item.image.length > 0
  )).map((item, index) => ({
    id: typeof item.id === 'string' && item.id ? item.id : `moment-${index}`,
    image: item.image || '/images/hero_candle.png',
    alt: typeof item.alt === 'string' && item.alt ? item.alt : `Customer candle moment ${index + 1}`
  }));

  return moments.length > 0 ? moments : defaultCustomerMoments;
}
