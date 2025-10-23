"use client";
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ type: '', message: '' });
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admin_token', data.token);
        window.location.href = '/admin/dashboard';
      } else {
        setToast({ type: 'error', message: data.error || 'Login failed' });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    
    <Navbar/>
    
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleLogin} className="relative bg-white p-6 rounded-lg shadow w-full max-w-md">
        {toast.message && (
          <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md shadow text-sm ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            {toast.message}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <FiLock className="text-[var(--brand)] w-6 h-6" />
          <h1 className="text-xl font-bold">Admin Login</h1>
        </div>

        {/* Email */}
        <label className="text-sm font-medium">Email</label>
        <div className="relative mb-3">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-10 py-2 focus:outline-none focus:border-[var(--brand)]" required />
        </div>

        {/* Password */}
        <label className="text-sm font-medium">Password</label>
        <div className="relative mb-4">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded px-10 py-2 pr-12 focus:outline-none focus:border-[var(--brand)]" required />
          <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {showPwd ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <button type="submit" className="w-full bg-[var(--brand)] text-white py-2 rounded" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <div className="mt-3 text-right">
          <Link href="/admin/forgot-password" className="text-sm text-[var(--brand)] underline">Forgot password?</Link>
        </div>
      </form>
    </main>
    </>
  );
}
