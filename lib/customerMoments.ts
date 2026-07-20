export interface CustomerMoment {
  id: string;
  image: string;
  alt: string;
}

export const CUSTOMER_MOMENTS_STORAGE_KEY = 'deeraglow_customer_moments';

export const defaultCustomerMoments: CustomerMoment[] = [
  { id: 'moment-rings', image: '/images/rings_category.png', alt: 'Customer rings moment 1' },
  { id: 'moment-bracelets', image: '/images/bracelets_category.png', alt: 'Customer bracelets moment 2' },
  { id: 'moment-necklaces', image: '/images/necklaces_category.png', alt: 'Customer necklaces moment 3' },
  { id: 'moment-earrings', image: '/images/earrings_category.png', alt: 'Customer earrings moment 4' },
  { id: 'moment-charm', image: '/images/charm_category.png', alt: 'Customer charm moment 5' },
  { id: 'moment-banner', image: '/images/jewelry_category_banner.png', alt: 'Customer jewelry style moment 6' },
  { id: 'moment-banner-cat', image: '/images/category_banner_jewelry.png', alt: 'Customer jewelry collection moment 7' },
  { id: 'moment-card', image: '/images/collection_card.png', alt: 'Customer jewelry style moment 8' }
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
    image: item.image || '/images/rings_category.png',
    alt: typeof item.alt === 'string' && item.alt ? item.alt : `Customer jewelry moment ${index + 1}`
  }));

  return moments.length > 0 ? moments : defaultCustomerMoments;
}
