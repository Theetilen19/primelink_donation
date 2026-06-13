'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Heart, Download, ArrowLeft, Loader2 } from 'lucide-react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [verifying, setVerifying] = useState(true);
    const [donationInfo, setDonationInfo] = useState<{
        amount: number;
        currency: string;
        donor_name: string;
    } | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setVerifying(false);
            return;
        }

        // Poll for donation completion (the webhook will handle DB update)
        let attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await fetch(`/api/mpesa/status?checkoutRequestId=${sessionId}`);
                const data = await res.json();
                if (data.status === 'completed' && data.donation) {
                    setDonationInfo(data.donation);
                    setVerifying(false);
                    clearInterval(interval);
                } else if (attempts >= maxAttempts) {
                    setVerifying(false);
                    clearInterval(interval);
                }
            } catch {
                if (attempts >= maxAttempts) {
                    setVerifying(false);
                    clearInterval(interval);
                }
            }
        }, 2000);

        // Also check after a short delay for Stripe (webhook is fast)
        setTimeout(() => {
            setVerifying(false);
            clearInterval(interval);
        }, 6000);

        return () => clearInterval(interval);
    }, [sessionId]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
                <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
                    {verifying ? (
                        <div className="glass" style={{ padding: '60px 40px' }}>
                            <Loader2
                                size={48}
                                color="var(--accent-primary)"
                                style={{ margin: '0 auto 24px', animation: 'spin 1s linear infinite' }}
                            />
                            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                                Confirming your payment...
                            </h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                We&apos;re verifying your transaction. This takes just a moment.
                            </p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : (
                        <div className="glass animate-pulse-glow" style={{ padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
                            <div className="orb orb-blue" style={{ width: 200, height: 200, top: -80, left: -80 }} />
                            <div className="orb orb-purple" style={{ width: 150, height: 150, bottom: -60, right: -60 }} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {/* Success icon with glow */}
                                <div
                                    style={{
                                        width: 90,
                                        height: 90,
                                        borderRadius: '50%',
                                        background: 'rgba(16,185,129,0.15)',
                                        border: '2px solid rgba(16,185,129,0.4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 28px',
                                        boxShadow: '0 0 40px rgba(16,185,129,0.2)',
                                    }}
                                >
                                    <CheckCircle size={44} color="#10b981" />
                                </div>

                                <h1
                                    style={{
                                        fontFamily: 'Outfit, sans-serif',
                                        fontWeight: 900,
                                        fontSize: '2rem',
                                        color: 'var(--text-primary)',
                                        marginBottom: '12px',
                                    }}
                                >
                                    Thank You! 🎉
                                </h1>

                                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '1.05rem' }}>
                                    Your donation was received successfully.
                                </p>

                                {donationInfo && (
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 20px',
                                            borderRadius: '20px',
                                            background: 'rgba(16,185,129,0.1)',
                                            border: '1px solid rgba(16,185,129,0.25)',
                                            color: '#10b981',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            margin: '16px auto',
                                        }}
                                    >
                                        {donationInfo.currency === 'kes' ? 'KSh' : '$'}
                                        {donationInfo.amount.toLocaleString()} donated
                                    </div>
                                )}

                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '36px', maxWidth: '380px', margin: '16px auto 36px' }}>
                                    A receipt has been sent to your email address. Your contribution helps PrimeLink Technologies drive innovation and impact across our communities.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px', margin: '0 auto' }}>
                                    <Link href="/donate" className="btn-primary">
                                        <Heart size={18} fill="white" />
                                        Donate Again
                                    </Link>
                                    <Link href="/campaigns" className="btn-secondary">
                                        <ArrowLeft size={18} />
                                        View Campaigns
                                    </Link>
                                    {sessionId && (
                                        <a
                                            href={`/api/receipt?session_id=${sessionId}`}
                                            className="btn-secondary"
                                            style={{ opacity: 0.7, fontSize: '0.875rem' }}
                                        >
                                            <Download size={16} />
                                            Download Receipt
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
