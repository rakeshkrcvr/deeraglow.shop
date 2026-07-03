"use client";

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>D E E K S H A</span>
            <span className={styles.logoSub}>ARTISANAL ILLUMINATION</span>
          </Link>
          <p className={styles.bio}>
            Crafting multisensory experiences to bring peace and presence to modern dwellings. Hand-poured with natural ingredients.
          </p>
          <div className={styles.socials}>
            <a href="#" aria-label="Instagram" className={styles.socialLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4.75 4.75 0 1 1 12.63 8 4.75 4.75 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" aria-label="Facebook" className={styles.socialLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" aria-label="Pinterest" className={styles.socialLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 22a9 9 0 0 1-1.91-8.3C6.73 9.4 10.3 6 15 6a5 5 0 0 1 5 5 8 8 0 0 1-3.66 7.36A3.08 3.08 0 0 1 14 15.5c0-.62.34-1.2.66-1.76.66-1.16 1.34-2.34 1.34-3.74a4 4 0 0 0-8 0 3 3 0 0 0 .5 1.5c.24.4.15.8-.1 1.2-.5 1-1.2 2-1.2 3.3a3.5 3.5 0 0 0 1.5 2.8C9.5 20.2 9 21.2 8 22Z"/></svg>
            </a>
          </div>
        </div>

        {/* Shop by Collection */}
        <div className={styles.linksCol}>
          <h3>🕯️ Collection</h3>
          <ul>
            <li><Link href="/category/scented-candles">Scented Candles</Link></li>
            <li><Link href="/category/soy-wax-candles">Soy Wax Candles</Link></li>
            <li><Link href="/category/jar-candles">Jar Candles</Link></li>
            <li><Link href="/category/luxury-candles">Luxury Candles</Link></li>
            <li><Link href="/category/decorative-candles">Decorative Candles</Link></li>
            <li><Link href="/category/mini-candles">Mini Candles</Link></li>
            <li><Link href="/category/large-candles">Large Candles</Link></li>
            <li><Link href="/category/travel-candles">Travel Candles</Link></li>
          </ul>
        </div>

        {/* Shop by Fragrance */}
        <div className={styles.linksCol}>
          <h3>🌸 Fragrance</h3>
          <ul>
            <li><Link href="/category/vanilla">Vanilla</Link></li>
            <li><Link href="/category/lavender">Lavender</Link></li>
            <li><Link href="/category/rose">Rose</Link></li>
            <li><Link href="/category/jasmine">Jasmine</Link></li>
            <li><Link href="/category/sandalwood">Sandalwood</Link></li>
            <li><Link href="/category/coffee">Coffee</Link></li>
            <li><Link href="/category/citrus">Citrus</Link></li>
            <li><Link href="/category/ocean-breeze">Ocean Breeze</Link></li>
            <li><Link href="/category/oud">Oud</Link></li>
            <li><Link href="/category/mixed-fruits">Mixed Fruits</Link></li>
          </ul>
        </div>

        {/* Shop by Purpose */}
        <div className={styles.linksCol}>
          <h3>🏠 Purpose</h3>
          <ul>
            <li><Link href="/category/home-decor">Home Décor</Link></li>
            <li><Link href="/category/relaxation-spa">Relaxation & Spa</Link></li>
            <li><Link href="/category/meditation">Meditation</Link></li>
            <li><Link href="/category/yoga">Yoga</Link></li>
            <li><Link href="/category/bedroom">Bedroom</Link></li>
            <li><Link href="/category/living-room">Living Room</Link></li>
            <li><Link href="/category/bathroom">Bathroom</Link></li>
            <li><Link href="/category/office">Office</Link></li>
          </ul>
        </div>

        {/* Shop by Occasion */}
        <div className={styles.linksCol}>
          <h3>🎁 Occasion</h3>
          <ul>
            <li><Link href="/category/birthday">Birthday Gifts</Link></li>
            <li><Link href="/category/anniversary">Anniversary Gifts</Link></li>
            <li><Link href="/category/wedding">Wedding Gifts</Link></li>
            <li><Link href="/category/housewarming">Housewarming Gifts</Link></li>
            <li><Link href="/category/diwali">Diwali Collection</Link></li>
            <li><Link href="/category/christmas">Christmas Collection</Link></li>
            <li><Link href="/category/valentines">Valentine's Day</Link></li>
            <li><Link href="/category/mothers-day">Mother's Day</Link></li>
          </ul>
        </div>

        {/* Premium Collection */}
        <div className={styles.linksCol}>
          <h3>💎 Premium</h3>
          <ul>
            <li><Link href="/category/best-sellers">Best Sellers</Link></li>
            <li><Link href="/category/new-arrivals">New Arrivals</Link></li>
            <li><Link href="/category/limited-edition">Limited Edition</Link></li>
            <li><Link href="/category/luxury-collection">Luxury Collection</Link></li>
            <li><Link href="/category/gift-sets">Gift Sets</Link></li>
            <li><Link href="/category/combo-packs">Combo Packs</Link></li>
          </ul>
        </div>

        {/* Shop by Price */}
        <div className={styles.linksCol}>
          <h3>💰 Price</h3>
          <ul>
            <li><Link href="/category/under-299">Under ₹299</Link></li>
            <li><Link href="/category/300-499">₹300–₹499</Link></li>
            <li><Link href="/category/500-999">₹500–₹999</Link></li>
            <li><Link href="/category/above-999">Above ₹999</Link></li>
          </ul>
        </div>

        {/* Shop by Wax Type */}
        <div className={styles.linksCol}>
          <h3>🌿 Wax Type</h3>
          <ul>
            <li><Link href="/category/soy-wax">Soy Wax</Link></li>
            <li><Link href="/category/beeswax">Beeswax</Link></li>
            <li><Link href="/category/coconut-wax">Coconut Wax</Link></li>
            <li><Link href="/category/paraffin-wax">Paraffin Wax</Link></li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className={styles.footerBottom}>
        <div className={`container ${styles.bottomContainer}`}>
          <p>© {new Date().getFullYear()} Deeksha Candles. All rights reserved.</p>
          <div className={styles.handcrafted}>
            <span>Handpoured with devotion in India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
