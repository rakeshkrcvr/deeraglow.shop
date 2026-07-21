"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ImageBanner.module.css';

interface ImageBannerProps {
  imageUrl?: string;
  linkHref?: string;
}

export default function ImageBanner({ 
  imageUrl, 
  linkHref = '/category/necklaces' 
}: ImageBannerProps) {
  const finalImage = imageUrl || '/images/category_banner_jewelry.png';

  const content = (
    <div className={styles.bannerWrapper}>
      <Image
        src={finalImage}
        alt="Collection Banner"
        fill
        sizes="(max-width: 1200px) 100vw, 1200px"
        className={styles.image}
        priority
      />
    </div>
  );

  return (
    <section className={styles.section} id="promo-banner">
      <div className="container">
        {linkHref ? (
          <Link href={linkHref} style={{ display: 'block', textDecoration: 'none' }}>
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </section>
  );
}
