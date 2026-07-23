"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#3e0030' }}>
      <Header />

      <main style={{ flexGrow: 1, padding: '100px 0', color: '#FAF8F5' }}>
        <div className="container" style={{ maxWidth: '800px' }}>

          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase' }}>
              Connect With Us
            </span>
            <h1 style={{ fontSize: '46px', fontWeight: '300', margin: '12px 0 20px 0', fontFamily: 'var(--font-serif)', color: '#FAF8F5' }}>
              Get in Touch
            </h1>
            <div style={{ width: '60px', height: '1.5px', backgroundColor: 'var(--accent)', margin: '0 auto' }}></div>
          </div>

          <div style={{
            background: 'rgba(62, 0, 48, 0.35)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(250, 248, 245, 0.08)',
            padding: '48px',
            borderRadius: '24px',
            fontSize: '15px',
            lineHeight: '1.8',
            color: 'rgba(250, 248, 245, 0.8)',
            fontWeight: '300'
          }}>
            <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '16px' }}>
              Have questions about our collections, jewelry craftsmanship, or partnership inquiries? Send us a message and we&apos;ll reply within 24 hours.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
              <div>
                <h3 style={{ color: 'var(--accent)', fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  📞 Customer Care
                </h3>
                <p style={{ color: '#ffffff', margin: 0 }}>+91 99714 59984</p>
                <p style={{ margin: 0 }}>Mon – Sat, 10:00 AM – 7:00 PM</p>
              </div>

              <div>
                <h3 style={{ color: 'var(--accent)', fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  ✉️ Email Us
                </h3>
                <p style={{ color: '#ffffff', margin: 0 }}>deeraglowshop@gmail.com</p>
                <p style={{ margin: 0 }}>General & Wholesale Inquiries</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(250, 248, 245, 0.05)', paddingTop: '40px' }}>
              <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '500', marginBottom: '20px', fontFamily: 'var(--font-serif)' }}>
                Send a Message
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Message sent successfully! We will contact you soon.");
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    style={{
                      background: 'rgba(250, 248, 245, 0.04)',
                      border: '1px solid rgba(250, 248, 245, 0.1)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    style={{
                      background: 'rgba(250, 248, 245, 0.04)',
                      border: '1px solid rgba(250, 248, 245, 0.1)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <textarea
                  placeholder="Your Message"
                  rows={5}
                  required
                  style={{
                    background: 'rgba(250, 248, 245, 0.04)',
                    border: '1px solid rgba(250, 248, 245, 0.1)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#ffffff',
                    fontSize: '14px',
                    resize: 'none'
                  }}
                ></textarea>

                <button
                  type="submit"
                  style={{
                    background: 'var(--accent)',
                    color: '#3e0030',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px 28px',
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    alignSelf: 'flex-start'
                  }}
                >
                  Send Message
                </button>
              </form>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
