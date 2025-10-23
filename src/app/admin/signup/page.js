"use client";
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useState } from 'react';
import { FiUserPlus, FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';

export default function AdminSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) {
      showToast('error', 'All fields are required');
      return;
    }
    if (!emailRegex.test(email)) {
      showToast('error', 'Enter a valid email address');
      return;
    }
    if (!passwordRegex.test(password)) {
      showToast('error', 'Password must be 8+ chars and include upper, lower, number, and special character');
      return;
    }
    if (password !== confirm) {
      showToast('error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message || 'Account created successfully');
        setTimeout(() => { window.location.href = '/admin/login'; }, 1000);
      } else {
        showToast('error', data.error || 'Signup failed');
      }
    } catch (err) {
      showToast('error', 'Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form onSubmit={handleSignup} className="relative bg-white p-6 rounded-lg shadow w-full max-w-md">
          {toast.message && (
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md shadow text-sm ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              {toast.message}
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <FiUserPlus className="text-[var(--brand)] w-6 h-6" />
            <h1 className="text-xl font-bold">Admin Signup</h1>
          </div>

          {/* Full name */}
          <label className="text-sm font-medium">Full Name</label>
          <div className="relative mb-3">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded pl-10 pr-3 py-2 focus:outline-none focus:border-[var(--brand)]"
              required
            />
          </div>

          {/* Email */}
          <label className="text-sm font-medium">Email</label>
          <div className="relative mb-3">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-10 py-2 focus:outline-none focus:border-[var(--brand)]"
              required
            />
          </div>

          {/* Password */}
          <label className="text-sm font-medium">Password</label>
          <div className="relative mb-3">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-10 py-2 pr-12 focus:outline-none focus:border-[var(--brand)]"
              required
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">Must be at least 8 characters and include uppercase, lowercase, number, and special character.</p>

          {/* Confirm Password */}
          <label className="text-sm font-medium">Confirm Password</label>
          <div className="relative mb-4">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border rounded px-10 py-2 pr-12 focus:outline-none focus:border-[var(--brand)]"
              required
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button type="submit" className="w-full bg-[var(--brand)] text-white py-2 rounded" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          <div className="mt-3 text-right">
            <Link href="/admin/login" className="text-sm text-[var(--brand)] underline">Already have an account?</Link>
          </div>
        </form>
      </main>
    </>
  );
}
