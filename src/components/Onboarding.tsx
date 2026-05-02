import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    emoji: "✅",
    title: "Marque suas figurinhas",
    desc: "Toque para marcar como tenho, toque de novo para repetida e mais uma para zerar.",
  },
  {
    emoji: "🤝",
    title: "Match de trocas",
    desc: "A gente cruza suas repetidas com o que falta para outros usuários e mostra os melhores matches.",
  },
  {
    emoji: "📍",
    title: "Pontos de troca",
    desc: "Veja eventos e locais perto de você ou crie o seu próprio em segundos.",
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
          <p className="text-muted-foreground text-sm px-4">{s.desc}</p>
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
            {last ? "Começar" : "Próximo"}
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