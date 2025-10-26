'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import StaffSidebar from '@/components/staff/StaffSidebar';

// Public staff pages that don't require authentication
const publicStaffPaths = [
  '/staff/login',
  '/staff/signup',
  '/staff/forgot-password',
  '/staff/reset-password'
];

export default function StaffLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const isPublicPath = publicStaffPaths.includes(pathname);

    if (!token && !isPublicPath) {
      router.push('/staff/login');
    } else if (token && isPublicPath) {
      router.push('/staff/dashboard');
    } else {
      setIsAuthenticated(!isPublicPath || !!token);
    }
    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show children without sidebar for public pages
  const isPublicPage = publicStaffPaths.includes(pathname);
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Show sidebar layout for authenticated pages
  return (
    <div className="flex min-h-screen bg-gray-50">
      <StaffSidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
