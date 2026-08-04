import React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetail from '@/components/ProductDetail';
import { getProducts } from '@/lib/products';

// Products are edited from the admin dashboard, so never serve a build-time copy.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find(p => p.slug === slug || String(p.id) === slug);
  if (!product) return { title: 'Product Not Found | Deera Glow' };

  const canonicalUrl = `https://deeraglow.shop/product/${product.slug || product.id}`;
  const imageUrl = product.image_url.startsWith('http')
    ? product.image_url
    : `https://deeraglow.shop${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`;

  return {
    title: `${product.name} | Deera Glow Premium jewellery`,
    description: product.description || `Buy ${product.name} artificial jewellery online at best price in India from Deera Glow.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | Deera Glow`,
      description: product.description,
      url: canonicalUrl,
      siteName: "Deera Glow",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPageAlias({ params }: PageProps) {
  const { slug } = await params;
  const products = await getProducts();

  const product = products.find(p => p.slug === slug || String(p.id) === slug || p.slug === `product-${slug}`);

  const targetProduct = product || products.find(p =>
    p.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') === slug.toLowerCase()
  );

  if (!targetProduct) {
    notFound();
  }

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": targetProduct.name,
    "image": targetProduct.image_url.startsWith('http')
      ? [targetProduct.image_url]
      : [`https://deeraglow.shop${targetProduct.image_url.startsWith('/') ? '' : '/'}${targetProduct.image_url}`],
    "description": targetProduct.description,
    "sku": `DG-${targetProduct.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Deera Glow"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://deeraglow.shop/product/${targetProduct.slug || targetProduct.id}`,
      "priceCurrency": "INR",
      "price": targetProduct.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": (targetProduct.inventory != null && Number(targetProduct.inventory) <= 0)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": targetProduct.rating || 4.9,
      "reviewCount": targetProduct.reviews_count || 120
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Header />
      <main style={{ flexGrow: 1, backgroundColor: '#3e0030' }}>
        <ProductDetail product={targetProduct} allProducts={products} />
      </main>
      <Footer />
    </div>
  );
}
