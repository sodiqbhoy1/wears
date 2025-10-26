'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiEye, FiTruck, FiCheck, FiClock, FiPhone, FiMail, FiMapPin, FiCheckCircle } from 'react-icons/fi';

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadOrders(statusFilter);
  }, [statusFilter]);

  const loadOrders = async (filter = 'all') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?status=${filter}`);
      const data = await res.json();
      if (data.ok) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('staffToken');
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ _id: orderId, status: newStatus })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const errMsg = (data && data.error) ? data.error : `Failed to update status`;
        setToast({ type: 'error', message: errMsg });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      loadOrders(statusFilter);
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      setToast({ type: 'success', message: 'Order status updated.' });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error('Failed to update order status:', err);
      setToast({ type: 'error', message: err.message || 'Failed to update order status.' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'preparing': return <FiTruck className="w-4 h-4" />;
      case 'ready': return <FiCheck className="w-4 h-4" />;
      case 'delivered': return <FiCheck className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: FiClock },
      { key: 'preparing', label: 'Preparing', icon: FiTruck },
      { key: 'ready', label: 'Ready for Pickup/Delivery', icon: FiCheck },
      { key: 'delivered', label: 'Delivered', icon: FiCheckCircle }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStatus);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const viewOrderDetails = async (order) => {
    setLoadingOrderDetails(true);
    setSelectedOrder(order);
    
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`);
      const data = await res.json();
      
      if (data.ok && data.order) {
        setSelectedOrder(data.order);
      } else {
        setSelectedOrder(order);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setSelectedOrder(order);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
        <p className="text-gray-600 mt-2">View and update order status</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={handleFilterChange}
          className="ml-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--brand)]"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {order.orderId || order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{order.customer?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.customer?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      ₦{order.totalAmount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                        {getStatusIcon(order.status || 'pending')}
                        {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-[var(--brand)] hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        <FiEye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {loadingOrderDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand)] mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading details...</p>
                </div>
              ) : (
                <>
                  {/* Order Status Progress */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h3>
                    <div className="flex items-center justify-between">
                      {getStatusSteps(selectedOrder.status || 'pending').map((step, index, array) => (
                        <div key={step.key} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              step.completed ? 'bg-[var(--brand)] text-white' : 'bg-gray-300 text-gray-600'
                            }`}>
                              <step.icon className="w-5 h-5" />
                            </div>
                            <p className={`mt-2 text-xs font-medium text-center ${
                              step.active ? 'text-[var(--brand)]' : 'text-gray-600'
                            }`}>
                              {step.label}
                            </p>
                          </div>
                          {index < array.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 ${
                              step.completed ? 'bg-[var(--brand)]' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex gap-2 flex-wrap">
                      {['pending', 'preparing', 'ready', 'delivered'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(selectedOrder._id, status)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm ${
                            selectedOrder.status === status
                              ? 'bg-[var(--brand)] text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <FiMail className="text-[var(--brand)] mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-800">{selectedOrder.customer?.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FiPhone className="text-[var(--brand)] mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-800">{selectedOrder.customer?.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 md:col-span-2">
                        <FiMapPin className="text-[var(--brand)] mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Delivery Address</p>
                          <p className="text-sm font-medium text-gray-800">{selectedOrder.customer?.address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          {item.image && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            {item.variant && (
                              <p className="text-xs text-gray-500">
                                Size: {item.variant.size} | Color: {item.variant.color}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">₦{(item.price * item.quantity).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">₦{item.price.toLocaleString()} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-800">₦{selectedOrder.totalAmount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-[var(--brand)]">₦{selectedOrder.totalAmount?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
