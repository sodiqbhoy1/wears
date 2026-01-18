import { NextResponse } from 'next/server';
import { getEmailConfigStatus } from '@/lib/emailService';

export async function GET() {
  try {
    const status = getEmailConfigStatus();
    return NextResponse.json({ ok: true, status });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}