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
      max_tokens: 300,
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
            text: `Esta é uma figurinha do álbum Panini FIFA World Cup 2026.

Analise a imagem com atenção e identifique:
1. O SOBRENOME do jogador — geralmente escrito em letras maiúsculas na parte inferior ou superior da figurinha
2. O NOME do jogador — geralmente escrito em letras menores abaixo do sobrenome
3. A SIGLA da seleção — ex: BRA, ARG, FRA, MEX
4. O NÚMERO da figurinha — número pequeno no canto da figurinha

IMPORTANTE: 
- Se a figurinha mostra um JOGADOR com foto, retorne o nome/sobrenome do jogador
- Se a figurinha mostra apenas um ESCUDO/EMBLEMA sem foto de jogador, retorne tipo "escudo"
- Leia com cuidado o texto na figurinha — não adivinhe

Responda APENAS com JSON válido, sem explicações:
{
  "sobrenome": "sobrenome em maiúsculas ou null",
  "nome": "nome em letras menores ou null",
  "nome_completo": "Nome Sobrenome combinado ou null",
  "sigla_selecao": "sigla de 3 letras ou null",
  "numero": "número da figurinha ou null",
  "tipo": "jogador ou escudo ou foto_time ou especial",
  "confianca": "alta ou media ou baixa"
}`
          }
        ]
      }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const clean = text.replace(/```json|```/g, "").trim();

    try {
      const result = JSON.parse(clean);
      console.log("Identificação:", JSON.stringify(result));
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("JSON parse error:", clean);
      return new Response(
        JSON.stringify({ sobrenome: null, nome: null, nome_completo: null, sigla_selecao: null, numero: null, tipo: null, confianca: "baixa" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Erro:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
