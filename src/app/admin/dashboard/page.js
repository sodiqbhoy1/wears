"use client";
import { useEffect, useState } from 'react';
import DashboardHome from '@/components/admin/DashboardHome';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    // fetch orders
    fetch('/api/orders').then(r => r.json()).then(d => {
      if (d.ok) setOrders(d.orders || []);
    });
  }, []);

  return (
    <DashboardHome orders={orders} />
  );
}
