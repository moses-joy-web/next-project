"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      console.log('[login] submitting', { username });
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      console.log('[login] response', res.status, data);
      if (!res.ok) return setError(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      router.push('/');
    } catch (err) {
      console.error('[login] Unexpected error', err);
      setError('Unexpected error');
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-7 bg-white shadow-xl border-l-4 border-t-4 border-slate-900 rounded-md">
      <h1 className="text-2xl text-slate-900 mb-3 text-center font-bold">Login</h1>
      <p></p>
      <form onSubmit={onSubmit} className="space-y-2">
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your Username" className="w-full border rounded-md px-2 py-3 border-2 border-slate-700 bg-transparent placeholder-slate-900" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" type="password" className="w-full border rounded-md px-2 py-3 border-2 border-slate-700 bg-transparent placeholder-slate-900" />
        <div className="flex gap-2">
          <button className="px-3 py-2 w-full bg-slate-900 text-white rounded-md mt-6">Login</button>
        </div>
        <p className="text-center mt-4 text-slate-900">
          <hr className="my-4" />
          Don't have an account ?
          <a href="/signup" className="px-3 py-1 text-center text-blue-700 underline">Sign Up</a>
        </p>
        {error ? <div className="text-red-600">{error}</div> : null}
      </form>
    </div>
  );
}
