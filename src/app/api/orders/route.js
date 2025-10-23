import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendOrderConfirmationEmail } from '@/lib/emailService';
import { verifyAdminToken } from '@/lib/auth';

// Lazy-load Mongoose model if available. If not, fall back to native driver.
let OrderModel = null;
let ProductModel = null;

async function tryLoadMongooseModels() {
  if (OrderModel && ProductModel) return { Order: OrderModel, Product: ProductModel };
  try {
    const { connectMongoose } = await import('@/lib/mongoose');
    await connectMongoose();
    if (!OrderModel) OrderModel = (await import('@/models/Order')).default;
    if (!ProductModel) ProductModel = (await import('@/models/Product')).default;
    return { Order: OrderModel, Product: ProductModel };
  } catch (e) {
    // Mongoose not available or failed to connect — caller should fall back
    return { Order: null, Product: null };
  }
}

export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const status = searchParams.get('status');

    const { Order } = await tryLoadMongooseModels();
    const query = {};
    if (reference) query.reference = reference;
    if (status && status !== 'all') query.status = status;

    let orders = [];
    let totalOrders = 0;
    let totalPages = 1;

    if (Order) {
      totalOrders = await Order.countDocuments(query);
      totalPages = Math.ceil(totalOrders / limit);
      orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();
    } else {
      const db = await getDb();
      totalOrders = await db.collection('orders').countDocuments(query);
      totalPages = Math.ceil(totalOrders / limit);
      orders = await db.collection('orders')
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
    }

    return NextResponse.json({ ok: true, orders, totalOrders, totalPages, currentPage: page });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const order = await req.json();
    const { Order, Product } = await tryLoadMongooseModels();
    const db = await getDb();

    // If reference is provided, check for an existing order
    if (order.reference) {
      const existingOrder = Order
        ? await Order.findOne({ reference: order.reference }).lean().exec()
        : await db.collection('orders').findOne({ reference: order.reference });

      if (existingOrder) {
        // If confirmation email hasn't been sent, try to resend asynchronously
        if (!existingOrder.confirmationEmailSent && existingOrder.customer?.email) {
          sendOrderConfirmationEmail(existingOrder)
            .then(async (result) => {
              if (result?.success) {
                if (Order) {
                  await Order.updateOne({ _id: existingOrder._id }, { $set: { confirmationEmailSent: true, confirmationEmailSentAt: new Date() } });
                } else {
                  await db.collection('orders').updateOne(
                    { _id: existingOrder._id },
                    { $set: { confirmationEmailSent: true, confirmationEmailSentAt: new Date() } }
                  );
                }
              }
            })
            .catch((err) => { console.error('Email resend failed (existing order):', err?.message || err); });
        }

        return NextResponse.json({ ok: true, order: existingOrder, message: 'Order already exists' });
      }
    }

    // Ensure timestamps and source
    if (!order.createdAt) order.createdAt = new Date();
    if (!order.source) order.source = 'client';
    if (!order.status) order.status = 'pending'; // Set default status

    // Try saving with Mongoose first
    let usedMongoose = false;
    try {
      if (Order) {
        const doc = new Order(order);
        const saved = await doc.save();
        order._id = saved._id;
        usedMongoose = true;
      }
    } catch (e) {
      console.error('Mongoose save failed, falling back to native driver:', e?.message || e);
      usedMongoose = false;
    }

    if (!usedMongoose) {
      const result = await db.collection('orders').insertOne(order);
      order._id = result.insertedId;
    }

    // After saving the order, update product quantities
    if (order.paid && order.items && order.items.length > 0 && Product) {
      for (const item of order.items) {
        try {
          // Use item.id which was passed from checkout. item.key is not available.
          const product = await Product.findById(item.id);
          if (product) {
            // item has 'qty', not 'quantity'
            product.quantity -= item.qty;
            if (product.quantity <= 0) {
              product.status = 'out of stock';
              product.quantity = 0;
            }
            await product.save();
          }
        } catch (err) {
          console.error(`Failed to update quantity for product ${item.id}:`, err);
          // Decide if you want to do something about this error, e.g., log it to a special collection
        }
      }
    }

    // Send confirmation email asynchronously
    if (order.customer?.email) {
      try {
        if (Order) {
          await Order.updateOne({ _id: order._id }, { $set: { emailAttempts: 1, lastEmailAttempt: new Date() } });
        } else {
          await db.collection('orders').updateOne({ _id: order._id }, { $set: { emailAttempts: 1, lastEmailAttempt: new Date() } });
        }
      } catch (e) {
        console.error('Failed to write initial email attempt metadata:', e?.message || e);
      }

      sendOrderConfirmationEmail(order)
        .then(async (result) => {
          try {
            if (result?.success) {
              if (Order) {
                await Order.updateOne({ _id: order._id }, { $set: { confirmationEmailSent: true, confirmationEmailSentAt: new Date() }, $unset: { confirmationEmailError: '' } });
              } else {
                await db.collection('orders').updateOne(
                  { _id: order._id },
                  { $set: { confirmationEmailSent: true, confirmationEmailSentAt: new Date() }, $unset: { confirmationEmailError: '' } }
                );
              }
            } else {
              if (Order) {
                await Order.updateOne({ _id: order._id }, { $set: { confirmationEmailError: result?.error || 'Unknown error', lastEmailAttempt: new Date() } });
              } else {
                await db.collection('orders').updateOne({ _id: order._id }, { $set: { confirmationEmailError: result?.error || 'Unknown error', lastEmailAttempt: new Date() } });
              }
            }
          } catch (e) {
            console.error('Failed to update order email status after send:', e?.message || e);
          }
        })
        .catch(async (err) => {
          console.error('Email send failed (new order):', err?.message || err);
          try {
            if (Order) {
              await Order.updateOne({ _id: order._id }, { $set: { confirmationEmailError: err?.message || 'Unknown error', lastEmailAttempt: new Date() } });
            } else {
              await db.collection('orders').updateOne({ _id: order._id }, { $set: { confirmationEmailError: err?.message || 'Unknown error', lastEmailAttempt: new Date() } });
            }
          } catch (e) {
            console.error('Failed to write email error metadata:', e?.message || e);
          }
        });
    }

    return NextResponse.json({ ok: true, order });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PUT(req) {
  // Verify admin authentication
  const auth = verifyAdminToken(req);
  if (!auth.valid) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ ok: false, error: 'Order ID is required' }, { status: 400 });
    }

    updateData.updatedAt = new Date();
    // Load mongoose models (if available) using the correct helper
    const { Order } = await tryLoadMongooseModels();

    if (Order) {
      // Mongoose accepts string _id for updates
      await Order.updateOne({ _id }, { $set: updateData });
      const updatedOrder = await Order.findOne({ _id }).lean().exec();
      return NextResponse.json({ ok: true, order: updatedOrder });
    }

    const db = await getDb();
    const oid = typeof _id === 'string' ? new ObjectId(_id) : _id;
    await db.collection('orders').updateOne({ _id: oid }, { $set: updateData });
    const updatedOrder = await db.collection('orders').findOne({ _id: oid });

    return NextResponse.json({ ok: true, order: updatedOrder });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}