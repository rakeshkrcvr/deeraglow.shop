"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

interface HeroProps {
  eyebrow?: string;
  title?: string;
  italicTitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  floatingTag?: string;
  sliderImages?: string;
}

type HeroSettings = Required<HeroProps>;

const defaultHeroSettings: HeroSettings = {
  eyebrow: 'TIMELESS BEAUTY',
  title: 'Shine Brighter',
  italicTitle: 'Every Day',
  description: 'Discover handcrafted jewelry that celebrates your unique style and every special moment.',
  primaryButtonText: 'Shop Collection',
  primaryButtonHref: '#shop-by-collection',
  secondaryButtonText: 'New Arrivals',
  secondaryButtonHref: '#products',
  floatingTag: '925 Sterling Silver',
  sliderImages: '["/images/hero_slide_1.png", "/images/hero_slide_2.png", "/images/hero_slide_3.png"]'
};

const getHeroImages = (sliderImages?: string) => {
  if (!sliderImages) return ['/images/hero_slide_1.png', '/images/hero_slide_2.png', '/images/hero_slide_3.png'];
  try {
    const parsed = JSON.parse(sliderImages);
    if (Array.isArray(parsed)) {
      const validImages = parsed.filter((image): image is string => typeof image === 'string' && image.trim().length > 0);
      return validImages.length > 0 ? validImages : ['/images/hero_slide_1.png', '/images/hero_slide_2.png', '/images/hero_slide_3.png'];
    }
  } catch {}

  return sliderImages
    .split(',')
    .map(image => image.trim())
    .filter(Boolean);
};

export default function Hero({
  eyebrow = defaultHeroSettings.eyebrow,
  title = defaultHeroSettings.title,
  italicTitle = defaultHeroSettings.italicTitle,
  description = defaultHeroSettings.description,
  primaryButtonText = defaultHeroSettings.primaryButtonText,
  primaryButtonHref = defaultHeroSettings.primaryButtonHref,
  secondaryButtonText = defaultHeroSettings.secondaryButtonText,
  secondaryButtonHref = defaultHeroSettings.secondaryButtonHref,
  floatingTag = defaultHeroSettings.floatingTag,
  sliderImages = defaultHeroSettings.sliderImages
}: HeroProps) {
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    eyebrow,
    title,
    italicTitle,
    description,
    primaryButtonText,
    primaryButtonHref,
    secondaryButtonText,
    secondaryButtonHref,
    floatingTag,
    sliderImages
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchLatestHeroSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        if (!res.ok) return;

        const settings = await res.json() as Partial<Record<string, string>>;
        if (isCancelled) return;

        setHeroSettings((current) => ({
          eyebrow: settings.heroEyebrow || current.eyebrow,
          title: settings.heroTitle || current.title,
          italicTitle: settings.heroItalicTitle || current.italicTitle,
          description: settings.heroDescription || current.description,
          primaryButtonText: settings.heroPrimaryButtonText || current.primaryButtonText,
          primaryButtonHref: settings.heroPrimaryButtonHref || current.primaryButtonHref,
          secondaryButtonText: settings.heroSecondaryButtonText || current.secondaryButtonText,
          secondaryButtonHref: settings.heroSecondaryButtonHref || current.secondaryButtonHref,
          floatingTag: settings.heroFloatingTag || current.floatingTag,
          sliderImages: settings.heroSliderImages || current.sliderImages
        }));
      } catch (err) {
        console.error('Error loading live hero settings:', err);
      }
    };

    fetchLatestHeroSettings();

    return () => {
      isCancelled = true;
    };
  }, []);

  const slides = useMemo(() => {
    const images = getHeroImages(heroSettings.sliderImages);
    
    const defaultSlides = [
      {
        eyebrow: 'TIMELESS BEAUTY',
        title: 'Shine Brighter Every Day',
        description: 'Discover handcrafted jewelry that celebrates your unique style and every special moment.',
        btnText: 'Shop Collection',
        btnHref: '#shop-by-collection',
        image: '/images/hero_slide_1.png'
      },
      {
        eyebrow: 'LUXURY CRAFTSMANSHIP',
        title: 'Elegance in Every Detail',
        description: 'Adorn yourself with masterfully crafted necklaces, bracelets, and charms made to last.',
        btnText: 'Explore New Arrivals',
        btnHref: '/category/new-arrivals',
        image: '/images/hero_slide_2.png'
      },
      {
        eyebrow: 'THE GOLDEN HOUR',
        title: 'Modern Classics',
        description: 'Find the perfect signature pieces that seamlessly transitions from day to night.',
        btnText: 'Shop Best Sellers',
        btnHref: '/category/best-sellers',
        image: '/images/hero_slide_3.png'
      }
    ];

    // If matches default length, map them to default slides
    if (images.length === 3 && images.includes('/images/hero_slide_1.png')) {
      return defaultSlides;
    }

    return images.map((image, index) => {
      const match = defaultSlides.find(s => s.image === image);
      if (match) return match;

      return {
        eyebrow: heroSettings.eyebrow,
        title: `${heroSettings.title} ${heroSettings.italicTitle}`,
        description: heroSettings.description,
        btnText: heroSettings.primaryButtonText,
        btnHref: heroSettings.primaryButtonHref,
        image
      };
    });
  }, [heroSettings]);

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveSlide(current => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  return (
    <section className={styles.hero}>
      {/* Background Slides */}
      <div className={styles.sliderContainer}>
        {slides.map((slide, index) => (
          <div
            key={`${slide.image}-${index}`}
            className={`${styles.slide} ${index === activeSlide ? styles.slideActive : ''}`}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className={styles.heroImg}
                sizes="100vw"
              />
              <div className={styles.overlay}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Content Overlay */}
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.textContent}>
          {slides.map((slide, index) => (
            <div
              key={`content-${index}`}
              className={`${styles.contentItem} ${index === activeSlide ? styles.contentItemActive : ''}`}
            >
              <span className={styles.tagline}>{slide.eyebrow}</span>
              <h1 className={styles.title}>
                {slide.title}
              </h1>
              <p className={styles.description}>
                {slide.description}
              </p>
              
              <div className={styles.ctaGroup}>
                <a href={slide.btnHref} className={styles.primaryBtn}>
                  {slide.btnText} <span className={styles.arrow}>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Center Slide Pagination Dots */}
      {slides.length > 1 && (
        <div className={styles.sliderDots} aria-label="Hero slides">
          {slides.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              className={`${styles.sliderDot} ${index === activeSlide ? styles.sliderDotActive : ''}`}
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
