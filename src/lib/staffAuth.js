import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function verifyStaffToken(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'No token provided' };
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'staff') {
      return { valid: false, error: 'Invalid role' };
    }
    return { valid: true, staff: decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

export function generateStaffToken(staff) {
  return jwt.sign(
    { id: staff._id || staff.id, email: staff.email, role: 'staff' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
