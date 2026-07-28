"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

export interface HeroSlide {
  image: string;
  mobileImage?: string;
  showText?: boolean;
  showMobileText?: boolean;
  eyebrow?: string;
  title?: string;
  description?: string;
  btnText?: string;
  btnHref?: string;
  mobileEyebrow?: string;
  mobileTitle?: string;
  mobileDescription?: string;
  mobileBtnText?: string;
  mobileBtnHref?: string;
}

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
  description: 'Discover exquisite jewellery that celebrates your unique style and every special moment.',
  primaryButtonText: 'Shop Collection',
  primaryButtonHref: '#shop-by-collection',
  secondaryButtonText: 'New Arrivals',
  secondaryButtonHref: '#products',
  floatingTag: '925 Sterling Silver',
  sliderImages: '["/images/hero_slide_1.png", "/images/hero_slide_2.png", "/images/hero_slide_3.png"]'
};

const getValidLink = (href?: string, fallback: string = '/collections'): string => {
  if (!href || !href.trim() || href === '#' || href === '#products' || href === '#shop-by-collection') {
    return fallback;
  }
  return href.trim();
};

const defaultSlides: HeroSlide[] = [
  {
    image: '/images/hero_slide_1.png',
    mobileImage: '',
    showText: true,
    showMobileText: true,
    eyebrow: 'TIMELESS BEAUTY',
    title: 'Shine Brighter Every Day',
    description: 'Discover exquisite jewellery that celebrates your unique style and every special moment.',
    btnText: 'Shop Collection',
    btnHref: '/collections'
  },
  {
    image: '/images/hero_slide_2.png',
    mobileImage: '',
    showText: true,
    showMobileText: true,
    eyebrow: 'LUXURY CRAFTSMANSHIP',
    title: 'Elegance in Every Detail',
    description: 'Adorn yourself with masterfully crafted necklaces, bracelets, and charms made to last.',
    btnText: 'Explore New Arrivals',
    btnHref: '/collections'
  },
  {
    image: '/images/hero_slide_3.png',
    mobileImage: '',
    showText: true,
    showMobileText: true,
    eyebrow: 'THE GOLDEN HOUR',
    title: 'Modern Classics',
    description: 'Find the perfect signature pieces that seamlessly transitions from day to night.',
    btnText: 'Shop Best Sellers',
    btnHref: '/collections'
  }
];

