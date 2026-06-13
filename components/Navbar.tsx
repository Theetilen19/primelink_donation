'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, Menu, X, BarChart3, Home, HandHeart, ShieldCheck } from 'lucide-react';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`site-nav relative ${scrolled ? 'shadow-sm' : ''}`}>
            <div className="container nav-inner">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 decoration-none group">
                    <div className="w-10 h-10 rounded-lg center" style={{ background: 'var(--gradient-primary)', boxShadow: '0 8px 30px rgba(12,34,78,0.45)' }}>
                        <Heart size={18} className="text-white" />
                    </div>
                    <span className="text-lg font-black" style={{ letterSpacing: '-0.02em' }}>
                        PrimeLink <span className="gradient-text">Gives</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="nav-links hidden md:flex items-center gap-4">
                    <NavLink href="/">Home</NavLink>
                    <NavLink href="/campaigns">Campaigns</NavLink>
                    <NavLink href="/donate">Donate</NavLink>

                    <Link href="/donate" className="btn btn-primary btn-sm" style={{ marginLeft: '0.75rem' }}>
                        <Heart size={14} />
                        Donate
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden p-2"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                >
                    {open ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                id="mobile-menu"
                className={`md:hidden absolute left-0 right-0 top-full transition-all duration-300 overflow-hidden z-50 ${open ? 'max-h-[520px] border-b border-white/5' : 'max-h-0'
                }`}
                style={{ willChange: 'max-height' }}
            >
                <div className="p-4 space-y-3 bg-[#020617]/95 backdrop-blur-xl shadow-2xl">
                    <div className="grid grid-cols-1 gap-1">
                        <MobileNavItem href="/" label="Home" Icon={Home} onClick={() => setOpen(false)} />
                        <MobileNavItem href="/campaigns" label="Campaigns" Icon={BarChart3} onClick={() => setOpen(false)} />
                        <MobileNavItem href="/donate" label="Donate" Icon={HandHeart} onClick={() => setOpen(false)} />
                        <MobileNavItem href="/about" label="About" Icon={ShieldCheck} onClick={() => setOpen(false)} />
                        <MobileNavItem href="/contact" label="Contact" Icon={ShieldCheck} onClick={() => setOpen(false)} />
                        <div className="h-px bg-white/5 my-2" />
                        <div className="text-sm text-slate-400 px-1">Quick payments</div>
                        <div className="grid grid-cols-3 gap-2">
                            <Link href="/donate?payment=stripe" onClick={() => setOpen(false)} className="py-2 px-2 rounded-lg bg-white/5 text-center text-xs block">Card</Link>
                            <Link href="/donate?payment=paystack" onClick={() => setOpen(false)} className="py-2 px-2 rounded-lg bg-white/5 text-center text-xs block">Paystack</Link>
                            <Link href="/donate?payment=mpesa" onClick={() => setOpen(false)} className="py-2 px-2 rounded-lg bg-white/5 text-center text-xs block">M-Pesa</Link>
                        </div>

                        <div className="pt-3">
                            <Link
                                href="/donate"
                                className="btn-premium w-full py-3 text-center rounded-xl"
                                onClick={() => setOpen(false)}
                            >
                                Donate Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="nav-link">
            {children}
        </Link>
    );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-4 py-3 text-lg font-semibold text-slate-300 hover:text-white hover:bg-white/6 rounded-xl transition-all"
        >
            {children}
        </Link>
    );
}

function MobileNavItem({ href, label, Icon, onClick }: { href: string; label: string; Icon: any; onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/6 transition-all">
            <div className="w-8 h-8 center rounded-lg bg-white/6"><Icon size={16} /></div>
            <div className="text-sm font-semibold text-slate-200">{label}</div>
        </Link>
    );
}
