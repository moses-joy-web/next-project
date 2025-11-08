import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;
  console.log('[auth/login] Request received for username:', username);
  if (!username || !password) {
    console.warn('[auth/login] Missing fields', { username });
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  try {
    await connectToDatabase();
  } catch (e) {
    console.error('[auth/login] Database connection failed', e);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.warn('[auth/login] User not found:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const ok = await compare(password, user.passwordHash);
    if (!ok) {
      console.warn('[auth/login] Invalid password for username:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = sign({ sub: user._id.toString(), username: user.username }, secret, { expiresIn: '30d' });
    console.log('[auth/login] Authentication successful for user:', username);
    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error('[auth/login] Unexpected error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
