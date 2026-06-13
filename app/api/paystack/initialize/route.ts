import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, currency, donorName, donorEmail, donorPhone, campaignId, anonymous } = body;

        // In a live system, you might want to drop the CHECK constraint in Supabase for payment_method
        // to allow 'paystack', or handle it on the database end beforehand.
        const supabase = createAdminClient();
        const tempId = `ps_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const { data: donation, error: donationError } = await supabase
            .from('donations')
            .insert({
                donor_name: anonymous ? 'Anonymous' : donorName,
                donor_email: donorEmail,
                donor_phone: donorPhone,
                amount,
                currency,
                payment_method: 'paystack' as 'stripe', // Type cast to avoid TS error if types not fully propagated, though we updated it
                transaction_id: tempId,
                campaign_id: campaignId || null,
                status: 'pending',
                anonymous: !!anonymous,
            })
            .select()
            .single();

        if (donationError) throw donationError;

        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email: donorEmail,
                amount: Math.round(amount * 100), // Paystack uses lowest currency unit (kobo/cents)
                currency: currency.toUpperCase(),
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/verify`,
                reference: tempId,
                metadata: {
                    donation_id: donation.id,
                    donor_name: donorName,
                    campaign_id: campaignId || null,
                    amount: amount
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json({ url: response.data.data.authorization_url });
    } catch (error: any) {
        console.error('Paystack initialization error:', error.response?.data || error.message);
        return NextResponse.json({ error: error.response?.data?.message || error.message }, { status: 500 });
    }
}
