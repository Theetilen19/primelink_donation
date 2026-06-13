'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Heart, Settings, LogOut, Bell, Search, Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const menuItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/donations', label: 'Donations', icon: Heart },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-[#020617]">
            {/* Sidebar */}
            <aside className="w-64 sidebar hidden lg:flex flex-col p-6 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                        PL
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">PrimeLink <span className="text-blue-500">Admin</span></span>
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 mt-6 border-t border-white/5">
                    <Link href="/" className="nav-item group">
                        <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                        <span className="group-hover:text-red-400 transition-colors">Exit Admin</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 glass border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4 lg:hidden">
                        <Menu className="text-slate-400" />
                        <span className="font-bold text-white">PrimeLink Admin</span>
                    </div>

                    <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 w-96 max-w-full">
                        <Search size={18} className="text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search donations, users..."
                            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-600"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#020617]"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-white">Administrator</p>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white/10 shadow-lg"></div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-8 flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
