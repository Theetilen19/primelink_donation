import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa';
import { createAdminClient } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { phone, amount, donorName, donorEmail, campaignId, anonymous } = await request.json();

        if (!phone || !amount || !donorName || !donorEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const donationId = randomUUID();
        const accountRef = `PL-${donationId.slice(0, 8).toUpperCase()}`;

        const stkResponse = await initiateStkPush({
            phone,
            amount,
            accountRef,
            description: 'PrimeLink Donation',
        });

        if (stkResponse.ResponseCode !== '0') {
            return NextResponse.json({ error: stkResponse.ResponseDescription }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Insert pending donation
        const { error: dbError } = await supabase.from('donations').insert({
            id: donationId,
            donor_name: donorName,
            donor_email: donorEmail,
            donor_phone: phone,
            amount,
            currency: 'KES',
            payment_method: 'mpesa',
            transaction_id: stkResponse.CheckoutRequestID,
            campaign_id: campaignId || null,
            status: 'pending',
            anonymous: anonymous || false,
        });

        if (dbError) {
            console.error('DB insert error:', dbError);
        }

        // Log the request
        await supabase.from('payment_logs').insert({
            donation_id: donationId,
            provider: 'mpesa',
            request_payload: { phone, amount, accountRef },
            response_payload: stkResponse,
            status: 'pending',
        });

        return NextResponse.json({
            success: true,
            checkoutRequestId: stkResponse.CheckoutRequestID,
            message: stkResponse.CustomerMessage,
            donationId,
        });
    } catch (error) {
        console.error('M-Pesa STK Error:', error);
        return NextResponse.json({ error: 'Failed to initiate M-Pesa payment' }, { status: 500 });
    }
}
