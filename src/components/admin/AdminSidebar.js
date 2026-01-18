"use client";
import { FiHome, FiPackage, FiUsers, FiList, FiLogOut, FiMenu, FiX, FiBell } from 'react-icons/fi';
import { useState } from 'react';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

const links = [
  { name: 'Home', href: '/admin/dashboard', icon: FiHome },
  { name: 'Orders', href: '/admin/orders', icon: FiPackage },
  { name: 'Products', href: '/admin/products', icon: FiList },
  { name: 'Announcements', href: '/admin/announcements', icon: FiBell },
  { name: 'Staff', href: '/admin/staff', icon: FiUsers },
];

export default function AdminSidebar({ active }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-md shadow-lg border hover:bg-gray-50 transition-colors"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? (
          <FiX className="w-5 h-5 text-gray-700" />
        ) : (
          <FiMenu className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col p-4 min-h-screen
      `}>
        <div className="font-bold text-xl mb-6 text-[var(--brand)] mt-16 lg:mt-0">Admin Panel</div>
        
        <nav className="flex-1">
          {links.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 w-full px-3 py-3 rounded mb-2 text-left hover:bg-[var(--brand)]/10 transition-colors ${
                active === link.name ? 'bg-[var(--brand)]/10 font-semibold' : ''
              }`}
            >
              <link.icon className="w-5 h-5 text-[var(--brand)]" />
              <span className="text-sm lg:text-base">{link.name}</span>
            </a>
          ))}
        </nav>

        {/* Enhanced Logout Button */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-3 rounded text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
          >
            <div className="p-1 rounded group-hover:bg-red-100 transition-colors">
              <FiLogOut className="w-5 h-5" />
            </div>
            <span className="text-sm lg:text-base font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
