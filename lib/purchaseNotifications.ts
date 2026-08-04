export interface PurchaseNotification {
  id: string;
  customerName: string;
  city: string;
  productName: string;
  productImage: string;
  productSlug?: string;
  timeAgo: string;
  verified?: boolean;
}

export const CUSTOMER_NOTIFICATIONS_STORAGE_KEY = 'deeksha_purchase_notifications';

export const defaultPurchaseNotifications: PurchaseNotification[] = [
  { id: 'notif-1', customerName: 'Priya', city: 'Delhi NCR', productName: 'Royal Pearl Drop Earrings', productImage: '/images/earrings_category.png', productSlug: 'royal-pearl-drops', timeAgo: '2 minutes ago', verified: true },
  { id: 'notif-2', customerName: 'Ananya', city: 'Mumbai', productName: 'Golden Solitaire Ring', productImage: '/images/rings_category.png', productSlug: 'golden-solitaire-ring', timeAgo: '4 minutes ago', verified: true },
  { id: 'notif-3', customerName: 'Sneha', city: 'Gurugram', productName: 'Classic Heart Pendant Necklace', productImage: '/images/necklaces_category.png', productSlug: 'classic-heart-pendant', timeAgo: '7 minutes ago', verified: true },
  { id: 'notif-4', customerName: 'Ritu', city: 'Bengaluru (Bangalore)', productName: 'Minimalist Link Chain Bracelet', productImage: '/images/bracelets_category.png', productSlug: 'minimalist-link-chain', timeAgo: '10 minutes ago', verified: true },
  { id: 'notif-5', customerName: 'Pooja', city: 'Chandigarh', productName: 'Rose Gold Floral Studs', productImage: '/images/earrings_category.png', productSlug: 'rose-gold-floral-studs', timeAgo: '12 minutes ago', verified: true },
  { id: 'notif-6', customerName: 'Divya', city: 'Hyderabad', productName: 'Emperor Crown Charm', productImage: '/images/charm_category.png', productSlug: 'emperor-crown-charm', timeAgo: '15 minutes ago', verified: true },
  { id: 'notif-7', customerName: 'Kavita', city: 'Chennai', productName: 'Eternity Band Ring', productImage: '/images/rings_category.png', productSlug: 'eternity-band-ring', timeAgo: '18 minutes ago', verified: true },
  { id: 'notif-8', customerName: 'Neha', city: 'Noida', productName: 'Tennis Gemstone Bracelet', productImage: '/images/bracelets_category.png', productSlug: 'tennis-gemstone-bracelet', timeAgo: '23 minutes ago', verified: true },
  { id: 'notif-9', customerName: 'Aarti', city: 'Delhi NCR', productName: 'Vintage Emerald Cut Ring', productImage: '/images/charm_category.png', productSlug: 'vintage-emerald-ring', timeAgo: '27 minutes ago', verified: true },
  { id: 'notif-10', customerName: 'Swati', city: 'Mumbai', productName: 'Charm Carrier Bangle', productImage: '/images/hero_slide_2.png', productSlug: 'charm-carrier-bangle', timeAgo: '31 minutes ago', verified: true },
  { id: 'notif-11', customerName: 'Isha', city: 'Gurugram', productName: 'Royal Pearl Drop Earrings', productImage: '/images/hero_slide_1.png', productSlug: 'royal-pearl-drops', timeAgo: '35 minutes ago', verified: true },
  { id: 'notif-12', customerName: 'Deepika', city: 'Noida', productName: 'Golden Solitaire Ring', productImage: '/images/rings_category.png', productSlug: 'golden-solitaire-ring', timeAgo: '39 minutes ago', verified: true },
  { id: 'notif-13', customerName: 'Simran', city: 'Bengaluru (Bangalore)', productName: 'Classic Heart Pendant Necklace', productImage: '/images/necklaces_category.png', productSlug: 'classic-heart-pendant', timeAgo: '44 minutes ago', verified: true },
  { id: 'notif-14', customerName: 'Sweta', city: 'Chandigarh', productName: 'Rose Gold Floral Studs', productImage: '/images/earrings_category.png', productSlug: 'rose-gold-floral-studs', timeAgo: '48 minutes ago', verified: true },
  { id: 'notif-15', customerName: 'Radhika', city: 'Hyderabad', productName: 'Minimalist Link Chain Bracelet', productImage: '/images/bracelets_category.png', productSlug: 'minimalist-link-chain', timeAgo: '52 minutes ago', verified: true },
  { id: 'notif-16', customerName: 'Sonam', city: 'Chennai', productName: 'Emperor Crown Charm', productImage: '/images/charm_category.png', productSlug: 'emperor-crown-charm', timeAgo: '56 minutes ago', verified: true },
  { id: 'notif-17', customerName: 'Mansi', city: 'Delhi NCR', productName: 'Eternity Band Ring', productImage: '/images/rings_category.png', productSlug: 'eternity-band-ring', timeAgo: '1 hour ago', verified: true },
  { id: 'notif-18', customerName: 'Preeti', city: 'Mumbai', productName: 'Tennis Gemstone Bracelet', productImage: '/images/bracelets_category.png', productSlug: 'tennis-gemstone-bracelet', timeAgo: '1 hour ago', verified: true },
  { id: 'notif-19', customerName: 'Payal', city: 'Gurugram', productName: 'Royal Pearl Drop Earrings', productImage: '/images/hero_slide_1.png', productSlug: 'royal-pearl-drops', timeAgo: '1 hour ago', verified: true },
  { id: 'notif-20', customerName: 'Komal', city: 'Noida', productName: 'Golden Solitaire Ring', productImage: '/images/rings_category.png', productSlug: 'golden-solitaire-ring', timeAgo: '1 hour ago', verified: true },
  { id: 'notif-21', customerName: 'Riddhi', city: 'Bengaluru (Bangalore)', productName: 'Classic Heart Pendant Necklace', productImage: '/images/necklaces_category.png', productSlug: 'classic-heart-pendant', timeAgo: '2 hours ago', verified: true },
  { id: 'notif-22', customerName: 'Muskan', city: 'Chandigarh', productName: 'Rose Gold Floral Studs', productImage: '/images/earrings_category.png', productSlug: 'rose-gold-floral-studs', timeAgo: '2 hours ago', verified: true },
  { id: 'notif-23', customerName: 'Garima', city: 'Hyderabad', productName: 'Charm Carrier Bangle', productImage: '/images/hero_slide_2.png', productSlug: 'charm-carrier-bangle', timeAgo: '2 hours ago', verified: true },
  { id: 'notif-24', customerName: 'Sakshi', city: 'Chennai', productName: 'Vintage Emerald Cut Ring', productImage: '/images/charm_category.png', productSlug: 'vintage-emerald-ring', timeAgo: '2 hours ago', verified: true },
  { id: 'notif-25', customerName: 'Kajal', city: 'Delhi NCR', productName: 'Tennis Gemstone Bracelet', productImage: '/images/bracelets_category.png', productSlug: 'tennis-gemstone-bracelet', timeAgo: '3 hours ago', verified: true },
  { id: 'notif-26', customerName: 'Priyanka', city: 'Mumbai', productName: 'Royal Pearl Drop Earrings', productImage: '/images/earrings_category.png', productSlug: 'royal-pearl-drops', timeAgo: '3 hours ago', verified: true },
  { id: 'notif-27', customerName: 'Ankita', city: 'Gurugram', productName: 'Golden Solitaire Ring', productImage: '/images/rings_category.png', productSlug: 'golden-solitaire-ring', timeAgo: '3 hours ago', verified: true },
  { id: 'notif-28', customerName: 'Jyoti', city: 'Noida', productName: 'Classic Heart Pendant Necklace', productImage: '/images/necklaces_category.png', productSlug: 'classic-heart-pendant', timeAgo: '3 hours ago', verified: true },
  { id: 'notif-29', customerName: 'Bhavna', city: 'Bengaluru (Bangalore)', productName: 'Minimalist Link Chain Bracelet', productImage: '/images/bracelets_category.png', productSlug: 'minimalist-link-chain', timeAgo: '4 hours ago', verified: true },
  { id: 'notif-30', customerName: 'Rashmi', city: 'Chandigarh', productName: 'Rose Gold Floral Studs', productImage: '/images/earrings_category.png', productSlug: 'rose-gold-floral-studs', timeAgo: '4 hours ago', verified: true },
  { id: 'notif-31', customerName: 'Juhi', city: 'Hyderabad', productName: 'Emperor Crown Charm', productImage: '/images/charm_category.png', productSlug: 'emperor-crown-charm', timeAgo: '4 hours ago', verified: true },
  { id: 'notif-32', customerName: 'Barkha', city: 'Chennai', productName: 'Eternity Band Ring', productImage: '/images/rings_category.png', productSlug: 'eternity-band-ring', timeAgo: '4 hours ago', verified: true }
];

