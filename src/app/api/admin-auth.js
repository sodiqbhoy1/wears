// Simple admin auth API (file-based, for demo)
// POST /api/admin-auth?action=signup|login|forgot|reset
// Stores users in users.json (in-memory for demo)
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const USERS_FILE = 'users.json';
const SECRET = 'supersecretkey';

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function POST(req) {
  const { action, email, password, confirm, resetToken } = await req.json();
  let users = loadUsers();

  if (action === 'signup') {
    if (users.find(u => u.email === email)) {
      return NextResponse.json({ ok: false, error: 'Email already exists' });
    }
    if (!email || !password || password !== confirm) {
      return NextResponse.json({ ok: false, error: 'Invalid signup data' });
    }
    const hash = await bcrypt.hash(password, 10);
    users.push({ email, password: hash });
    saveUsers(users);
    return NextResponse.json({ ok: true });
  }

  if (action === 'login') {
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' });
    }
    const token = jwt.sign({ email }, SECRET, { expiresIn: '1d' });
    return NextResponse.json({ ok: true, token });
  }

  if (action === 'forgot') {
    // Dummy: always succeed
    return NextResponse.json({ ok: true, message: 'If this email exists, a reset link will be sent.' });
  }

  if (action === 'reset') {
    // Dummy: always succeed
    return NextResponse.json({ ok: true, message: 'Password reset successful.' });
  }

  return NextResponse.json({ ok: false, error: 'Unknown action' });
}
