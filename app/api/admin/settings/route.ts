import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // 1. Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS store_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;

    // 2. Query all settings
    const rows = await sql`SELECT * FROM store_settings` as unknown as { key: string, value: string }[];
    
    // Convert to key-value map
    const settings: Record<string, string> = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    // Provide default values
    const defaults = {
      isGokwikActive: 'true',
      isCodActive: 'true',
      razorpayKeyId: '',
      razorpayKeySecret: '',
      shiprocketEmail: '',
      shiprocketPassword: '',
      shiprocketToken: ''
    };

    return NextResponse.json({ ...defaults, ...settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS store_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;

    // Upsert key-values
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        await sql`
          INSERT INTO store_settings (key, value)
          VALUES (${key}, ${value})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
