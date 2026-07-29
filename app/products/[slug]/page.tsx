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

  return {
    title: `${product.name} | Deera Glow Premium jewellery`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const products = await getProducts();

  let product = products.find(p => p.slug === slug || String(p.id) === slug || p.slug === `product-${slug}`);

  if (!product) {
    product = products.find(p =>
      p.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') === slug.toLowerCase()
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flexGrow: 1, backgroundColor: '#3e0030' }}>
        <ProductDetail product={product} allProducts={products} />
      </main>
      <Footer />
    </div>
  );
}
