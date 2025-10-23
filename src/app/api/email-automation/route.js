// Force Node.js runtime for Vercel
export const runtime = 'nodejs';

import { getDb } from '@/lib/mongodb';
import { sendOrderConfirmationEmail } from '@/lib/emailService';

export async function POST(request) {
  try {
  // Starting automated email processing
    
    // Optional API key protection (can be called without key for internal use)
    const { apiKey } = await request.json().catch(() => ({}));
    
    // Try Order model first
    let OrderModel = null;
    try {
      const { connectMongoose } = await import('@/lib/mongoose');
      await connectMongoose();
      OrderModel = (await import('@/models/Order')).default;
    } catch (e) {
      // ignore
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const query = {
      paid: true,
      'customer.email': { $exists: true, $ne: '' },
      confirmationEmailSent: { $ne: true },
      createdAt: { $gte: twentyFourHoursAgo },
      $or: [
        { emailAttempts: { $exists: false } },
        { emailAttempts: { $lt: 3 } }
      ]
    };

    let ordersNeedingEmail = [];
    if (OrderModel) {
      ordersNeedingEmail = await OrderModel.find(query).lean().exec();
    } else {
      const db = await getDb();
      ordersNeedingEmail = await db.collection('orders').find(query).toArray();
    }
    
  // Found orders needing confirmation emails: ${ordersNeedingEmail.length}
    
    if (ordersNeedingEmail.length === 0) {
      return Response.json({
        success: true,
        message: 'No orders need confirmation emails',
        processed: 0
      });
    }
    
    let successCount = 0;
    let failureCount = 0;
    const results = [];
    
    // Process each order
    for (const order of ordersNeedingEmail) {
      try {
  // Processing email for order
        
        // Increment attempt counter
        const currentAttempts = (order.emailAttempts || 0) + 1;
        if (OrderModel) {
          await OrderModel.updateOne({ _id: order._id }, { $set: { emailAttempts: currentAttempts, lastEmailAttempt: new Date() } });
        } else {
          const db = await getDb();
          await db.collection('orders').updateOne(
            { _id: order._id },
            { 
              $set: { 
                emailAttempts: currentAttempts,
                lastEmailAttempt: new Date()
              }
            }
          );
        }
        
        // Try to send email
        const emailResult = await sendOrderConfirmationEmail(order);
        
        if (emailResult.success) {
          // Mark as sent
          if (OrderModel) {
            await OrderModel.updateOne({ _id: order._id }, { $set: { confirmationEmailSent: true, confirmationEmailSentAt: new Date(), emailAttempts: currentAttempts }, $unset: { confirmationEmailError: "" } });
          } else {
            const db = await getDb();
            await db.collection('orders').updateOne(
              { _id: order._id },
              { 
                $set: { 
                  confirmationEmailSent: true,
                  confirmationEmailSentAt: new Date(),
                  emailAttempts: currentAttempts
                },
                $unset: { confirmationEmailError: "" }
              }
            );
          }
          
          successCount++;
          results.push({
            reference: order.reference,
            status: 'success',
            email: order.customer.email
          });
          
          // Email sent successfully for order
        } else {
          // Mark the error but don't fail completely
          if (OrderModel) {
            await OrderModel.updateOne({ _id: order._id }, { $set: { confirmationEmailError: emailResult.error || 'Unknown error', lastEmailAttempt: new Date(), emailAttempts: currentAttempts } });
          } else {
            const db = await getDb();
            await db.collection('orders').updateOne(
              { _id: order._id },
              { 
                $set: { 
                  confirmationEmailError: emailResult.error || 'Unknown error',
                  lastEmailAttempt: new Date(),
                  emailAttempts: currentAttempts
                }
              }
            );
          }
          
          failureCount++;
          results.push({
            reference: order.reference,
            status: 'failed',
            error: emailResult.error,
            email: order.customer.email
          });
          
          // Email failed for order
        }
        
        // Small delay to avoid overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (orderError) {
        console.error(`❌ Error processing order ${order.reference}:`, orderError);
        failureCount++;
        results.push({
          reference: order.reference,
          status: 'error',
          error: orderError.message,
          email: order.customer?.email
        });
      }
    }
    
  // Email processing complete: ${successCount} success, ${failureCount} failures
    
    return Response.json({
      success: true,
      message: `Processed ${ordersNeedingEmail.length} orders`,
      summary: {
        total: ordersNeedingEmail.length,
        success: successCount,
        failures: failureCount
      },
      results: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🚨 Automated email processing error:', error);
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for health check and manual trigger
export async function GET() {
  try {
    // GET: check pending count
    // Try model count first
    let pendingCount = 0;
    try {
      const OrderModel2 = (await import('@/models/Order')).default;
      pendingCount = await OrderModel2.countDocuments({ paid: true, 'customer.email': { $exists: true, $ne: '' }, confirmationEmailSent: { $ne: true }, createdAt: { $gte: twentyFourHoursAgo }, $or: [ { emailAttempts: { $exists: false } }, { emailAttempts: { $lt: 3 } } ] }).exec();
    } catch (e) {
      const db = await getDb();
      pendingCount = await db.collection('orders').countDocuments({ paid: true, 'customer.email': { $exists: true, $ne: '' }, confirmationEmailSent: { $ne: true }, createdAt: { $gte: twentyFourHoursAgo }, $or: [ { emailAttempts: { $exists: false } }, { emailAttempts: { $lt: 3 } } ] });
    }
    
    return Response.json({
      success: true,
      pendingEmails: pendingCount,
      message: pendingCount > 0 ? `${pendingCount} orders need confirmation emails` : 'No orders need emails',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}