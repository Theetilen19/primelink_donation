// Supabase Edge Function: verify-stripe-payment
// Deploy with: supabase functions deploy verify-stripe-payment

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
    try {
        const { sessionId } = await req.json();
        if (!sessionId) {
            return new Response(JSON.stringify({ error: "Missing sessionId" }), { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        if (session.payment_status === "paid") {
            await supabase
                .from("donations")
                .update({ status: "completed" })
                .eq("transaction_id", sessionId);

            const { metadata } = session;
            if (metadata?.campaign_id) {
                const { data: campaign } = await supabase
                    .from("campaigns")
                    .select("raised_amount")
                    .eq("id", metadata.campaign_id)
                    .single();

                if (campaign) {
                    await supabase
                        .from("campaigns")
                        .update({ raised_amount: campaign.raised_amount + Number(metadata.amount) })
                        .eq("id", metadata.campaign_id);
                }
            }

            return new Response(JSON.stringify({ status: "completed" }), { status: 200 });
        }

        return new Response(JSON.stringify({ status: session.payment_status }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
});
