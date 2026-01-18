"use client";
import { useState, useEffect } from 'react';

export default function DashboardHome({ orders }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600">Manage your food delivery business from here</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-blue-100 p-2 md:p-3 rounded-full">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                ₦{orders.reduce((sum, order) => sum + (order.amount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-2 md:p-3 rounded-full">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Today&apos;s Orders</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {orders.filter(order => {
                  const orderDate = new Date(order.createdAt || Date.now());
                  const today = new Date();
                  return orderDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
            <div className="bg-yellow-100 p-2 md:p-3 rounded-full">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-800">Recent Orders</h2>
        </div>
        <div className="p-4 md:p-6">
          {orders.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-10 h-10 md:w-12 md:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-sm md:text-base text-gray-500">No orders yet. Start promoting your business!</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {orders.slice(0, 5).map((order, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-4">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="bg-[var(--brand)] text-white p-1.5 md:p-2 rounded-full flex-shrink-0">
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm md:text-base font-medium text-gray-900 truncate">Order #{order.reference}</p>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{order.customer?.name || order.customer?.email || 'Unknown customer'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between sm:justify-end sm:text-right gap-4">
                    <div>
                      <p className="text-sm md:text-base font-semibold text-gray-900">₦{order.amount?.toFixed(2)}</p>
                      <p className="text-xs md:text-sm text-gray-500">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length > 5 && (
                <div className="text-center pt-3 md:pt-4">
                  <a href="/admin/orders" className="text-sm md:text-base text-[var(--brand)] hover:underline">View all orders</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}