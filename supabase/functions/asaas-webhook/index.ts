import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

const WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN")!;

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
    const customerId = payment?.customer;
    if (!customerId) {
      return new Response(JSON.stringify({ ok: true, skip: "no customer" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, periodo_assinatura")
      .eq("asaas_customer_id", customerId)
      .maybeSingle();

    if (!profile) {
      return new Response(JSON.stringify({ ok: true, skip: "no profile" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscriptionId = payment?.subscription ?? null;

    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      const ate = new Date();
      if (profile.periodo_assinatura === "anual") {
        ate.setFullYear(ate.getFullYear() + 1);
      } else {
        ate.setMonth(ate.getMonth() + 1);
      }
      ate.setDate(ate.getDate() + 3); // pequena margem
      await supabase
        .from("profiles")
        .update({
          is_premium: true,
          premium_ate: ate.toISOString(),
          asaas_subscription_id: subscriptionId,
        })
        .eq("id", profile.id);
    } else if (
      event === "PAYMENT_OVERDUE" ||
      event === "PAYMENT_DELETED" ||
      event === "PAYMENT_REFUNDED"
    ) {
      await supabase
        .from("profiles")
        .update({ is_premium: false, premium_ate: new Date().toISOString() })
        .eq("id", profile.id);
    }

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