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
  eyebrow: 'DEEKSHA RITUALS',
  title: 'The Art of',
  italicTitle: 'Slow Burning',
  description: 'Ancestral scents mindfully crafted in small batches. Poured with 100% organic soy wax, pure botanical extracts, and wood wicks to ground your soul and illuminate your sanctuary.',
  primaryButtonText: 'Discover Our Rituals',
  primaryButtonHref: '#products',
  secondaryButtonText: 'Our Philosophy',
  secondaryButtonHref: '#story',
  floatingTag: 'Batch No. 042 / Sandalwood',
  sliderImages: '["/images/hero_candle.png"]'
};

const getHeroImages = (sliderImages?: string) => {
  if (!sliderImages) return ['/images/hero_candle.png'];
  try {
    const parsed = JSON.parse(sliderImages);
    if (Array.isArray(parsed)) {
      const validImages = parsed.filter((image): image is string => typeof image === 'string' && image.trim().length > 0);
      return validImages.length > 0 ? validImages : ['/images/hero_candle.png'];
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

  const heroImages = useMemo(() => {
    const images = getHeroImages(heroSettings.sliderImages);
    return images.length > 0 ? images : ['/images/hero_candle.png'];
  }, [heroSettings.sliderImages]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (heroImages.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveSlide(current => (current + 1) % heroImages.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [heroImages.length]);

  const activeImageIndex = heroImages.length > 0 ? activeSlide % heroImages.length : 0;

  const goToPreviousSlide = () => {
    setActiveSlide(current => (current - 1 + heroImages.length) % heroImages.length);
  };

  const goToNextSlide = () => {
    setActiveSlide(current => (current + 1) % heroImages.length);
  };

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroContainer}`}>
        
        {/* Left Column: Text & CTA */}
        <div className={styles.textContent}>
          <span className={styles.tagline}>{heroSettings.eyebrow}</span>
          <h1 className={styles.title}>
            {heroSettings.title} <br />
            <span className={styles.italicTitle}>{heroSettings.italicTitle}</span>
          </h1>
          <p className={styles.description}>
            {heroSettings.description}
          </p>
          
          <div className={styles.ctaGroup}>
            <a href={heroSettings.primaryButtonHref} className={styles.primaryBtn}>
              {heroSettings.primaryButtonText}
            </a>
            <a href={heroSettings.secondaryButtonHref} className={styles.secondaryBtn}>
              {heroSettings.secondaryButtonText}
            </a>
          </div>

          {/* Core Values / Features underneath */}
          <div className={styles.values}>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className={styles.valueText}>
                <h4>Pure Soy Wax</h4>
                <p>Biodegradable, slow clean burn</p>
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              </div>
              <div className={styles.valueText}>
                <h4>Therapeutic Scents</h4>
                <p>Pure botanical essential oils</p>
              </div>
            </div>

            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className={styles.valueText}>
                <h4>Cruelty-Free & Vegan</h4>
                <p>Consciously sourced in India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Image with Floating Pedestal styling */}
        <div className={styles.imageContent}>
          <div className={styles.imageWrapper}>
            <div className={styles.shadowOverlay}></div>
            {heroImages.map((image, index) => (
              <Image
                key={`${image}-${index}`}
                src={image}
                alt="Premium luxury hand-poured soy candle"
                width={600}
                height={600}
                priority={index === 0}
                className={`${styles.heroImg} ${index === activeImageIndex ? styles.heroImgActive : ''}`}
              />
            ))}
            {heroImages.length > 1 && (
              <>
                <button type="button" className={`${styles.sliderButton} ${styles.sliderButtonPrev}`} onClick={goToPreviousSlide} aria-label="Previous hero image">
                  ‹
                </button>
                <button type="button" className={`${styles.sliderButton} ${styles.sliderButtonNext}`} onClick={goToNextSlide} aria-label="Next hero image">
                  ›
                </button>
                <div className={styles.sliderDots} aria-label="Hero image slides">
                  {heroImages.map((image, index) => (
                    <button
                      key={`${image}-dot-${index}`}
                      type="button"
                      className={`${styles.sliderDot} ${index === activeImageIndex ? styles.sliderDotActive : ''}`}
                      onClick={() => setActiveSlide(index)}
                      aria-label={`Show hero image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Subtle overlay elements */}
          <div className={styles.floatingTag}>
            <span className={styles.goldDot}></span>
            <span>{heroSettings.floatingTag}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
