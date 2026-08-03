"use server";

import { sql } from "@/lib/db";
import { sendWelcomeNewsletterEmail } from "@/lib/email";

export interface SubscriptionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function subscribeNewsletter(prevState: SubscriptionResult, formData: FormData): Promise<SubscriptionResult> {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // Basic email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    // 1. Ensure newsletter_subscribers table exists
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 2. Check if email already exists
    const existing = await sql`
      SELECT id FROM newsletter_subscribers WHERE email = ${email}
    ` as unknown as { id: number }[];

    if (existing.length > 0) {
      return { success: true, message: "You are already subscribed to our journal! Thank you." };
    }

    // 3. Insert into database
    await sql`
      INSERT INTO newsletter_subscribers (email) VALUES (${email})
    `;

    // 4. Send Welcome Email via Gmail SMTP
    await sendWelcomeNewsletterEmail(email);

    return { success: true, message: "Thank you for subscribing! A welcome email has been sent to your inbox." };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { 
      success: false, 
      error: "Something went wrong. Please try again later." 
    };
  }
}
