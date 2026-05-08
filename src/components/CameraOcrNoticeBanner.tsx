import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  userId: string;
  onDismiss: () => void;
  onImport: () => void;
}

export function CameraOcrNoticeBanner({ userId, onDismiss, onImport }: Props) {
  const markSeen = async () => {
    await supabase
      .from("profiles")
      .update({ aviso_camera_ocr_visto: true })
      .eq("id", userId);
  };

  const handleDismiss = async () => {
    await markSeen();
    onDismiss();
  };

  const handleImport = async () => {
    await markSeen();
    onImport();
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
      <div className="flex items-start gap-2">
        <Camera className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground leading-snug">
            Novidade! A câmera agora lê o código da figurinha (ex: BRA-14) em vez do rosto do jogador. Aponte para o número impresso.
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-8 px-3 text-xs font-bold"
            >
              Entendi
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              className="h-8 px-3 text-xs font-bold"
            >
              Importar minhas figurinhas
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Fechar aviso"
          className="text-muted-foreground hover:text-foreground p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}