const parseHeroSlides = (sliderImages?: string, heroSettings?: HeroSettings): HeroSlide[] => {
  if (!sliderImages) return defaultSlides;
  try {
    const parsed = JSON.parse(sliderImages);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, index) => {
        if (typeof item === 'string') {
          const defaultMatch = defaultSlides.find(s => s.image === item);
          if (defaultMatch) return defaultMatch;
          return {
            image: item,
            mobileImage: '',
            showText: true,
            showMobileText: true,
            eyebrow: heroSettings?.eyebrow || 'TIMELESS BEAUTY',
            title: `${heroSettings?.title || 'Shine Brighter'} ${heroSettings?.italicTitle || ''}`.trim(),
            description: heroSettings?.description || '',
            btnText: heroSettings?.primaryButtonText || 'Shop Collection',
            btnHref: getValidLink(heroSettings?.primaryButtonHref, '/collections')
          };
        }
        return {
          image: item.image || '/images/hero_slide_1.png',
          mobileImage: item.mobileImage || '',
          showText: item.showText !== undefined ? Boolean(item.showText) : true,
          showMobileText: item.showMobileText !== undefined ? Boolean(item.showMobileText) : true,
          eyebrow: item.eyebrow ?? '',
          title: item.title ?? '',
          description: item.description ?? '',
          btnText: item.btnText ?? '',
          btnHref: getValidLink(item.btnHref, '/collections'),
          mobileEyebrow: item.mobileEyebrow ?? '',
          mobileTitle: item.mobileTitle ?? '',
          mobileDescription: item.mobileDescription ?? '',
          mobileBtnText: item.mobileBtnText ?? '',
          mobileBtnHref: getValidLink(item.mobileBtnHref, getValidLink(item.btnHref, '/collections'))
        };
      });
    }
  } catch { }

  return defaultSlides;
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
    setHeroSettings({
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
  }, [eyebrow, title, italicTitle, description, primaryButtonText, primaryButtonHref, secondaryButtonText, secondaryButtonHref, floatingTag, sliderImages]);

  useEffect(() => {
    let isCancelled = false;

    const fetchLatestHeroSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        if (!res.ok) return;

        const settings = await res.json() as Partial<Record<string, string>>;
        if (isCancelled) return;

        setHeroSettings((current) => ({
          eyebrow: settings.heroEyebrow ?? current.eyebrow,
          title: settings.heroTitle ?? current.title,
          italicTitle: settings.heroItalicTitle ?? current.italicTitle,
          description: settings.heroDescription ?? current.description,
          primaryButtonText: settings.heroPrimaryButtonText ?? current.primaryButtonText,
          primaryButtonHref: settings.heroPrimaryButtonHref ?? current.primaryButtonHref,
          secondaryButtonText: settings.heroSecondaryButtonText ?? current.secondaryButtonText,
          secondaryButtonHref: settings.heroSecondaryButtonHref ?? current.secondaryButtonHref,
          floatingTag: settings.heroFloatingTag ?? current.floatingTag,
          sliderImages: settings.heroSliderImages ?? current.sliderImages
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
    return parseHeroSlides(heroSettings.sliderImages, heroSettings);
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
        {slides.map((slide, index) => {
          const hasMobileImg = Boolean(slide.mobileImage && slide.mobileImage.trim());

          const hasDesktopText = slide.showText !== false && Boolean(
            (slide.eyebrow && slide.eyebrow.trim()) ||
            (slide.title && slide.title.trim()) ||
            (slide.description && slide.description.trim()) ||
            (slide.btnText && slide.btnText.trim())
          );

          const hasMobileText = slide.showMobileText !== false && (slide.showText !== false) && Boolean(
            (slide.mobileEyebrow && slide.mobileEyebrow.trim()) ||
            (slide.mobileTitle && slide.mobileTitle.trim()) ||
            (slide.mobileDescription && slide.mobileDescription.trim()) ||
            (slide.mobileBtnText && slide.mobileBtnText.trim()) ||
            hasDesktopText
          );

          const desktopLink = getValidLink(slide.btnHref, '/collections');
          const mobileLink = getValidLink(slide.mobileBtnHref, desktopLink);

          const handleBannerClick = () => {
            if (typeof window === 'undefined') return;
            const isMobile = window.innerWidth <= 768;
            const targetLink = isMobile ? mobileLink : desktopLink;
            if (targetLink) {
              window.location.href = targetLink;
            }
          };

          return (
            <div
              key={`${slide.image}-${index}`}
              className={`${styles.slide} ${index === activeSlide ? styles.slideActive : ''}`}
            >
              <div
                onClick={handleBannerClick}
                className={`${styles.imageWrapper} ${hasMobileImg ? styles.hasMobileImg : ''}`}
              >
                {/* Desktop Image */}
                <Image
                  src={slide.image}
                  alt={slide.title || 'Hero Slide'}
                  fill
                  priority={index === 0}
                  className={`${styles.heroImg} ${hasMobileImg ? styles.desktopImg : ''}`}
                  sizes="100vw"
                />

                {/* Mobile Image */}
                {hasMobileImg && (
                  <Image
                    src={slide.mobileImage!}
                    alt={slide.mobileTitle || slide.title || 'Hero Mobile Slide'}
                    fill
                    priority={index === 0}
                    className={`${styles.heroImg} ${styles.mobileImg}`}
                    sizes="100vw"
                  />
                )}

                <div className={`
                  ${styles.overlay}
                  ${!hasDesktopText ? styles.noOverlayDesktop : ''}
                  ${!hasMobileText ? styles.noOverlayMobile : ''}
                `}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Content Overlay */}
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.textContent}>
          {slides.map((slide, index) => {
            const showDesktop = slide.showText !== false;
            const showMobile = slide.showMobileText !== false && showDesktop;

            // If text is hidden on both desktop and mobile
            if (!showDesktop && !showMobile) return null;

            const eyebrowText = slide.eyebrow;
            const mobileEyebrowText = slide.mobileEyebrow || eyebrowText;
            const titleText = slide.title;
            const mobileTitleText = slide.mobileTitle || titleText;
            const descText = slide.description;
            const mobileDescText = slide.mobileDescription || descText;
            const btnText = slide.btnText;
            const mobileBtnText = slide.mobileBtnText || btnText;

            const desktopHref = getValidLink(slide.btnHref, '/collections');
            const mobileHref = getValidLink(slide.mobileBtnHref, desktopHref);

            return (
              <div
                key={`content-${index}`}
                className={`
                  ${styles.contentItem} 
                  ${index === activeSlide ? styles.contentItemActive : ''}
                  ${!showDesktop ? styles.hideTextDesktop : ''}
                  ${!showMobile ? styles.hideTextMobile : ''}
                `}
              >
                {/* Eyebrow */}
                {(eyebrowText || slide.mobileEyebrow) && (
                  <span className={styles.tagline}>
                    {slide.mobileEyebrow ? (
                      <>
                        <span className={styles.desktopOnly}>{eyebrowText}</span>
                        <span className={styles.mobileOnly}>{mobileEyebrowText}</span>
                      </>
                    ) : (
                      eyebrowText
                    )}
                  </span>
                )}

                {/* Title */}
                {(titleText || slide.mobileTitle) && (
                  <h1 className={styles.title}>
                    {slide.mobileTitle ? (
                      <>
                        <span className={styles.desktopOnly}>{titleText}</span>
                        <span className={styles.mobileOnly}>{mobileTitleText}</span>
                      </>
                    ) : (
                      titleText
                    )}
                  </h1>
                )}

                {/* Description */}
                {(descText || slide.mobileDescription) && (
                  <p className={styles.description}>
                    {slide.mobileDescription ? (
                      <>
                        <span className={styles.desktopOnly}>{descText}</span>
                        <span className={styles.mobileOnly}>{mobileDescText}</span>
                      </>
                    ) : (
                      descText
                    )}
                  </p>
                )}

                {/* CTA Button */}
                {(btnText || slide.mobileBtnText) && (
                  <div className={styles.ctaGroup}>
                    {slide.mobileBtnHref ? (
                      <>
                        <a href={desktopHref} className={`${styles.primaryBtn} ${styles.desktopOnly}`}>
                          {btnText} <span className={styles.arrow}>→</span>
                        </a>
                        <a href={mobileHref} className={`${styles.primaryBtn} ${styles.mobileOnly}`}>
                          {mobileBtnText} <span className={styles.arrow}>→</span>
                        </a>
                      </>
                    ) : (
                      <a href={desktopHref} className={styles.primaryBtn}>
                        {slide.mobileBtnText ? (
                          <>
                            <span className={styles.desktopOnly}>{btnText}</span>
                            <span className={styles.mobileOnly}>{mobileBtnText}</span>
                          </>
                        ) : (
                          btnText
                        )}
                        <span className={styles.arrow}>→</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
