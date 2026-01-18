"use client";
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiCopy, FiPackage } from 'react-icons/fi';
import { formatTrackingCode } from '@/lib/trackingUtils';
function SuccessContent() {
  const params = useSearchParams();
  const ref = params?.get('reference') || '';
  const [orderStatus, setOrderStatus] = useState('checking'); // checking, found, not-found
  const [orderDetails, setOrderDetails] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref) {
      // Check if order exists in database
      const checkOrder = async () => {
        try {
          const response = await fetch(`/api/orders?reference=${encodeURIComponent(ref)}`);
          const data = await response.json();
          if (data.ok && data.orders && data.orders.length > 0) {
            setOrderStatus('found');
            setOrderDetails(data.orders[0]);
          } else {
            setOrderStatus('not-found');
            setTimeout(checkOrder, 5000);
          }
        } catch (error) {
          setOrderStatus('not-found');
        }
      };
      checkOrder();
    }
  }, [ref]);

  const copyTrackingCode = async () => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = ref;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-8">
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful! 🎉</h1>
        <p className="text-gray-600 mb-6">Thank you for your order. Your payment has been processed successfully.</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Your Tracking Code</h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-mono text-lg font-bold text-[var(--brand)]">
              {formatTrackingCode(ref) || ref}
            </span>
            <button
              onClick={copyTrackingCode}
              className="p-1 text-gray-500 hover:text-[var(--brand)] transition-colors"
              title="Copy tracking code"
            >
              <FiCopy className="w-4 h-4" />
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600">✓ Copied to clipboard!</p>
          )}
          <p className="text-xs text-gray-500">Save this code to track your order</p>
        </div>
        <div className="mb-6">
          {orderStatus === 'checking' && (
            <div className="text-blue-600 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Verifying your order...
            </div>
          )}
          {orderStatus === 'found' && orderDetails && (
            <div className="text-green-600">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiCheckCircle className="w-5 h-5" />
                <span className="font-medium">Order confirmed!</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                Total: ₦{orderDetails?.amount?.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Status: <span className="capitalize font-medium">{orderDetails.status}</span>
              </p>
            </div>
          )}
          {orderStatus === 'not-found' && (
            <div className="text-orange-600">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiPackage className="w-5 h-5" />
                <span className="font-medium">Order being processed</span>
              </div>
              <p className="text-sm text-gray-600">
                Order being processed via backup system. You will receive confirmation shortly.
              </p>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <Link 
            href={`/track-order?code=${encodeURIComponent(ref)}`}
            className="block w-full bg-[var(--brand)] text-white py-3 px-6 rounded-lg hover:bg-[var(--brand)]/90 transition-colors font-medium"
          >
            Track Your Order
          </Link>
          <div className="flex gap-3">
            <Link 
              href="/menu" 
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Order More
            </Link>
            <Link 
              href="/" 
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<main className="max-w-2xl mx-auto p-8 text-center"><div>Loading...</div></main>}>
      <SuccessContent />
    </Suspense>
  );
}
