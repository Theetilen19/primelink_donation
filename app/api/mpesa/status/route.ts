import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const donationId = searchParams.get('donationId');
        const checkoutRequestId = searchParams.get('checkoutRequestId');

        if (!donationId && !checkoutRequestId) {
            return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
        }

        const supabase = createAdminClient();
        let query = supabase.from('donations').select('id, status, amount, currency, donor_name');

        if (donationId) {
            query = query.eq('id', donationId);
        } else {
            query = query.eq('transaction_id', checkoutRequestId!);
        }

        const { data, error } = await query.single();

        if (error || !data) {
            return NextResponse.json({ status: 'not_found' }, { status: 404 });
        }

        return NextResponse.json({ status: data.status, donation: data });
    } catch (error) {
        console.error('Status check error:', error);
        return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
    }
}
