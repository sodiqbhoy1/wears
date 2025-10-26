"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiEdit2, FiTrash, FiImage, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
// layout is provided by src/app/admin/layout.js
import { getAuthHeaders, getAuthHeadersFormData } from '@/lib/apiHelpers';

const initialFormState = {
  id: '',
  name: '',
  basePrice: '',
  category: '',
  description: '',
  images: [],
  quantity: '',
  color: '',
  size: '',
};

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

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
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: getAuthHeadersFormData(),
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
    // Basic client-side validation
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
    // Check admin token presence
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (!token) {
      setLoading(false);
      alert('You are not logged in as admin. Please login first.');
      return;
    }
    const method = form.id ? 'PUT' : 'POST';

    // Create a single variant from the form data
    const variant = {
      color: form.color || null,
      size: form.size || null,
      quantity: Number(form.quantity || 0),
      price: form.basePrice ? Number(form.basePrice) : undefined,
      image: form.images && form.images[0] ? form.images[0] : undefined,
    };

    const payload = { 
      ...form, 
      variants: [variant],
      quantity: Number(form.quantity || 0)
    };
    if (form.id) payload._id = form.id;

    try {
      const res = await fetch('/api/products', {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.ok) {
        console.error('Save product failed', { status: res.status, data });
        alert('Failed to save product: ' + (data.error || 'Unknown error'));
        return;
      }

      // success
      setForm(initialFormState);
      load();
    } catch (err) {
      console.error('Network error saving product', err);
      setLoading(false);
      alert('Network error: ' + (err.message || String(err)));
    }
  };

  const edit = (it) => {
    const firstVariant = (it.variants && it.variants.length > 0) ? it.variants[0] : {};
    setForm({
      id: it._id || it.id,
      name: it.name,
      basePrice: it.basePrice,
      category: it.category,
      description: it.description,
      images: it.images || [],
      quantity: firstVariant.quantity || it.quantity || '',
      color: firstVariant.color || '',
      size: firstVariant.size || '',
    });
  };

  const del = async (id) => {
    await fetch('/api/products?id=' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    load();
  };

  const getTotalQuantity = (variants) => {
    return (variants || []).reduce((total, v) => total + (Number(v.quantity) || 0), 0);
  }

  return (
    <section className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Manage Products</h1>

          <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{form.id ? 'Edit Product' : 'Add New Product'}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input 
                  className="w-full border rounded px-3 py-2 text-sm" 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  placeholder="e.g., Classic Cotton T-Shirt"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (₦) *</label>
                <input 
                  type="number" 
                  className="w-full border rounded px-3 py-2 text-sm" 
                  value={form.basePrice} 
                  onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} 
                  placeholder="e.g., 5000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input 
                  className="w-full border rounded px-3 py-2 text-sm" 
                  value={form.category} 
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
                  placeholder="e.g., Shirts, Trousers, Dresses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity in Stock *</label>
                <input 
                  type="number" 
                  className="w-full border rounded px-3 py-2 text-sm" 
                  value={form.quantity} 
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} 
                  placeholder="e.g., 50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input 
                  className="w-full border rounded px-3 py-2 text-sm" 
                  value={form.color} 
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))} 
                  placeholder="e.g., Red, Blue, Black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <input 
                  className="w-full border rounded px-3 py-2 text-sm" 
                  value={form.size} 
                  onChange={e => setForm(f => ({ ...f, size: e.target.value }))} 
                  placeholder="e.g., S, M, L, XL"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="w-full border rounded px-3 py-2 text-sm" 
                  value={form.description} 
                  rows={3} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  placeholder="Describe the product features, material, and other details..."
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1">Product Images</label>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFileChange}
                    className="text-sm"
                    disabled={imageUploading}
                  />
                  {imageUploading && <div className="flex items-center gap-2 text-blue-600"><FiLoader className="animate-spin" /> Uploading images...</div>}
                  <div className="flex flex-wrap gap-2">
                    {form.images.map((img, index) => (
                      <div key={index} className="relative">
                        <Image src={img} alt="Preview" width={80} height={80} className="object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }))}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                        >&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button onClick={save} disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--brand)] text-white px-6 py-2 rounded text-sm">
                {loading ? 'Saving...' : (form.id ? 'Update Product' : 'Add Product')}
              </button>
              {form.id && (
                <button 
                  onClick={() => setForm(initialFormState)} 
                  className="ml-2 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-500 text-white px-6 py-2 rounded text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded shadow p-4 mt-6">
            <h2 className="text-lg font-semibold mb-3">Products</h2>
            {productsLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : items.length === 0 ? (
              <div>No products yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left w-20">Image</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Base Price</th>
                      <th className="p-2 text-left w-24">Total Qty</th>
                      <th className="p-2 text-left w-28">Status</th>
                      <th className="p-2 text-left w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(it => (
                      <tr key={it._id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {it.images && it.images[0] ? (
                            <Image src={it.images[0]} alt={it.name} width={50} height={50} className="object-cover rounded" />
                          ) : <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <FiImage className="text-gray-400" />
                          </div>}
                        </td>
                        <td className="p-2 font-medium">{it.name}</td>
                        <td className="p-2 text-gray-600">{it.category || '-'}</td>
                        <td className="p-2 font-medium">₦{Number(it.basePrice || 0).toFixed(2)}</td>
                        <td className="p-2 text-center">{getTotalQuantity(it.variants)}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            it.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {it.status === 'available' ? <FiCheckCircle className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
                            {it.status}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => edit(it)} className="p-2 hover:bg-gray-100 rounded text-blue-600" title="Edit"><FiEdit2 /></button>
                            <button onClick={() => del(it._id)} className="p-2 hover:bg-gray-100 rounded text-red-600" title="Delete"><FiTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
  );
}
