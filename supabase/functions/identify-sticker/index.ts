const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, mediaType } = await req.json();
    if (!imageBase64 || !mediaType) {
      return new Response(JSON.stringify({ error: "imageBase64 and mediaType required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Isso é uma figurinha do álbum Panini Copa do Mundo FIFA 2026.
Identifique e responda APENAS um JSON válido, sem explicações:
{
  "numero": "número da figurinha se visível, ou null",
  "nome": "nome do jogador ou descrição (ex: Escudo Brasil, Foto Time França), ou null",
  "selecao": "sigla da seleção se visível (ex: BRA, ARG, FRA), ou null",
  "confianca": "alta | media | baixa"
}
Se não conseguir identificar nada, responda: {"numero": null, "nome": null, "selecao": null, "confianca": "baixa"}`;

    const apiResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: imageBase64 },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!apiResp.ok) {
      const errText = await apiResp.text();
      console.error("Anthropic error:", apiResp.status, errText);
      return new Response(
        JSON.stringify({ error: "AI provider error", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await apiResp.json();
    const text: string = data?.content?.[0]?.type === "text" ? data.content[0].text : "{}";

    let result;
    try {
      result = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      result = { numero: null, nome: null, selecao: null, confianca: "baixa" };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("identify-sticker error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});