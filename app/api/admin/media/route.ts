import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const defaultMedia = [
  { url: '/images/hero_candle.png', name: 'Sandalwood Jar (Hero)' },
  { url: '/images/lavender_candle.png', name: 'Lavender Amber Jar' },
  { url: '/images/jasmine_candle.png', name: 'Jasmine White Jar' },
  { url: '/images/eucalyptus_candle.png', name: 'Eucalyptus Clear Jar' },
  { url: '/images/vanilla_candle.png', name: 'Vanilla Matte Jar' },
  { url: '/images/rose_candle.png', name: 'Rose Pink Glass Jar' }
];

async function ensureMediaTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS media_files (
      id SERIAL PRIMARY KEY,
      url VARCHAR(500) NOT NULL UNIQUE,
      filename VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`ALTER TABLE media_files ADD COLUMN IF NOT EXISTS storage_key VARCHAR(255) UNIQUE`;
  await sql`ALTER TABLE media_files ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100)`;
  await sql`ALTER TABLE media_files ADD COLUMN IF NOT EXISTS data_base64 TEXT`;
  await sql`ALTER TABLE media_files ADD COLUMN IF NOT EXISTS file_size INT`;
}

function cleanFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').slice(0, 80);
}

function displayFilename(filename: string) {
  return filename.replace(/["\r\n]/g, '_').slice(0, 255);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function seedDefaultMedia() {
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

export async function GET() {
  try {
    await ensureMediaTable();
    await seedDefaultMedia();

    const files = await sql`
      SELECT id, url, filename, storage_key, mime_type, file_size, created_at
      FROM media_files
      ORDER BY id DESC
    `;
    return NextResponse.json(files);
  } catch (err: unknown) {
    console.error('Error in media GET:', err);
    return NextResponse.json({ error: getErrorMessage(err, 'Database error') }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureMediaTable();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Image must be smaller than 8MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const dataBase64 = Buffer.from(bytes).toString('base64');
    const storageKey = `${Date.now()}-${randomUUID()}-${cleanFilename(file.name)}`;
    const url = `/api/media/${storageKey}`;
    const filename = displayFilename(file.name);

    const files = await sql`
      INSERT INTO media_files (url, filename, storage_key, mime_type, data_base64, file_size)
      VALUES (${url}, ${filename}, ${storageKey}, ${file.type}, ${dataBase64}, ${file.size})
      RETURNING id, url, filename, storage_key, mime_type, file_size, created_at
    `;

    return NextResponse.json({ success: true, file: files[0], url, filename });
  } catch (err: unknown) {
    console.error('Error in media POST:', err);
    return NextResponse.json({ error: getErrorMessage(err, 'Server error') }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureMediaTable();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    await sql`DELETE FROM media_files WHERE id = ${parseInt(id, 10)}`;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Error in media DELETE:', err);
    return NextResponse.json({ error: getErrorMessage(err, 'Server error') }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
