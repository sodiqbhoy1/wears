import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyAdminToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'No valid authorization header' };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return { valid: true, admin: decoded };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
}

export function requireAdmin(handler) {
  return async (request, context) => {
    const auth = verifyAdminToken(request);
    
    if (!auth.valid) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    return handler(request, context);
  };
}