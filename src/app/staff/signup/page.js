'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function StaffSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/staff/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'Account created! Please wait for admin approval.');
        router.push('/staff/login');
      } else {
        setError(data.error || 'Signup failed');
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
            <FiUser className="text-[var(--brand)] w-6 h-6" />
            <h1 className="text-xl font-bold">Staff Sign Up</h1>
          </div>

          {/* Name */}
          <label className="text-sm font-medium">Full Name</label>
          <div className="relative mb-3">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded px-10 py-2 focus:outline-none focus:border-[var(--brand)]"
            />
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
            />
          </div>

          {/* Password */}
          <label className="text-sm font-medium">Password</label>
          <div className="relative mb-3">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-10 py-2 pr-12 focus:outline-none focus:border-[var(--brand)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <label className="text-sm font-medium">Confirm Password</label>
          <div className="relative mb-4">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded px-10 py-2 pr-12 focus:outline-none focus:border-[var(--brand)]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--brand)] text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className="mt-3 text-center">
            <p className="text-sm">
              Already have an account?{' '}
              <Link href="/staff/login" className="text-[var(--brand)] underline">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </main>
    </>
  );
}
