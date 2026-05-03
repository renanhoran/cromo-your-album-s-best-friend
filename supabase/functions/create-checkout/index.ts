import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ASAAS_KEY = Deno.env.get("ASAAS_API_KEY")!;
const APP_URL = Deno.env.get("APP_URL") ?? "https://app.maniadealbum.com.br";

const isSandbox = ASAAS_KEY.includes("$aact_") &&
  (ASAAS_KEY.includes("YTU5YTE") || ASAAS_KEY.includes("sandbox") ||
   Deno.env.get("ASAAS_SANDBOX") === "true");

const ASAAS_URL = isSandbox
  ? "https://sandbox.asaas.com/api/v3"
  : "https://api.asaas.com/v3";

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
        valor: 29.90,
        nome: "Mania de Álbum — Plano Básico",
        descricao: "Acesso completo permanente.",
      },
      completo: {
        valor: 49.90,
        nome: "Mania de Álbum — Plano Completo",
        descricao: "Acesso completo com câmera IA.",
      },
      upgrade: {
        valor: 20.00,
        nome: "Mania de Álbum — Upgrade Câmera IA",
        descricao: "Upgrade para câmera IA ilimitada.",
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
      "access_token": ASAAS_KEY,
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
          name: nome || email.split("@")[0],
          email,
          externalReference: user_id,
          notificationDisabled: true,
        }),
      });
      const cust = await custRes.json();
      console.log("Customer response:", JSON.stringify(cust));

      if (!custRes.ok || !cust.id) {
        return new Response(JSON.stringify({ error: "Falha ao criar cliente", detail: cust }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      customerId = cust.id;
      await supabase.from("profiles")
        .update({ asaas_customer_id: customerId })
        .eq("id", user_id);
    }

    const paymentRes = await fetch(`${ASAAS_URL}/payments`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        customer: customerId,
        billingType: "UNDEFINED",
        value: planoEscolhido.valor,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString().split("T")[0],
        description: planoEscolhido.descricao,
        externalReference: `${user_id}|${planoKey}`,
        postalService: false,
      }),
    });

    const payment = await paymentRes.json();
    console.log("Payment response:", JSON.stringify(payment));

    if (!paymentRes.ok || !payment.id) {
      return new Response(
        JSON.stringify({ error: "Falha ao criar cobrança", detail: payment }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const invoiceUrl = payment.invoiceUrl || payment.bankSlipUrl;

    if (!invoiceUrl) {
      const viewRes = await fetch(`${ASAAS_URL}/payments/${payment.id}/viewingInfo`, {
        headers,
      });
      const viewData = await viewRes.json();
      console.log("View response:", JSON.stringify(viewData));

      const finalUrl = viewData.invoiceUrl || `https://sandbox.asaas.com/i/${payment.id}`;

      await supabase.from("profiles")
        .update({ asaas_payment_id: payment.id })
        .eq("id", user_id);

      return new Response(
        JSON.stringify({ url: finalUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("profiles")
      .update({ asaas_payment_id: payment.id })
      .eq("id", user_id);

    return new Response(
      JSON.stringify({ url: invoiceUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Erro geral:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
