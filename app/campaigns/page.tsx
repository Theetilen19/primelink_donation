'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Campaign } from '@/lib/supabase';
import { Target, TrendingUp, Calendar, Heart, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

function CampaignCard({ campaign }: { campaign: Campaign }) {
    const progress = Math.min(100, Math.round((campaign.raised_amount / campaign.target_amount) * 100));
    const daysLeft = Math.max(0, Math.round((new Date(campaign.created_at).getTime() + 90 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)));

    return (
        <div className="glass-premium rounded-[40px] overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 border-white/5">
            <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-tight ${progress >= 100
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                        {progress >= 100 ? 'FULLY FUNDED' : `${progress}% TARGET REACHED`}
                    </span>
                    <span className="text-slate-500 text-xs font-bold flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full">
                        <Calendar size={12} />
                        {daysLeft} days left
                    </span>
                </div>

                <h3 className="text-xl font-black text-white mb-3 leading-tight tracking-tight group-hover:text-blue-400 transition-colors">
                    {campaign.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3">
                    {campaign.description}
                </p>

                {/* Progress Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-3">
                        <div>
                            <span className="text-2xl font-black text-white tracking-tighter">
                                KSh {campaign.raised_amount.toLocaleString()}
                            </span>
                            <span className="text-slate-500 text-xs font-bold ml-2">RAISED</span>
                        </div>
                        <span className="text-slate-500 text-xs font-bold">
                            GOAL: KSh {campaign.target_amount.toLocaleString()}
                        </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <Link
                    href={`/donate?campaign=${campaign.id}`}
                    className="btn-premium w-full py-4 text-lg group/btn"
                >
                    <Heart size={18} className="transition-transform group-hover/btn:scale-110 group-hover/btn:fill-white" />
                    Support this Cause
                    <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                </Link>
            </div>
        </div>
    );
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/campaigns')
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) setCampaigns(data);
                else setError('Failed to load campaigns.');
            })
            .catch(() => setError('Failed to connect. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    const totalRaised = campaigns.reduce((s, c) => s + c.raised_amount, 0);
    const totalTarget = campaigns.reduce((s, c) => s + c.target_amount, 0);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-1 py-16 md:py-32 relative overflow-hidden">
                {/* Background accents */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
                </div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <header className="text-center mb-12 md:mb-20 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-sm font-semibold mb-6">
                            <TrendingUp size={16} className="text-blue-500" />
                            <span className="text-slate-300">Live Impact Tracking</span>
                        </div>
                        <h1 className="heading-lg mb-6">
                            Active <span className="gradient-text">Campaigns</span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed mb-12">
                            Explore our ongoing initiatives and join thousands of donors
                            making a real difference in the world today.
                        </p>

                        {!loading && campaigns.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <StatItem icon={Target} label="Campaigns" value={campaigns.length} />
                                <StatItem icon={Heart} label="Total Raised" value={`KSh ${totalRaised.toLocaleString()}`} />
                                <StatItem icon={TrendingUp} label="Overall Goal" value={`KSh ${totalTarget.toLocaleString()}`} className="hidden md:flex" />
                            </div>
                        )}
                    </header>

                    {loading ? (
                        <div className="text-center py-40">
                            <Loader2 size={48} className="text-blue-500 animate-spin mx-auto mb-6" />
                            <p className="text-slate-500 font-medium">Fetching active campaigns...</p>
                        </div>
                    ) : error ? (
                        <div className="max-w-xl mx-auto glass-premium p-12 rounded-[40px] text-center border-red-500/10">
                            <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
                            <h3 className="text-white text-xl font-bold mb-2">Connection Error</h3>
                            <p className="text-slate-400 mb-8">{error}</p>
                            <button onClick={() => window.location.reload()} className="btn-premium px-8 py-3 rounded-xl">Try Again</button>
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center py-40 glass-premium rounded-[40px] border-white/5 max-w-2xl mx-auto p-12">
                            <Heart size={64} className="text-slate-700 mx-auto mb-8" />
                            <h3 className="text-2xl font-bold text-white mb-4">No Active Campaigns</h3>
                            <p className="text-slate-500 mb-10">All campaigns are currently funded or pending. You can still make a general donation.</p>
                            <Link href="/donate" className="btn-premium px-10 py-4 rounded-2xl inline-flex">
                                Make a General Donation
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {campaigns.map((c) => (
                                <CampaignCard key={c.id} campaign={c} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
            <div className="noise" />
        </div>
    );
}

function StatItem({ icon: Icon, label, value, className = "" }: { icon: any, label: string, value: string | number, className?: string }) {
    return (
        <div className={`glass-premium px-6 py-4 rounded-3xl border-white/5 flex items-center gap-4 text-left ${className}`}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-blue-500" />
            </div>
            <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-black">{label}</div>
                <div className="text-white font-bold tracking-tight">{value}</div>
            </div>
        </div>
    );
}
