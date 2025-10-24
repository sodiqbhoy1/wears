"use client";
import { useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children, activePage = 'Home' }) {
  // Read token and pathname on the client. This component is a client component
  // so accessing window/localStorage here is safe.
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const publicAdminPaths = [
    '/admin/login',
    '/admin/signup',
    '/admin/forgot-password',
    '/admin/reset-password'
  ];

  const isPublicPage = publicAdminPaths.some(p => pathname.startsWith(p));

  // Don't show the sidebar on the login (or other public admin) pages.
  const showSidebar = Boolean(token) && !isPublicPage;

  useEffect(() => {
    // If there's no token and we're not on a public page, redirect to login.
    if (!token && !isPublicPage) {
      window.location.href = '/admin/login';
      return;
    }
  }, [token, pathname, isPublicPage]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {showSidebar && <AdminSidebar active={activePage} />}
      <main className={`flex-1 p-4 md:p-6 lg:p-8 ${showSidebar ? 'lg:ml-64' : ''}`}>
        {children}
      </main>
    </div>
  );
}