import { Sticker } from "@/data/stickers";
import { getFlagUrl } from "@/data/flags";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, HelpCircle, Loader2 } from "lucide-react";

export interface IdentifyResult {
  numero: string | null;
  nome: string | null;
  selecao: string | null;
  confianca: "alta" | "media" | "baixa";
}

interface Props {
  open: boolean;
  identifying: boolean;
  result: IdentifyResult | null;
  encontrada: Sticker | null;
  count: number;
  onClose: () => void;
  onConfirm: (sticker: Sticker, nextCount: number) => void;
}

export function IdentifySheet({
  open,
  identifying,
  result,
  encontrada,
  count,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl">
        {identifying ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-semibold">Identificando figurinha...</p>
          </div>
        ) : !result ? null : !encontrada ? (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                  <HelpCircle className="h-7 w-7 text-muted-foreground" />
                </div>
              </div>
              <DialogTitle className="text-center">Não encontrada</DialogTitle>
              <DialogDescription className="text-center">
                {result.nome ? (
                  <>Identificamos: <strong>{result.nome}</strong></>
                ) : (
                  "Não conseguimos identificar com clareza."
                )}
                <br />
                Pode ser uma figurinha especial ou erro de leitura.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={onClose} className="w-full">Fechar</Button>
          </>
        ) : (
          <ResultBody
            sticker={encontrada}
            count={count}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResultBody({
  sticker,
  count,
  onClose,
  onConfirm,
}: {
  sticker: Sticker;
  count: number;
  onClose: () => void;
  onConfirm: (s: Sticker, n: number) => void;
}) {
  const has = count >= 1;
  const flag = getFlagUrl(sticker.sigla_selecao, 80);
  const next = has ? count + 1 : 1;
  const actionLabel = has ? "Marcar como repetida" : "Marcar como tenho";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">Figurinha identificada</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center gap-2 py-2">
        {flag && (
          <img src={flag} alt={sticker.selecao} className="w-14 h-10 object-cover rounded-sm shadow-sm" />
        )}
        <div className="text-lg font-black text-center leading-tight">{sticker.nome}</div>
        <div className="text-xs text-muted-foreground font-semibold">
          {sticker.selecao} · #{sticker.id}
        </div>
        <div
          className={
            "mt-2 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 " +
            (has
              ? "bg-[hsl(var(--sticker-dupe))]/15 text-[hsl(var(--sticker-dupe))]"
              : "bg-muted text-foreground")
          }
        >
          {has ? (
            <>
              <Check className="h-3.5 w-3.5" /> Você já tem essa figurinha
              {count > 1 && ` (×${count})`}
            </>
          ) : (
            <>
              <X className="h-3.5 w-3.5" /> Você ainda não tem essa figurinha
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => onConfirm(sticker, next)}
          className={
            has
              ? "w-full bg-[hsl(var(--sticker-dupe))] text-[hsl(var(--sticker-dupe-foreground))] hover:bg-[hsl(var(--sticker-dupe))]/90"
              : "w-full bg-[hsl(var(--sticker-have))] text-[hsl(var(--sticker-have-foreground))] hover:bg-[hsl(var(--sticker-have))]/90"
          }
        >
          {actionLabel}
        </Button>
        <Button variant="ghost" onClick={onClose} className="w-full">
          Cancelar
        </Button>
      </div>
    </>
  );
}