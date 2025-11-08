import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';

export async function POST(req: Request) {
  const body = await req.json();
  const { username, name, password } = body;
  console.log('[auth/signup] Request received for username:', username);
  if (!username || !name || !password) {
    console.warn('[auth/signup] Missing fields', { username, name });
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  try {
    await connectToDatabase();
  } catch (e) {
    console.error('[auth/signup] Database connection failed', e);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
  }

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      console.warn('[auth/signup] User exists:', username);
      return NextResponse.json({ error: 'User exists' }, { status: 400 });
    }
    const passwordHash = await hash(password, 10);
    const u = await User.create({ username, name, passwordHash });
    console.log('[auth/signup] Created user:', u._id.toString());
    return NextResponse.json({ id: u._id, username: u.username, name: u.name }, { status: 201 });
  } catch (err) {
    console.error('[auth/signup] Unexpected error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
