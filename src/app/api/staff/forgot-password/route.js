import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

async function tryLoadStaffModel() {
  try {
    const { connectMongoose } = await import('@/lib/mongoose');
    await connectMongoose();
    const Staff = (await import('@/models/Staff')).default;
    return Staff;
  } catch (e) {
    return null;
  }
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    const Staff = await tryLoadStaffModel();
    let staff = null;

    if (Staff) {
      // Use Mongoose
      staff = await Staff.findOne({ email: emailLower });
    } else {
      // Use native driver
      const db = await getDb();
      staff = await db.collection('staff').findOne({ email: emailLower });
    }

    if (!staff) {
      // Don't reveal if email exists or not
      return NextResponse.json({
        message: 'If the email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    if (Staff) {
      // Update using Mongoose
      await Staff.updateOne(
        { email: emailLower },
        { $set: { resetToken, resetTokenExpiry } }
      );
    } else {
      // Update using native driver
      const db = await getDb();
      await db.collection('staff').updateOne(
        { email: emailLower },
        { $set: { resetToken, resetTokenExpiry, updatedAt: new Date() } }
      );
    }

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/staff/reset-password?token=${resetToken}`;

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

    const mailOptions = {
      from: `"WearHouse Staff" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - WearHouse Staff',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${staff.name},</p>
          <p>We received a request to reset your password for your WearHouse staff account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            WearHouse Staff Portal - Automated Email
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: 'If the email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Staff forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
