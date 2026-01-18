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
    console.log(' Mongoose Staff model not available:', e?.message || e);
    return null;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Try Mongoose first
    const Staff = await tryLoadStaffModel();
    const emailLower = email.toLowerCase();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    if (Staff) {
      const existing = await Staff.findOne({ email: emailLower });
      if (existing) {
        return NextResponse.json({ error: 'Staff with this email already exists' }, { status: 409 });
      }
      const created = await Staff.create({ 
        name, 
        email: emailLower, 
        password: hash, 
        isActive: false  // Requires admin approval
      });
      return NextResponse.json({ 
        id: created._id, 
        message: 'Account created successfully! Please wait for admin approval before you can login.' 
      }, { status: 201 });
    }

    // Fallback to native driver
    const db = await getDb(process.env.MONGODB_DB || 'platepay');
    const staff = db.collection('staff');

    const existing = await staff.findOne({ email: emailLower });
    if (existing) {
      return NextResponse.json({ error: 'Staff with this email already exists' }, { status: 409 });
    }

    const now = new Date();
    const res = await staff.insertOne({
      name,
      email: emailLower,
      password: hash,
      isActive: false,
      createdAt: now,
      updatedAt: now
    });

    return NextResponse.json({ 
      id: res.insertedId, 
      message: 'Account created successfully! Please wait for admin approval before you can login.' 
    }, { status: 201 });
  } catch (err) {
    console.error('Staff signup error', err);
    return NextResponse.json({ error: 'Failed to create staff account' }, { status: 500 });
  }
}
