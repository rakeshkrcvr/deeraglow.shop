import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';
import { defaultStoreSettings, ensureStoreSettingsTable, getStoreSettings } from '@/lib/settings';

export async function GET() {
  try {
    return NextResponse.json(await getStoreSettings(), {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });
  } catch (error: unknown) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await ensureStoreSettingsTable();

    // Upsert key-values
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' && key in defaultStoreSettings) {
        await sql`
          INSERT INTO store_settings (key, value)
          VALUES (${key}, ${value})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `;
      }
    }

    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
