import { useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Keyboard, ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { findStickerByCode, parseCodeList, normalizeCode } from "@/lib/stickerCode";
import type { StickerCounts } from "@/lib/storage";

type Mode = "menu" | "camera" | "type";

interface Props {
  userId: string;
  counts: StickerCounts;
  onCountsChange: (next: StickerCounts) => void;
  onDone: () => void;
}

export function ImportStickersOnboarding({ userId, counts, onCountsChange, onDone }: Props) {
  const [mode, setMode] = useState<Mode>("menu");
  const [text, setText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const finish = async () => {
    await supabase
      .from("profiles")
      .update({ onboarding_importacao_concluido: true })
      .eq("id", userId);
    onDone();
  };

  const skip = async () => {
    await finish();
  };

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

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
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
      const result: { codigo: string | null; erro?: boolean } = await res.json();
      if (!result.codigo || result.erro) {
        toast.error("Não foi possível ler o código. Tente novamente.");
        return;
      }
      const sticker = findStickerByCode(result.codigo);
      if (!sticker) {
        toast.error(`Código ${result.codigo} não encontrado.`);
        return;
      }
      const current = counts[sticker.id] ?? 0;
      const next = current >= 9 ? 9 : current + 1;
      await supabase.from("user_stickers").upsert(
        { user_id: userId, sticker_id: sticker.id, count: next, updated_at: new Date().toISOString() },
        { onConflict: "user_id,sticker_id" }
      );
      onCountsChange({ ...counts, [sticker.id]: next });
      setScanned((prev) => new Set(prev).add(sticker.id));
      toast.success(`${result.codigo} ✓`);
    } catch {
      toast.error("Erro ao ler. Tente novamente.");
    } finally {
      setScanning(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleSubmitTyped = async () => {
    const codes = parseCodeList(text);
    if (codes.length === 0) {
      toast.error("Digite pelo menos um código.");
      return;
    }
    const valid = codes
      .map((c) => ({ raw: c, id: normalizeCode(c) }))
      .filter((c): c is { raw: string; id: string } => !!c.id && !!findStickerByCode(c.raw));

    if (valid.length === 0) {
      toast.error("Nenhum código válido encontrado.");
      return;
    }

    const updates = valid.map((v) => ({
      user_id: userId,
      sticker_id: v.id,
      count: Math.max(1, counts[v.id] ?? 0),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("user_stickers")
      .upsert(updates, { onConflict: "user_id,sticker_id" });

    if (error) {
      toast.error("Erro ao salvar. Tente novamente.");
      return;
    }

    const newCounts = { ...counts };
    valid.forEach((v) => {
      newCounts[v.id] = Math.max(1, counts[v.id] ?? 0);
    });
    onCountsChange(newCounts);
    toast.success(`${valid.length} figurinha${valid.length > 1 ? "s" : ""} registrada${valid.length > 1 ? "s" : ""} com sucesso!`);
    await finish();
  };

  return (
    <Sheet open onOpenChange={() => {}}>
      <SheetContent side="bottom" className="rounded-t-3xl max-w-md mx-auto h-auto max-h-[90vh] overflow-y-auto">
        {mode === "menu" && (
          <div className="py-4 text-center">
            <div className="text-5xl mb-3">📒</div>
            <h2 className="text-2xl font-black mb-1">Você já tem figurinhas?</h2>
            <p className="text-muted-foreground text-sm mb-6 px-2">
              Registre agora e comece com seu álbum atualizado
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => setMode("camera")}
                className="w-full h-14 font-bold text-base justify-start px-5"
              >
                <Camera className="mr-3 h-5 w-5" />
                Escanear com a câmera
              </Button>
              <Button
                onClick={() => setMode("type")}
                variant="secondary"
                className="w-full h-14 font-bold text-base justify-start px-5"
              >
                <Keyboard className="mr-3 h-5 w-5" />
                Digitar os códigos
              </Button>
              <button
                onClick={skip}
                className="w-full text-sm text-muted-foreground py-3 mt-2"
              >
                Pular por agora
              </button>
            </div>
          </div>
        )}

        {mode === "type" && (
          <div className="py-4">
            <button
              onClick={() => setMode("menu")}
              className="flex items-center gap-1 text-sm text-muted-foreground mb-3"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <h2 className="text-xl font-black mb-1">Digite seus códigos</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Separe por espaço, vírgula ou linha. Exemplo: BRA-01 BRA-02 MEX-05
            </p>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: BRA-01 BRA-02 MEX-05 FWC-03"
              className="min-h-32 text-base"
              autoFocus
            />
            <Button onClick={handleSubmitTyped} className="w-full h-12 font-bold mt-4">
              Registrar
            </Button>
          </div>
        )}

        {mode === "camera" && (
          <div className="py-4">
            <button
              onClick={() => setMode("menu")}
              className="flex items-center gap-1 text-sm text-muted-foreground mb-3"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <h2 className="text-xl font-black mb-1">Escanear figurinhas</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Aponte a câmera para o código na parte de trás da figurinha (ex: BRA-14)
            </p>
            <div className="rounded-2xl bg-primary/10 border border-primary/30 px-4 py-3 mb-4 text-center">
              <div className="text-3xl font-black text-primary leading-none">{scanned.size}</div>
              <div className="text-xs text-muted-foreground font-semibold">
                figurinha{scanned.size === 1 ? "" : "s"} escaneada{scanned.size === 1 ? "" : "s"}
              </div>
            </div>
            <label
              htmlFor="import-camera-input"
              className="block w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <Camera className="h-5 w-5" />
              {scanning ? "Lendo..." : "Tirar foto da próxima"}
            </label>
            <input
              ref={inputRef}
              id="import-camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCameraCapture}
              disabled={scanning}
            />
            <Button
              onClick={finish}
              variant="secondary"
              className="w-full h-12 font-bold mt-3"
              disabled={scanning}
            >
              <Check className="mr-2 h-4 w-4" />
              Concluir
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}