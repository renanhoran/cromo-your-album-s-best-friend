import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ASAAS_URL = "https://sandbox.asaas.com/api/v3";
const ASAAS_KEY = Deno.env.get("ASAAS_API_KEY")!;
const APP_URL = Deno.env.get("APP_URL") ?? "https://maniadealbum.com.br";
const ASAAS_CHECKOUT_BASE_URL = "https://sandbox.asaas.com/checkoutSession/show?id=";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user_id, email, nome, plano } = await req.json();

    if (!user_id || !email) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planos: Record<string, { valor: number; nome: string; descricao: string }> = {
      basico: {
        valor: 29.9,
        nome: "Mania de Álbum — Plano Básico",
        descricao: "Acesso completo permanente sem câmera IA.",
      },
      completo: {
        valor: 49.9,
        nome: "Mania de Álbum — Plano Completo",
        descricao: "Acesso completo permanente com câmera IA ilimitada.",
      },
      upgrade: {
        valor: 20.0,
        nome: "Mania de Álbum — Upgrade Câmera IA",
        descricao: "Upgrade do Básico para o Completo. Adiciona câmera IA.",
      },
    };

    const planoKey = (plano as string) in planos ? (plano as string) : "completo";
    const planoEscolhido = planos[planoKey];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const headers = {
      "Content-Type": "application/json",
      access_token: ASAAS_KEY,
    };

    const { data: profile } = await supabase
      .from("profiles")
      .select("asaas_customer_id")
      .eq("id", user_id)
      .single();

    let customerId = profile?.asaas_customer_id;

    if (!customerId) {
      const custRes = await fetch(`${ASAAS_URL}/customers`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: nome || email,
          email,
          externalReference: user_id,
          notificationDisabled: false,
        }),
      });
      const cust = await custRes.json();
      if (!custRes.ok || !cust.id) {
        console.error("Asaas customer error", cust);
        return new Response(JSON.stringify({ error: "Falha ao criar cliente no Asaas" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      customerId = cust.id;
      await supabase.from("profiles").update({ asaas_customer_id: customerId }).eq("id", user_id);
    }

    const checkoutRes = await fetch(`${ASAAS_URL}/checkouts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        billingTypes: ["CREDIT_CARD", "PIX"],
        chargeTypes: ["DETACHED"],
        minutesToExpire: 30,
        callback: {
          successUrl: `${APP_URL}/sucesso?plano=${planoKey}`,
          cancelUrl: `${APP_URL}/`,
          expiredUrl: `${APP_URL}/`,
        },
        customer: customerId,
        items: [
          {
            name: planoEscolhido.nome,
            description: planoEscolhido.descricao,
            quantity: 1,
            value: planoEscolhido.valor,
          },
        ],
      }),
    });

    const checkout = await checkoutRes.json();
    if (!checkoutRes.ok) {
      console.error("Asaas checkout error", checkout);
      return new Response(JSON.stringify({ error: "Falha ao criar checkout no Asaas" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checkoutUrl =
      checkout.url ?? checkout.invoiceUrl ?? (checkout.id ? `${ASAAS_CHECKOUT_BASE_URL}${checkout.id}` : null);

    return new Response(JSON.stringify({ url: checkoutUrl }), {
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
