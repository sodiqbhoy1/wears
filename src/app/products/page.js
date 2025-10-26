"use client";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';
import Image from 'next/image';
import CartPanel from '@/components/CartPanel';
import { useCart } from '@/context/cart';

export default function ProductsPage(){
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const { add } = useCart();
    const [selectedVariants, setSelectedVariants] = useState({});
    const [quantities, setQuantities] = useState({});
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(()=>{
        fetchProducts()
    },[])

    const fetchProducts = async ()=>{
        try {
            const res = await fetch("/api/public/products")
            const data = await res.json()
            if(!res.ok){
                // Handle error
                setLoading(false);
                return;
            }
            const items = data.items || [];

            // Normalize products so UI can rely on a variants array.
            const normalized = items.map((it) => {
                // If already has variants, ensure numbers are correct and image keys exist
                if (Array.isArray(it.variants) && it.variants.length > 0) {
                    const v = it.variants.map(variant => ({
                        ...variant,
                        quantity: Number(variant.quantity || 0),
                        price: variant.price != null ? Number(variant.price) : undefined,
                        image: variant.image || undefined,
                    }));
                    return { ...it, variants: v, basePrice: it.basePrice != null ? Number(it.basePrice) : (it.price != null ? Number(it.price) : undefined) };
                }

                // Legacy product shape: use top-level fields to create a single variant
                const legacyVariant = {
                    color: null,
                    size: null,
                    quantity: Number(it.quantity || 0),
                    price: it.price != null ? Number(it.price) : (it.basePrice != null ? Number(it.basePrice) : undefined),
                    image: it.image || (Array.isArray(it.images) ? it.images[0] : undefined),
                };
                return {
                    ...it,
                    variants: [legacyVariant],
                    basePrice: it.basePrice != null ? Number(it.basePrice) : (it.price != null ? Number(it.price) : undefined),
                    images: it.images || (it.image ? [it.image] : []),
                };
            });

            setProducts(normalized);

            if (Array.isArray(normalized)) {
                const initialQuantities = {};
                const initialVariants = {};
                normalized.forEach((it) => {
                    const k = it._id ?? it.id;
                    if (k != null) {
                        initialQuantities[k] = 1;
                        if (it.variants && it.variants.length > 0) {
                            const firstInStockIndex = it.variants.findIndex(v => Number(v.quantity) > 0);
                            initialVariants[k] = firstInStockIndex !== -1 ? firstInStockIndex : 0;
                        } else {
                            initialVariants[k] = 0;
                        }
                    }
                });
                setQuantities(initialQuantities);
                setSelectedVariants(initialVariants);
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }
    }

    const formatPrice = (p) => {
        if (p == null) return '—'
        const num = Number(p)
        if (Number.isNaN(num)) return String(p)
        return `₦${Math.round(num).toLocaleString('en-US')}`
    }

    const changeQty = (key, delta) => {
        setQuantities((q) => {
            const cur = q[key] ?? 1
            const next = Math.max(1, cur + delta)
            return { ...q, [key]: next }
        })
    }
    
    const handleVariantChange = (productKey, variantIndex) => {
        setSelectedVariants(prev => ({ ...prev, [productKey]: variantIndex }));
    };

    const handleAddToCart = (item) => {
        const key = item._id || item.id;
        const variantIndex = selectedVariants[key];
        const selectedVariant = (item.variants || [])[variantIndex || 0];

        if (!selectedVariant) {
            alert("Please select a variant.");
            return;
        }

        add({
            ...item,
            price: selectedVariant.price ?? item.basePrice ?? item.price,
            variantId: selectedVariant._id,
            size: selectedVariant.size,
            color: selectedVariant.color,
            image: selectedVariant.image || (item.images && item.images[0]) || item.image,
            quantity: quantities[key],
            availableQty: Number(selectedVariant.quantity || 0),
        });
    };

    const toggleDescription = (key) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const openProductDetails = (product) => {
        setSelectedProduct(product);
    };

    const closeProductDetails = () => {
        setSelectedProduct(null);
    };

    return (
        <>
        <Navbar/>
        
        {/* Spacer for fixed navbar */}
        <div className="h-20"></div>
        
                {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div role="status" className="p-6 bg-white/90 rounded-lg flex flex-col items-center gap-4">
                            <svg className="w-12 h-12 text-[var(--brand)] animate-spin" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" strokeOpacity="0.2" />
                                <path d="M45 25a20 20 0 00-20-20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                            </svg>
                            <span className="text-sm text-[var(--foreground)]">Loading products…</span>
                        </div>
                    </div>
                )}

        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Products</h1>
                
                {!loading && products.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-500">No products available at the moment.</p>
                        <p className="text-gray-400 mt-2">Please check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {products.map((item) => {
                            const key = item._id || item.id;
                            const variants = item.variants || [];
                            const selectedVariantIndex = selectedVariants[key];
                            const selectedVariant = variants[selectedVariantIndex];
                            const inStock = Boolean(selectedVariant && Number(selectedVariant.quantity) > 0);

                            return (
                                <div 
                                    key={key} 
                                    onClick={() => openProductDetails(item)}
                                    className="bg-white overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 flex flex-col hover:shadow-md"
                                >
                                    <div className="relative w-full aspect-square">
                                        <Image 
                                            src={selectedVariant?.image || (item.images && item.images[0]) || item.image || '/placeholder.png'} 
                                            alt={item.name} 
                                            layout="fill" 
                                            objectFit="cover" 
                                        />
                                        {!inStock && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">Out of Stock</span>
                                            </div>
                                        )}
                                        {inStock && Number(selectedVariant?.quantity) < 10 && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                {selectedVariant.quantity} left
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 flex flex-col">
                                        <h2 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h2>
                                        <span className="text-base font-bold text-[var(--brand)] mt-1">
                                            {formatPrice(selectedVariant?.price ?? item.basePrice ?? item.price)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </main>

        {/* Product Details Modal */}
        {selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeProductDetails}>
                <div 
                    className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        {/* Left: Image */}
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                            {(() => {
                                const key = selectedProduct._id || selectedProduct.id;
                                const variants = selectedProduct.variants || [];
                                const selectedVariantIndex = selectedVariants[key];
                                const selectedVariant = variants[selectedVariantIndex];
                                
                                return (
                                    <Image 
                                        src={selectedVariant?.image || (selectedProduct.images && selectedProduct.images[0]) || selectedProduct.image || '/placeholder.png'} 
                                        alt={selectedProduct.name} 
                                        layout="fill" 
                                        objectFit="cover" 
                                    />
                                );
                            })()}
                        </div>

                        {/* Right: Details */}
                        <div className="flex flex-col">
                            <button 
                                onClick={closeProductDetails}
                                className="self-end text-gray-500 hover:text-gray-700 text-2xl font-bold mb-2"
                            >
                                &times;
                            </button>
                            
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedProduct.name}</h1>
                            
                            {(() => {
                                const key = selectedProduct._id || selectedProduct.id;
                                const variants = selectedProduct.variants || [];
                                const selectedVariantIndex = selectedVariants[key];
                                const selectedVariant = variants[selectedVariantIndex];
                                const inStock = Boolean(selectedVariant && Number(selectedVariant.quantity) > 0);
                                
                                const availableColors = [...new Set((variants || []).map(v => v.color).filter(Boolean))];
                                const availableSizes = [...new Set((variants || []).map(v => v.size).filter(Boolean))];

                                const handleColorChange = (e) => {
                                    const newColor = e.target.value;
                                    const newVariantIndex = variants.findIndex(v => v.color === newColor);
                                    if (newVariantIndex !== -1) {
                                        handleVariantChange(key, newVariantIndex);
                                    }
                                };

                                const handleSizeChange = (e) => {
                                    const newSize = e.target.value;
                                    const newVariantIndex = variants.findIndex(v => v.size === newSize && v.color === selectedVariant?.color);
                                    if (newVariantIndex !== -1) {
                                        handleVariantChange(key, newVariantIndex);
                                    }
                                };

                                return (
                                    <>
                                        <div className="text-3xl font-bold text-[var(--brand)] mb-4">
                                            {formatPrice(selectedVariant?.price ?? selectedProduct.basePrice ?? selectedProduct.price)}
                                        </div>

                                        {selectedProduct.category && (
                                            <p className="text-sm text-gray-500 mb-4">
                                                Category: <span className="font-medium text-gray-700">{selectedProduct.category}</span>
                                            </p>
                                        )}

                                        {selectedProduct.description && (
                                            <div className="mb-6">
                                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                                                <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                                            </div>
                                        )}

                                        {/* Variants */}
                                        <div className="mb-6 space-y-4">
                                            {availableColors.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Color</label>
                                                    <select 
                                                        value={selectedVariant?.color} 
                                                        onChange={handleColorChange}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                                                    >
                                                        {availableColors.map(color => <option key={color} value={color}>{color}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                            {availableSizes.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Size</label>
                                                    <select 
                                                        value={selectedVariant?.size}
                                                        onChange={handleSizeChange}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                                                    >
                                                        {availableSizes.map(size => <option key={size} value={size}>{size}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stock Status */}
                                        <div className="mb-6">
                                            {inStock ? (
                                                <p className="text-sm text-green-600 font-medium">
                                                    ✓ In Stock ({selectedVariant.quantity} available)
                                                </p>
                                            ) : (
                                                <p className="text-sm text-red-600 font-medium">
                                                    ✗ Out of Stock
                                                </p>
                                            )}
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => changeQty(key, -1)} 
                                                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                                                >
                                                    <FiMinus size={18}/>
                                                </button>
                                                <span className="text-xl font-semibold w-12 text-center">{quantities[key] || 1}</span>
                                                <button 
                                                    onClick={() => changeQty(key, 1)} 
                                                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                                                >
                                                    <FiPlus size={18}/>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button 
                                            onClick={() => {
                                                handleAddToCart(selectedProduct);
                                                closeProductDetails();
                                            }}
                                            disabled={!inStock}
                                            className="w-full bg-[var(--brand)] text-white py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-[var(--brand)]/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold shadow-lg"
                                        >
                                            <FiShoppingCart size={24}/>
                                            <span>Add to Cart</span>
                                        </button>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        )}

        <CartPanel/>
        </>
    )
}
