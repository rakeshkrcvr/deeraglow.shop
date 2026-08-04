"use client";

import React, { useState } from 'react';
import styles from './BeforeAfterComparison.module.css';

interface BeforeAfterComparisonProps {
  beforeAfterImage?: string;
}

export default function BeforeAfterComparison({ beforeAfterImage }: BeforeAfterComparisonProps) {
  const beforeAfterImg = beforeAfterImage || "https://www.deeraglow.shop/api/media/1785230756833-5ea86cd4-49f2-4af1-bdbe-81ebcc3460cc-afterbefore.png";
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  return (
    <section className={styles.comparisonSection} id="before-after-comparison">
      <div className="container">

        <div className={styles.storyHeader}>
          <span className={styles.storySubtitle}>EXPERIENCE THE DIFFERENCE</span>
          <h2 className={styles.storyTitle}>Before vs After Deera Glow</h2>
          <div className={styles.storyLine}></div>
          <p className={styles.comparisonSubTitle}>A small change that transforms your whole look & confidence.</p>
        </div>

        <div className={styles.comparisonContainer}>
          <div className={styles.comparisonSliderGrid}>

            {/* Left Side: Before Text list */}
            <div className={styles.beforeTextCol}>
              <div className={styles.columnHeader}>
                <span className={styles.beforeBadge}>BEFORE</span>
                <h3>Ordinary Life</h3>
                <p className={styles.colSub}>Dull. Plain. Uninspired.</p>
              </div>
              <ul className={styles.featuresList}>
                <li>
                  <span className={styles.featureEmoji}>🙁</span>
                  <div>
                    <strong>Dull & Plain Outfits</strong>
                    <p>Regular daily wear feels incomplete</p>
                  </div>
                </li>
                <li>
                  <span className={styles.featureEmoji}>💍</span>
                  <div>
                    <strong>Uninspired Styling</strong>
                    <p>Struggling to find the right signature piece</p>
                  </div>
                </li>
                <li>
                  <span className={styles.featureEmoji}>💫</span>
                  <div>
                    <strong>Fading & Tarnishing</strong>
                    <p>Cheap jewellery tarnishes after a few wears</p>
                  </div>
                </li>
                <li>
                  <span className={styles.featureEmoji}>🍃</span>
                  <div>
                    <strong>Skin Irritations</strong>
                    <p>Nickel-heavy accessories cause redness</p>
                  </div>
                </li>
                <li>
                  <span className={styles.featureEmoji}>😔</span>
                  <div>
                    <strong>Lack of Confidence</strong>
                    <p>Lacking that final elegant touch to stand out</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Center: Interactive Before/After Image Slider */}
            <div className={styles.sliderCenterCol}>
              <div className={styles.imageSlider}>
                {/* Before (desaturated) */}
                <div className={styles.beforeImageContainer}>
                  <img
                    src={beforeAfterImg}
                    alt="Dull Ordinary Look"
                    className={styles.sliderImg}
                    style={{ filter: 'grayscale(100%) contrast(90%) brightness(80%)' }}
                  />
                  <div className={styles.imageLabelLeft}>PLAIN LOOK</div>
                </div>

                {/* After (warm glow) */}
                <div
                  className={styles.afterImageContainer}
                  style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                >
                  <img
                    src={beforeAfterImg}
                    alt="Vibrant Deera Glow Look"
                    className={styles.sliderImg}
                  />
                  <div className={styles.imageLabelRight}>DEERA GLOW</div>
                </div>

                {/* Drag Line divider */}
                <div
                  className={styles.sliderLine}
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className={styles.sliderHandle}>
                    <span className={styles.sliderHandleArrow}>↔</span>
                  </div>
                </div>

                {/* Range input Overlay */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(parseInt(e.target.value, 10))}
                  className={styles.rangeInput}
                  aria-label="Image comparison slider"
                />
              </div>
            </div>

            {/* Right Side: After Text list */}
            <div className={styles.afterTextCol}>
              <div className={styles.columnHeader}>
                <span className={styles.afterBadge}>AFTER</span>
                <h3>Deera Glow Moments</h3>
                <p className={styles.colSub}>Elegant. Shining. Beautiful.</p>
              </div>
              <ul className={styles.featuresList}>
                <li>
                  <span className={styles.featureEmoji}>😊</span>
                  <div>
                    <strong>Stunning Signature Look</strong>
                    <p>Instantly feel complete, styled & graceful</p>
                  </div>
                </li>
                <li>
                  <span className={styles.featureEmoji}>✨</span>
                  <div>
                    <strong>Compliment Magnet</strong>
                    <p>Beautiful intricate details that turn heads</p>
                  </div>
                </li>
                <li>
                  <span className={styles.featureEmoji}>🛡️</span>
                  <div>
                    <strong>Anti-Tarnish Polish</strong>
                    <p>Stays bright with long-lasting protective coating</p>
                  </div>
                </li>
                <li>
                  <span className={styles.featureEmoji}>🍃</span>
                  <div>
                    <strong>Skin-Friendly Comfort</strong>
                    <p>Hypoallergenic, lead-free & nickel-free silver base</p>
                  </div>
                </li>
                <li>
                  <span className={styles.featureEmoji}>👑</span>
                  <div>
                    <strong>Boosted Confidence</strong>
                    <p>Stand out and command attention in any room</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Row: Why Thousands Choose Deera Glow */}
          <div className={styles.chooseSection}>
            <h3 className={styles.chooseTitle}>Why Thousands Choose Deera Glow</h3>
            <div className={styles.chooseGrid}>
              <div className={styles.chooseCard}>
                <span className={styles.chooseIcon}>🏅</span>
                <div>
                  <h4>Premium Quality</h4>
                  <p>Finest metals & stones for daily wear</p>
                </div>
              </div>
              <div className={styles.chooseCard}>
                <span className={styles.chooseIcon}>🛡️</span>
                <div>
                  <h4>Anti-Tarnish Polish</h4>
                  <p>Long lasting shine & protection</p>
                </div>
              </div>
              <div className={styles.chooseCard}>
                <span className={styles.chooseIcon}>🍃</span>
                <div>
                  <h4>Skin Friendly</h4>
                  <p>Nickel-free, lead-free & hypoallergenic</p>
                </div>
              </div>
              <div className={styles.chooseCard}>
                <span className={styles.chooseIcon}>🎁</span>
                <div>
                  <h4>Luxury Packaging</h4>
                  <p>Perfect for gifting & special moments</p>
                </div>
              </div>
              <div className={styles.chooseCard}>
                <span className={styles.chooseIcon}>🧡</span>
                <div>
                  <h4>Designed with Love</h4>
                  <p>Created with care in every piece</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
