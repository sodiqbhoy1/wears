import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import crypto from 'crypto';
import { sendOrderConfirmationEmail } from '@/lib/emailService';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    // Get the raw body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    
    // Verify webhook signature for security (if webhook secret is available)
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (webhookSecret) {
      const hash = crypto.createHmac('sha512', webhookSecret).update(rawBody).digest('hex');
      const signature = req.headers.get('x-paystack-signature');
      
      if (!signature || hash !== signature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
      }
  // Webhook signature verified
    } else {
    console.warn('Webhook running without signature verification. Add PAYSTACK_WEBHOOK_SECRET for security.');
    }
    
    // Log webhook details for debugging
    console.log('Webhook event:', body.event);
    console.log('Transaction status:', body.data?.status);
    
    if (body.event === 'charge.success' && body.data.status === 'success') {
      const meta = body.data.metadata || {};
      // Try Mongoose Order model first
      let OrderModel = null;
      try {
        const { connectMongoose } = await import('@/lib/mongoose');
        await connectMongoose();
        OrderModel = (await import('@/models/Order')).default;
      } catch (e) {
        // ignore
      }

      const db = await getDb();
      // Check if order already exists (avoid duplicates)
      const existingOrder = OrderModel
        ? await OrderModel.findOne({ reference: body.data.reference }).lean().exec()
        : await db.collection('orders').findOne({ reference: body.data.reference });
      
      if (existingOrder) {
        console.log('Order already exists:', body.data.reference);
        return NextResponse.json({ ok: true, message: 'Order already exists' });
      }
      
      const order = {
        reference: body.data.reference,
        amount: body.data.amount / 100,
        currency: body.data.currency,
        customer: meta.customer || {},
        items: meta.items || [],
        status: 'pending', // Default status for new orders
        paid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'webhook', // Mark as created by webhook
        paystack_reference: body.data.reference,
        paystack_transaction_id: body.data.id
      };
      
      if (OrderModel) {
        const created = await OrderModel.create(order);
        order._id = created._id;
      } else {
        const result = await db.collection('orders').insertOne(order);
        order._id = result.insertedId;
      }
      
      // Send order confirmation email (non-blocking) and mark flag
      if (order.customer?.email) {
  // Attempting to send webhook order confirmation email to customer
        sendOrderConfirmationEmail(order)
          .then(async (result) => {
            // Webhook email result
            if (result?.success) {
              if (OrderModel) {
                await OrderModel.updateOne({ _id: order._id }, { $set: { confirmationEmailSent: true, confirmationEmailSentAt: new Date() } });
              } else {
                await db.collection('orders').updateOne(
                  { _id: order._id },
                  { $set: { confirmationEmailSent: true, confirmationEmailSentAt: new Date() } }
                );
              }
              // Webhook email flag updated for order
            } else {
              // Webhook email failed but order saved
              await db.collection('orders').updateOne(
                { _id: order._id },
                { $set: { confirmationEmailError: result?.error || 'Unknown error', confirmationEmailSentAt: new Date() } }
              );
            }
          })
          .catch(err => {
            console.error('❌ Failed to send order confirmation email via webhook:', err);
            // Update order with email error for debugging
            db.collection('orders').updateOne(
              { _id: order._id },
              { $set: { confirmationEmailError: err.message, confirmationEmailSentAt: new Date() } }
            ).catch(dbErr => console.error('Failed to update email error:', dbErr));
          });
      } else {
  // No customer email found in webhook order, skipping email
      }
      
  // Order created via webhook
      return NextResponse.json({ ok: true, order });
    }
    
  // Webhook event ignored
    return NextResponse.json({ ok: false, message: 'Not a successful payment event.' });
  } catch (e) {
  console.error('Webhook error:', e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
