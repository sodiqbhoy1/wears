import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendOrderConfirmationEmail } from '@/lib/emailService';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, reference } = body || {};

    if (!id && !reference) {
      return NextResponse.json({ ok: false, error: 'id or reference required' }, { status: 400 });
    }

    // Try Mongoose Order model first
    let OrderModel = null;
    try {
      const { connectMongoose } = await import('@/lib/mongoose');
      await connectMongoose();
      OrderModel = (await import('@/models/Order')).default;
    } catch (e) {}

    const query = id ? { _id: new ObjectId(id) } : { reference };
    let order = null;
    if (OrderModel) {
      order = await OrderModel.findOne(query).lean().exec();
    } else {
      const db = await getDb();
      order = await db.collection('orders').findOne(query);
    }

    if (!order) {
      return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
    }

    if (!order.customer?.email) {
      return NextResponse.json({ ok: false, error: 'Order has no customer email' }, { status: 400 });
    }

    const result = await sendOrderConfirmationEmail(order);

    if (result?.success) {
      if (OrderModel) {
        await OrderModel.updateOne({ _id: order._id }, { $set: { confirmationEmailSent: true, confirmationEmailSentAt: new Date() } });
      } else {
        const db = await getDb();
        await db.collection('orders').updateOne(
          { _id: order._id },
          { $set: { confirmationEmailSent: true, confirmationEmailSentAt: new Date() } }
        );
      }
    }

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}