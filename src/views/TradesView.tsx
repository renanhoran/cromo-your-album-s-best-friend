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
import { WhatsAppShareButtons } from "@/components/WhatsAppShareButtons";

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
          .filter((p: any) => {
            const n = (p.nome ?? "").toLowerCase().replace(/\s+/g, "");
            if (!n) return true;
            return !/(operador|apptester|tester|teste\d|^teste$)/.test(n);
          })
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

  const mensagemRepetidas = useMemo(() => {
    const repetidas = STICKERS.filter((s) => (counts[s.id] ?? 0) > 1);
    if (repetidas.length === 0) return "";
    const porSelecao: Record<string, string[]> = {};
    repetidas.forEach((s) => {
      if (!porSelecao[s.selecao]) porSelecao[s.selecao] = [];
      const qtd = (counts[s.id] ?? 0) - 1;
      porSelecao[s.selecao].push(`${s.id}${qtd > 1 ? ` (×${qtd})` : ""}`);
    });
    const linhas = Object.entries(porSelecao).map(
      ([selecao, jogadores]) => `*${selecao}:* ${jogadores.join(", ")}`
    );
    return [
      "📒 *Minhas figurinhas repetidas — Copa 2026*",
      "",
      ...linhas,
      "",
      `_Total: ${repetidas.length} figurinha(s) repetida(s)_`,
      "",
      "Baixe agora o único app com leitor de figurinhas por IA via foto 📸⚽",
      "",
      "Controle as figurinhas que você já tem, as repetidas e as que ainda faltam.",
      "Além disso, encontre pessoas próximas de você que tenham as figurinhas que você precisa — e que precisem das suas!",
      "",
      "app.maniadealbum.com.br",
    ].join("\n");
  }, [counts]);

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
        <WhatsAppShareButtons
          text={mensagemRepetidas}
          shareLabel="Compartilhar repetidas"
          onShare={(url) => {
            if (!mensagemRepetidas) {
              toast.info("Você não tem figurinhas repetidas ainda.");
              return;
            }
            shareWhats(url);
          }}
        />

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
                  {(() => {
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
                      ``,
                      `Baixe agora o único app com leitor de figurinhas por IA via foto 📸⚽`,
                      ``,
                      `Controle as figurinhas que você já tem, as repetidas e as que ainda faltam.`,
                      `Além disso, encontre pessoas próximas de você que tenham as figurinhas que você precisa — e que precisem das suas!`,
                      ``,
                      `app.maniadealbum.com.br`,
                    ].join("\n");
                    return (
                      <WhatsAppShareButtons
                        text={msg}
                        shareLabel="Propor troca"
                        onShare={(url) => shareWhats(url)}
                      />
                    );
                  })()}
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