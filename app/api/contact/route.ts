import { NextResponse } from 'next/server';
import { sendContactNotificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const sent = await sendContactNotificationEmail(name, email, phone || '', message);

    if (sent) {
      return NextResponse.json({ success: true, message: 'Message sent successfully!' });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to send message via email server.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error handling contact submission:', error);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
