import { useMemo } from "react";
import { STICKERS } from "@/data/stickers";
import { StickerCounts } from "@/lib/storage";
import type { Profile } from "@/pages/Index";
import { AdBanner } from "@/components/AdBanner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Camera, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ProfileView({
  counts,
  profile,
  setProfile,
  email,
  plano = "teste",
  userId,
  onLogout,
}: {
  counts: StickerCounts;
  profile: Profile;
  setProfile: (p: Profile) => void;
  email: string;
  plano?: "teste" | "basico" | "completo";
  userId?: string;
  onLogout: () => void;
}) {
  const stats = useMemo(() => {
    let have = 0;
    let dupes = 0;
    STICKERS.forEach((s) => {
      const c = counts[s.id] ?? 0;
      if (c >= 1) have++;
      if (c >= 2) dupes += c - 1;
    });
    return { have, dupes, total: STICKERS.length, pct: Math.round((have / STICKERS.length) * 100) };
  }, [counts]);

  const update = (patch: Partial<Profile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
  };

  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [upgrading, setUpgrading] = useState(false);

  const compartilharRepetidas = () => {
    const repetidas = STICKERS.filter((s) => (counts[s.id] ?? 0) > 1);
    if (repetidas.length === 0) {
      toast.info("Você não tem figurinhas repetidas ainda.");
      return;
    }
    const porSelecao: Record<string, string[]> = {};
    repetidas.forEach((s) => {
      if (!porSelecao[s.selecao]) porSelecao[s.selecao] = [];
      const qtd = (counts[s.id] ?? 0) - 1;
      porSelecao[s.selecao].push(`${s.nome}${qtd > 1 ? ` (×${qtd})` : ""}`);
    });
    const linhas = Object.entries(porSelecao).map(
      ([selecao, jogadores]) => `*${selecao}:* ${jogadores.join(", ")}`
    );
    const mensagem = [
      "📒 *Minhas figurinhas repetidas — Copa 2026*",
      "",
      ...linhas,
      "",
      `_Total: ${repetidas.length} figurinha(s) repetida(s)_`,
      "_Baixe o Mania de Álbum: app.maniadealbum.com.br_",
    ].join("\n");
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  };

  const handleUpgrade = async () => {
    if (!userId) return;
    setUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { user_id: userId, email, nome: profile.nome, plano: "upgrade" },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("URL de checkout não recebida");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível iniciar o upgrade.");
      setUpgrading(false);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("cromo:theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className="pb-24">
      <header className="sticky top-12 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Perfil</p>
            <h1 className="text-2xl font-black tracking-tight truncate">{profile.nome || "Você"}</h1>
            {email && <p className="text-xs text-muted-foreground mt-0.5 truncate">{email}</p>}
          </div>
          <button
            onClick={() => setIsDark((v) => !v)}
            aria-label="Alternar tema"
            className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div className="rounded-2xl bg-card border border-border p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl">
              {profile.avatar}
            </div>
            <div className="flex-1">
              <div className="text-3xl font-black text-primary leading-none">{stats.pct}%</div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">do álbum completo</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <Mini value={stats.have} label="tenho" />
            <Mini value={stats.total - stats.have} label="preciso" />
            <Mini value={stats.dupes} label="repetidas" />
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <h3 className="font-bold text-sm">Seus dados</h3>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Nome</label>
            <Input value={profile.nome} onChange={(e) => update({ nome: e.target.value })} placeholder="Seu nome" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Cidade</label>
            <Input value={profile.cidade} onChange={(e) => update({ cidade: e.target.value })} placeholder="Cidade, UF" />
          </div>
        </div>

        {plano === "basico" && (
          <div className="rounded-2xl border-2 p-4" style={{ borderColor: "#1DB954" }}>
            <div className="flex items-center gap-2 mb-1">
              <Camera className="h-4 w-4" style={{ color: "#1DB954" }} />
              <h3 className="font-black text-sm">Quer a câmera IA?</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Faça upgrade para o Plano Completo por apenas R$ 20,00 e identifique figurinhas pela câmera.
            </p>
            <Button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full h-11 text-sm font-bold rounded-xl"
              style={{ backgroundColor: "#1DB954", color: "#000" }}
            >
              {upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar câmera por R$ 20,00"}
            </Button>
          </div>
        )}

        {plano === "teste" && <AdBanner />}

        <button
          onClick={compartilharRepetidas}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-white font-semibold text-sm"
          style={{ backgroundColor: "#25D366" }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Compartilhar minhas repetidas
        </button>

        <Button variant="outline" className="w-full h-12" onClick={onLogout}>
          Sair
        </Button>

        <p className="text-center text-[11px] text-muted-foreground pt-1">
          Mania de Álbum · Copa 2026 · feito para colecionadores
        </p>
      </div>
    </div>
  );
}

function Mini({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-secondary py-2">
      <div className="text-base font-black leading-none">{value}</div>
      <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">{label}</div>
    </div>
  );
}