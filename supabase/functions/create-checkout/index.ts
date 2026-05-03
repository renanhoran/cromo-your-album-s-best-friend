import Stripe from "https://esm.sh/stripe@14";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
});

const APP_URL = Deno.env.get("APP_URL") ?? "https://app.maniadealbum.com.br";

const PRICES: Record<string, string> = {
  basico:   Deno.env.get("STRIPE_PRICE_BASICO")!,
  completo: Deno.env.get("STRIPE_PRICE_COMPLETO")!,
  upgrade:  Deno.env.get("STRIPE_PRICE_UPGRADE")!,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user_id, email, plano } = await req.json();

    if (!user_id || !email) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planoKey = plano in PRICES ? plano : "completo";
    const priceId = PRICES[planoKey];

    if (!priceId) {
      return new Response(JSON.stringify({ error: "Plano inválido ou Price ID não configurado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/sucesso?plano=${planoKey}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/`,
      metadata: {
        user_id,
        plano: planoKey,
      },
      locale: "pt-BR",
    });

    console.log("Stripe session criada:", session.id, "URL:", session.url);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Erro Stripe:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
