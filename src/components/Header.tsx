"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(typeof window !== 'undefined' && !!localStorage.getItem('token'));
  }, []);

  function onLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      setLoggedIn(false);
      // refresh to update UI
      window.location.href = '/';
    }
  }

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-sky-600">SocialX</Link>
            <nav className="hidden sm:flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Link href="/" className="hover:underline">Feed</Link>
              <Link href="/profile/alice" className="hover:underline">Explore</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <input
                placeholder="Search"
                className="px-3 py-1 rounded border bg-slate-50 text-sm dark:bg-slate-800"
              />
            </div>

            <div>
              {loggedIn ? (
                <button onClick={onLogout} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Logout</button>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="px-3 py-1 border rounded text-sm">Login</Link>
                  <Link href="/signup" className="px-3 py-1 bg-sky-600 text-white rounded text-sm">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
