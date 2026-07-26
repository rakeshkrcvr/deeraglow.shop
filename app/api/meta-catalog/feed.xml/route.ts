import { NextResponse } from 'next/server';
import { generateMetaXmlFeed } from '@/lib/metaCatalog';
import { getErrorMessage } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const xmlContent = await generateMetaXmlFeed(baseUrl);

    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error: unknown) {
    console.error('Error generating Meta XML Feed:', error);
    return new NextResponse(`<error>${getErrorMessage(error)}</error>`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}

export const dynamic = 'force-dynamic';
