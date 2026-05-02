import { useMemo } from "react";
import { STICKERS } from "@/data/stickers";
import { StickerCounts } from "@/lib/storage";
import type { Profile } from "@/pages/Index";
import { AdBanner } from "@/components/AdBanner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ProfileView({
  counts,
  profile,
  setProfile,
  email,
  onLogout,
}: {
  counts: StickerCounts;
  profile: Profile;
  setProfile: (p: Profile) => void;
  email: string;
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

        <AdBanner />

        <Button variant="outline" className="w-full h-12" onClick={onLogout}>
          Sair
        </Button>

        <p className="text-center text-[11px] text-muted-foreground pt-1">
          CROMO · Copa 2026 · feito para colecionadores
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