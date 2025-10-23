import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Set this in .env.local for production

async function tryLoadAdminModel() {
  try {
    const { connectMongoose } = await import('@/lib/mongoose');
    await connectMongoose();
    const Admin = (await import('@/models/Admin')).default;
    return Admin;
  } catch (e) {
  // Mongoose Admin model not available
    return null;
  }
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Try Mongoose model first
    const Admin = await tryLoadAdminModel();
    let admin = null;
    if (Admin) {
      admin = await Admin.findOne({ email }).lean().exec();
      if (!admin) {
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
      }

      const storedHash = admin.passwordHash || admin.password; // handle older field name
      const isMatch = await bcrypt.compare(password, storedHash);
      if (!isMatch) {
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
      }
    } else {
      const db = await getDb();
      admin = await db.collection('admins').findOne({ email });
      if (!admin) {
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
      }
      const storedHash = admin.passwordHash || admin.password;
      const isMatch = await bcrypt.compare(password, storedHash);
      if (!isMatch) {
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, fullName: admin.fullName || admin.name, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      admin: { id: admin._id, fullName: admin.fullName || admin.name, email: admin.email }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}