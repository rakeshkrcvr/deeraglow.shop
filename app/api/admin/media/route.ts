import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 1. Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS media_files (
        id SERIAL PRIMARY KEY,
        url VARCHAR(500) NOT NULL UNIQUE,
        filename VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Check if we need to seed the 6 default mock images
    const checkCount = await sql`SELECT COUNT(*) FROM media_files` as any;
    const count = parseInt(checkCount[0].count, 10);

    if (count === 0) {
      const defaultMedia = [
        { url: '/images/hero_candle.png', name: 'Sandalwood Jar (Hero)' },
        { url: '/images/lavender_candle.png', name: 'Lavender Amber Jar' },
        { url: '/images/jasmine_candle.png', name: 'Jasmine White Jar' },
        { url: '/images/eucalyptus_candle.png', name: 'Eucalyptus Clear Jar' },
        { url: '/images/vanilla_candle.png', name: 'Vanilla Matte Jar' },
        { url: '/images/rose_candle.png', name: 'Rose Pink Glass Jar' }
      ];

      for (const media of defaultMedia) {
        try {
          await sql`
            INSERT INTO media_files (url, filename)
            VALUES (${media.url}, ${media.name})
            ON CONFLICT (url) DO NOTHING
          `;
        } catch (e) {
          console.error('Seeding media error:', e);
        }
      }
    }

    const files = await sql`SELECT * FROM media_files ORDER BY id DESC`;
    return NextResponse.json(files);
  } catch (err: any) {
    console.error('Error in media GET:', err);
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file to public/uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const url = `/uploads/${filename}`;

    // Record in database
    await sql`
      INSERT INTO media_files (url, filename)
      VALUES (${url}, ${file.name})
      ON CONFLICT (url) DO NOTHING
    `;

    return NextResponse.json({ success: true, url, filename: file.name });
  } catch (err: any) {
    console.error('Error in media POST:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // Get url first
    const fileRes = await sql`SELECT url FROM media_files WHERE id = ${parseInt(id, 10)}` as any;
    if (fileRes.length > 0) {
      const url = fileRes[0].url;

      // Delete from DB
      await sql`DELETE FROM media_files WHERE id = ${parseInt(id, 10)}`;

      // Optionally delete from local filesystem if in /uploads/
      if (url.startsWith('/uploads/')) {
        const filepath = path.join(process.cwd(), 'public', url);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error in media DELETE:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
