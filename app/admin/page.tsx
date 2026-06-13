'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Donation, Campaign } from '@/lib/supabase';
import {
    BarChart3,
    TrendingUp,
    Users,
    AlertCircle,
    Download,
    Heart,
    CreditCard,
    Smartphone,
    RefreshCcw,
    Loader2,
    CheckCircle,
    Clock,
    XCircle,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Search,
} from 'lucide-react';

type Stats = {
    totalRaised: number;
    totalDonations: number;
    pending: number;
    failed: number;
    stripeTotal: number;
    mpesaTotal: number;
    recentCount: number;
    campaigns: Campaign[];
};

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { cls: string; label: string }> = {
        completed: { cls: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Completed' },
        pending: { cls: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Pending' },
        failed: { cls: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Failed' },
    };
    const { cls, label } = map[status] || { cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: status };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${cls}`}>{label.toUpperCase()}</span>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingDonations, setLoadingDonations] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoadingStats(true);
        setLoadingDonations(true);
        setError('');

        try {
            const [statsRes, donationsRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/donations'),
            ]);

            const statsData = await statsRes.json();
            const donationsData = await donationsRes.json();

            if (statsRes.ok) setStats(statsData);
            if (donationsRes.ok) setDonations(Array.isArray(donationsData) ? donationsData : []);
        } catch {
            setError('Failed to load admin data. Check your Supabase configuration.');
        } finally {
            setLoadingStats(false);
            setLoadingDonations(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleExport = () => {
        window.open('/api/admin/export', '_blank');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        System <span className="gradient-text">Overview</span>
                    </h1>
                    <p className="text-slate-500 text-sm">Real-time performance and transaction monitoring.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/5 transition-all"
                        title="Refresh Data"
                    >
                        <RefreshCcw size={18} className={loadingStats ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleExport} className="btn-premium py-3 px-6 rounded-xl flex items-center gap-2">
                        <Download size={18} />
                        Export Data
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-[24px] p-6 flex items-center gap-4 text-red-500">
                    <AlertCircle size={24} />
                    <div>
                        <div className="font-bold">Data Error</div>
                        <div className="text-sm opacity-80">{error}</div>
                    </div>
                </div>
            )}

            {/* KPI Grid */}
            {loadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass-premium h-40 rounded-[32px] animate-pulse border-white/5" />
                    ))}
                </div>
            ) : stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <KpiCard
                        icon={TrendingUp}
                        label="Total Revenue"
                        value={`$${stats.totalRaised.toLocaleString()}`}
                        trend="+12.5%"
                        trendUp={true}
                        color="blue"
                    />
                    <KpiCard
                        icon={Heart}
                        label="Donations"
                        value={stats.totalDonations.toLocaleString()}
                        trend={`${stats.pending} pending`}
                        trendUp={null}
                        color="purple"
                    />
                    <KpiCard
                        icon={Smartphone}
                        label="M-Pesa Volume"
                        value={`KSh ${stats.mpesaTotal.toLocaleString()}`}
                        trend="Mobile Cash"
                        trendUp={true}
                        color="green"
                    />
                    <KpiCard
                        icon={AlertCircle}
                        label="Failed Ops"
                        value={stats.failed.toLocaleString()}
                        trend="Action required"
                        trendUp={false}
                        color="red"
                    />
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Campaigns Progress */}
                <div className="lg:col-span-1 glass-premium p-8 rounded-[40px] border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <BarChart3 size={20} className="text-blue-500" />
                            Campaigns
                        </h2>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                            {stats?.campaigns.length || 0} TOTAL
                        </span>
                    </div>

                    <div className="space-y-8">
                        {stats?.campaigns.slice(0, 5).map((c) => {
                            const pct = Math.min(100, Math.round((c.raised_amount / c.target_amount) * 100));
                            return (
                                <div key={c.id} className="group">
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold text-sm line-clamp-1 mb-1">{c.title}</span>
                                            <span className="text-slate-500 text-[10px] font-black tracking-wider uppercase">
                                                KSh {c.raised_amount.toLocaleString()} / {c.target_amount.toLocaleString()}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-black tracking-tighter ${pct >= 100 ? 'text-green-400' : 'text-blue-400'}`}>
                                            {pct}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${pct >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button className="w-full mt-10 py-4 border border-white/5 bg-white/[0.02] rounded-2xl text-slate-400 text-sm font-bold hover:bg-white/5 hover:text-white transition-all">
                        View All Campaigns
                    </button>
                </div>

                {/* Transactions Table */}
                <div className="lg:col-span-2 glass-premium rounded-[40px] border-white/5 overflow-hidden flex flex-col">
                    <div className="p-8 pb-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <Clock size={20} className="text-purple-500" />
                            Recent Activity
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-40 glass rounded-xl border border-white/5 flex items-center px-4">
                                <Search size={14} className="text-slate-600" />
                                <input type="text" placeholder="Filter..." className="bg-transparent border-none text-xs text-white ml-2 outline-none w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 tracking-widest uppercase">Donor</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 tracking-widest uppercase">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 tracking-widest uppercase">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 tracking-widest uppercase">Date</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {donations.slice(0, 7).map((d) => (
                                    <tr key={d.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-400">
                                                    {d.anonymous ? '🎭' : (d.donor_name?.[0] || 'U')}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                        {d.anonymous ? 'Anonymous' : d.donor_name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-black tracking-tight flex items-center gap-1.5 uppercase">
                                                        {d.payment_method === 'stripe' ? <CreditCard size={10} className="text-blue-500" /> : <Smartphone size={10} className="text-green-500" />}
                                                        {d.payment_method}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-black text-white">
                                                {d.currency === 'kes' ? 'KSh' : '$'} {d.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <StatusBadge status={d.status} />
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-[11px] text-slate-500 font-bold">{formatDate(d.created_at)}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <ChevronRight size={16} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-white/[0.01] border-t border-white/5 text-center">
                        <Link href="/admin/donations" className="text-xs font-black text-slate-500 hover:text-white transition-colors tracking-widest uppercase">
                            View Full Ledger
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ icon: Icon, label, value, trend, trendUp, color }: any) {
    const colorMap: any = {
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/10 shadow-blue-500/5',
        purple: 'text-purple-500 bg-purple-500/10 border-purple-500/10 shadow-purple-500/5',
        green: 'text-green-500 bg-green-500/10 border-green-500/10 shadow-green-500/5',
        red: 'text-red-500 bg-red-500/10 border-red-500/10 shadow-red-500/5',
    };

    return (
        <div className="glass-premium p-8 rounded-[40px] border-white/5 relative overflow-hidden group">
            <div className={`p-3 rounded-2xl border inline-flex mb-6 ${colorMap[color]}`}>
                <Icon size={24} />
            </div>

            <div className="text-3xl font-black text-white tracking-tighter mb-1.5 group-hover:text-blue-400 transition-colors">
                {value}
            </div>
            <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-4">{label}</div>

            <div className="flex items-center gap-2">
                {trendUp !== null && (
                    <div className={`p-1 rounded-md ${trendUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    </div>
                )}
                <span className={`text-[11px] font-bold ${trendUp === true ? 'text-green-500' : trendUp === false ? 'text-red-500' : 'text-slate-400'}`}>
                    {trend}
                </span>
            </div>

            {/* Ambient background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 blur-[60px] opacity-20 pointer-events-none rounded-full ${colorMap[color].split(' ')[0]}`} />
        </div>
    );
}
