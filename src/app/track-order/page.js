"use client";
import { useState } from 'react';
import { FiSearch, FiPackage, FiClock, FiTruck, FiCheckCircle, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import Link from 'next/link';

export default function TrackOrderPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trackOrder = async () => {
    if (!trackingCode.trim()) {
      setError('Please enter a tracking code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/track-order?code=${encodeURIComponent(trackingCode.trim())}`);
      const data = await response.json();

      if (data.ok && data.order) {
        setOrder(data.order);
        setError('');
      } else {
        setError(data.error || 'Order not found. Please check your tracking code.');
        setOrder(null);
      }
    } catch (err) {
      setError('Failed to track order. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="w-5 h-5" />;
      case 'preparing': return <FiPackage className="w-5 h-5" />;
      case 'ready': return <FiTruck className="w-5 h-5" />;
      case 'delivered': return <FiCheckCircle className="w-5 h-5" />;
      default: return <FiClock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'preparing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ready': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: FiClock },
      { key: 'preparing', label: 'Preparing', icon: FiPackage },
      { key: 'ready', label: 'Ready for Pickup/Delivery', icon: FiTruck },
      { key: 'delivered', label: 'Delivered', icon: FiCheckCircle }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStatus);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-[var(--brand)]">
              WearHouse
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/menu" className="text-gray-600 hover:text-[var(--brand)]">
                Menu
              </Link>
              <Link href="/track-order" className="text-[var(--brand)] font-medium">
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your tracking code to see your order status</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                placeholder="Enter your tracking code (e.g., FJ12345678)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--brand)] text-sm uppercase"
                onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
              />
            </div>
            <button
              onClick={trackOrder}
              disabled={loading}
              className="px-6 py-3 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand)]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Tracking...
                </>
              ) : (
                <>
                  <FiSearch className="w-4 h-4" />
                  Track Order
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order #{order.reference}</h2>
                  <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="font-medium capitalize">{order.status}</span>
                </div>
              </div>
            </div>

            {/* Order Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-6">Order Progress</h3>
              <div className="space-y-4">
                {getStatusSteps(order.status).map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                        step.completed 
                          ? 'bg-[var(--brand)] border-[var(--brand)] text-white' 
                          : step.active
                          ? 'border-[var(--brand)] text-[var(--brand)] bg-white'
                          : 'border-gray-300 text-gray-400 bg-white'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.completed || step.active ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                      </div>
                      {step.completed && (
                        <div className="text-green-600 text-sm">
                          ✓ Complete
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{order.customer?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{order.customer?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <span className="text-gray-900">{order.customer?.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title || item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.qty || item.quantity || 1}</p>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      ₦{((item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-[var(--brand)]">₦{order.amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 mb-3">
            If you have any questions about your order or need assistance, please contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="tel:+2348012345678" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <FiPhone className="w-4 h-4" />
              Call: +234 801 234 5678
            </a>
            <a href="mailto:support@foodjoint.com" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <FiMail className="w-4 h-4" />
              Email: support@foodjoint.com
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}