import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deeksha Candles | Luxury Hand-Poured Soy Candles",
  description: "Experience the art of mindful living. Hand-crafted soy candles poured in small batches with natural botanicals, pure essential oils, and lead-free wicks for a clean, slow burn.",
  metadataBase: new URL("https://deekshacandles.in"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
