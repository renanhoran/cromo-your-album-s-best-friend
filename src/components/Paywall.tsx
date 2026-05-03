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
  const [loading, setLoading] = useState<null | "basico" | "completo">(null);

  const handleStart = async (plano: "basico" | "completo") => {
    setLoading(plano);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { user_id: userId, email, nome, plano },
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
      setLoading(null);
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
        <p className="text-center text-muted-foreground text-sm mb-5">
          Suas figurinhas estão salvas.<br />
          Continue de onde parou.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Básico */}
          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col">
            <div className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">Básico</div>
            <div className="text-2xl font-black leading-tight">R$ 29,90</div>
            <div className="text-[10px] text-muted-foreground mb-3">pagamento único</div>
            <ul className="space-y-1.5 text-xs flex-1 mb-3">
              {[
                "Figurinhas ilimitadas",
                "Match de trocas",
                "Mapa de locais",
                "Sem anúncios",
              ].map((b) => (
                <li key={b} className="flex items-start gap-1.5">
                  <Check className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleStart("basico")}
              disabled={loading !== null}
              variant="outline"
              className="w-full h-11 text-sm font-bold rounded-xl border-2"
              style={{ borderColor: "#1DB954", color: "#1DB954" }}
            >
              {loading === "basico" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Escolher"}
            </Button>
          </div>

          {/* Completo */}
          <div className="rounded-2xl border-2 bg-card p-4 flex flex-col relative" style={{ borderColor: "#1DB954" }}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: "#1DB954", color: "#000" }}>
              Recomendado
            </div>
            <div className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: "#1DB954" }}>Completo ★</div>
            <div className="text-2xl font-black leading-tight">R$ 49,90</div>
            <div className="text-[10px] text-muted-foreground mb-3">pagamento único</div>
            <ul className="space-y-1.5 text-xs flex-1 mb-3">
              {[
                "Tudo do Básico",
                "Câmera IA identifica",
                "Ilimitado pra sempre",
              ].map((b) => (
                <li key={b} className="flex items-start gap-1.5">
                  <Check className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleStart("completo")}
              disabled={loading !== null}
              className="w-full h-11 text-sm font-bold rounded-xl"
              style={{ backgroundColor: "#1DB954", color: "#000" }}
            >
              {loading === "completo" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Escolher"}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Pagamento único. Sem mensalidade. Sem surpresa.
        </p>

        <div className="mt-8">
          <AdBanner slot="" />
        </div>
      </div>
    </div>
  );
}
