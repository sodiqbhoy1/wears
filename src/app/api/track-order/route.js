import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

async function tryLoadOrderModel() {
  try {
    const { connectMongoose } = await import('@/lib/mongoose');
    await connectMongoose();
    const Order = (await import('@/models/Order')).default;
    return Order;
  } catch (e) {
    return null;
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingCode = searchParams.get('code');
    
    if (!trackingCode) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Tracking code is required' 
      }, { status: 400 });
    }

    // Try model first
    const Order = await tryLoadOrderModel();
    let order = null;
    if (Order) {
      order = await Order.findOne({ reference: trackingCode.trim() }).lean().exec();
    } else {
      const db = await getDb();
      // Search for order by reference (which serves as tracking code)
      order = await db.collection('orders').findOne({ reference: trackingCode.trim() });
    }

    if (!order) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Order not found. Please check your tracking code and try again.' 
      }, { status: 404 });
    }

    // Return order details (excluding sensitive admin info)
    const publicOrder = {
      _id: order._id,
      reference: order.reference,
      amount: order.amount,
      currency: order.currency,
      status: order.status || 'pending',
      paid: order.paid,
      createdAt: order.createdAt,
      customer: {
        name: order.customer?.name,
        email: order.customer?.email,
        phone: order.customer?.phone,
        address: order.customer?.address
      },
      items: order.items || []
    };

    return NextResponse.json({ 
      ok: true, 
      order: publicOrder 
    });

  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to track order. Please try again later.' 
    }, { status: 500 });
  }
}