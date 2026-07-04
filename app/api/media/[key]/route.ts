import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface MediaFileRow {
  filename: string;
  mime_type: string | null;
  data_base64: string | null;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function headerSafeFilename(filename: string) {
  return filename.replace(/["\r\n]/g, '_');
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await context.params;

    const files = await sql`
      SELECT filename, mime_type, data_base64
      FROM media_files
      WHERE storage_key = ${key}
      LIMIT 1
    ` as unknown as MediaFileRow[];

    if (!files.length || !files[0].data_base64) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const buffer = Buffer.from(files[0].data_base64, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': files[0].mime_type || 'application/octet-stream',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${headerSafeFilename(files[0].filename)}"`
      }
    });
  } catch (err: unknown) {
    console.error('Error serving media file:', err);
    return NextResponse.json({ error: getErrorMessage(err, 'Server error') }, { status: 500 });
  }
}
