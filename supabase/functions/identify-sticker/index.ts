import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.27.0";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageBase64, mediaType } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 30,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType ?? "image/jpeg",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Leia o código alfanumérico impresso nesta figurinha Panini da Copa do Mundo 2026.
O código está no formato SIGLA-NÚMERO (exemplos: BRA-14, MEX-07, FWC-03, USA-20).
Retorne SOMENTE o código, sem nenhum texto adicional, sem pontuação, sem explicação.
Se não conseguir ler o código, retorne apenas: ERRO`
          }
        ]
      }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const clean = text.replace(/[`"'.\s]/g, "").toUpperCase().trim();
    console.log("OCR result:", clean);

    if (!clean || clean === "ERRO" || clean.includes("ERRO")) {
      return new Response(JSON.stringify({ codigo: null, erro: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const match = clean.match(/([A-Z]{2,4})-?(\d{1,3})/);
    if (!match) {
      return new Response(JSON.stringify({ codigo: null, erro: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const codigo = `${match[1]}-${match[2].padStart(2, "0")}`;
    return new Response(JSON.stringify({ codigo, erro: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erro:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
