import React from 'react';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'Contact Us | Deera Glow Premium Artificial jewellery',
  description: 'Get in touch with Deera Glow customer care for order inquiries, jewellery care support, and partnership questions. We reply within 24 hours.',
  alternates: {
    canonical: 'https://deeraglow.shop/contact',
  },
  openGraph: {
    title: 'Contact Deera Glow | Premium Artificial jewellery',
    description: 'Get in touch with Deera Glow customer care for inquiries and assistance.',
    url: 'https://deeraglow.shop/contact',
    siteName: 'Deera Glow',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
