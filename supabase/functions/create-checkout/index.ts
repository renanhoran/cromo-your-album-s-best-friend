import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ASAAS_URL = "https://sandbox.asaas.com/api/v3";
const ASAAS_KEY = Deno.env.get("ASAAS_API_KEY")!;
const APP_URL = Deno.env.get("APP_URL") ?? "https://maniadealbum.com.br";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const {
      user_id,
      email,
      nome,
      periodo,
      cpf_cnpj,
      phone,
      address,
      address_number,
      address_complement,
      postal_code,
      province,
      city,
    } = await req.json();

    if (!user_id || !email || !periodo) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanCpfCnpj = String(cpf_cnpj ?? "").replace(/\D/g, "");
    const cleanPhone = String(phone ?? "").replace(/\D/g, "");
    const cleanPostalCode = String(postal_code ?? "").replace(/\D/g, "");
    const cleanAddress = String(address ?? "").trim();
    const cleanAddressNumber = String(address_number ?? "").trim();
    const cleanComplement = String(address_complement ?? "").trim();
    const cleanProvince = String(province ?? "").trim();
    const cleanCity = String(city ?? "").trim();

    if (!cleanCpfCnpj || !cleanPhone || !cleanAddress || !cleanAddressNumber || !cleanPostalCode || !cleanProvince || !cleanCity) {
      return new Response(JSON.stringify({ error: "Dados de cobrança incompletos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const headers = {
      "Content-Type": "application/json",
      access_token: ASAAS_KEY,
    };

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("asaas_customer_id")
      .eq("id", user_id)
      .single();

    let customerId = profile?.asaas_customer_id;

    const customerPayload = {
      name: nome || email,
      email,
      cpfCnpj: cleanCpfCnpj,
      ...(cleanPhone.length >= 10 ? { mobilePhone: cleanPhone } : {}),
      address: cleanAddress,
      addressNumber: cleanAddressNumber,
      complement: cleanComplement || undefined,
      postalCode: cleanPostalCode,
      province: cleanProvince,
      cityName: cleanCity || undefined,
      externalReference: user_id,
      notificationDisabled: false,
    };

    if (!customerId) {
      const custRes = await fetch(`${ASAAS_URL}/customers`, {
        method: "POST",
        headers,
        body: JSON.stringify(customerPayload),
      });
      const cust = await custRes.json();
      if (!custRes.ok) {
        console.error("Asaas customer error", cust);
        throw new Error("Falha ao criar cliente no Asaas");
      }
      customerId = cust.id;
      await supabase.from("profiles").update({ asaas_customer_id: customerId }).eq("id", user_id);
    } else {
      const custRes = await fetch(`${ASAAS_URL}/customers/${customerId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(customerPayload),
      });
      const cust = await custRes.json();
      if (!custRes.ok) {
        console.error("Asaas customer update error", cust);
        throw new Error("Falha ao atualizar cliente no Asaas");
      }
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 3);
    const nextDueDateStr = nextDueDate.toISOString().split("T")[0];

    const valor = periodo === "anual" ? 79.9 : 9.9;
    const ciclo = periodo === "anual" ? "YEARLY" : "MONTHLY";

    const checkoutRes = await fetch(`${ASAAS_URL}/checkouts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        billingTypes: ["CREDIT_CARD"],
        chargeTypes: ["RECURRENT"],
        minutesToExpire: 30,
        callback: {
          successUrl: `${APP_URL}/sucesso`,
          cancelUrl: `${APP_URL}/`,
          expiredUrl: `${APP_URL}/`,
        },
        items: [
          {
            name: "Mania de Álbum",
            description: `Assinatura ${periodo === "anual" ? "anual" : "mensal"} — acesso completo`,
            quantity: 1,
            value: valor,
          },
        ],
        subscription: {
          cycle: ciclo,
          nextDueDate: nextDueDateStr,
        },
        customer: customerId,
      }),
    });

    const checkout = await checkoutRes.json();
    if (!checkoutRes.ok) {
      console.error("Asaas checkout error", checkout);
      throw new Error("Falha ao criar checkout no Asaas");
    }

    const premiumAte = new Date();
    premiumAte.setDate(premiumAte.getDate() + 3);

    await supabase
      .from("profiles")
      .update({
        is_premium: true,
        premium_ate: premiumAte.toISOString(),
        periodo_assinatura: periodo,
      })
      .eq("id", user_id);

    return new Response(JSON.stringify({ url: checkout.url ?? checkout.invoiceUrl }), {
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