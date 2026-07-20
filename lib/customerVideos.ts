export interface CustomerVideo {
  id: string;
  title: string;
  author: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  link: string;
  verified: boolean;
}

export const CUSTOMER_VIDEOS_STORAGE_KEY = 'deeksha_customer_videos';

export const defaultCustomerVideos: CustomerVideo[] = [
  {
    id: 'video-unboxing',
    title: 'Unboxing Experience',
    author: 'Neha S.',
    duration: '0:18',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-lighted-candle-in-a-glass-jar-42340-large.mp4',
    thumbnail: '/images/cozy_room_glow.png',
    link: 'https://instagram.com',
    verified: true
  },
  {
    id: 'video-burn-test',
    title: 'Burn Test - 40+ Hours',
    author: 'Rahul M.',
    duration: '0:24',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-burning-candle-flame-in-close-up-42296-large.mp4',
    thumbnail: '/images/hero_candle.png',
    link: 'https://instagram.com',
    verified: true
  },
  {
    id: 'video-evening-routine',
    title: 'My Evening Routine',
    author: 'Ananya P.',
    duration: '0:31',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-lit-candle-42316-large.mp4',
    thumbnail: '/images/rose_candle.png',
    link: 'https://instagram.com',
    verified: true
  },
  {
    id: 'video-glow-closeup',
    title: 'Glow Close-up',
    author: 'Deera Glow',
    duration: '0:20',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-candle-flame-flickering-in-dark-room-42315-large.mp4',
    thumbnail: '/images/lavender_candle.png',
    link: 'https://instagram.com',
    verified: true
  }
];

export function normalizeCustomerVideos(value: unknown): CustomerVideo[] {
  if (!Array.isArray(value)) return defaultCustomerVideos;

  const videos = value.filter((item): item is Partial<CustomerVideo> => (
    typeof item === 'object' &&
    item !== null &&
    typeof item.videoUrl === 'string' &&
    item.videoUrl.length > 0
  )).map((item, index) => ({
    id: typeof item.id === 'string' && item.id ? item.id : `video-${index}`,
    title: typeof item.title === 'string' && item.title ? item.title : `Customer Video ${index + 1}`,
    author: typeof item.author === 'string' && item.author ? item.author : 'Customer',
    duration: typeof item.duration === 'string' && item.duration ? item.duration : '0:20',
    videoUrl: item.videoUrl || '',
    thumbnail: typeof item.thumbnail === 'string' && item.thumbnail ? item.thumbnail : '/images/hero_candle.png',
    link: typeof item.link === 'string' && item.link ? item.link : item.videoUrl || '#',
    verified: typeof item.verified === 'boolean' ? item.verified : true
  }));

  return videos.length > 0 ? videos : defaultCustomerVideos;
}
