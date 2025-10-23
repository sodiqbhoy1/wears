"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiX, FiTrash } from 'react-icons/fi';
import { useCart } from '@/context/cart';

export default function CartPanel() {
  const { items, update, remove, clear } = useCart();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const total = items.reduce((s, it) => s + (Number(String(it.price).replace(/[^0-9.-]+/g, '')) || 0) * it.qty, 0);

  return (
    <>
      {/* Floating cart button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open cart"
        className="fixed right-6 bottom-6 z-50 inline-flex items-center gap-3 bg-[var(--brand)] text-white px-4 py-3 rounded-full shadow-lg ring-2 ring-[var(--brand)]/40"
      >
        <FiShoppingCart className="w-5 h-5" />
        <span className="sr-only">Open cart</span>
        <span className="text-sm font-medium">{items.length}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* slide-over */}
          <aside className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl transform transition ease-in-out duration-200">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="text-[var(--brand)] bg-[var(--brand)]/10 rounded-full w-9 h-9 flex items-center justify-center">
                    <FiShoppingCart className="text-[var(--brand)] w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Your cart</h3>
                </div>

                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button onClick={() => clear()} className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1">Clear</button>
                  )}
                  <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 text-gray-600 hover:text-gray-900">
                    <FiX />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 overflow-auto space-y-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                    <div className="mb-3 w-24 h-24 rounded-full bg-[var(--brand)]/8 flex items-center justify-center">
                      <FiShoppingCart className="text-[var(--brand)] w-8 h-8" />
                    </div>
                    <p className="font-medium">Your cart is empty</p>
                    <p className="text-sm mt-2">Add stylish items from the products page to get started.</p>
                  </div>
                ) : (
                  items.map((it, index) => {
                    // try to show a thumbnail if available
                    const img = it.image || it.img || it.imageUrl || null;
                    const priceNum = Number(String(it.price).replace(/[^0-9.-]+/g, '')) || 0;
                    const key = index.toString();
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          {img ? (
                            // next/image will gracefully handle public/remote images if configured
                            // fallback to a simple div if not available
                            <Image src={img} alt={it.name} width={64} height={64} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">👕</div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-[var(--foreground)]">{it.name}</div>
                              <div className="text-sm text-gray-500">
                                {it.size && <span>Size: {it.size}</span>}
                                {it.color && <span className="ml-2">Color: {it.color}</span>}
                              </div>
                              <div className="text-sm text-gray-500">{it.price}</div>
                            </div>
                            <button onClick={() => remove(key)} aria-label={`Remove ${it.name}`} className="text-red-500 p-2 hover:bg-red-50 rounded">
                              <FiTrash />
                            </button>
                          </div>

                          <div className="mt-2 flex items-center gap-3">
                            <div className="inline-flex items-center rounded-md bg-gray-100 border border-gray-200">
                              <button onClick={() => update(key, Math.max(1, it.qty - 1))} className="px-3 py-1 text-gray-700">−</button>
                              <div className="px-4 py-1 font-medium">{it.qty}</div>
                              <button onClick={() => update(key, it.qty + 1)} className="px-3 py-1 bg-[var(--brand)] text-white">+</button>
                            </div>

                            <div className="ml-auto text-sm font-medium text-[var(--foreground)]">#{(priceNum * it.qty).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {items.length > 0 && (
                <div className="p-4 border-t bg-white sticky bottom-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600">Subtotal</div>
                    <div className="text-lg font-semibold">#{total.toFixed(2)}</div>
                  </div>

                  <div className="space-y-2">
                    <button onClick={() => { setOpen(false); router.push('/checkout'); }} className="w-full inline-flex items-center justify-center gap-2 bg-[var(--brand)] text-white px-4 py-3 rounded-md shadow">
                      Checkout
                    </button>

                    <button onClick={() => { clear(); }} className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 px-4 py-3 rounded-md text-gray-700">
                      Continue shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
