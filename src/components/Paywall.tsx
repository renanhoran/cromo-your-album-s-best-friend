import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdBanner } from "@/components/AdBanner";

interface PaywallProps {
  userId: string;
  email: string;
  nome?: string;
}

export function Paywall({ userId, email, nome }: PaywallProps) {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { user_id: userId, email, nome },
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
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
            <Lock className="h-8 w-8 text-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-center leading-tight mb-2">
          Seu teste grátis acabou.
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Suas figurinhas estão salvas.<br />
          Continue de onde parou.
        </p>

        <div className="rounded-2xl border border-border bg-card p-6 mb-6 text-center">
          <div className="text-5xl font-black">R$ 19,90</div>
          <p className="text-sm text-muted-foreground mt-2">
            acesso completo — pague uma vez, use sempre
          </p>
        </div>

        <ul className="mb-6 space-y-2.5 text-sm">
          {[
            "Suas figurinhas já marcadas continuam salvas",
            "Match de trocas sem limite",
            "Mapa de pontos de troca",
            "Sem anúncios para sempre",
          ].map((b) => (
            <li key={b} className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={handleStart}
          disabled={loading}
          className="w-full h-14 text-base font-bold rounded-xl"
          style={{ backgroundColor: "#1DB954", color: "#000" }}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Liberar acesso por R$ 19,90"
          )}
        </Button>

        <p className="mt-4 text-xs text-muted-foreground text-center leading-relaxed">
          Pagamento único. Sem mensalidade. Sem surpresa.
        </p>

        <div className="mt-8">
          <AdBanner slot="" />
        </div>
      </div>
    </div>
  );
}
