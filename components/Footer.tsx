"use client";

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const [footerLogoUrl, setFooterLogoUrl] = React.useState('');

  React.useEffect(() => {
    const fetchLogoSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        if (!res.ok) return;

        const settings = await res.json();
        if (typeof settings.logoFooterUrl === 'string') {
          setFooterLogoUrl(settings.logoFooterUrl);
        }
      } catch (err) {
        console.error('Error loading footer logo:', err);
      }
    };

    fetchLogoSettings();
  }, []);

  const normalizeAssetUrl = (url: string) => {
    if (!url) return '';

    try {
      const parsedUrl = new URL(url);
      const currentHostname = typeof window === 'undefined' ? '' : window.location.hostname;
      if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === currentHostname) {
        return `${parsedUrl.pathname}${parsedUrl.search}`;
      }
    } catch {
      return url;
    }

    return url;
  };

  const normalizedFooterLogoUrl = normalizeAssetUrl(footerLogoUrl);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logo}>
            {normalizedFooterLogoUrl ? (
              <img src={normalizedFooterLogoUrl} alt="Deera Glow" className={styles.logoImage} />
            ) : (
              <>
                <span className={styles.logoText}>D E E R A  G L O W</span>
                <span className={styles.logoSub}>PREMIUM ARTIFICIAL JEWELRY</span>
              </>
            )}
          </Link>
          <p className={styles.bio}>
            Discover the latest collection of premium artificial jewelry at Deera Glow. Shop stylish earrings, necklaces, rings, bracelets, and fashion accessories.
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
          <h3>💍 Collection</h3>
          <ul>
            <li><Link href="/category/rings">Rings</Link></li>
            <li><Link href="/category/bracelets">Bracelets</Link></li>
            <li><Link href="/category/necklaces">Necklaces</Link></li>
            <li><Link href="/category/earrings">Earrings</Link></li>
            <li><Link href="/category/charms">Charms & Pendants</Link></li>
            <li><Link href="/category/bangles">Bangles</Link></li>
            <li><Link href="/category/anklets">Anklets</Link></li>
          </ul>
        </div>

        {/* Shop by Material */}
        <div className={styles.linksCol}>
          <h3>✨ Material</h3>
          <ul>
            <li><Link href="/category/sterling-silver">Sterling Silver</Link></li>
            <li><Link href="/category/gold-plated">Gold Plated</Link></li>
            <li><Link href="/category/rose-gold">Rose Gold Plated</Link></li>
            <li><Link href="/category/pearls">Pearl Jewelry</Link></li>
            <li><Link href="/category/cubic-zirconia">Cubic Zirconia</Link></li>
            <li><Link href="/category/solitaire">Solitaire</Link></li>
          </ul>
        </div>

        {/* Shop by Style & Occasion */}
        <div className={styles.linksCol}>
          <h3>💝 Style & Occasion</h3>
          <ul>
            <li><Link href="/category/daily-wear">Daily Wear</Link></li>
            <li><Link href="/category/office-wear">Office Wear</Link></li>
            <li><Link href="/category/festive-wear">Festive Wear</Link></li>
            <li><Link href="/category/party-wear">Party Wear</Link></li>
            <li><Link href="/category/wedding-jewelry">Wedding Jewelry</Link></li>
            <li><Link href="/category/anniversary-gifts">Anniversary Gifts</Link></li>
          </ul>
        </div>

        {/* Shop by Gifts */}
        <div className={styles.linksCol}>
          <h3>🎁 Gifts</h3>
          <ul>
            <li><Link href="/category/gifts-for-her">Gifts for Her</Link></li>
            <li><Link href="/category/gift-sets">Gift Sets</Link></li>
            <li><Link href="/category/couple-rings">Couple Rings</Link></li>
            <li><Link href="/category/birthday-gifts">Birthday Gifts</Link></li>
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
            <li><Link href="/category/combo-packs">Combo Packs</Link></li>
          </ul>
        </div>

        {/* Shop by Price */}
        <div className={styles.linksCol}>
          <h3>💰 Price</h3>
          <ul>
            <li><Link href="/category/under-499">Under ₹499</Link></li>
            <li><Link href="/category/500-999">₹500–₹999</Link></li>
            <li><Link href="/category/1000-1999">₹1,000–₹1,999</Link></li>
            <li><Link href="/category/above-2000">Above ₹2,000</Link></li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className={styles.footerBottom}>
        <div className={`container ${styles.bottomContainer}`}>
          <p>© {new Date().getFullYear()} Deera Glow. All rights reserved.</p>
          <div className={styles.handcrafted}>
            <span>Handcrafted with love in India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
