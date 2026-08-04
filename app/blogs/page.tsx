import React from 'react';
import BlogsClient from './BlogsClient';

export const metadata = {
  title: 'Jewellery Styling & Care Journal | Deera Glow',
  description: 'Read the latest guides on sterling silver jewellery care, 925 silver vs brass comparisons, and necklace layering tips by Deera Glow.',
  alternates: {
    canonical: 'https://deeraglow.shop/blogs',
  },
  openGraph: {
    title: 'Jewellery Styling & Care Journal | Deera Glow',
    description: 'Read the latest guides on sterling silver care and jewellery styling tips.',
    url: 'https://deeraglow.shop/blogs',
    siteName: 'Deera Glow',
    type: 'website',
  },
};

export default function BlogsPage() {
  return <BlogsClient />;
}
