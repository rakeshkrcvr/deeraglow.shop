import React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetail from '@/components/ProductDetail';
import { getProducts } from '@/lib/products';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const products = await getProducts();
  
  const product = products.find(p => p.slug === slug);
  
  if (!product) {
    notFound();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flexGrow: 1, backgroundColor: '#3E0030' }}>
        <ProductDetail product={product} allProducts={products} />
      </main>
      <Footer />
    </div>
  );
}
