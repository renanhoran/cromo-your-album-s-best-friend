import { useEffect, useMemo, useRef, useState } from "react";
import { STICKERS } from "@/data/stickers";
import type { Sticker } from "@/data/stickers";
import { StickerCounts } from "@/lib/storage";
import { StickerCard } from "@/components/Sticker";
import { AdBanner } from "@/components/AdBanner";
import { cn } from "@/lib/utils";
import { Search, X, Camera } from "lucide-react";
import { getFlagUrl } from "@/data/flags";
import { IdentifySheet, IdentifyResult } from "@/components/IdentifySheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  onSetCount,
  isPremium = false,
  temCamera = true,
}: {
  counts: StickerCounts;
  onTap: (id: string) => void;
  onSetCount?: (id: string, next: number) => void;
  isPremium?: boolean;
  temCamera?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("todas");
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [identifyResult, setIdentifyResult] = useState<IdentifyResult | null>(null);
  const [encontrada, setEncontrada] = useState<Sticker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = () =>
      setIsMobile(window.innerWidth < 768 || (navigator.maxTouchPoints ?? 0) > 0);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const compressImage = (file: File): Promise<{ base64: string; mediaType: string }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          const maxW = 800;
          const scale = Math.min(1, maxW / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("no ctx"));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve({ base64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const findSticker = (r: IdentifyResult): Sticker | null => {
    const sigla = r.sigla_selecao?.toUpperCase().trim() ?? "";
    const num = r.numero?.toString().replace(/\D/g, "") ?? "";
    const sobrenome = r.sobrenome?.toLowerCase().trim() ?? "";
    const nomeCompleto = r.nome_completo?.toLowerCase().trim() ?? "";

    const found = STICKERS.find((s) => {
      if (num && sigla) {
        const idEsperado = `${sigla}-${num.padStart(3, "0")}`;
        if (s.id === idEsperado) return true;
      }
      if (sobrenome && sigla) {
        const nomeLower = s.nome.toLowerCase();
        const selecaoMatch = s.sigla_selecao === sigla;
        const nomeMatch =
          nomeLower.includes(sobrenome) ||
          sobrenome.includes(nomeLower.split(" ")[0]);
        if (selecaoMatch && nomeMatch) return true;
      }
      if (nomeCompleto && sigla) {
        const first = nomeCompleto.split(" ")[0];
        const sFirst = s.nome.toLowerCase().split(" ")[0];
        if (
          s.sigla_selecao === sigla &&
          (s.nome.toLowerCase().includes(first) || nomeCompleto.includes(sFirst))
        ) {
          return true;
        }
      }
      return false;
    });

    if (found) return found;

    if (r.tipo === "escudo" && sigla) {
      const escudo = STICKERS.find(
        (s) => s.sigla_selecao === sigla && s.tipo === "escudo"
      );
      if (escudo) return escudo;
    }
    return null;
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowSheet(true);
    setIdentifying(true);
    setIdentifyResult(null);
    setEncontrada(null);

    try {
      const { base64, mediaType } = await compressImage(file);
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/identify-sticker`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? ""}`,
          },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        }
      );

      if (!res.ok) {
        toast.error("Erro ao identificar. Tente novamente.");
        setShowSheet(false);
        return;
      }

      const result: IdentifyResult = await res.json();

      if (
        result.confianca === "baixa" ||
        (!result.nome_completo && !result.sobrenome && !result.sigla_selecao && !result.numero)
      ) {
        toast.error("Não consegui identificar a figurinha. Tenta uma foto mais nítida.");
        setShowSheet(false);
        return;
      }

      setIdentifyResult(result);
      setEncontrada(findSticker(result));
    } catch {
      toast.error("Erro ao identificar. Tente novamente.");
      setShowSheet(false);
    } finally {
      setIdentifying(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

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
    const q = query.trim().toLowerCase();
    return STICKERS.filter((s) => {
      const c = counts[s.id] ?? 0;
      if (filter === "tenho") return c >= 1;
      if (filter === "preciso") return c === 0;
      if (filter === "repetidas") return c >= 2;
      return true;
    }).filter((s) => {
      if (!q) return true;
      return (
        s.selecao.toLowerCase().includes(q) ||
        s.sigla_selecao.toLowerCase().includes(q) ||
        s.nome.toLowerCase().includes(q)
      );
    });
  }, [counts, filter, query]);

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
      <header className="sticky top-12 z-20 bg-background/95 backdrop-blur border-b border-border">
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

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              inputMode="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar seleção ou jogador"
              className="w-full h-10 pl-9 pr-9 rounded-full bg-secondary text-sm font-medium placeholder:text-muted-foreground border border-transparent focus:bg-card focus:border-border focus:outline-none transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-6">
        <div className="rounded-xl bg-primary/10 border border-primary/30 px-3 py-2.5 text-center text-xs font-semibold text-primary">
          1 toque: tenho ✓ · +toques: repetidas (×2 a ×9) · 10º toque ou × zera
        </div>
        {grouped.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-2">🎯</div>
            <p className="font-semibold text-foreground">Nenhuma figurinha aqui</p>
            <p className="text-sm">Tente outro filtro.</p>
          </div>
        )}

        {grouped.map(([selecao, items], index) => (
          <div key={selecao}>
            <section>
            <div className="flex items-baseline justify-between mb-2 px-0.5">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                {getFlagUrl(items[0]?.sigla_selecao ?? "", 40) && (
                  <img
                    src={getFlagUrl(items[0].sigla_selecao, 40)!}
                    alt={selecao}
                    loading="lazy"
                    className="w-6 h-4 object-cover rounded-sm shadow-sm"
                  />
                )}
                {selecao}
              </h2>
              <span className="text-[11px] text-muted-foreground font-medium">
                {items.filter((s) => (counts[s.id] ?? 0) >= 1).length}/{items.length}
              </span>
            </div>
            <div className="h-1 rounded-full bg-secondary overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.round(
                    (items.filter((s) => (counts[s.id] ?? 0) >= 1).length / items.length) * 100
                  )}%`,
                  background: "var(--gradient-primary)",
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {items.map((s) => (
                <StickerCard
                  key={s.id}
                  sticker={s}
                  count={counts[s.id] ?? 0}
                  onClick={() => onTap(s.id)}
                  onClear={onSetCount ? () => onSetCount(s.id, 0) : undefined}
                />
              ))}
            </div>
            </section>
            {!isPremium && index > 0 && index % 4 === 0 && (
              <div className="mt-6">
                <AdBanner slot="" />
              </div>
            )}
          </div>
        ))}

      </div>

      {isMobile && temCamera && (
        <>
          <label
            htmlFor="camera-input"
            aria-label="Identificar figurinha pela câmera"
            className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg cursor-pointer active:scale-95 transition-transform"
          >
            <Camera className="w-6 h-6" />
          </label>
          <input
            ref={inputRef}
            id="camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCameraCapture}
          />
        </>
      )}

      <IdentifySheet
        open={showSheet}
        identifying={identifying}
        result={identifyResult}
        encontrada={encontrada}
        count={encontrada ? counts[encontrada.id] ?? 0 : 0}
        onClose={() => setShowSheet(false)}
        onConfirm={(s, next) => {
          onSetCount?.(s.id, next);
          setShowSheet(false);
          toast.success(
            next > 1 ? `Marcada como repetida (×${next})` : "Marcada como tenho!"
          );
        }}
      />
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