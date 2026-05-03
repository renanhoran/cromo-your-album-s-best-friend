import Stripe from "https://esm.sh/stripe@14";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error("Webhook signature error:", err);
    return new Response("Webhook error", { status: 400 });
  }

  console.log("Evento Stripe:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      console.log("Pagamento não confirmado ainda:", session.payment_status);
      return new Response("ok");
    }

    const user_id = session.metadata?.user_id;
    const plano = session.metadata?.plano ?? "completo";

    if (!user_id) {
      console.error("user_id não encontrado nos metadata");
      return new Response("ok");
    }

    console.log("Liberando acesso:", user_id, "plano:", plano);

    const { error } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        plano,
        stripe_session_id: session.id,
        stripe_customer_id: session.customer as string,
      })
      .eq("id", user_id);

    if (error) console.error("Erro ao atualizar perfil:", error);
    else console.log("Acesso liberado com sucesso para:", user_id);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});