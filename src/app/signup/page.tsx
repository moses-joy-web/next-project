"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      console.log('[signup] submitting', { username, name });
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, name, password }) });
      const data = await res.json();
      console.log('[signup] response', res.status, data);
      if (!res.ok) return setError(data.error || 'Signup failed');
      // after signup, auto-login
      console.log('[signup] attempting auto-login for', username);
      const login = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const ld = await login.json();
      console.log('[signup] login response', login.status, ld);
      if (!login.ok) return setError(ld.error || 'Login failed');
      localStorage.setItem('token', ld.token);
      router.push('/');
    } catch (err) {
      console.error('[signup] Unexpected error', err);
      setError('Unexpected error');
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-7 bg-white shadow-xl border-l-4 border-t-4 border-slate-900 rounded-md">
      <h1 className="text-2xl text-slate-900 mb-3 text-center font-bold">Sign up</h1>
      <p></p>
      <form onSubmit={onSubmit} className="space-y-2">
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your Username" className="w-full  border rounded-md px-2 py-3 border-2 border-slate-700 py-2 bg-transparent placeholder-slate-900" />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your Name" className="w-full  border rounded-md px-2 py-1 border-2 border-slate-700 py-3 bg-transparent placeholder-slate-900" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" type="password" className="w-full  border rounded-md px-2 py-3 border-2 border-slate-700 py-2 bg-transparent placeholder-slate-900" />
        <div className="flex gap-2">
          <button className="px-3 py-2 w-full bg-slate-900 text-white rounded-md mt-6">Sign up</button>
        </div>
        <p
          className="text-center mt-4 text-slate-900">
          <hr className="my-4" />
          Already Have An account ? 
           <a href="/login" className="px-3 py-1 text-center text-blue-700  underline">Login</a>
        </p>
        {error ? <div className="text-red-600">{error}</div> : null}
      </form>
    </div>
  );
}
