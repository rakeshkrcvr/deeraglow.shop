import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { getStoreSettings } from "@/lib/settings";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deeksha Candles | Luxury Hand-Poured Soy Candles",
  description: "Experience the art of mindful living. Hand-crafted soy candles poured in small batches with natural botanicals, pure essential oils, and lead-free wicks for a clean, slow burn.",
  metadataBase: new URL("https://deekshacandles.in"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();
  const googleTagId = settings.googleTagId || '';
  const googleTagCode = settings.googleTagCode || '';
  const facebookPixelId = settings.facebookPixelId || '';
  const facebookPixelCode = settings.facebookPixelCode || '';

  return (
    <html lang="en">
      <head>
        {/* Dynamic Google Tag / Analytics Integration */}
        {googleTagCode ? (
          <script dangerouslySetInnerHTML={{ __html: googleTagCode }} />
        ) : googleTagId ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${googleTagId}');
                `,
              }}
            />
          </>
        ) : null}

        {/* Dynamic Facebook / Meta Pixel Integration */}
        {facebookPixelCode ? (
          <script dangerouslySetInnerHTML={{ __html: facebookPixelCode }} />
        ) : facebookPixelId ? (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${facebookPixelId}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        ) : null}
      </head>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
