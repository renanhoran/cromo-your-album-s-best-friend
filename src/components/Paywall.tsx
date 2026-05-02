import { Button } from "@/components/ui/button";

export function Paywall({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-background">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 h-20 w-20 rounded-3xl flex items-center justify-center text-4xl text-primary-foreground shadow-[var(--shadow-pop)]" style={{ background: "var(--gradient-primary)" }}>
          ⚽️
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">CROMO</h1>
        <p className="text-muted-foreground mb-8">
          O jeito mais rápido de completar seu álbum da Copa 2026.
        </p>

        <div className="rounded-2xl border border-border bg-card p-6 text-left shadow-[var(--shadow-card)] mb-6">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-black">R$ 9,90</span>
            <span className="text-sm text-muted-foreground">acesso completo</span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><span className="text-primary font-bold">✓</span> Controle de figurinhas em 1 toque</li>
            <li className="flex gap-2"><span className="text-primary font-bold">✓</span> Match inteligente com outros usuários</li>
            <li className="flex gap-2"><span className="text-primary font-bold">✓</span> Veja quem tem o que você precisa</li>
            <li className="flex gap-2"><span className="text-primary font-bold">✓</span> Atualizações durante toda a Copa</li>
          </ul>
        </div>

        <Button
          onClick={onUnlock}
          className="w-full h-14 text-base font-bold shadow-[var(--shadow-pop)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          Liberar acesso · R$ 9,90
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Pagamento único · cancele quando quiser
        </p>
      </div>
    </div>
  );
}