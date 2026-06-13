import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const supabase = createAdminClient();

        const resultCode = body?.Body?.stkCallback?.ResultCode;
        const checkoutRequestId = body?.Body?.stkCallback?.CheckoutRequestID;
        const callbackMetadata = body?.Body?.stkCallback?.CallbackMetadata?.Item;

        if (!checkoutRequestId) {
            return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 });
        }

        if (resultCode === 0) {
            // Payment successful — extract details
            const getItem = (name: string) =>
                callbackMetadata?.find((i: { Name: string; Value: unknown }) => i.Name === name)?.Value;

            const mpesaReceiptNumber = getItem('MpesaReceiptNumber') as string;
            const transactionDate = getItem('TransactionDate');
            const amount = getItem('Amount') as number;

            // Update donation status
            const { data: donation } = await supabase
                .from('donations')
                .select('id, campaign_id')
                .eq('transaction_id', checkoutRequestId)
                .single();

            if (donation) {
                await supabase
                    .from('donations')
                    .update({ status: 'completed', transaction_id: mpesaReceiptNumber || checkoutRequestId })
                    .eq('id', donation.id);

                // Update campaign raised amount
                if (donation.campaign_id) {
                    const { data: campaign } = await supabase
                        .from('campaigns')
                        .select('raised_amount')
                        .eq('id', donation.campaign_id)
                        .single();

                    if (campaign) {
                        await supabase
                            .from('campaigns')
                            .update({ raised_amount: campaign.raised_amount + amount })
                            .eq('id', donation.campaign_id);
                    }
                }

                // Log the callback
                await supabase.from('payment_logs').insert({
                    donation_id: donation.id,
                    provider: 'mpesa',
                    request_payload: {},
                    response_payload: body,
                    status: 'completed',
                });
            }
        } else {
            // Payment failed
            await supabase
                .from('donations')
                .update({ status: 'failed' })
                .eq('transaction_id', checkoutRequestId);

            await supabase.from('payment_logs').insert({
                donation_id: checkoutRequestId,
                provider: 'mpesa',
                request_payload: {},
                response_payload: body,
                status: 'failed',
            });
        }

        return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (error) {
        console.error('M-Pesa callback error:', error);
        return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
    }
}
