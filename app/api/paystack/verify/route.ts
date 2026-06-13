import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import axios from 'axios';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
        return NextResponse.redirect(new URL('/donate?error=No reference found', process.env.NEXT_PUBLIC_APP_URL));
    }

    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        const data = response.data.data;
        const donationId = data.metadata.donation_id;
        const campaignId = data.metadata.campaign_id;
        const amount = data.metadata.amount; // original amount, not kobo

        const supabase = createAdminClient();

        if (data.status === 'success') {
            await supabase
                .from('donations')
                .update({ status: 'completed' })
                .eq('id', donationId);

            if (campaignId) {
                const { data: campaign } = await supabase
                    .from('campaigns')
                    .select('raised_amount')
                    .eq('id', campaignId)
                    .single();

                if (campaign) {
                    await supabase
                        .from('campaigns')
                        .update({ raised_amount: campaign.raised_amount + Number(amount) })
                        .eq('id', campaignId);
                }
            }

            // Log successful payment
            await supabase.from('payment_logs').insert({
                donation_id: reference,
                provider: 'paystack',
                request_payload: {},
                response_payload: data,
                status: 'completed',
            });

            return NextResponse.redirect(new URL('/donate?success=true', process.env.NEXT_PUBLIC_APP_URL));
        } else {
            await supabase
                .from('donations')
                .update({ status: 'failed' })
                .eq('id', donationId);

            return NextResponse.redirect(new URL('/donate?error=Payment failed', process.env.NEXT_PUBLIC_APP_URL));
        }
    } catch (error: any) {
        console.error('Verification failed:', error.message);
        return NextResponse.redirect(new URL('/donate?error=Verification failed', process.env.NEXT_PUBLIC_APP_URL));
    }
}
