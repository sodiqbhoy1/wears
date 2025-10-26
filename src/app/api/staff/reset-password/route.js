import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

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
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const Staff = await tryLoadStaffModel();
    let staff = null;

    if (Staff) {
      // Use Mongoose
      staff = await Staff.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() }
      });

      if (!staff) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }

      // Hash password and update
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      staff.password = hash;
      staff.resetToken = null;
      staff.resetTokenExpiry = null;
      await staff.save();
    } else {
      // Use native driver
      const db = await getDb();
      staff = await db.collection('staff').findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() }
      });

      if (!staff) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }

      // Hash password and update
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await db.collection('staff').updateOne(
        { _id: staff._id },
        { 
          $set: { password: hash, updatedAt: new Date() },
          $unset: { resetToken: '', resetTokenExpiry: '' }
        }
      );
    }

    return NextResponse.json({
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Staff reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
