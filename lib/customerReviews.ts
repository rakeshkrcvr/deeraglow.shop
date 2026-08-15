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

// Kept only so existing browsers can be migrated away from the old demo data.
// Real reviews must be created in the admin dashboard and linked to a product.
const legacyDemoCustomerReviews: CustomerReview[] = [
  { id: 'review-1', name: 'Priya Mehra', city: 'Delhi', time: '3 days ago', helpful: 24, avatar: '/images/earrings_category.png', quote: "The Royal Pearl Drops are absolutely stunning! They look so elegant and premium, and the polish hasn't faded at all even after multiple wears.", rating: 5, verified: true, productName: 'Royal Pearl Drops', productImage: '/images/earrings_category.png' },
  { id: 'review-2', name: 'Aditya Rane', city: 'Mumbai', time: '1 week ago', helpful: 18, avatar: '/images/rings_category.png', quote: "Bought the Golden Solitaire Ring as a gift for my sister and she loved it! The packaging is extremely premium and looks like real gold.", rating: 5, verified: true, productName: 'Golden Solitaire Ring', productImage: '/images/rings_category.png' },
  { id: 'review-3', name: 'Sneha Kapoor', city: 'Bengaluru', time: '2 weeks ago', helpful: 31, avatar: '/images/necklaces_category.png', quote: "This necklace has become my everyday go-to. It is so lightweight, minimalist, and goes with everything. Highly recommend Deera Glow!", rating: 5, verified: true, productName: 'Classic Heart Pendant', productImage: '/images/necklaces_category.png' },
  { id: 'review-4', name: 'Ananya Sharma', city: 'Chandigarh', time: '4 days ago', helpful: 15, avatar: '/images/earrings_category.png', quote: "The Rose Gold Floral Studs are even more gorgeous in person. The shine is unreal and it feels very comfortable on sensitive skin.", rating: 5, verified: true, productName: 'Rose Gold Floral Studs', productImage: '/images/earrings_category.png' },
  { id: 'review-5', name: 'Pooja Verma', city: 'Ahmedabad', time: '5 days ago', helpful: 22, avatar: '/images/bracelets_category.png', quote: "Super impressed with the speed of delivery! The packaging was luxurious with a lovely velvet pouch. Will definitely buy again.", rating: 5, verified: true, productName: 'Minimalist Link Chain Bracelet', productImage: '/images/bracelets_category.png' },
  { id: 'review-6', name: 'Divya Nair', city: 'Kochi', time: '1 week ago', helpful: 12, avatar: '/images/charm_category.png', quote: "Finishing and detailing is top notch. Looks like pure diamond jewellery. So glad I came across Deera Glow.", rating: 5, verified: true, productName: 'Emperor Crown Charm', productImage: '/images/charm_category.png' },
  { id: 'review-7', name: 'Meera Joshi', city: 'Pune', time: '1 week ago', helpful: 27, avatar: '/images/rings_category.png', quote: "The Eternity Band Ring fits perfectly! I wear it while washing hands and doing daily work, still zero tarnishing.", rating: 5, verified: true, productName: 'Eternity Band Ring', productImage: '/images/rings_category.png' },
  { id: 'review-8', name: 'Ritu Sen', city: 'Kolkata', time: '2 weeks ago', helpful: 19, avatar: '/images/bracelets_category.png', quote: "Tennis Gemstone Bracelet looks incredibly classy. Got so many compliments at a wedding function recently.", rating: 5, verified: true, productName: 'Tennis Gemstone Bracelet', productImage: '/images/bracelets_category.png' },
  { id: 'review-9', name: 'Aarti Saxena', city: 'Lucknow', time: '2 weeks ago', helpful: 14, avatar: '/images/charm_category.png', quote: "Very fine quality silver. The shine on the stones is bright and eye-catching. 10/10 experience!", rating: 5, verified: true, productName: 'Vintage Emerald Cut Ring', productImage: '/images/charm_category.png' },
  { id: 'review-10', name: 'Isha Merchant', city: 'Surat', time: '3 weeks ago', helpful: 29, avatar: '/images/hero_slide_2.png', quote: "Gifted this to my wife for our anniversary and her face lit up! Outstanding craftsmanship and design.", rating: 5, verified: true, productName: 'Charm Carrier Bangle', productImage: '/images/hero_slide_2.png' },
  { id: 'review-11', name: 'Deepika Singhania', city: 'Jaipur', time: '3 days ago', helpful: 16, avatar: '/images/hero_slide_1.png', quote: "Elegant design that works for both office wear and evening outings. Lightweight and super stylish.", rating: 5, verified: true, productName: 'Royal Pearl Drops', productImage: '/images/hero_slide_1.png' },
  { id: 'review-12', name: 'Simran Kaur', city: 'Amritsar', time: '4 days ago', helpful: 20, avatar: '/images/rings_category.png', quote: "Sparkles so bright! My friends asked me if this was real diamond. Extremely satisfied with my purchase.", rating: 5, verified: true, productName: 'Golden Solitaire Ring', productImage: '/images/rings_category.png' },
  { id: 'review-13', name: 'Sweta Chawla', city: 'Indore', time: '6 days ago', helpful: 11, avatar: '/images/necklaces_category.png', quote: "Product quality matched the photos 100%. Premium feel, great box packaging, and prompt customer support.", rating: 5, verified: true, productName: 'Classic Heart Pendant', productImage: '/images/necklaces_category.png' },
  { id: 'review-14', name: 'Radhika Patel', city: 'Vadodara', time: '1 week ago', helpful: 25, avatar: '/images/earrings_category.png', quote: "I have very sensitive skin, but these studs caused zero irritation. Very high quality anti-tarnish finish!", rating: 5, verified: true, productName: 'Rose Gold Floral Studs', productImage: '/images/earrings_category.png' },
  { id: 'review-15', name: 'Sonam Mishra', city: 'Bhopal', time: '1 week ago', helpful: 17, avatar: '/images/bracelets_category.png', quote: "Beautiful link chain bracelet. Perfect thickness and secure lock. Feels very high-end.", rating: 5, verified: true, productName: 'Minimalist Link Chain Bracelet', productImage: '/images/bracelets_category.png' },
  { id: 'review-16', name: 'Mansi Rastogi', city: 'Noida', time: '2 weeks ago', helpful: 13, avatar: '/images/charm_category.png', quote: "The crown charm detail is so intricate and fine. Loved how delicate and cute it looks on my chain.", rating: 5, verified: true, productName: 'Emperor Crown Charm', productImage: '/images/charm_category.png' },
  { id: 'review-17', name: 'Preeti Agarwal', city: 'Ghaziabad', time: '2 weeks ago', helpful: 21, avatar: '/images/rings_category.png', quote: "Simple, elegant, and timeless ring design. I wear it every single day and it still looks brand new.", rating: 5, verified: true, productName: 'Eternity Band Ring', productImage: '/images/rings_category.png' },
  { id: 'review-18', name: 'Payal Deshmukh', city: 'Nagpur', time: '3 weeks ago', helpful: 8, avatar: '/images/bracelets_category.png', quote: "Gorgeous sparkle on the tennis bracelet! Fits my wrist gracefully and doesn't snag on clothes.", rating: 5, verified: true, productName: 'Tennis Gemstone Bracelet', productImage: '/images/bracelets_category.png' },
  { id: 'review-19', name: 'Komal Tripathi', city: 'Varanasi', time: '3 weeks ago', helpful: 33, avatar: '/images/charm_category.png', quote: "Bought the emerald cut ring and it is breathtaking! The color of the stone is deep and mesmerizing.", rating: 5, verified: true, productName: 'Vintage Emerald Cut Ring', productImage: '/images/charm_category.png' },
  { id: 'review-20', name: 'Riddhi Shah', city: 'Rajkot', time: '4 weeks ago', helpful: 19, avatar: '/images/hero_slide_2.png', quote: "Bangle quality is very solid and sturdy. Smooth edges and shiny finish. Exceeded my expectations!", rating: 5, verified: true, productName: 'Charm Carrier Bangle', productImage: '/images/hero_slide_2.png' },
  { id: 'review-21', name: 'Muskan Bhatia', city: 'Delhi', time: '2 days ago', helpful: 10, avatar: '/images/earrings_category.png', quote: "Fast 3-day delivery to Delhi. The pearl earrings look ethereal and pair nicely with ethnic & western dresses.", rating: 5, verified: true, productName: 'Royal Pearl Drops', productImage: '/images/earrings_category.png' },
  { id: 'review-22', name: 'Garima Seth', city: 'Gurugram', time: '3 days ago', helpful: 26, avatar: '/images/rings_category.png', quote: "Solitaire ring has a sparkling clarity that looks luxurious. Loved the gift pouch inside!", rating: 5, verified: true, productName: 'Golden Solitaire Ring', productImage: '/images/rings_category.png' },
  { id: 'review-23', name: 'Sakshi Reddy', city: 'Hyderabad', time: '5 days ago', helpful: 14, avatar: '/images/necklaces_category.png', quote: "Heart pendant is dainty and sweet. The chain length is just right. Excellent craftsmanship!", rating: 5, verified: true, productName: 'Classic Heart Pendant', productImage: '/images/necklaces_category.png' },
  { id: 'review-24', name: 'Kajal Mehta', city: 'Mumbai', time: '6 days ago', helpful: 18, avatar: '/images/earrings_category.png', quote: "Floral studs are my new staple. Very lightweight and doesn't hurt earlobes even after 12 hours.", rating: 5, verified: true, productName: 'Rose Gold Floral Studs', productImage: '/images/earrings_category.png' },
  { id: 'review-25', name: 'Priyanka Roy', city: 'Kolkata', time: '1 week ago', helpful: 22, avatar: '/images/bracelets_category.png', quote: "The bracelet chain feels very premium and durable. Shipped safely in a sturdy gift box.", rating: 5, verified: true, productName: 'Minimalist Link Chain Bracelet', productImage: '/images/bracelets_category.png' },
  { id: 'review-26', name: 'Ankita Sundaram', city: 'Chennai', time: '1 week ago', helpful: 15, avatar: '/images/charm_category.png', quote: "Detailed charm that adds character to any outfit. Pure 925 silver finish is evident.", rating: 5, verified: true, productName: 'Emperor Crown Charm', productImage: '/images/charm_category.png' },
  { id: 'review-27', name: 'Jyoti Thakur', city: 'Dehradun', time: '2 weeks ago', helpful: 30, avatar: '/images/rings_category.png', quote: "Eternity ring fits comfortably around the finger. The micro-pave stones are aligned perfectly.", rating: 5, verified: true, productName: 'Eternity Band Ring', productImage: '/images/rings_category.png' },
  { id: 'review-28', name: 'Bhavna Solanki', city: 'Jodhpur', time: '2 weeks ago', helpful: 12, avatar: '/images/bracelets_category.png', quote: "The tennis bracelet has an expensive look without breaking the bank. Loved the clasp design.", rating: 5, verified: true, productName: 'Tennis Gemstone Bracelet', productImage: '/images/bracelets_category.png' },
  { id: 'review-29', name: 'Rashmi Menon', city: 'Thiruvananthapuram', time: '3 weeks ago', helpful: 27, avatar: '/images/charm_category.png', quote: "Emerald ring color is super rich! Arrived in pristine condition. Deera Glow is doing fantastic work.", rating: 5, verified: true, productName: 'Vintage Emerald Cut Ring', productImage: '/images/charm_category.png' },
  { id: 'review-30', name: 'Juhi Gill', city: 'Ludhiana', time: '3 weeks ago', helpful: 9, avatar: '/images/hero_slide_2.png', quote: "Bangle finish is super polished. Very classy piece to gift your mother or sister.", rating: 5, verified: true, productName: 'Charm Carrier Bangle', productImage: '/images/hero_slide_2.png' },
  { id: 'review-31', name: 'Barkha Mahajan', city: 'Jammu', time: '4 days ago', helpful: 16, avatar: '/images/hero_slide_1.png', quote: "Pearl drops are lightweight and look so graceful. Really happy with the anti-tarnish promise!", rating: 5, verified: true, productName: 'Royal Pearl Drops', productImage: '/images/hero_slide_1.png' },
  { id: 'review-32', name: 'Niharika Bose', city: 'Durgapur', time: '5 days ago', helpful: 23, avatar: '/images/rings_category.png', quote: "The solitaire ring stone catch light beautifully. Ideal ring for daily wear and special dinners.", rating: 5, verified: true, productName: 'Golden Solitaire Ring', productImage: '/images/rings_category.png' },
  { id: 'review-33', name: 'Shruti Pathak', city: 'Patna', time: '1 week ago', helpful: 11, avatar: '/images/necklaces_category.png', quote: "Minimal pendant that enhances any neck neckline. Sleek, stylish and rust-free.", rating: 5, verified: true, productName: 'Classic Heart Pendant', productImage: '/images/necklaces_category.png' },
  { id: 'review-34', name: 'Reena Gupta', city: 'Kanpur', time: '1 week ago', helpful: 19, avatar: '/images/earrings_category.png', quote: "Rose gold studs look cute and classy. Great value for money fine jewellery.", rating: 5, verified: true, productName: 'Rose Gold Floral Studs', productImage: '/images/earrings_category.png' },
  { id: 'review-35', name: 'Sonali Pandey', city: 'Prayagraj', time: '2 weeks ago', helpful: 14, avatar: '/images/bracelets_category.png', quote: "Beautiful link bracelet. Premium metal shine that doesn't darken after sweat or water exposure.", rating: 5, verified: true, productName: 'Minimalist Link Chain Bracelet', productImage: '/images/bracelets_category.png' },
  { id: 'review-36', name: 'Nidhi Jain', city: 'Udaipur', time: '2 weeks ago', helpful: 28, avatar: '/images/charm_category.png', quote: "Unique charm design that gets noticed instantly. Shipped within 24 hours of ordering!", rating: 5, verified: true, productName: 'Emperor Crown Charm', productImage: '/images/charm_category.png' },
  { id: 'review-37', name: 'Kriti Kulkarni', city: 'Nashik', time: '3 weeks ago', helpful: 17, avatar: '/images/rings_category.png', quote: "Very smooth band ring, doesn't catch on sweater threads. Stays shiny always.", rating: 5, verified: true, productName: 'Eternity Band Ring', productImage: '/images/rings_category.png' },
  { id: 'review-38', name: 'Pragya Tiwari', city: 'Ranchi', time: '3 weeks ago', helpful: 20, avatar: '/images/bracelets_category.png', quote: "Tennis bracelet stones are super clear and brilliant. Premium packaging added to the joy.", rating: 5, verified: true, productName: 'Tennis Gemstone Bracelet', productImage: '/images/bracelets_category.png' },
  { id: 'review-39', name: 'Archana Dixit', city: 'Gwalior', time: '4 weeks ago', helpful: 13, avatar: '/images/charm_category.png', quote: "Emerald ring is an eye-catcher! The stone setting is firm and secure. Highly satisfied.", rating: 5, verified: true, productName: 'Vintage Emerald Cut Ring', productImage: '/images/charm_category.png' },
  { id: 'review-40', name: 'Charu Saxena', city: 'Bareilly', time: '4 weeks ago', helpful: 21, avatar: '/images/hero_slide_2.png', quote: "Sturdy bangle with smooth latch. Goes well with traditional suits and sarees.", rating: 5, verified: true, productName: 'Charm Carrier Bangle', productImage: '/images/hero_slide_2.png' },
  { id: 'review-41', name: 'Urvashi Choudhary', city: 'Kota', time: '2 days ago', helpful: 15, avatar: '/images/earrings_category.png', quote: "The pearl drops are truly royalty-inspired! The gold polish looks soft and rich.", rating: 5, verified: true, productName: 'Royal Pearl Drops', productImage: '/images/earrings_category.png' },
  { id: 'review-42', name: 'Mahi Swaminathan', city: 'Coimbatore', time: '4 days ago', helpful: 18, avatar: '/images/rings_category.png', quote: "Ring size guide was accurate and fitting is spot on. Sparkles brilliantly in direct light!", rating: 5, verified: true, productName: 'Golden Solitaire Ring', productImage: '/images/rings_category.png' },
  { id: 'review-43', name: 'Vandana Merchant', city: 'Surat', time: '6 days ago', helpful: 24, avatar: '/images/necklaces_category.png', quote: "Heart pendant chain is strong and shiny. Loved how it was packed in a cute box.", rating: 5, verified: true, productName: 'Classic Heart Pendant', productImage: '/images/necklaces_category.png' },
  { id: 'review-44', name: 'Shilpa Shetty', city: 'Mangalore', time: '1 week ago', helpful: 10, avatar: '/images/earrings_category.png', quote: "Studs are comfortable to sleep in as well. Super skin-safe and beautiful.", rating: 5, verified: true, productName: 'Rose Gold Floral Studs', productImage: '/images/earrings_category.png' },
  { id: 'review-45', name: 'Smriti Bansal', city: 'Panchkula', time: '1 week ago', helpful: 32, avatar: '/images/bracelets_category.png', quote: "Paperclip style link bracelet is very trendy! Gets lots of compliments from colleagues.", rating: 5, verified: true, productName: 'Minimalist Link Chain Bracelet', productImage: '/images/bracelets_category.png' },
  { id: 'review-46', name: 'Chetna Sinha', city: 'Bhubaneshwar', time: '2 weeks ago', helpful: 14, avatar: '/images/charm_category.png', quote: "Charming crown piece! Pure silver authenticity feels solid. Will shop more soon.", rating: 5, verified: true, productName: 'Emperor Crown Charm', productImage: '/images/charm_category.png' },
  { id: 'review-47', name: 'Deepa Pillai', city: 'Mysuru', time: '2 weeks ago', helpful: 22, avatar: '/images/rings_category.png', quote: "The eternity ring design is flawless. Micro stones are smooth and don't scratch.", rating: 5, verified: true, productName: 'Eternity Band Ring', productImage: '/images/rings_category.png' },
  { id: 'review-48', name: 'Minakshi Wagh', city: 'Solapur', time: '3 weeks ago', helpful: 11, avatar: '/images/bracelets_category.png', quote: "Classic tennis bracelet that looks worth 10x its price. Outstanding quality fine jewellery.", rating: 5, verified: true, productName: 'Tennis Gemstone Bracelet', productImage: '/images/bracelets_category.png' },
  { id: 'review-49', name: 'Twinkle Parekh', city: 'Vadodara', time: '3 weeks ago', helpful: 19, avatar: '/images/charm_category.png', quote: "Rich green emerald ring that looks vintage and royal. Best online jewellery buy so far!", rating: 5, verified: true, productName: 'Vintage Emerald Cut Ring', productImage: '/images/charm_category.png' },
  { id: 'review-50', name: 'Richa Sharma', city: 'Shimla', time: '4 weeks ago', helpful: 25, avatar: '/images/hero_slide_2.png', quote: "Carrier bangle is thick and holds charms nicely without slipping. Highly recommended!", rating: 5, verified: true, productName: 'Charm Carrier Bangle', productImage: '/images/hero_slide_2.png' }
];

const legacyDemoReviewIds = new Set(legacyDemoCustomerReviews.map((review) => review.id));

export const defaultCustomerReviews: CustomerReview[] = [];

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
    productName: typeof item.productName === 'string' && item.productName ? item.productName : 'Deera Glow jewellery',
    productImage: typeof item.productImage === 'string' && item.productImage ? item.productImage : '/images/rings_category.png'
  }));

  // Versions before this change seeded 50 fictional reviews. Preserve a legacy
  // entry only if an admin has linked it to a real product; this keeps edited
  // reviews (such as the Royal Cherry Pearl review) and removes demo records.
  return reviews.filter((review) => (
    !legacyDemoReviewIds.has(review.id) ||
    (typeof review.productId === 'number' && review.productId > 0)
  ));
}
