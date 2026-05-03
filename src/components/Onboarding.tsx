import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    emoji: "📒",
    title: "Bem-vindo ao Mania de Álbum!",
    desc: "Você tem 3 dias de teste grátis com tudo incluso — sem precisar colocar cartão.",
    destaque: null as string | null,
    cta: "Próximo",
  },
  {
    emoji: "👆",
    title: "Marque suas figurinhas",
    desc: "Toque uma vez: você tem. Toque de novo: está repetida. Toque mais uma vez: volta ao normal.",
    destaque: null,
    cta: "Próximo",
  },
  {
    emoji: "🤝",
    title: "Encontre quem quer trocar",
    desc: "O app mostra quem tem o que você precisa — e precisa do que você tem.",
    destaque: null,
    cta: "Próximo",
  },
  {
    emoji: "📸",
    title: "Identifique pela câmera",
    desc: "Fotografe qualquer figurinha e o app identifica automaticamente.",
    destaque: "✨ Disponível no seu teste grátis agora!",
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