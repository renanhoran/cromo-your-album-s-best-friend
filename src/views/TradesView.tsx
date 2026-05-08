import { useEffect, useMemo, useState } from "react";
import { STICKERS } from "@/data/stickers";
import { StickerCounts } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { AdBanner } from "@/components/AdBanner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGeolocation, normalizeCidade } from "@/hooks/useGeolocation";
import { Locate, Loader2 } from "lucide-react";
import { useWhatsAppShare } from "@/hooks/useWhatsAppShare";

export function TradesView({ counts, isPremium = false }: { counts: StickerCounts; isPremium?: boolean }) {
  const [realUsers, setRealUsers] = useState<
    { id: string; nome: string; cidade: string; avatar: string; counts: StickerCounts }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [nearMe, setNearMe] = useState(false);
  const geo = useGeolocation();
  const { share: shareWhats, dialog: whatsDialog } = useWhatsAppShare("trocas");

  const handleNearMe = async () => {
    if (nearMe) {
      setNearMe(false);
      return;
    }
    const pos = geo.coords ?? (await geo.request());
    if (pos) setNearMe(true);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const [{ data: profiles }, { data: stickers }] = await Promise.all([
          supabase.rpc("get_public_profiles"),
          supabase.from("user_stickers").select("user_id, sticker_id, count"),
        ]);
        if (cancelled) return;
        const byUser = new Map<string, StickerCounts>();
        (stickers ?? []).forEach((row: any) => {
          if (user && row.user_id === user.id) return;
          if (!byUser.has(row.user_id)) byUser.set(row.user_id, {});
          byUser.get(row.user_id)![row.sticker_id] = row.count ?? 0;
        });
        const list = (profiles ?? [])
          .filter((p: any) => byUser.has(p.id))
          .map((p: any) => ({
            id: p.id,
            nome: p.nome || "Colecionador",
            cidade: p.cidade || "",
            avatar: p.avatar || "⚽",
            counts: byUser.get(p.id) || {},
          }));
        setRealUsers(list);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const matches = useMemo(() => {
    const stickerById = new Map(STICKERS.map((s) => [s.id, s]));
    const myMissing = STICKERS.filter((s) => (counts[s.id] ?? 0) === 0).map((s) => s.id);
    const myDupes = STICKERS.filter((s) => (counts[s.id] ?? 0) >= 2).map((s) => s.id);
    const missingSet = new Set(myMissing);
    const dupeSet = new Set(myDupes);

    const myCidade = nearMe && geo.coords ? normalizeCidade(geo.coords.cidade) : "";
    const filteredUsers = nearMe && myCidade
      ? realUsers.filter((u) => normalizeCidade(u.cidade) === myCidade)
      : realUsers;

    return filteredUsers.map((u) => {
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
  }, [counts, realUsers, nearMe, geo.coords]);

  const totalPossible = matches.reduce((acc, m) => acc + m.score, 0);
  const [open, setOpen] = useState<string | null>(null);

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
      porSelecao[s.selecao].push(`${s.id}${qtd > 1 ? ` (×${qtd})` : ""}`);
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
    shareWhats(`https://wa.me/?text=${encodeURIComponent(mensagem)}`);
  };

  return (
    <div className="pb-24">
      {whatsDialog}
      <header className="sticky top-12 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 pt-4 pb-3">
          <p className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Match inteligente</p>
          <h1 className="text-2xl font-black tracking-tight">Trocas possíveis</h1>
          <div className="mt-2">
            <button
              onClick={handleNearMe}
              disabled={geo.loading}
              className={cn(
                "px-3 h-8 rounded-full text-xs font-semibold border transition-all inline-flex items-center gap-1.5",
                nearMe
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border"
              )}
            >
              {geo.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Locate className="h-3 w-3" />}
              {nearMe && geo.coords?.cidade ? `Perto de ${geo.coords.cidade}` : "Perto de mim"}
            </button>
          </div>
          <div className="mt-3 rounded-2xl p-4 text-primary-foreground shadow-[var(--shadow-pop)]" style={{ background: "var(--gradient-primary)" }}>
            <div className="text-3xl font-black leading-none">{totalPossible}</div>
            <div className="text-sm font-medium opacity-95 mt-1">
              {totalPossible === 1 ? "troca possível" : "trocas possíveis"} · {matches.length} {matches.length === 1 ? "usuário" : "usuários"}
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-3">
        <button
          onClick={compartilharRepetidas}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-white font-semibold text-sm"
          style={{ backgroundColor: "#25D366" }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Compartilhar minhas repetidas no WhatsApp
        </button>

        {!isPremium && <AdBanner slot="" />}

        {loading && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Buscando colecionadores…
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-2">🤝</div>
            <p className="font-semibold text-foreground">Sem matches ainda</p>
            <p className="text-sm">Marque suas figurinhas tenho/repetidas para encontrar trocas com outros colecionadores.</p>
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
                  <button
                    onClick={() => {
                      const linhasTem = theyHaveForMe
                        .map((id) => stickerById.get(id))
                        .filter(Boolean)
                        .map((s) => `• ${s!.id} (${s!.selecao})`);
                      const linhasOfereco = iHaveForThem
                        .map((id) => stickerById.get(id))
                        .filter(Boolean)
                        .map((s) => `• ${s!.id} (${s!.selecao})`);
                      const msg = [
                        `🤝 *Proposta de troca — Copa 2026*`,
                        ``,
                        `Oi ${user.nome}! Vi no Mania de Álbum que temos um match de ${score} figurinha(s).`,
                        ``,
                        `*Você tem que eu preciso (${theyHaveForMe.length}):*`,
                        ...linhasTem,
                        ``,
                        `*Eu tenho repetidas que você precisa (${iHaveForThem.length}):*`,
                        ...linhasOfereco,
                        ``,
                        `Topa trocar? 🔥`,
                        `_via app.maniadealbum.com.br_`,
                      ].join("\n");
                      shareWhats(`https://wa.me/?text=${encodeURIComponent(msg)}`);
                    }}
                    className="w-full h-11 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Propor troca pelo WhatsApp
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