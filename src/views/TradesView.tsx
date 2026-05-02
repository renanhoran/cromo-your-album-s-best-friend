import { useMemo, useState } from "react";
import { STICKERS } from "@/data/stickers";
import { MOCK_USERS, StickerCounts } from "@/lib/storage";
import { AdBanner } from "@/components/AdBanner";
import { cn } from "@/lib/utils";

export function TradesView({ counts }: { counts: StickerCounts }) {
  const matches = useMemo(() => {
    const stickerById = new Map(STICKERS.map((s) => [s.id, s]));
    const myMissing = STICKERS.filter((s) => (counts[s.id] ?? 0) === 0).map((s) => s.id);
    const myDupes = STICKERS.filter((s) => (counts[s.id] ?? 0) >= 2).map((s) => s.id);
    const missingSet = new Set(myMissing);
    const dupeSet = new Set(myDupes);

    return MOCK_USERS.map((u) => {
      const theyHaveForMe: string[] = [];
      const iHaveForThem: string[] = [];
      missingSet.forEach((id) => {
        if ((u.counts[id] ?? 0) >= 2) theyHaveForMe.push(id);
      });
      dupeSet.forEach((id) => {
        if ((u.counts[id] ?? 0) === 0) iHaveForThem.push(id);
      });
      const score = Math.min(theyHaveForMe.length, iHaveForThem.length);
      return { user: u, theyHaveForMe, iHaveForThem, score, stickerById };
    })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [counts]);

  const totalPossible = matches.reduce((acc, m) => acc + m.score, 0);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 pt-4 pb-3">
          <p className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Match inteligente</p>
          <h1 className="text-2xl font-black tracking-tight">Trocas possíveis</h1>
          <div className="mt-3 rounded-2xl p-4 text-primary-foreground shadow-[var(--shadow-pop)]" style={{ background: "var(--gradient-primary)" }}>
            <div className="text-3xl font-black leading-none">{totalPossible}</div>
            <div className="text-sm font-medium opacity-95 mt-1">
              {totalPossible === 1 ? "troca possível" : "trocas possíveis"} · {matches.length} {matches.length === 1 ? "usuário" : "usuários"}
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-3">
        <AdBanner label="Patrocinado" />

        {matches.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-2">🤝</div>
            <p className="font-semibold text-foreground">Sem matches ainda</p>
            <p className="text-sm">Marque suas figurinhas tenho/repetidas para encontrar trocas.</p>
          </div>
        )}

        {matches.map(({ user, theyHaveForMe, iHaveForThem, score, stickerById }) => {
          const isOpen = open === user.id;
          return (
            <div key={user.id} className="rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : user.id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-2xl shrink-0">
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{user.nome}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.cidade}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-primary leading-none">{score}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
                    matches
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 py-3 space-y-3 bg-background/50">
                  <MatchList
                    title={`Tem para você (${theyHaveForMe.length})`}
                    ids={theyHaveForMe}
                    tone="have"
                    stickerById={stickerById}
                  />
                  <MatchList
                    title={`Você tem para ele (${iHaveForThem.length})`}
                    ids={iHaveForThem}
                    tone="dupe"
                    stickerById={stickerById}
                  />
                  <button className="w-full h-11 rounded-xl font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                    Propor troca
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchList({
  title,
  ids,
  tone,
  stickerById,
}: {
  title: string;
  ids: string[];
  tone: "have" | "dupe";
  stickerById: Map<string, (typeof STICKERS)[number]>;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ids.slice(0, 12).map((id) => {
          const s = stickerById.get(id);
          if (!s) return null;
          return (
            <span
              key={id}
              className={cn(
                "px-2 py-1 rounded-md text-[11px] font-semibold",
                tone === "have"
                  ? "bg-[hsl(var(--sticker-have))] text-[hsl(var(--sticker-have-foreground))]"
                  : "bg-[hsl(var(--sticker-dupe))] text-[hsl(var(--sticker-dupe-foreground))]"
              )}
            >
              {s.id}
            </span>
          );
        })}
        {ids.length > 12 && (
          <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-secondary text-muted-foreground">
            +{ids.length - 12}
          </span>
        )}
      </div>
    </div>
  );
}