export const ALLOWED_CITIES = [
  'Chandigarh',
  'Delhi NCR',
  'Mumbai',
  'Bengaluru (Bangalore)',
  'Hyderabad',
  'Chennai',
  'Gurugram',
  'Noida'
];

export function cleanCity(city: string, index: number = 0): string {
  if (!city) return ALLOWED_CITIES[index % ALLOWED_CITIES.length];
  const trimmed = city.trim();
  if (ALLOWED_CITIES.includes(trimmed)) return trimmed;
  
  const lower = trimmed.toLowerCase();
  if (lower === 'delhi') return 'Delhi NCR';
  if (lower === 'bangalore' || lower === 'bengaluru') return 'Bengaluru (Bangalore)';
  if (lower === 'gurgaon') return 'Gurugram';
  
  return ALLOWED_CITIES[index % ALLOWED_CITIES.length];
}

export function normalizePurchaseNotifications(raw: any): PurchaseNotification[] {
  if (!Array.isArray(raw) || raw.length === 0) return defaultPurchaseNotifications;
  return raw.map((item, index) => ({
    id: String(item.id || `notif-${index + 1}`),
    customerName: String(item.customerName || 'Happy Customer'),
    city: cleanCity(String(item.city || 'Delhi NCR'), index),
    productName: String(item.productName || 'Royal Pearl Drops'),
    productImage: String(item.productImage || '/images/earrings_category.png'),
    productSlug: item.productSlug ? String(item.productSlug) : '',
    timeAgo: String(item.timeAgo || 'Recently'),
    verified: item.verified !== undefined ? Boolean(item.verified) : true
  }));
}
