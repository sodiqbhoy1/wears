import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyAdminToken } from '@/lib/auth';

async function tryLoadStaffModel() {
  try {
    const { connectMongoose } = await import('@/lib/mongoose');
    await connectMongoose();
    const Staff = (await import('@/models/Staff')).default;
    return Staff;
  } catch (e) {
    console.log('⚠️ Mongoose Staff model not available:', e?.message || e);
    return null;
  }
}

// GET all staff (admin only)
export async function GET(req) {
  try {
    // Verify admin token
    const authResult = verifyAdminToken(req);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const Staff = await tryLoadStaffModel();
    let staff = [];

    if (Staff) {
      // Use Mongoose
      staff = await Staff.find({})
        .select('-password -resetToken -resetTokenExpiry')
        .sort({ createdAt: -1 });
    } else {
      // Use native driver
      const db = await getDb();
      staff = await db.collection('staff')
        .find({})
        .project({ password: 0, resetToken: 0, resetTokenExpiry: 0 })
        .sort({ createdAt: -1 })
        .toArray();
    }

    return NextResponse.json(staff);

  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// PATCH - Update staff status (activate/deactivate)
export async function PATCH(req) {
  try {
    // Verify admin token
    const authResult = verifyAdminToken(req);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { staffId, isActive } = await req.json();

    if (!staffId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Staff ID and status are required' },
        { status: 400 }
      );
    }

    const Staff = await tryLoadStaffModel();
    let staff = null;

    if (Staff) {
      // Use Mongoose
      staff = await Staff.findByIdAndUpdate(
        staffId,
        { isActive },
        { new: true }
      ).select('-password -resetToken -resetTokenExpiry');
    } else {
      // Use native driver
      const db = await getDb();
      const result = await db.collection('staff').findOneAndUpdate(
        { _id: new (await import('mongodb')).ObjectId(staffId) },
        { $set: { isActive, updatedAt: new Date() } },
        { returnDocument: 'after', projection: { password: 0, resetToken: 0, resetTokenExpiry: 0 } }
      );
      staff = result.value;
    }

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Staff ${isActive ? 'activated' : 'deactivated'} successfully`,
      staff
    });

  } catch (error) {
    console.error('Failed to update staff status:', error);
    return NextResponse.json(
      { error: 'Failed to update staff status' },
      { status: 500 }
    );
  }
}

// DELETE - Remove staff member
export async function DELETE(req) {
  try {
    // Verify admin token
    const authResult = verifyAdminToken(req);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('id');

    if (!staffId) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    const Staff = await tryLoadStaffModel();
    let staff = null;

    if (Staff) {
      // Use Mongoose
      staff = await Staff.findByIdAndDelete(staffId);
    } else {
      // Use native driver
      const db = await getDb();
      const result = await db.collection('staff').findOneAndDelete({
        _id: new (await import('mongodb')).ObjectId(staffId)
      });
      staff = result.value;
    }

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Staff deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    );
  }
}
