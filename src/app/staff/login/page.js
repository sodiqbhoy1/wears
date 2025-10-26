'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function StaffLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('staffToken', data.token);
        localStorage.setItem('staffData', JSON.stringify(data.staff));
        window.location.href = '/staff/dashboard';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-20">
        <form onSubmit={handleSubmit} className="relative bg-white p-6 rounded-lg shadow w-full max-w-md">
          {error && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md shadow text-sm bg-red-500 text-white">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <FiLock className="text-[var(--brand)] w-6 h-6" />
            <h1 className="text-xl font-bold">Staff Login</h1>
          </div>

          {/* Email */}
          <label className="text-sm font-medium">Email Address</label>
          <div className="relative mb-3">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded px-10 py-2 focus:outline-none focus:border-[var(--brand)]"
              required
            />
          </div>

          {/* Password */}
          <label className="text-sm font-medium">Password</label>
          <div className="relative mb-4">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPwd ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-10 py-2 pr-12 focus:outline-none focus:border-[var(--brand)]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--brand)] text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="mt-3 text-right">
            <Link href="/staff/forgot-password" className="text-sm text-[var(--brand)] underline">
              Forgot password?
            </Link>
          </div>

          <div className="mt-3 text-center">
            <p className="text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/staff/signup" className="text-[var(--brand)] underline">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </main>
    </>
  );
}
