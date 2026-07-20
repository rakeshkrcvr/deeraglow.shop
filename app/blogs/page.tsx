"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function BlogsPage() {
  const blogs = [
    {
      title: "Why Wooden Wicks Crackle: The Science & Magic",
      excerpt: "Explore the fascinating process behind wooden wicks and why they burn slower and cleaner than traditional cotton wicks.",
      date: "June 28, 2026",
      readTime: "4 min read",
      slug: "wooden-wicks-science"
    },
    {
      title: "The Ultimate Guide to Soy Wax vs Paraffin",
      excerpt: "Learn why choosing 100% natural soy wax is healthier for your indoor air quality and how it extends the burn time of your candles.",
      date: "May 15, 2026",
      readTime: "6 min read",
      slug: "soy-wax-vs-paraffin"
    },
    {
      title: "How to Burn Your Candle Correctly (No Tunneling)",
      excerpt: "A simple list of burning tips to ensure your candles melt evenly every single time and double their shelf life.",
      date: "April 22, 2026",
      readTime: "3 min read",
      slug: "candle-care-guide"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#3E0030' }}>
      <Header />
      
      <main style={{ flexGrow: 1, padding: '100px 0', color: '#FAF8F5' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase' }}>
              The Journal
            </span>
            <h1 style={{ fontSize: '46px', fontWeight: '300', margin: '12px 0 20px 0', fontFamily: 'var(--font-serif)', color: '#FAF8F5' }}>
              Candle Rituals & Care
            </h1>
            <div style={{ width: '60px', height: '1.5px', backgroundColor: 'var(--accent)', margin: '0 auto' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {blogs.map((blog, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: 'rgba(62, 0, 48, 0.35)', 
                  backdropFilter: 'blur(16px)', 
                  border: '1px solid rgba(250, 248, 245, 0.08)',
                  padding: '36px',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent)', marginBottom: '12px' }}>
                  <span>{blog.date}</span>
                  <span>{blog.readTime}</span>
                </div>
                
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: '400', color: '#ffffff', marginBottom: '12px' }}>
                  {blog.title}
                </h2>
                
                <p style={{ fontSize: '14px', color: 'rgba(250, 248, 245, 0.65)', lineHeight: '1.6', marginBottom: '24px', fontWeight: '300' }}>
                  {blog.excerpt}
                </p>

                <Link 
                  href={`/blogs`}
                  onClick={() => alert("Blog reading functionality coming soon in the next release!")}
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    letterSpacing: '0.05em', 
                    textTransform: 'uppercase', 
                    color: 'var(--accent)',
                    borderBottom: '1px solid var(--accent)',
                    paddingBottom: '2px'
                  }}
                >
                  Read Article →
                </Link>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
