import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/emailService';

export async function POST(req) {
  try {
    const { action, email, token, newPassword } = await req.json();

    if (action === 'request') {
      return await handlePasswordResetRequest(email);
    } else if (action === 'reset') {
      return await handlePasswordReset(token, newPassword);
    } else if (action === 'validate') {
      return await handleTokenValidation(token);
    } else {
      return NextResponse.json({ 
        ok: false, 
        error: 'Invalid action. Use "request", "reset", or "validate"' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function handlePasswordResetRequest(email) {
  if (!email) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Email is required' 
    }, { status: 400 });
  }

  // Try Mongoose Admin model first
  let Admin = null;
  try {
    const { connectMongoose } = await import('@/lib/mongoose');
    await connectMongoose();
    Admin = (await import('@/models/Admin')).default;
  } catch (e) {
    // ignore, will use native driver
  }

  // Check if admin exists
  let admin = null;
  if (Admin) {
    admin = await Admin.findOne({ email });
  } else {
    const db = await getDb();
    admin = await db.collection('admins').findOne({ email });
  }
  if (!admin) {
    // Don't reveal that email doesn't exist for security
    return NextResponse.json({ 
      ok: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  // Save reset token to database (model or native)
  if (Admin) {
    await Admin.updateOne({ email }, { $set: { resetToken, resetTokenExpiry } });
  } else {
    const db = await getDb();
    await db.collection('admins').updateOne(
      { email },
      { 
        $set: { 
          resetToken,
          resetTokenExpiry
        }
      }
    );
  }

  // Send reset email
  try {
    await sendPasswordResetEmail(email, resetToken);
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError);
    // Continue anyway - don't expose email issues to user
  }

  return NextResponse.json({ 
    ok: true, 
    message: 'If an account with that email exists, a password reset link has been sent.' 
  });
}

async function handlePasswordReset(token, newPassword) {
  if (!token || !newPassword) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Token and new password are required' 
    }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Password must be at least 6 characters long' 
    }, { status: 400 });
  }

  // Try model first
  let Admin = null;
  try {
    const { connectMongoose } = await import('@/lib/mongoose');
    await connectMongoose();
    Admin = (await import('@/models/Admin')).default;
  } catch (e) {}

  let admin = null;
  if (Admin) {
    admin = await Admin.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
  } else {
    const db = await getDb();
    admin = await db.collection('admins').findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
  }

  if (!admin) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Invalid or expired reset token' 
    }, { status: 400 });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password and remove reset token (model or native)
  if (Admin) {
    await Admin.updateOne({ _id: admin._id }, { $set: { passwordHash: hashedPassword }, $unset: { resetToken: '', resetTokenExpiry: '' } });
  } else {
    const db = await getDb();
    await db.collection('admins').updateOne(
      { _id: admin._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetToken: '', resetTokenExpiry: '' }
      }
    );
  }

  return NextResponse.json({ 
    ok: true, 
    message: 'Password has been reset successfully. You can now login with your new password.' 
  });
}

async function handleTokenValidation(token) {
  if (!token) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Reset token is required' 
    }, { status: 400 });
  }

  // Try Admin model first
  let Admin = null;
  try {
    const { connectMongoose } = await import('@/lib/mongoose');
    await connectMongoose();
    Admin = (await import('@/models/Admin')).default;
  } catch (e) {}

  let admin = null;
  if (Admin) {
    admin = await Admin.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
  } else {
    const db = await getDb();
    admin = await db.collection('admins').findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
  }

  if (!admin) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Invalid or expired reset token' 
    }, { status: 400 });
  }

  return NextResponse.json({ 
    ok: true, 
    message: 'Token is valid' 
  });
}