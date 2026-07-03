"use server";

import { sql } from "@/lib/db";

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
    // Check if email already exists
    const existing = await sql`
      SELECT id FROM newsletter_subscribers WHERE email = ${email}
    `;

    if (existing.length > 0) {
      return { success: true, message: "You are already subscribed to our journal! Thank you." };
    }

    // Insert into database
    await sql`
      INSERT INTO newsletter_subscribers (email) VALUES (${email})
    `;

    return { success: true, message: "Thank you for subscribing to the Deeksha Journal!" };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { 
      success: false, 
      error: "Something went wrong. Please try again later." 
    };
  }
}
