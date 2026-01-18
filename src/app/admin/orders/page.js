"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiEye, FiTruck, FiCheck, FiClock, FiPhone, FiMail, FiMapPin, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { getAuthHeaders } from '@/lib/apiHelpers';
// layout is provided by src/app/admin/layout.js

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [resendLoadingId, setResendLoadingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const ORDERS_PER_PAGE = 15;

  useEffect(() => {
    loadOrders(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const loadOrders = async (page = 1, filter = 'all') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?page=${page}&limit=${ORDERS_PER_PAGE}&status=${filter}`);
      const data = await res.json();
      if (data.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setTotalOrders(data.totalOrders || 0);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const resendEmail = async (order) => {
    try {
      setResendLoadingId(order._id);
      const res = await fetch('/api/orders/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order._id })
      });
      const data = await res.json();
      if (data.ok && data.result?.success) {
        setToast({ type: 'success', message: 'Confirmation email resent successfully.' });
        loadOrders(currentPage, statusFilter);
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to resend email.' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to resend email.' });
    } finally {
      setResendLoadingId(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const headers = Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders() || {});
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ _id: orderId, status: newStatus })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const errMsg = (data && data.error) ? data.error : `Failed to update status (status ${res.status})`;
        console.error('Update order status error:', errMsg);
        setToast({ type: 'error', message: errMsg });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      // Success: refresh and update local selected order
      loadOrders(currentPage, statusFilter);
      if (selectedOrder && (selectedOrder._id === orderId || selectedOrder._id === String(orderId))) {
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const viewOrderDetails = async (order) => {
    setLoadingOrderDetails(true);
    setSelectedOrder(order);
    
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/admin/orders/${order._id}`, { headers });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data.ok && data.order) {
        setSelectedOrder(data.order);
      } else {
        throw new Error(data.error || 'Failed to load order details');
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
      setToast({ type: 'error', message: err.message || 'Failed to load order details' });
      setTimeout(() => setToast(null), 3000);
      // Keep the basic order visible even if detailed fetch fails
      setLoadingOrderDetails(false);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const filteredOrders = orders; // No longer need to filter on client-side

  if (loading && orders.length === 0) { // Show full-page loader only on initial load
    return (
      <section className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
    <section className="flex-1 p-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Orders Management ({totalOrders})</h1>
          <div className="flex items-center gap-4">
            <select 
              value={statusFilter} 
              onChange={handleFilterChange}
              className="w-full sm:w-auto border rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand)]"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
            <FiTruck className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-sm md:text-base text-gray-500">
              {statusFilter === 'all' ? 'No orders have been placed yet.' : `No ${statusFilter} orders found.`}
            </p>
          </div>
        ) : (
          <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Mobile Card View */}
            <div className="block md:hidden">
              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">#{order.reference}</div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                        {getStatusIcon(order.status || 'pending')}
                        {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>{order.customer?.name || 'N/A'}</div>
                      <div className="text-xs">{order.customer?.email}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">{order.items?.length || 0} items</div>
                        <div className="font-medium text-gray-900">₦{order.amount?.toFixed(2)}</div>
                        <div className="mt-1">
                          {order.paid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiCheckCircle className="w-3 h-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FiXCircle className="w-3 h-3" />
                              Unpaid
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                      <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="flex-1 text-[var(--brand)] hover:text-[var(--brand)]/80 text-sm py-2 px-3 border border-[var(--brand)] rounded"
                      >
                        View Details
                      </button>
                      {order.status !== 'delivered' && (
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="text-xs border rounded px-2 py-2 focus:outline-none focus:border-[var(--brand)]"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-3">Order ID</th>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3">Customer</th>
                    <th scope="col" className="px-6 py-3">Total</th>
                    <th scope="col" className="px-6 py-3">Payment</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">#{order.reference}</td>
                      <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{order.customer?.name || 'N/A'}</td>
                      <td className="px-6 py-4">₦{order.amount?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {order.paid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiCheckCircle className="w-3 h-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FiXCircle className="w-3 h-3" />
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'delivered' ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                            {getStatusIcon(order.status || 'pending')}
                            {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                          </span>
                        ) : (
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="text-xs border rounded px-2 py-1 focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => viewOrderDetails(order)} className="font-medium text-[var(--brand)] hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          </>
        )}
      </div>

      {/* Selected Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow max-w-2xl w-full mx-4 p-6 md:p-8 md:mx-0 md:w-3/4 lg:w-1/2 h-auto max-h-[90vh] overflow-auto sm:mx-2">
            {loadingOrderDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand)]"></div>
                <span className="ml-3">Loading order details...</span>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-semibold">Order Details — #{selectedOrder.reference}</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                </div>

                {/* Order Progress Tracker */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Order Progress</h3>
                  <div className="space-y-3">
                    {getStatusSteps(selectedOrder.status || 'pending').map((step) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                            step.completed 
                              ? 'bg-[var(--brand)] border-[var(--brand)] text-white' 
                              : step.active
                              ? 'border-[var(--brand)] text-[var(--brand)] bg-white'
                              : 'border-gray-300 text-gray-400 bg-white'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${step.completed || step.active ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step.label}
                            </p>
                          </div>
                          {step.completed && (
                            <div className="text-green-600 text-xs font-medium">
                              ✓ Complete
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Customer Information</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700"><span className="font-medium">Name:</span> {selectedOrder.customer?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-700"><span className="font-medium">Email:</span> {selectedOrder.customer?.email}</p>
                      <p className="text-sm text-gray-700"><span className="font-medium">Phone:</span> {selectedOrder.customer?.phone}</p>
                      <p className="text-sm text-gray-700"><span className="font-medium">Address:</span> {selectedOrder.customer?.address}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <p className="text-sm text-gray-700">Items: {selectedOrder.items?.length || 0}</p>
                    <p className="text-sm text-gray-700 font-semibold">Total: ₦{(selectedOrder.amount || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-700">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                      <select 
                        value={selectedOrder.status || 'pending'} 
                        onChange={(e) => { 
                          updateOrderStatus(selectedOrder._id, e.target.value);
                        }} 
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--brand)]"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready for Pickup/Delivery</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Items to Package</h3>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.resolvedItems && selectedOrder.resolvedItems.length > 0 ? (
                      selectedOrder.resolvedItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 border-b py-2">
                          {item.productImage && (
                            <Image src={item.productImage} alt={item.productName} width={64} height={64} className="object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-gray-500">
                              {item.variant ? (
                                <>Size: {item.variant.size} / Color: {item.variant.color}</>
                              ) : (
                                <>{item.size && `Size: ${item.size}`} {item.color && `/ Color: ${item.color}`}</>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">Qty: {item.qty || item.quantity || 1}</div>
                          </div>
                          <div className="text-sm font-medium">₦{(item.price || 0).toFixed(2)}</div>
                        </div>
                      ))
                    ) : (
                      (selectedOrder.items || []).map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b py-2">
                          <div>
                            <div className="font-medium">{it.title || it.name || it.productName || 'Unknown product'}</div>
                            <div className="text-sm text-gray-500">{it.size ? `${it.size} / ${it.color}` : (it.color || '')}</div>
                          </div>
                          <div className="text-sm">{(it.qty || it.quantity || 1)} x ₦{(it.price || 0).toFixed(2)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
    </>
  );
}