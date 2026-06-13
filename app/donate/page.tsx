'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    CreditCard,
    Smartphone,
    Heart,
    Check,
    AlertCircle,
    Loader2,
    Shield,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
} from 'lucide-react';
import { Campaign } from '@/lib/supabase';

const PRESET_AMOUNTS_USD = [10, 25, 50, 100, 250];
const PRESET_AMOUNTS_KES = [500, 1000, 2500, 5000, 10000];

export default function DonatePage() {
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'paystack'>('mpesa');
    const [currency, setCurrency] = useState<'usd' | 'kes'>('kes');
    const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
    const [customAmount, setCustomAmount] = useState('');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    const [form, setForm] = useState({
        donorName: '',
        donorEmail: '',
        donorPhone: '',
        campaignId: '',
        anonymous: false,
        message: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [mpesaStatus, setMpesaStatus] = useState<{
        donationId: string;
        checkoutRequestId: string;
        polling: boolean;
    } | null>(null);

    const amounts = currency === 'kes' ? PRESET_AMOUNTS_KES : PRESET_AMOUNTS_USD;
    const displayAmount = customAmount ? Number(customAmount) : selectedAmount || 0;

    useEffect(() => {
        fetch('/api/campaigns')
            .then((r) => r.json())
            .then((data) => { if (Array.isArray(data)) setCampaigns(data); })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!mpesaStatus?.polling) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/mpesa/status?donationId=${mpesaStatus.donationId}`);
                const data = await res.json();
                if (data.status === 'completed') {
                    setSuccess('Payment confirmed! Thank you for your donation. 🎉');
                    setMpesaStatus(null);
                } else if (data.status === 'failed') {
                    setError('Payment was cancelled or failed. Please try again.');
                    setMpesaStatus(null);
                }
            } catch { }
        }, 3000);
        return () => clearInterval(interval);
    }, [mpesaStatus]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            setSuccess('Payment confirmed! Thank you for your donation. 🎉');
        } else if (urlParams.get('error')) {
            setError(urlParams.get('error') || 'Payment failed.');
        }
    }, []);

    // Read optional query params (e.g. ?payment=paystack or ?payment=mpesa)
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const p = params.get('payment');
            const amt = params.get('amount');
            if (p === 'mpesa' || p === 'paystack') {
                setPaymentMethod(p as any);
                setCurrency(p === 'paystack' ? 'kes' : 'kes');
            }
            if (amt) {
                // populate custom amount or preset
                setCustomAmount(amt);
                setSelectedAmount(null);
            }
        } catch (e) { }
    }, []);

    const handlePresetAmount = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    const handleCustomAmount = (value: string) => {
        setCustomAmount(value);
        setSelectedAmount(null);
    };

    // Stripe removed: only Paystack and M-Pesa remain

    const handleMpesaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayAmount || displayAmount < 1) return setError('Please enter a valid amount');
        if (!form.donorName || !form.donorEmail) return setError('Name and email are required');
        if (!form.donorPhone) return setError('Phone number is required for M-Pesa');

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/mpesa/stk-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: form.donorPhone.startsWith('0') ? '254' + form.donorPhone.substring(1) : form.donorPhone,
                    amount: displayAmount,
                    donorName: form.donorName,
                    donorEmail: form.donorEmail,
                    campaignId: form.campaignId || undefined,
                    anonymous: form.anonymous,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'STK Push failed');

            setSuccess(`📱 Check your phone — enter M-Pesa PIN to complete.`);
            setMpesaStatus({
                donationId: data.donationId,
                checkoutRequestId: data.checkoutRequestId,
                polling: true,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handlePaystackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayAmount || displayAmount < 1) return setError('Please enter a valid amount');
        if (!form.donorName || !form.donorEmail) return setError('Name and email are required');

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: displayAmount,
                    currency,
                    donorName: form.donorName,
                    donorEmail: form.donorEmail,
                    donorPhone: form.donorPhone || undefined,
                    campaignId: form.campaignId || undefined,
                    anonymous: form.anonymous,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Payment session creation failed');
            window.location.href = data.url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = paymentMethod === 'paystack' ? handlePaystackSubmit : handleMpesaSubmit;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-1 py-16 md:py-32">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <header className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-sm font-semibold mb-6">
                                <Shield size={16} className="text-blue-500" />
                                <span className="text-slate-300">Secure & Encrypted Payments</span>
                            </div>
                            <h1 className="heading-lg mb-4">
                                Make an <span className="gradient-text">Impact Today</span>
                            </h1>
                            <p className="text-slate-400 max-w-lg mx-auto">
                                Every contribution helps us build a brighter future through
                                education, innovation, and community support.
                            </p>
                        </header>

                        <div className="grid lg:grid-cols-12 gap-12 items-start">
                            {/* ===== FORM CARD ===== */}
                            <div className="lg:col-span-7">
                                {/* Mobile method selector (compact) */}
                                <div className="md:hidden mb-6">
                                    <div className="flex gap-3 overflow-x-auto">
                                        <button
                                            type="button"
                                            onClick={() => { setPaymentMethod('paystack'); setCurrency('kes'); }}
                                            className={`min-w-[120px] flex-shrink-0 py-3 px-4 rounded-2xl border-2 text-sm font-semibold ${paymentMethod === 'paystack' ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={16} />
                                                Paystack
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setPaymentMethod('mpesa'); setCurrency('kes'); }}
                                            className={`min-w-[120px] flex-shrink-0 py-3 px-4 rounded-2xl border-2 text-sm font-semibold ${paymentMethod === 'mpesa' ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                                            <div className="flex items-center gap-2">
                                                <Smartphone size={16} />
                                                M-Pesa
                                            </div>
                                        </button>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit} className="glass-premium p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32" />

                                    <div className="relative z-10">
                                        {/* Method Selection */}
                                        <div className="mb-10">
                                            <h3 className="text-white font-bold mb-6 flex items-center gap-2 tracking-tight">
                                                01. Select Payment Method
                                            </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                                                    <MethodCard
                                                        active={paymentMethod === 'paystack'}
                                                        onClick={() => { setPaymentMethod('paystack'); setCurrency('kes'); }}
                                                        icon={CreditCard}
                                                        title="Paystack"
                                                        subtitle="Cards, Bank, Mobile Money"
                                                    />
                                                    <MethodCard
                                                        active={paymentMethod === 'mpesa'}
                                                        onClick={() => { setPaymentMethod('mpesa'); setCurrency('kes'); }}
                                                        icon={Smartphone}
                                                        title="M-Pesa Mobile"
                                                        subtitle="Instant STK Push"
                                                    />
                                                </div>
                                        </div>

                                        {/* Amount Selection */}
                                        <div className="mb-10">
                                            <h3 className="text-white font-bold mb-6 flex items-center gap-2 tracking-tight">
                                                02. Choose Your Amount
                                            </h3>

                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                                                {amounts.map((a) => (
                                                    <button
                                                        key={a}
                                                        type="button"
                                                        onClick={() => handlePresetAmount(a)}
                                                        className={`py-4 rounded-2xl border transition-all font-bold text-lg ${selectedAmount === a && !customAmount
                                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {currency === 'kes' ? '' : '$'}{a.toLocaleString()}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                                    {currency === 'kes' ? 'KSh' : '$'}
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="Enter custom amount..."
                                                    className="input py-4 pl-14 text-xl font-bold"
                                                    value={customAmount}
                                                    onChange={(e) => handleCustomAmount(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Donor Information */}
                                        <div className="mb-10">
                                            <h3 className="text-white font-bold mb-6 flex items-center gap-2 tracking-tight">
                                                03. Donor Information
                                            </h3>

                                            {campaigns.length > 0 && (
                                                <div className="mb-6">
                                                    <select
                                                        className="input"
                                                        value={form.campaignId}
                                                        onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
                                                    >
                                                        <option value="">Specific Campaign (optional)</option>
                                                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                                    </select>
                                                </div>
                                            )}

                                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                                <input
                                                    className="input"
                                                    placeholder="Full Name"
                                                    value={form.donorName}
                                                    onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                                                    required
                                                />
                                                <input
                                                    className="input"
                                                    type="email"
                                                    placeholder="Email Address"
                                                    value={form.donorEmail}
                                                    onChange={(e) => setForm({ ...form, donorEmail: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <input
                                                className="input mb-6"
                                                placeholder={paymentMethod === 'mpesa' ? "07xx xxx xxx (M-Pesa Number)" : "Phone Number (optional)"}
                                                value={form.donorPhone}
                                                onChange={(e) => setForm({ ...form, donorPhone: e.target.value })}
                                                required={paymentMethod === 'mpesa'}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, anonymous: !form.anonymous })}
                                                className={`flex items-center gap-3 px-2 py-1 transition-all ${form.anonymous ? 'text-blue-400' : 'text-slate-500 hover:text-slate-400'}`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.anonymous ? 'bg-blue-600 border-blue-500' : 'border-white/10 bg-white/5'}`}>
                                                    {form.anonymous && <Check size={14} className="text-white" strokeWidth={4} />}
                                                </div>
                                                <span className="text-sm font-semibold">Make this donation anonymous</span>
                                            </button>
                                        </div>

                                        {/* Status Messages */}
                                        {error && (
                                            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-3">
                                                <AlertCircle size={18} className="shrink-0" />
                                                {error}
                                            </div>
                                        )}
                                        {success && (
                                            <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm flex items-start gap-3">
                                                <Check size={18} className="shrink-0" />
                                                {success}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading || !!mpesaStatus?.polling}
                                            className="btn-premium w-full py-4 md:py-5 text-lg md:text-xl flex items-center justify-center gap-3 active:scale-95"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <Heart className="fill-white" />}
                                            {loading ? 'Processing...' : `Donate ${currency === 'kes' ? 'KSh ' : '$'}${displayAmount.toLocaleString()}`}
                                        </button>

                                        <p className="text-center text-slate-500 text-xs mt-6 flex items-center justify-center gap-2">
                                            <Lock size={12} />
                                            Legacy encryption used. No payment data is stored.
                                        </p>
                                    </div>
                                </form>
                            </div>

                            {/* ===== SUMMARY CARD ===== */}
                            <div className="lg:col-span-5 space-y-6 md:space-y-8">
                                <div className="glass-premium p-6 md:p-10 rounded-[32px] md:rounded-[40px] border-white/5 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl" />

                                    <h3 className="text-xl font-bold text-white mb-8 tracking-tight">Summary</h3>

                                    <div className="space-y-6 mb-10">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Donation Amount</span>
                                            <span className="text-xl font-bold text-white">{currency === 'kes' ? 'KSh' : '$'}{displayAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Processing Fee</span>
                                            <span className="text-slate-500 text-sm italic">Covered by PrimeLink</span>
                                        </div>
                                        <div className="h-px bg-white/5 my-6" />
                                        <div className="flex justify-between items-end">
                                            <span className="text-lg font-bold text-white">Total Impact</span>
                                            <span className="text-4xl font-black gradient-text font-sans">
                                                {currency === 'kes' ? 'KSh' : '$'}{displayAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[Shield, Lock, Heart].map((Icon, i) => (
                                            <div key={i} className="bg-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
                                                <Icon size={20} className="text-blue-500" />
                                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Secure</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tips Card */}
                                <div className="glass-premium p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5">
                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <Check size={18} className="text-blue-500" />
                                        M-Pesa Quick Tip
                                    </h4>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                        After clicking donate, check your phone for the M-Pesa PIN prompt.
                                        If it doesn't appear, ensure your phone is unlocked and active.
                                    </p>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-500 flex gap-3">
                                        <AlertCircle size={16} className="shrink-0" />
                                        Payments are processed immediately. A receipt will be sent to your email.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <div className="noise" />
        </div>
    );
}

function MethodCard({ active, onClick, icon: Icon, title, subtitle }: {
    active: boolean,
    onClick: () => void,
    icon: any,
    title: string,
    subtitle: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-6 rounded-[28px] border-2 text-left transition-all ${active
                ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10'
                : 'bg-white/5 border-white/5 hover:border-white/10 grayscale opacity-60'
                }`}
        >
            <div className={`p-3 rounded-xl inline-flex mb-4 transition-colors ${active ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                <Icon size={24} />
            </div>
            <div className={`font-bold transition-colors ${active ? 'text-white' : 'text-slate-400'}`}>{title}</div>
            <div className="text-xs text-slate-500">{subtitle}</div>
        </button>
    );
}
