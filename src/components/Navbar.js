"use client";
import { useState } from 'react';
import Link from 'next/link';
import WearHouseLogo from './WearHouseLogo';
import AnnouncementBanner from './AnnouncementBanner';

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <>
        <AnnouncementBanner />
        <header style={{ backgroundColor: 'var(--brand)', color: 'var(--background)' }} className="fixed top-0 left-0 right-0 z-40">
            <nav className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
                {/* Logo on the left with home link */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 group no-underline">
                    <div className="transform transition-transform group-hover:scale-110 group-hover:rotate-2">
                        <WearHouseLogo size={48} className="drop-shadow-md" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-lg leading-tight group-hover:text-yellow-100 transition-colors">WearHouse</span>
                        <span className="text-white/80 text-xs leading-tight group-hover:text-white transition-colors">Your Style, Your Way</span>
                    </div>
                </Link>

                {/* Links on the right (desktop) */}
                <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
                    <li className="hover:underline cursor-pointer">
                        <Link href="/products">Products</Link>
                    </li>
                    <li className="hover:underline cursor-pointer">
                        <Link href="/track-order">Track Order</Link>
                    </li>
                    <li className="hover:underline cursor-pointer">
                        <Link href="/about">About</Link>
                    </li>
                </ul>

                {/* Mobile hamburger */}
                <div className="md:hidden">
                    <button onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" className="p-2 rounded-md border border-white/20 text-white">
                        {/* simple hamburger icon */}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile menu panel */}
            {open && (
                <div className="md:hidden bg-[var(--brand)]/95 backdrop-blur-sm text-white border-t border-white/20">
                    <ul className="flex flex-col p-4 gap-3">
                        <li>
                            <Link 
                                href="/products" 
                                onClick={() => setOpen(false)}
                                className="block py-2 px-3 hover:bg-white/10 rounded transition-colors"
                            >
                                Products
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/track-order" 
                                onClick={() => setOpen(false)}
                                className="block py-2 px-3 hover:bg-white/10 rounded transition-colors"
                            >
                                Track Order
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/about" 
                                onClick={() => setOpen(false)}
                                className="block py-2 px-3 hover:bg-white/10 rounded transition-colors"
                            >
                                About
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </header>
        </>
    );
}