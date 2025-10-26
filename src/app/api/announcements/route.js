import { NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongoose';
import Announcement from '@/models/Announcement';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectMongoose();
    
    // Check if request is from admin (has authorization header)
    const authHeader = req.headers.get('Authorization');
    const isAdmin = authHeader && authHeader.startsWith('Bearer ');
    
    if (isAdmin) {
      // Admin: Get all announcements
      const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ ok: true, announcements });
    } else {
      // Public: Get only the latest active announcement
      const announcement = await Announcement.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ ok: true, announcement });
    }
  } catch (error) {
    console.error('Get announcements error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Verify admin authentication
    const auth = verifyAdminToken(req);
    if (!auth.valid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoose();
    const body = await req.json();
    const { title, message } = body;

    if (!title || !message) {
      return NextResponse.json({ ok: false, error: 'Title and message are required' }, { status: 400 });
    }

    // Deactivate all previous announcements
    await Announcement.updateMany({}, { isActive: false });

    // Create new announcement
    const announcement = await Announcement.create({
      title,
      message,
      isActive: true,
      createdBy: auth.admin?.email || 'admin'
    });

    return NextResponse.json({ ok: true, announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    // Verify admin authentication
    const auth = verifyAdminToken(req);
    if (!auth.valid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoose();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Announcement ID is required' }, { status: 400 });
    }

    await Announcement.findByIdAndDelete(id);
    return NextResponse.json({ ok: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
