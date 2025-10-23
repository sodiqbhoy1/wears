"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash, FiImage, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
// layout is provided by src/app/admin/layout.js
import { getAuthHeaders, getAuthHeadersFormData } from '@/lib/apiHelpers';

const initialFormState = {
  id: '',
  name: '',
  basePrice: '',
  category: '',
  description: '',
  images: [],
  variants: [{ color: '', size: '', quantity: '', price: '', image: '' }],
};

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [variantImageUploading, setVariantImageUploading] = useState({});

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

  const onVariantFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setVariantImageUploading(prev => ({ ...prev, [index]: true }));

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
        handleVariantChange(index, 'image', data.url);
      } else {
        alert('Failed to upload image: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to upload image: ' + error.message);
    }
    setVariantImageUploading(prev => ({ ...prev, [index]: false }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...form.variants];
    newVariants[index][field] = value;
    setForm({ ...form, variants: newVariants });
  };

  const addVariant = () => {
    setForm({ ...form, variants: [...form.variants, { color: '', size: '', quantity: '', price: '', image: '' }] });
  };

  const removeVariant = (index) => {
    const newVariants = form.variants.filter((_, i) => i !== index);
    setForm({ ...form, variants: newVariants });
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

    setLoading(true);
    // Check admin token presence
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (!token) {
      setLoading(false);
      alert('You are not logged in as admin. Please login first.');
      return;
    }
    const method = form.id ? 'PUT' : 'POST';

    // Ensure variant quantities and prices are numbers
    const processedVariants = form.variants.map(v => ({
      ...v,
      quantity: Number(v.quantity || 0),
      price: v.price ? Number(v.price) : undefined,
      image: v.image || undefined,
    }));

    const payload = { ...form, variants: processedVariants };
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

  const edit = (it) => setForm({
    id: it._id || it.id,
    name: it.name,
    basePrice: it.basePrice,
    category: it.category,
    description: it.description,
    images: it.images || [],
    variants: (it.variants && it.variants.length > 0) ? it.variants : [{ color: '', size: '', quantity: '', price: '', image: '' }],
  });

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
                <label className="block text-sm font-medium mb-1">Name</label>
                <input className="w-full border rounded px-3 py-2 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Price</label>
                <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1">Category</label>
                <input className="w-full border rounded px-3 py-2 text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. shirts, trousers" />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded px-3 py-2 text-sm" value={form.description} rows={3} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1">Images</label>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFileChange}
                    className="text-sm"
                    disabled={imageUploading}
                  />
                  {imageUploading && <div className="flex items-center gap-2 text-blue-600"><FiLoader className="animate-spin" /> Uploading...</div>}
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
              <h3 className="text-md font-semibold mb-2">Product Variants</h3>
              {form.variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
                  {/* Column 1: Image Uploader */}
                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium mb-1 self-start">Variant Image</label>
                    {variant.image ? (
                      <div className="relative w-24 h-24">
                        <Image src={variant.image} alt="Variant" layout="fill" className="object-cover rounded" />
                         <button
                          type="button"
                          onClick={() => handleVariantChange(index, 'image', '')}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                        >&times;</button>
                      </div>
                    ) : (
                       <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                         <FiImage className="text-gray-400" size={32}/>
                       </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => onVariantFileChange(e, index)} className="text-sm mt-2" disabled={variantImageUploading[index]}/>
                    {variantImageUploading[index] && <div className="text-blue-600 text-sm mt-1">Uploading...</div>}
                  </div>

                  {/* Column 2: Details */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-3 items-start">
                    <div>
                      <label className="block text-sm font-medium mb-1">Color</label>
                      <input value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Red" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Size</label>
                      <input value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. M" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity</label>
                      <input type="number" value={variant.quantity} onChange={e => handleVariantChange(index, 'quantity', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (Optional)</label>
                      <input type="number" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="Overrides base price" />
                    </div>
                    <div className="col-span-2 flex items-end justify-end">
                       <button onClick={() => removeVariant(index)} className="text-red-500 p-2"><FiTrash /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addVariant} className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--brand)]"><FiPlus /> Add Variant</button>
            </div>

            <div className="mt-6">
              <button onClick={save} disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--brand)] text-white px-6 py-2 rounded text-sm">
                {loading ? 'Saving...' : (form.id ? 'Update Product' : 'Add Product')}
              </button>
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
                      <th className="p-2">Image</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Base Price</th>
                      <th className="p-2">Total Quantity</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(it => (
                      <tr key={it._id} className="border-b">
                        <td className="p-2">
                          {it.images && it.images[0] ? (
                            <Image src={it.images[0]} alt={it.name} width={48} height={48} className="object-cover rounded" />
                          ) : <div className="w-12 h-12 bg-gray-100 rounded" />}
                        </td>
                        <td className="p-2 font-medium">{it.name}</td>
                        <td className="p-2">{it.category}</td>
                        <td className="p-2">₦{Number(it.basePrice || 0).toFixed(2)}</td>
                        <td className="p-2">{getTotalQuantity(it.variants)}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${it.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {it.status}
                          </span>
                        </td>
                        <td className="p-2">
                          <button onClick={() => edit(it)} className="p-2"><FiEdit2 /></button>
                          <button onClick={() => del(it._id)} className="p-2 text-red-600"><FiTrash /></button>
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
