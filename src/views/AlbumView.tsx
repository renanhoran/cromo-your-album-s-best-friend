import { useMemo, useState } from "react";
import { STICKERS } from "@/data/stickers";
import { StickerCounts } from "@/lib/storage";
import { StickerCard } from "@/components/Sticker";
import { AdBanner } from "@/components/AdBanner";
import { cn } from "@/lib/utils";

type Filter = "todas" | "tenho" | "preciso" | "repetidas";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "tenho", label: "Tenho" },
  { id: "preciso", label: "Preciso" },
  { id: "repetidas", label: "Repetidas" },
];

export function AlbumView({
  counts,
  onTap,
}: {
  counts: StickerCounts;
  onTap: (id: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("todas");

  const stats = useMemo(() => {
    const total = STICKERS.length;
    let have = 0;
    let dupes = 0;
    STICKERS.forEach((s) => {
      const c = counts[s.id] ?? 0;
      if (c >= 1) have++;
      if (c >= 2) dupes += c - 1;
    });
    const missing = total - have;
    const pct = Math.round((have / total) * 100);
    return { total, have, dupes, missing, pct };
  }, [counts]);

  const filtered = useMemo(() => {
    return STICKERS.filter((s) => {
      const c = counts[s.id] ?? 0;
      if (filter === "tenho") return c >= 1;
      if (filter === "preciso") return c === 0;
      if (filter === "repetidas") return c >= 2;
      return true;
    });
  }, [counts, filter]);

  // Group by selecao for visual organization
  const grouped = useMemo(() => {
    const map = new Map<string, typeof STICKERS>();
    filtered.forEach((s) => {
      const key = s.selecao;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="pb-24">
      {/* Header / progress */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Copa 2026</p>
              <h1 className="text-2xl font-black tracking-tight">Meu álbum</h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-primary leading-none">{stats.pct}%</div>
              <div className="text-[11px] text-muted-foreground font-medium">completo</div>
            </div>
          </div>

          <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${stats.pct}%`, background: "var(--gradient-primary)" }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <Stat value={stats.have} label="tenho" tone="have" />
            <Stat value={stats.missing} label="preciso" tone="missing" />
            <Stat value={stats.dupes} label="repetidas" tone="dupe" />
          </div>

          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "shrink-0 px-4 h-9 rounded-full text-sm font-semibold border transition-all",
                  filter === f.id
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-foreground border-border"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-6">
        <AdBanner />

        {grouped.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-2">🎯</div>
            <p className="font-semibold text-foreground">Nenhuma figurinha aqui</p>
            <p className="text-sm">Tente outro filtro.</p>
          </div>
        )}

        {grouped.map(([selecao, items]) => (
          <section key={selecao}>
            <div className="flex items-baseline justify-between mb-2 px-0.5">
              <h2 className="text-sm font-black uppercase tracking-wider">{selecao}</h2>
              <span className="text-[11px] text-muted-foreground font-medium">
                {items.filter((s) => (counts[s.id] ?? 0) >= 1).length}/{items.length}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {items.map((s) => (
                <StickerCard
                  key={s.id}
                  sticker={s}
                  count={counts[s.id] ?? 0}
                  onClick={() => onTap(s.id)}
                />
              ))}
            </div>
          </section>
        ))}

        <p className="text-center text-xs text-muted-foreground pt-2">
          1 toque: tenho · 2 toques: repetida · 3 toques: zerar
        </p>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone: "have" | "missing" | "dupe" }) {
  const color =
    tone === "have"
      ? "text-[hsl(var(--sticker-have))]"
      : tone === "dupe"
      ? "text-[hsl(var(--sticker-dupe))]"
      : "text-foreground";
  return (
    <div className="rounded-xl bg-card border border-border py-2">
      <div className={cn("text-lg font-black leading-none", color)}>{value}</div>
      <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</div>
    </div>
  );
}