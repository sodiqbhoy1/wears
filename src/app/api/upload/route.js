import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminToken } from '@/lib/auth';

export async function POST(req) {
  try {
    // Verify admin authentication
    const auth = verifyAdminToken(req);
    if (!auth.valid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        ok: false, 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = (file.name || 'upload').split('.').pop().toLowerCase();
    const filename = `menu_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);
    const url = `/uploads/${filename}`;

  // Image uploaded successfully
    return NextResponse.json({ ok: true, url });
    
  } catch (error) {
  console.error('Upload error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to upload file: ' + error.message 
    }, { status: 500 });
  }
}
