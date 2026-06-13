import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET() {
    try {
        const supabase = createAdminClient();

        const [donationsResult, campaignsResult] = await Promise.all([
            supabase.from('donations').select('amount, status, payment_method, created_at'),
            supabase.from('campaigns').select('*'),
        ]);

        const donations = donationsResult.data || [];
        const campaigns = campaignsResult.data || [];

        const completed = donations.filter((d) => d.status === 'completed');
        const totalRaised = completed.reduce((sum, d) => sum + d.amount, 0);
        const totalDonations = completed.length;
        const pending = donations.filter((d) => d.status === 'pending').length;
        const failed = donations.filter((d) => d.status === 'failed').length;

        const stripeTotal = completed
            .filter((d) => d.payment_method === 'stripe')
            .reduce((s, d) => s + d.amount, 0);
        const mpesaTotal = completed
            .filter((d) => d.payment_method === 'mpesa')
            .reduce((s, d) => s + d.amount, 0);

        // Last 30 days trend
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const recent = completed.filter((d) => d.created_at >= thirtyDaysAgo);

        return NextResponse.json({
            totalRaised,
            totalDonations,
            pending,
            failed,
            stripeTotal,
            mpesaTotal,
            recentCount: recent.length,
            campaigns,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
