import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SECTIONS = [
  {
    emoji: "📒",
    title: "Álbum",
    desc: "Toque uma vez na figurinha para marcar como 'tenho ✓'. Toque mais vezes para registrar repetidas (×2 a ×9). No 10º toque ou no botão ×, ela zera.",
  },
  {
    emoji: "📸",
    title: "Identificar pela câmera",
    desc: "No álbum, use o botão da câmera flutuante para fotografar uma figurinha. A IA reconhece e sugere a marcação automaticamente.",
  },
  {
    emoji: "🤝",
    title: "Trocas",
    desc: "A aba Trocas mostra quem tem o que você precisa e precisa do que você tem. Inicie a conversa direto pelo WhatsApp.",
  },
  {
    emoji: "📍",
    title: "Locais",
    desc: "Veja pontos fixos e eventos de troca na sua cidade. Você também pode cadastrar novos locais para a comunidade.",
  },
  {
    emoji: "📲",
    title: "Compartilhar repetidas",
    desc: "No álbum, filtre por 'Repetidas' e use o botão verde para enviar a lista pelo WhatsApp em um toque.",
  },
  {
    emoji: "👤",
    title: "Seu perfil",
    desc: "Mantenha nome, cidade e WhatsApp atualizados — assim outros colecionadores conseguem te chamar para trocas.",
  },
  {
    emoji: "💎",
    title: "Planos",
    desc: "Você começa com 15 dias grátis com tudo incluso. Depois, escolha o plano Básico ou Completo (com câmera IA).",
  },
];

export function HowItWorksDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-black">
            Como funciona o app
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              className="rounded-xl bg-secondary/50 border border-border p-3"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">{s.emoji}</div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}