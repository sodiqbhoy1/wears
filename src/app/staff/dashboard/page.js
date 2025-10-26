'use client';

import { useEffect, useState } from 'react';

export default function StaffDashboard() {
  const [staffData, setStaffData] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get staff data from localStorage
    const data = localStorage.getItem('staffData');
    if (data) {
      setStaffData(JSON.parse(data));
    }

    // Fetch order statistics
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      const res = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const orders = await res.json();
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          preparingOrders: orders.filter(o => o.status === 'preparing').length,
          readyOrders: orders.filter(o => o.status === 'ready').length
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {staffData?.name || 'Staff'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Here&#39;s what&#39;s happening with your orders today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold mt-2">
                {loading ? '...' : stats.totalOrders}
              </p>
            </div>
            <div className="text-4xl opacity-50">📦</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold mt-2">
                {loading ? '...' : stats.pendingOrders}
              </p>
            </div>
            <div className="text-4xl opacity-50">⏳</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Preparing</p>
              <p className="text-3xl font-bold mt-2">
                {loading ? '...' : stats.preparingOrders}
              </p>
            </div>
            <div className="text-4xl opacity-50">🔄</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Ready</p>
              <p className="text-3xl font-bold mt-2">
                {loading ? '...' : stats.readyOrders}
              </p>
            </div>
            <div className="text-4xl opacity-50">✅</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/staff/orders"
            className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="text-3xl">📋</div>
            <div>
              <h3 className="font-semibold text-gray-800">Manage Orders</h3>
              <p className="text-sm text-gray-600">View and update order status</p>
            </div>
          </a>

          <a
            href="/staff/products"
            className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="text-3xl">➕</div>
            <div>
              <h3 className="font-semibold text-gray-800">Add Products</h3>
              <p className="text-sm text-gray-600">Add new products to inventory</p>
            </div>
          </a>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-gray-600 font-medium w-24">Name:</span>
            <span className="text-gray-800">{staffData?.name || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-gray-600 font-medium w-24">Email:</span>
            <span className="text-gray-800">{staffData?.email || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-gray-600 font-medium w-24">Status:</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
