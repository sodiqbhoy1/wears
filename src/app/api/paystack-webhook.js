
import { NextResponse } from 'next/server';

// Dummy in-memory order store (replace with DB in production)
let orders = [];

export async function POST(req) {
  try {
    const body = await req.json();
    // Paystack sends events with event type and data
    if (body.event === 'charge.success' && body.data.status === 'success') {
      // Extract order info from metadata
      const meta = body.data.metadata || {};
      const order = {
        reference: body.data.reference,
        amount: body.data.amount / 100,
        currency: body.data.currency,
        customer: meta.customer || {},
        items: meta.items || [],
        paid: true,
        created_at: new Date().toISOString(),
      };
      orders.push(order);
      return NextResponse.json({ ok: true, order });
    }
    return NextResponse.json({ ok: false, message: 'Not a successful payment event.' });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message });
  }
}
