import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Profile } from "@/pages/Index";

interface PaywallProps {
  userId: string;
  email: string;
  nome?: string;
  profile: Profile;
  onProfileChange: (profile: Profile) => Promise<void>;
  diasTestados?: number;
}

export function Paywall({ userId, email, nome, profile, onProfileChange, diasTestados = 3 }: PaywallProps) {
  const [periodo, setPeriodo] = useState<"mensal" | "anual">("anual");
  const [loading, setLoading] = useState(false);

  const preco =
    periodo === "anual"
      ? { principal: "R$ 6,65", sufixo: "/mês", detalhe: "cobrado R$ 79,90/ano" }
      : { principal: "R$ 9,90", sufixo: "/mês", detalhe: "cobrado mensalmente" };

  const legal =
    periodo === "anual"
      ? "R$ 79,90 cobrado anualmente. Cancele quando quiser."
      : "R$ 9,90 por mês. Cancele quando quiser.";

  const updateField = (field: keyof Profile, value: string) => {
    void onProfileChange({ ...profile, [field]: value });
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const requiredFields: Array<[keyof Profile, string]> = [
        ["cpf_cnpj", "CPF"],
        ["phone", "Telefone"],
        ["address", "Endereço"],
        ["address_number", "Número"],
        ["postal_code", "CEP"],
        ["province", "Bairro"],
        ["city", "Cidade"],
      ];

      const missing = requiredFields.find(([field]) => !String(profile[field] ?? "").trim());
      if (missing) {
        toast.error(`Preencha ${missing[1].toLowerCase()} para continuar.`);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          user_id: userId,
          email,
          nome,
          periodo,
          cpf_cnpj: profile.cpf_cnpj,
          phone: profile.phone,
          address: profile.address,
          address_number: profile.address_number,
          address_complement: profile.address_complement,
          postal_code: profile.postal_code,
          province: profile.province,
          city: profile.city,
        },
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
        <div className="flex justify-center mb-5 text-5xl">🔒</div>
        <h1 className="text-3xl font-black tracking-tight text-center leading-tight mb-2">
          Seu teste grátis acabou.
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Você marcou suas figurinhas por {diasTestados} dias.<br />
          Continue de onde parou — seus dados estão salvos.
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

        <ul className="mb-6 space-y-2 text-sm">
          {[
            "Suas figurinhas já marcadas continuam salvas",
            "Match de trocas sem limite",
            "Mapa de pontos de troca",
            "Até 4 perfis — família toda usa",
            "Sem propagandas",
            "Backup automático",
          ].map((b) => (
            <li key={b} className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border border-border bg-card p-5 mb-6 space-y-3">
          <h2 className="text-sm font-bold">Dados para cobrança</h2>
          <div className="grid grid-cols-1 gap-3">
            <Input value={profile.cpf_cnpj ?? ""} onChange={(e) => updateField("cpf_cnpj", e.target.value)} placeholder="CPF" inputMode="numeric" />
            <Input value={profile.phone ?? ""} onChange={(e) => updateField("phone", e.target.value)} placeholder="Telefone com DDD" inputMode="tel" />
            <Input value={profile.address ?? ""} onChange={(e) => updateField("address", e.target.value)} placeholder="Endereço" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={profile.address_number ?? ""} onChange={(e) => updateField("address_number", e.target.value)} placeholder="Número" />
              <Input value={profile.address_complement ?? ""} onChange={(e) => updateField("address_complement", e.target.value)} placeholder="Complemento" />
            </div>
            <Input value={profile.postal_code ?? ""} onChange={(e) => updateField("postal_code", e.target.value)} placeholder="CEP" inputMode="numeric" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={profile.province ?? ""} onChange={(e) => updateField("province", e.target.value)} placeholder="Bairro" />
              <Input value={profile.city ?? ""} onChange={(e) => updateField("city", e.target.value)} placeholder="Cidade" />
            </div>
          </div>
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
            "Continuar usando — assinar agora"
          )}
        </Button>

        <p className="mt-4 text-xs text-muted-foreground text-center leading-relaxed">
          {legal}
        </p>
      </div>
    </div>
  );
}