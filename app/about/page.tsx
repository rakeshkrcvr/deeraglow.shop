import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0b1a11' }}>
      <Header />
      
      <main style={{ flexGrow: 1, padding: '100px 0', color: '#FAF8F5' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase' }}>
              Our Story
            </span>
            <h1 style={{ fontSize: '46px', fontWeight: '300', margin: '12px 0 20px 0', fontFamily: 'var(--font-serif)' }}>
              Crafted for Consciousness
            </h1>
            <div style={{ width: '60px', height: '1.5px', backgroundColor: 'var(--accent)', margin: '0 auto' }}></div>
          </div>

          <div style={{ 
            background: 'rgba(25, 48, 36, 0.35)', 
            backdropFilter: 'blur(16px)', 
            border: '1px solid rgba(250, 248, 245, 0.08)',
            padding: '48px',
            borderRadius: '24px',
            fontSize: '16px',
            lineHeight: '1.8',
            color: 'rgba(250, 248, 245, 0.8)',
            fontWeight: '300'
          }}>
            <p style={{ marginBottom: '24px' }}>
              Welcome to <strong>Deeksha Candles</strong>. Our journey began in our small home studio, inspired by a desire to create clean-burning candles that evoke quiet mindfulness, deep focus, and relaxation.
            </p>
            
            <p style={{ marginBottom: '24px' }}>
              Unlike mass-produced commercial alternatives, each Deeksha candle is hand-poured in small batches of 40 using 100% natural soy wax, premium botanical fragrance oils, and crackling wooden wicks.
            </p>

            <blockquote style={{ 
              borderLeft: '2px solid var(--accent)', 
              paddingLeft: '20px', 
              margin: '32px 0', 
              fontStyle: 'italic',
              color: '#ffffff',
              fontSize: '18px'
            }}>
              "We believe that a candle is not just a source of light, but a silent companion to your daily rituals, meditation, and quiet reflections."
            </blockquote>

            <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: '400', marginTop: '40px', marginBottom: '16px' }}>
              Our Sourcing Standards
            </h3>
            <p style={{ marginBottom: '24px' }}>
              We carefully source our ingredients from eco-responsible partners:
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '32px', listStyleType: 'circle', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>100% Pure Soy Wax:</strong> Biodegradable, clean-burning, and free of petroleum paraffin.</li>
              <li><strong>Wooden Wicks:</strong> Sustainably sourced FSC-certified wicks that crackle like a mini fireplace.</li>
              <li><strong>Premium Oils:</strong> Phthalate-free and paraben-free fragrance extracts.</li>
            </ul>

            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--accent)', margin: '0' }}>
                Handpoured with devotion in India.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
