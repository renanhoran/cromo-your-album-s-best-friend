import { Sticker as StickerT } from "@/data/stickers";
import { cn } from "@/lib/utils";

interface Props {
  sticker: StickerT;
  count: number;
  onClick: () => void;
}

export function StickerCard({ sticker, count, onClick }: Props) {
  const state = count === 0 ? "missing" : count === 1 ? "have" : "dupe";
  const initials = sticker.sigla_selecao;
  const isEspecial = sticker.tipo === "especial";
  const isEscudo = sticker.tipo === "escudo";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative aspect-[3/4] rounded-xl overflow-hidden text-left transition-all active:scale-95",
        "border shadow-[var(--shadow-card)]",
        state === "missing" && "bg-[hsl(var(--sticker-missing))] border-border",
        state === "have" && "bg-[hsl(var(--sticker-have))] border-[hsl(var(--sticker-have))] text-[hsl(var(--sticker-have-foreground))]",
        state === "dupe" && "bg-[hsl(var(--sticker-dupe))] border-[hsl(var(--sticker-dupe))] text-[hsl(var(--sticker-dupe-foreground))]"
      )}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        <div
          className={cn(
            "text-[11px] font-bold tracking-wider opacity-70 mb-1",
            state === "missing" && "text-muted-foreground"
          )}
        >
          {sticker.id}
        </div>
        <div
          className={cn(
            "text-3xl font-black leading-none",
            isEspecial && "text-2xl",
            state === "missing" && "text-foreground/30"
          )}
        >
          {isEspecial ? "★" : initials}
        </div>
        <div
          className={cn(
            "mt-2 text-[10px] font-semibold text-center leading-tight line-clamp-2 px-1",
            state === "missing" && "text-muted-foreground"
          )}
        >
          {isEscudo ? sticker.selecao : sticker.nome}
        </div>
      </div>
      {count > 1 && (
        <span className="absolute top-1.5 right-1.5 bg-background/95 text-[hsl(var(--sticker-dupe))] text-[11px] font-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-sm">
          ×{count}
        </span>
      )}
      {state === "have" && (
        <span className="absolute top-1.5 right-1.5 text-base">✓</span>
      )}
    </button>
  );
}