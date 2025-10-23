import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/emailService';

export const runtime = 'nodejs';

/**
 * Protected test endpoint to send a sample order confirmation email
 * Pass ?token=YOUR_TOKEN to authorize (set EMAIL_TEST_TOKEN in env)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const expected = process.env.EMAIL_TEST_TOKEN;
    if (!expected || token !== expected) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const order = {
      reference: 'FJTEST1234',
      amount: 2500,
      currency: 'NGN',
      customer: { name: 'Test User', email: process.env.EMAIL_USER },
      items: [
        { name: 'Signature Pizza', qty: 1, price: 2500 },
      ],
      createdAt: new Date().toISOString(),
    };

    const result = await sendOrderConfirmationEmail(order);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}