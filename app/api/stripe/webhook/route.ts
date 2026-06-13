import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const { metadata } = session;

        try {
            // Mark donation as completed
            const { error: updateError } = await supabase
                .from('donations')
                .update({ status: 'completed' })
                .eq('transaction_id', session.id);

            if (updateError) throw updateError;

            // Update campaign raised amount if applicable
            if (metadata?.campaign_id) {
                const { data: campaign } = await supabase
                    .from('campaigns')
                    .select('raised_amount')
                    .eq('id', metadata.campaign_id)
                    .single();

                if (campaign) {
                    await supabase
                        .from('campaigns')
                        .update({ raised_amount: campaign.raised_amount + Number(metadata.amount) })
                        .eq('id', metadata.campaign_id);
                }
            }

            // Log successful payment
            await supabase.from('payment_logs').insert({
                donation_id: session.id,
                provider: 'stripe',
                request_payload: {},
                response_payload: { session_id: session.id, payment_status: session.payment_status },
                status: 'completed',
            });

            console.log(`Donation ${session.id} confirmed`);
        } catch (error) {
            console.error('Error processing webhook:', error);
            return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
        }
    }

    if (event.type === 'checkout.session.expired') {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabase
            .from('donations')
            .update({ status: 'failed' })
            .eq('transaction_id', session.id);
    }

    return NextResponse.json({ received: true });
}
