import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaywallProps {
  userId: string;
  email: string;
  nome?: string;
}

export function Paywall({ userId, email, nome }: PaywallProps) {
  const [periodo, setPeriodo] = useState<"mensal" | "anual">("anual");
  const [loading, setLoading] = useState(false);

  const preco =
    periodo === "anual"
      ? { principal: "R$ 6,65", sufixo: "/mês", detalhe: "cobrado R$ 79,90/ano" }
      : { principal: "R$ 9,90", sufixo: "/mês", detalhe: "cobrado mensalmente" };

  const legal =
    periodo === "anual"
      ? "Nenhuma cobrança nos primeiros 3 dias. Depois, R$ 79,90/ano. Cancele quando quiser."
      : "Nenhuma cobrança nos primeiros 3 dias. Depois, R$ 9,90 por mês. Cancele quando quiser.";

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { user_id: userId, email, nome, periodo },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não recebida");
      }
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível iniciar o checkout. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 py-8 flex justify-center">
      <div className="w-full max-w-[420px] flex flex-col">
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            3 dias de teste grátis
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-center leading-tight mb-2">
          Complete seu álbum mais rápido.
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Acesso completo. Cancele quando quiser.
        </p>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-secondary mb-5">
          <button
            onClick={() => setPeriodo("mensal")}
            className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
              periodo === "mensal" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setPeriodo("anual")}
            className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
              periodo === "anual" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Anual
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black">{preco.principal}</span>
            <span className="text-base text-muted-foreground font-medium">{preco.sufixo}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{preco.detalhe}</p>
          {periodo === "anual" && (
            <span className="inline-block mt-3 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold">
              Economize 33%
            </span>
          )}
        </div>

        <Button
          onClick={handleStart}
          disabled={loading}
          className="w-full h-14 text-base font-bold rounded-xl"
          style={{ backgroundColor: "#1DB954", color: "#000" }}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Começar teste grátis de 3 dias"
          )}
        </Button>

        <p className="mt-4 text-xs text-muted-foreground text-center leading-relaxed">
          {legal}
        </p>
      </div>
    </div>
  );
}