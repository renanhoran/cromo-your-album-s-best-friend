import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

const ASAAS_URL = "https://sandbox.asaas.com/api/v3";
const WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN")!;
const ASAAS_KEY = Deno.env.get("ASAAS_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = req.headers.get("asaas-access-token") ?? req.headers.get("access_token");
    if (token !== WEBHOOK_TOKEN) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const event = payload?.event as string;
    const payment = payload?.payment;

    if (event !== "PAYMENT_RECEIVED" && event !== "PAYMENT_CONFIRMED") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!payment?.customer) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try lookup via stored customer id first
    let userId: string | null = null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("asaas_customer_id", payment.customer)
      .maybeSingle();

    if (profile) {
      userId = profile.id;
    } else {
      const custRes = await fetch(`${ASAAS_URL}/customers/${payment.customer}`, {
        headers: { access_token: ASAAS_KEY },
      });
      const cust = await custRes.json();
      userId = cust?.externalReference ?? null;
    }

    if (!userId) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("profiles")
      .update({
        is_premium: true,
        asaas_payment_id: payment.id,
        asaas_customer_id: payment.customer,
      })
      .eq("id", userId);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
