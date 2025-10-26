import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

// Helper to stream file buffer to Cloudinary
const streamToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'wears', // Optional: organize uploads in a folder
        // You can add more upload options here, e.g., transformations
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    file.arrayBuffer().then(buffer => {
      stream.end(Buffer.from(buffer));
    });
  });
};

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

    // Validate file type - accept more image formats
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/x-icon'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Invalid file type. Supported formats: JPEG, JPG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO' 
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

    // Upload to Cloudinary
    const result = await streamToCloudinary(file);

    // Image uploaded successfully to Cloudinary
    return NextResponse.json({ ok: true, url: result.secure_url });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to upload file: ' + error.message 
    }, { status: 500 });
  }
}
