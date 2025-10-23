"use client";
import { useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children, activePage = 'Home' }) {
  // Read token and pathname on the client. This component is a client component
  // so accessing window/localStorage here is safe.
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Don't show the sidebar on the login (or other public admin) pages.
  const showSidebar = Boolean(token) && !pathname.startsWith('/admin/login');

  useEffect(() => {
    // If there's no token and we're not already on the login page, redirect to login.
    if (!token && !pathname.startsWith('/admin/login')) {
      window.location.href = '/admin/login';
      return;
    }
  }, [token, pathname]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {showSidebar && <AdminSidebar active={activePage} />}
      <main className={`flex-1 p-4 md:p-6 lg:p-8 ${showSidebar ? 'lg:ml-64' : ''}`}>
        {children}
      </main>
    </div>
  );
}