import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/products';
import { getAllCollections } from '@/lib/collections';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://deeraglow.shop';

  // Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Dynamic category pages
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const collections = await getAllCollections();
    const defaultSlugs = [
      'rings',
      'necklaces',
      'earrings',
      'bracelets',
      'charms',
      'sterling-silver',
      'gold-plated',
      'best-sellers',
      'all-jewellery',
    ];
    
    const allSlugs = Array.from(
      new Set([
        ...defaultSlugs,
        ...collections.map((c) => c.slug).filter(Boolean),
      ])
    );

    categoryEntries = allSlugs.map((slug) => ({
      url: `${baseUrl}/category/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }));
  } catch (e) {
    console.error('Error generating category sitemap entries:', e);
  }

  // Dynamic product pages
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    productEntries = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug || product.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Error generating product sitemap entries:', e);
  }

  return [...staticPages, ...categoryEntries, ...productEntries];
}
