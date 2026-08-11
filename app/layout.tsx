import type { Metadata } from "next";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import { getStoreSettings } from "@/lib/settings";
import MetaPixelPageView from "@/components/MetaPixelPageView";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Deera Glow | Premium Artificial jewellery Online in India",
    template: "%s | Deera Glow",
  },
  description: "Discover the latest collection of premium artificial jewellery at Deera Glow. Shop stylish earrings, necklaces, rings, bracelets, bangles, and fashion accessories for every occasion. Affordable prices, secure payments, and fast delivery across India.",
  metadataBase: new URL("https://deeraglow.shop"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Deera Glow | Premium Artificial jewellery Online in India",
    description: "Discover the latest collection of premium artificial jewellery at Deera Glow. Shop stylish earrings, necklaces, rings, bracelets, bangles, and fashion accessories for every occasion.",
    url: "https://deeraglow.shop",
    siteName: "Deera Glow",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deera Glow | Premium Artificial jewellery Online in India",
    description: "Discover the latest collection of premium artificial jewellery at Deera Glow.",
  },
};

import RecentSalesPopup from "@/components/RecentSalesPopup";

type CustomScript = {
  src?: string;
  content?: string;
};

// The admin field accepts the standard Google snippet, which already contains
// <script> tags. Rendering that entire value inside another <script> produces
// invalid HTML and can leave the document parser in an unexpected state.
function parseCustomScripts(snippet: string): CustomScript[] {
  const scripts = [...snippet.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map((match) => {
    const src = match[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    return src ? { src } : { content: match[2].trim() };
  });

  return scripts.length > 0 ? scripts : snippet.trim() ? [{ content: snippet.trim() }] : [];
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();
  const faviconUrl = settings.faviconUrl || settings.logoHeaderUrl || '';
  const googleTagId = settings.googleTagId || '';
  const customGoogleScripts = parseCustomScripts(settings.googleTagCode || '');
  // Never render the admin's pasted Meta snippet directly: it often contains its
  // own <script> tags, which makes invalid nested markup. Keep the ID editable,
  // but always emit one canonical pixel bootstrap instead.
  const facebookPixelId = settings.facebookPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || '4388165921425895';
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'xyp5x0gfdo';

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://deeraglow.shop/#organization",
        "name": "Deera Glow",
        "url": "https://deeraglow.shop",
        "logo": "https://deeraglow.shop/images/category_banner_jewelry.png",
        "sameAs": [
          "https://www.instagram.com/deeraglow.shop"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-9971459984",
          "contactType": "customer service",
          "email": "deeraglowshop@gmail.com",
          "areaServed": "IN"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://deeraglow.shop/#website",
        "url": "https://deeraglow.shop",
        "name": "Deera Glow",
        "publisher": {
          "@id": "https://deeraglow.shop/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://deeraglow.shop/category/all-jewellery?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {faviconUrl && (
          <>
            <link rel="icon" href={faviconUrl} />
            <link rel="shortcut icon" href={faviconUrl} />
            <link rel="apple-touch-icon" href={faviconUrl} />
          </>
        )}
        {/* Dynamic Google Tag / Analytics Integration */}
        {customGoogleScripts.length > 0 ? (
          customGoogleScripts.map((script, index) => script.src ? (
            <Script
              id={`custom-google-src-${index}`}
              key={`custom-google-src-${index}`}
              src={script.src}
              strategy="afterInteractive"
            />
          ) : (
            <Script
              id={`custom-google-inline-${index}`}
              key={`custom-google-inline-${index}`}
              strategy="afterInteractive"
            >
              {script.content ?? ''}
            </Script>
          ))
        ) : googleTagId ? (
          <>
            <Script id="google-tag-library" src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} strategy="afterInteractive" />
            <Script id="google-tag-config" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${googleTagId}');`}
            </Script>
          </>
        ) : null}

      </head>
      <body>
        <CartProvider>
          {children}
          <RecentSalesPopup />
        </CartProvider>
        <noscript>
          <img height="1" width="1" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`} alt="" />
        </noscript>
        <Script id="meta-pixel-base" strategy="beforeInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${facebookPixelId}');fbq('track','PageView');`}
        </Script>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script','${clarityProjectId}');`}
        </Script>
        <MetaPixelPageView />
      </body>
    </html>
  );
}
