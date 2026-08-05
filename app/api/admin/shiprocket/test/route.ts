import { NextResponse } from 'next/server';
import { ShiprocketError, testShiprocketConnection } from '@/lib/shiprocket';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await testShiprocketConnection();
    return NextResponse.json({ connected: true, message: 'Shiprocket is connected.' });
  } catch (error) {
    const message = error instanceof ShiprocketError
      ? error.message
      : 'Unable to connect to Shiprocket. Please try again.';
    return NextResponse.json({ connected: false, error: message }, { status: 502 });
  }
}
