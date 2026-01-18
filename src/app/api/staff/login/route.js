import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    // Try Mongoose model first
    const Staff = await tryLoadStaffModel();
    let staff = null;
    if (Staff) {
      staff = await Staff.findOne({ email: emailLower });
      if (!staff) {
        console.log('Staff not found with email:', emailLower);
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      console.log('Staff found:', { email: staff.email, isActive: staff.isActive });

      const storedHash = staff.password;
      console.log('Stored password hash:', storedHash);
      console.log('Attempting to verify password...');
      
      const isMatch = await bcrypt.compare(password, storedHash);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        console.log('Password does not match');
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Check if staff is active
      if (!staff.isActive) {
        return NextResponse.json({ error: 'Your account is pending admin approval. Please wait for activation.' }, { status: 403 });
      }
    } else {
      const db = await getDb();
      staff = await db.collection('staff').findOne({ email: emailLower });
      if (!staff) {
        console.log('Staff not found with email:', emailLower);
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
      
      console.log('Staff found:', { email: staff.email, isActive: staff.isActive });
      
      const storedHash = staff.password;
      const isMatch = await bcrypt.compare(password, storedHash);
      if (!isMatch) {
        console.log('Password does not match');
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Check if staff is active
      if (!staff.isActive) {
        return NextResponse.json({ error: 'Your account is pending admin approval. Please wait for activation.' }, { status: 403 });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: staff._id, email: staff.email, name: staff.name, role: 'staff' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      staff: { id: staff._id, name: staff.name, email: staff.email }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
