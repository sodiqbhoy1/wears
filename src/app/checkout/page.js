"use client";
import { useEffect, useState } from 'react';
import { useCart } from '@/context/cart';
import { useRouter } from 'next/navigation';
import { generateTrackingCode } from '@/lib/trackingUtils';

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // if no items go back to menu
    if (!items || items.length === 0) {
      router.replace('/products');
    }
  }, [items, router]);

  const total = items.reduce((s, it) => s + (Number(String(it.price).replace(/[^0-9.-]+/g, '')) || 0) * it.qty, 0);

  const validate = () => {
    const e = {};
    if (!customer.name || customer.name.trim().length < 2) e.name = 'Enter your full name';
    if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) e.email = 'Enter a valid email';
    if (!customer.phone || customer.phone.trim().length < 7) e.phone = 'Enter a valid phone number';
    if (!customer.address || customer.address.trim().length < 5) e.address = 'Enter delivery address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const startPaystack = async () => {
    if (!validate()) return;
    
    const key = process.env.NEXT_PUBLIC_PAYSTACK_KEY;
    if (!key) {
      alert('Paystack public key not configured. Set NEXT_PUBLIC_PAYSTACK_KEY in your environment.');
      return;
    }

    setLoading(true);

    try {
      // Load Paystack script
      if (!window.PaystackPop) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://js.paystack.co/v1/inline.js';
          s.onload = resolve;
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }

      // Create metadata for items + customer
      const metadata = {
        items: items.map(i => ({ 
          id: i._id, 
          name: i.name, 
          qty: i.qty, 
          price: i.price,
          size: i.size,
          color: i.color
        })),
        customer
      };

      const handler = window.PaystackPop.setup({
        key,
        email: customer.email,
        amount: Math.round(total * 100), // paystack uses kobo
        currency: 'NGN',
        metadata,
        onClose: function() {
          setLoading(false);
          // Payment window closed by user
        },
        callback: function(response) {
          // Payment successful - create order directly and clear cart
          setLoading(true);
          
          const createOrder = async () => {
            try {
              // Generate unique tracking code
              const trackingCode = generateTrackingCode();
              
              // Create order in database
              const orderData = {
                reference: trackingCode, // Use custom tracking code as primary reference
                paystack_reference: response.reference, // Keep Paystack reference for reconciliation
                amount: total,
                currency: 'NGN',
                customer: customer,
                items: items.map(i => ({ 
                  id: i._id, 
                  name: i.name, 
                  qty: i.qty, 
                  price: Number(String(i.price).replace(/[^0-9.-]+/g, '')) || 0,
                  size: i.size,
                  color: i.color
                })),
                status: 'pending',
                paid: true,
                createdAt: new Date()
              };

              const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
              });

              const orderResult = await orderResponse.json();
              
              if (!orderResult.ok) {
                // Handle order creation error silently in production
              }
            } catch (err) {
              // Handle error silently - continue since payment was successful
            } finally {
              clear();
              router.replace('/checkout/success?reference=' + encodeURIComponent(trackingCode));
            }
          };

          createOrder();
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Error setting up payment:', error);
      setLoading(false);
      alert('Error setting up payment. Please try again.');
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="bg-white p-4 rounded shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">Delivery & contact</h2>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input value={customer.name} onChange={(e) => setCustomer(c => ({ ...c, name: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2" placeholder="John Doe" />
              {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input value={customer.email} onChange={(e) => setCustomer(c => ({ ...c, email: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2" placeholder="you@example.com" />
              {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
            </div>

            <div>
              <label className="text-sm font-medium">Phone</label>
              <input value={customer.phone} onChange={(e) => setCustomer(c => ({ ...c, phone: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2" placeholder="+2348012345678" />
              {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
            </div>

            <div>
              <label className="text-sm font-medium">Delivery address</label>
              <textarea value={customer.address} onChange={(e) => setCustomer(c => ({ ...c, address: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2" placeholder="House, Street, City" rows={3} />
              {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-600">Items</div>
          <ul className="mt-2 space-y-2">
            {items.map(it => (
              <li key={it.key} className="flex items-center justify-between">
                <div className="text-sm">{it.title} × {it.qty}</div>
                <div className="text-sm font-medium">{it.price}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-lg font-semibold">Total</div>
          <div className="text-lg font-bold">₦{total.toFixed(2)}</div>
        </div>

        <div className="mt-6">
          <button onClick={startPaystack} disabled={loading} className="w-full bg-[var(--brand)] text-white px-4 py-3 rounded-md">
            {loading ? 'Opening payment...' : `Pay ₦${total.toFixed(2)} with Paystack`}
          </button>
        </div>
      </div>
    </main>
  );
}
