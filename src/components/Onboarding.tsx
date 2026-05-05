import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    emoji: "📒",
    title: "Bem-vindo ao Mania de Álbum!",
    desc: "Seu álbum digital da Copa 2026: marque figurinhas, encontre trocas e complete a coleção. 15 dias grátis, sem cartão.",
    destaque: null as string | null,
    cta: "Próximo",
  },
  {
    emoji: "👆",
    title: "Marque suas figurinhas",
    desc: "1 toque: tenho ✓ · 2 toques: repetida ×2 · até ×9. Toque no × para zerar a qualquer momento.",
    destaque: null,
    cta: "Próximo",
  },
  {
    emoji: "📸",
    title: "Identifique pela câmera",
    desc: "Fotografe qualquer figurinha e a IA reconhece automaticamente — sem precisar digitar nada.",
    destaque: "✨ Incluso no seu teste grátis",
    cta: "Próximo",
  },
  {
    emoji: "🤝",
    title: "Trocas inteligentes",
    desc: "O app mostra quem tem o que você precisa e precisa do que você tem. Proponha trocas direto pelo WhatsApp.",
    destaque: null,
    cta: "Próximo",
  },
  {
    emoji: "📍",
    title: "Pontos de troca",
    desc: "Veja locais e eventos de troca na sua cidade — ou cadastre os seus.",
    destaque: null,
    cta: "Próximo",
  },
  {
    emoji: "📲",
    title: "Compartilhe suas repetidas",
    desc: "Envie sua lista de repetidas pelo WhatsApp em um toque, agrupada por seleção.",
    destaque: null,
    cta: "Próximo",
  },
  {
    emoji: "🚀",
    title: "Tudo pronto!",
    desc: "Comece a marcar suas figurinhas. Seus dados ficam salvos na nuvem e sincronizam entre dispositivos.",
    destaque: "🎁 15 dias grátis com tudo incluso",
    cta: "Começar a usar →",
  },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const s = SLIDES[i];
  return (
    <Sheet open onOpenChange={(o) => !o && onDone()}>
      <SheetContent side="bottom" className="rounded-t-3xl max-w-md mx-auto">
        <div className="text-center py-6">
          <div className="text-6xl mb-4">{s.emoji}</div>
          <h2 className="text-2xl font-black mb-2">{s.title}</h2>
          <p className="text-muted-foreground text-sm px-4 leading-relaxed">{s.desc}</p>
          {s.destaque && (
            <div className="mt-4 mx-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm font-medium text-primary">
              {s.destaque}
            </div>
          )}
          <div className="flex justify-center gap-1.5 mt-6">
            {SLIDES.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-6 bg-primary" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
          <Button
            className="w-full h-12 mt-6 font-bold"
            onClick={() => (last ? onDone() : setI(i + 1))}
          >
            {s.cta}
          </Button>
          {!last && (
            <button onClick={onDone} className="text-xs text-muted-foreground mt-3">
              Pular
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}