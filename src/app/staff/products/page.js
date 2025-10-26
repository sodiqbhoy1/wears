'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiImage, FiLoader } from 'react-icons/fi';

const initialFormState = {
  name: '',
  basePrice: '',
  category: '',
  description: '',
  images: [],
  quantity: '',
  color: '',
  size: '',
};

export default function StaffProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setProductsLoading(true);
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.ok) setItems(data.items);
    setProductsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onFileChange = async (e) => {
    const files = e.target.files;
    if (!files) return;

    setImageUploading(true);
    const uploadedImages = [];
    for (const file of files) {
      try {
        const token = localStorage.getItem('staffToken');
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: fd
        });
        const data = await res.json();
        if (data.ok) {
          uploadedImages.push(data.url);
        } else {
          alert('Failed to upload image: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        alert('Failed to upload image: ' + error.message);
      }
    }
    setForm(f => ({ ...f, images: [...f.images, ...uploadedImages] }));
    setImageUploading(false);
  };

  const save = async () => {
    if (!form.name || String(form.name).trim() === '') {
      alert('Product name is required');
      return;
    }
    if (!form.basePrice && form.basePrice !== 0) {
      alert('Base price is required');
      return;
    }
    if (!form.quantity && form.quantity !== 0) {
      alert('Quantity is required');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('staffToken');
    if (!token) {
      setLoading(false);
      alert('You are not logged in. Please login first.');
      return;
    }

    const variant = {
      color: form.color || null,
      size: form.size || null,
      quantity: Number(form.quantity || 0),
      price: form.basePrice ? Number(form.basePrice) : undefined,
      image: form.images && form.images[0] ? form.images[0] : undefined,
    };

    const payload = {
      name: form.name,
      basePrice: Number(form.basePrice || 0),
      category: form.category || '',
      description: form.description || '',
      images: form.images || [],
      variants: [variant]
    };

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setLoading(false);

    if (data.ok) {
      setToast({ type: 'success', message: 'Product added successfully!' });
      setTimeout(() => setToast(null), 3000);
      setForm(initialFormState);
      load();
    } else {
      alert(data.error || 'Failed to add product');
    }
  };

  const removeImage = (index) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
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
        <h1 className="text-3xl font-bold text-gray-800">Add Product</h1>
        <p className="text-gray-600 mt-2">Add new products to the inventory</p>
      </div>

      {/* Add Product Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Product Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter product name (e.g., Cotton T-Shirt)"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₦) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter price (e.g., 5000)"
              value={form.basePrice}
              onChange={e => setForm({ ...form, basePrice: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              placeholder="Enter category (e.g., T-Shirts, Jeans)"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter quantity in stock (e.g., 50)"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <input
              type="text"
              placeholder="Enter color (e.g., Black, White, Blue)"
              value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size
            </label>
            <input
              type="text"
              placeholder="Enter size (e.g., S, M, L, XL)"
              value={form.size}
              onChange={e => setForm({ ...form, size: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter product description and details"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-[var(--brand)] font-medium">Upload images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onFileChange}
                  className="hidden"
                  disabled={imageUploading}
                />
              </label>
              <p className="text-sm text-gray-500 mt-1">
                {imageUploading ? 'Uploading...' : 'PNG, JPG, GIF up to 10MB'}
              </p>
            </div>

            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <Image
                      src={img}
                      alt={`Product ${i + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={save}
            disabled={loading || imageUploading}
            className="px-6 py-3 bg-[var(--brand)] text-white rounded-lg font-semibold hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <FiLoader className="animate-spin" />}
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
          <button
            onClick={() => setForm(initialFormState)}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
          >
            Clear Form
          </button>
        </div>
      </div>

      {/* Products List (View Only) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Current Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {item.images && item.images[0] && (
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          width={50}
                          height={50}
                          className="rounded-lg object-cover"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.category || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">₦{item.basePrice?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (item.variants?.[0]?.quantity || 0) > 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.variants?.[0]?.quantity || 0} in stock
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
