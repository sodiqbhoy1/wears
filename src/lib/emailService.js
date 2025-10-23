/**
 * Email service using Nodemailer + Gmail
 * Cleaned: removed console.log and emoji characters for production.
 */

export async function sendOrderConfirmationEmail(orderDetails) {
  try {
    // Basic validation
    if (!orderDetails || !orderDetails.customer?.email) {
      return { success: false, message: 'No customer email provided' };
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email not configured - missing EMAIL_USER or EMAIL_PASS');
      return { success: false, message: 'Email service not configured' };
    }

    // Import nodemailer dynamically for better Vercel compatibility
    let nodemailer;
    try {
      const nodemailerModule = await import('nodemailer');
      nodemailer = nodemailerModule.default || nodemailerModule;
    } catch (importErr) {
      console.error('Failed to import nodemailer:', importErr);
      return { success: false, error: 'Email service unavailable' };
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    // Verify transporter with timeout for Vercel
    try {
      const verifyPromise = transporter.verify();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Email verification timeout')), 10000));
      await Promise.race([verifyPromise, timeoutPromise]);
    } catch (verifyError) {
      console.error('Email transporter verification failed (proceeding anyway):', verifyError.message);
    }

    const mailOptions = {
      from: `"WearHouse Orders" <${process.env.EMAIL_USER}>`,
      to: orderDetails.customer.email,
      subject: `Order Confirmation - Tracking Code: ${orderDetails.reference}`,
      text: generateOrderConfirmationText(orderDetails),
      html: generateOrderConfirmationHTML(orderDetails),
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPasswordResetEmail(email, resetToken) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { success: false, message: 'Email service not configured' };
    }

    let nodemailer;
    try {
      const nodemailerModule = await import('nodemailer');
      nodemailer = nodemailerModule.default || nodemailerModule;
    } catch (importErr) {
      console.error('Failed to import nodemailer:', importErr);
      return { success: false, error: 'Email service unavailable' };
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"FoodJoint Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - FoodJoint Admin',
      text: generatePasswordResetText(resetUrl),
      html: generatePasswordResetHTML(resetUrl),
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Password reset email error:', error);
    return { success: false, error: error.message };
  }
}

export function getEmailConfigStatus() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  return { configured: Boolean(user && pass), userPresent: Boolean(user), passPresent: Boolean(pass) };
}

function generatePasswordResetHTML(resetUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #CA2C33; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #CA2C33; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
                <p>FoodJoint Admin Dashboard</p>
            </div>
            
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>You have requested to reset your admin password for FoodJoint.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">
                    ${resetUrl}
                </p>
                
                <div class="warning">
                    <h4>Security Notice:</h4>
                    <ul>
                        <li>This link will expire in 1 hour</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>For security, this link can only be used once</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>If you have any questions, contact support at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
                <p>FoodJoint Admin Team</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function generatePasswordResetText(resetUrl) {
  return `
Password Reset Request - FoodJoint Admin

You have requested to reset your admin password for FoodJoint.

Click the link below to reset your password:
${resetUrl}

Security Notice:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- For security, this link can only be used once

If you have any questions, contact support at ${process.env.EMAIL_USER}

FoodJoint Admin Team
  `;
}

function generateOrderConfirmationHTML(orderDetails) {
  const { reference, customer = {}, items = [], amount = 0, createdAt = Date.now() } = orderDetails;
  const customerName = customer.name || 'valued customer';
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #CA2C33; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .tracking-code { background: #fff; padding: 15px; border: 2px solid #CA2C33; text-align: center; margin: 20px 0; }
            .order-items { background: #fff; padding: 15px; margin: 20px 0; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 15px; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .button { display: inline-block; background: #CA2C33; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmed</h1>
                <p>Thank you for your order, ${customerName}!</p>
            </div>
            
            <div class="content">
                <h2>Your Order Details</h2>
                <p><strong>Order Date:</strong> ${new Date(createdAt).toLocaleDateString()}</p>
                <p><strong>Order ID:</strong> ${reference}</p>
                
                <div class="tracking-code">
                    <h3>Your Tracking Code</h3>
                    <div style="font-size: 24px; font-weight: bold; color: #CA2C33; letter-spacing: 2px;">
                        ${reference}
                    </div>
                    <p style="margin-top: 10px; font-size: 14px;">Save this code to track your order</p>
                </div>
                
                <div class="order-items">
                    <h3>Order Items</h3>
                    ${items.map(item => `
                        <div class="item">
                            <span class="mx-3">${item.title || item.name} x ${item.qty || item.quantity || 1}</span>
                            <span class="mx-3">₦${((item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <div class="total">
                        Total: ₦${amount.toFixed(2)}
                    </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/track-order?code=${encodeURIComponent(reference)}" class="button">
                        Track Your Order
                    </a>
                </div>
                
                <div style="background: #e3f2fd; padding: 15px; border-radius: 5px;">
                    <h4>What happens next?</h4>
                    <ul>
                        <li>Your order is being prepared by our kitchen</li>
                        <li>Estimated preparation time: 20-30 minutes</li>
                        <li>You can track your order status using the tracking code above</li>
                        <li>You will receive updates on your order progress</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>Need help? Contact us at <a href="mailto:support@foodjoint.com">support@foodjoint.com</a></p>
                <p>FoodJoint - Delicious meals delivered fresh!</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function generateOrderConfirmationText(orderDetails) {
  const { reference, customer = {}, items = [], amount = 0, createdAt = Date.now() } = orderDetails;
  const customerName = customer.name || 'valued customer';
  return `
Order Confirmation - FoodJoint

Hello ${customerName},

Thank you for your order! Your payment has been processed successfully.

ORDER DETAILS:
- Order ID: ${reference}
- Order Date: ${new Date(createdAt).toLocaleDateString()}
- Total: ₦${amount.toFixed(2)}

TRACKING CODE: ${reference}
Save this code to track your order at: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/track-order

ORDER ITEMS:
${items.map(item => `- ${item.title || item.name} x ${item.qty || item.quantity || 1} = ₦${((item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2)}`).join('\n')}

WHAT HAPPENS NEXT:
- Your order is being prepared by our kitchen
- Estimated preparation time: 20-30 minutes
- You can track your order status using the tracking code above
- You will receive updates on your order progress

Need help? Contact us at support@foodjoint.com

FoodJoint - Delicious meals delivered fresh!
  `;
}

// Alternative implementations for different email services (kept as examples)

export async function sendWithSendGrid(orderDetails) {
  // Example SendGrid implementation (commented out)
}

export async function sendWithNodemailer(orderDetails) {
  // Example Nodemailer implementation (commented out)
}