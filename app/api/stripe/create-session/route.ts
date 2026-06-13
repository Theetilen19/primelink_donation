import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { amount, currency = 'usd', donorName, donorEmail, donorPhone, campaignId, anonymous } =
            await request.json();

        if (!amount || !donorName || !donorEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const amountInCents = Math.round(amount * 100);

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: 'PrimeLink Technologies Donation',
                            description: campaignId ? `Donation to campaign` : 'General Donation',
                            images: [],
                        },
                        unit_amount: amountInCents,
                    },
                    quantity: 1,
                },
            ],
            customer_email: donorEmail,
            metadata: {
                donor_name: donorName,
                donor_email: donorEmail,
                donor_phone: donorPhone || '',
                campaign_id: campaignId || '',
                anonymous: String(anonymous || false),
                amount: String(amount),
                currency,
            },
            success_url: `${appUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/donate?cancelled=true`,
        });

        // Create pending donation record
        const supabase = createAdminClient();
        const { error: dbError } = await supabase.from('donations').insert({
            donor_name: donorName,
            donor_email: donorEmail,
            donor_phone: donorPhone || null,
            amount,
            currency,
            payment_method: 'stripe',
            transaction_id: session.id,
            campaign_id: campaignId || null,
            status: 'pending',
            anonymous: anonymous || false,
        });

        if (dbError) {
            console.error('DB insert error:', dbError);
        }

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Stripe session error:', error);
        return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 });
    }
}
