// Supabase Edge Function: mpesa-callback-handler
// Deploy with: supabase functions deploy mpesa-callback-handler

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    try {
        const body = await req.json();
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const resultCode = body?.Body?.stkCallback?.ResultCode;
        const checkoutRequestId = body?.Body?.stkCallback?.CheckoutRequestID;
        const items = body?.Body?.stkCallback?.CallbackMetadata?.Item;

        if (!checkoutRequestId) {
            return new Response("Invalid payload", { status: 400 });
        }

        if (resultCode === 0) {
            const getItem = (name: string) => items?.find((i: { Name: string; Value: unknown }) => i.Name === name)?.Value;
            const mpesaReceiptNumber = getItem("MpesaReceiptNumber") as string;
            const amount = getItem("Amount") as number;

            const { data: donation } = await supabase
                .from("donations")
                .select("id, campaign_id")
                .eq("transaction_id", checkoutRequestId)
                .single();

            if (donation) {
                await supabase
                    .from("donations")
                    .update({ status: "completed", transaction_id: mpesaReceiptNumber || checkoutRequestId })
                    .eq("id", donation.id);

                if (donation.campaign_id) {
                    const { data: campaign } = await supabase
                        .from("campaigns")
                        .select("raised_amount")
                        .eq("id", donation.campaign_id)
                        .single();

                    if (campaign) {
                        await supabase
                            .from("campaigns")
                            .update({ raised_amount: campaign.raised_amount + amount })
                            .eq("id", donation.campaign_id);
                    }
                }

                await supabase.from("payment_logs").insert({
                    donation_id: donation.id,
                    provider: "mpesa",
                    request_payload: {},
                    response_payload: body,
                    status: "completed",
                });
            }
        } else {
            await supabase
                .from("donations")
                .update({ status: "failed" })
                .eq("transaction_id", checkoutRequestId);
        }

        return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
});
