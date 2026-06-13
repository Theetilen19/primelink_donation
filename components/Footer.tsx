'use client';

import Link from 'next/link';
import { Heart, Mail, Globe, MessageSquare, Send, ArrowUpRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3 decoration-none group mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                <Heart size={20} className="text-white fill-white" />
                            </div>
                            <span className="text-xl font-black font-sans text-white tracking-tight">
                                PrimeLink <span className="gradient-text">Gives</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">
                            Empowering communities through technology and transparent philanthropy.
                            Join us in building a more connected future.
                        </p>
                        <div className="flex gap-3">
                            {[Globe, MessageSquare, Send].map((Icon, i) => (
                                <a key={i} href="#" className="pill center" style={{ width:44, height:44 }}>
                                    <Icon size={18} className="" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Explore Campaigns', href: '/campaigns' },
                                { label: 'How it Works', href: '/how-it-works' },
                                { label: 'Recent Donations', href: '/donations' },
                                { label: 'Success Stories', href: '/stories' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1 group">
                                        {link.label}
                                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Support</h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Help Center', href: '/help' },
                                { label: 'Developer API', href: '/api-docs' },
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'Terms of Service', href: '/terms' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1 group">
                                        {link.label}
                                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter / Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Stay Connected</h4>
                        <p className="text-slate-400 text-sm mb-4">
                            Get updates on campaigns and community impact.
                        </p>
                        <div className="relative mb-6">
                            <div className="flex gap-2">
                                <input type="email" placeholder="email@example.com" className="input" />
                                <button className="btn btn-primary btn-sm">
                                    <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Mail size={16} />
                            <a href="mailto:support@primelink.tech" className="hover:text-blue-400 transition-colors">
                                support@primelink.tech
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-xs">
                        © {new Date().getFullYear()} PrimeLink Technologies. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                        <Link href="/cookies" className="muted-sm">Cookies</Link>
                        <Link href="/accessibility" className="muted-sm">Accessibility</Link>
                        <div className="muted-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap:8 }}>
                            Made with <Heart size={12} style={{ color:'#ff6b6b' }} /> for the community
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
