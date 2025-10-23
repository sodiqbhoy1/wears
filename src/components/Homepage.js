"use client";
import Navbar from "./Navbar";
import Link from "next/link";
import Image from "next/image";
import CountUpStats from "./CountUpStats";
import { FiArrowRight, FiClock, FiStar, FiTruck, FiShield, FiPhone, FiMail, FiMapPin } from "react-icons/fi";

export default function Homepage() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/background.jpg"
            alt="Delicious food background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Find Your Style
              <span className="block text-[var(--brand)]">Delivered to You</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Discover the latest trends in fashion. Quality wears for every occasion, 
              delivered straight to your doorstep.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/products"
                className="group bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                Shop Now
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/track-order"
                className="group border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
              >
                Track Order
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <CountUpStats end={1000} suffix="+" />
                <div className="text-sm text-gray-300">Happy Customers</div>
              </div>
              <div className="text-center">
                <CountUpStats end={50} suffix="+" />
                <div className="text-sm text-gray-300">Product Varieties</div>
              </div>
              <div className="text-center">
                <CountUpStats end={15} suffix="min" />
                <div className="text-sm text-gray-300">Avg Delivery</div>
              </div>
              <div className="text-center">
                <CountUpStats end={4.8} suffix="★" />
                <div className="text-sm text-gray-300">Rating</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose WearHouse?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to delivering not just clothes, but an exceptional experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-[var(--brand)]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--brand)] transition-colors">
                  <FiTruck className="w-8 h-8 text-[var(--brand)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Get your new favorite outfit delivered to your door in no time.</p>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-[var(--brand)]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--brand)] transition-colors">
                  <FiStar className="w-8 h-8 text-[var(--brand)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Quality Materials</h3>
                <p className="text-gray-600">We use high-quality materials to ensure our products are durable and comfortable.</p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-[var(--brand)]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--brand)] transition-colors">
                  <FiClock className="w-8 h-8 text-[var(--brand)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Latest Styles</h3>
                <p className="text-gray-600">Our collection is always updated with the latest fashion trends.</p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-[var(--brand)]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--brand)] transition-colors">
                  <FiShield className="w-8 h-8 text-[var(--brand)] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Easy Returns</h3>
                <p className="text-gray-600">Not satisfied? We offer a hassle-free return policy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Items Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Check out some of our most popular items
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Sample Product Items */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Stylish T-Shirt"
                  width={1000}
                  height={256}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Stylish T-Shirt</h3>
                <p className="text-gray-600 mb-4">A comfortable and stylish t-shirt for everyday wear.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[var(--brand)]">₦5,000</span>
                  <div className="flex items-center text-yellow-500">
                    <FiStar className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-gray-600">4.8</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Comfortable Trousers"
                  width={1000}
                  height={256}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Comfortable Trousers</h3>
                <p className="text-gray-600 mb-4">Perfect for both casual and formal occasions.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[var(--brand)]">₦8,000</span>
                  <div className="flex items-center text-yellow-500">
                    <FiStar className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-gray-600">4.9</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Trendy Sneakers"
                  width={1000}
                  height={256}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Trendy Sneakers</h3>
                <p className="text-gray-600 mb-4">Complete your look with these stylish sneakers.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[var(--brand)]">₦12,000</span>
                  <div className="flex items-center text-yellow-500">
                    <FiStar className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-gray-600">4.7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              href="/products"
              className="inline-flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              View All Products
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--brand)] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Upgrade Your Wardrobe?
            </h2>
            <p className="text-xl mb-8 text-red-100">
              Join thousands of satisfied customers and discover your new favorite outfit
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/products"
                className="group bg-white text-[var(--brand)] hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                Start Shopping
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/track-order"
                className="group border-2 border-white text-white hover:bg-white hover:text-[var(--brand)] px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
              >
                Track Your Order
              </Link>
            </div>
            
            <div className="text-center text-red-100">
              <p className="text-lg">🚚 Free delivery on orders above ₦20,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-[var(--brand)] mb-4">WearHouse</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Your trusted partner for quality wears delivered fast. 
                Experience the best of fashion with every order.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons can be added here */}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-gray-400 hover:text-white transition-colors">Products</Link></li>
                <li><Link href="/track-order" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
                <li><Link href="/admin/login" className="text-gray-400 hover:text-white transition-colors">Admin</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-400">
                  <FiPhone className="w-4 h-4" />
                  <span>+234 800 000 0000</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <FiMail className="w-4 h-4" />
                  <span>hello@wearhouse.com</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <FiMapPin className="w-4 h-4" />
                  <span>Lagos, Nigeria</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 WearHouse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}