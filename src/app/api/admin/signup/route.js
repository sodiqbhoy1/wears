import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

async function tryLoadAdminModel() {
  try {
    const { connectMongoose } = await import('@/lib/mongoose');
    await connectMongoose();
    const Admin = (await import('@/models/Admin')).default;
    return Admin;
  } catch (e) {
    console.log('⚠️ Mongoose Admin model not available:', e?.message || e);
    return null;
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, email, password } = body || {}

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Try Mongoose first
    const Admin = await tryLoadAdminModel();
    const emailLower = email.toLowerCase();
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    if (Admin) {
      const existing = await Admin.findOne({ email: emailLower }).lean().exec();
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }
      const created = await Admin.create({ name, email: emailLower, passwordHash: hash, role: 'admin' });
      return NextResponse.json({ id: created._id, message: 'Admin created' }, { status: 201 })
    }

    // Fallback to native driver
    const db = await getDb(process.env.MONGODB_DB || 'platepay')
    const admins = db.collection('admins')

    const existing = await admins.findOne({ email: emailLower })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const now = new Date()
    const res = await admins.insertOne({
      name,
      email: emailLower,
      password: hash,
      createdAt: now,
      role: 'admin'
    })

    return NextResponse.json({ id: res.insertedId, message: 'Admin created' }, { status: 201 })
  } catch (err) {
    console.error('Register error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
