import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  text: string;
  onShare: (url: string) => void;
  shareLabel?: string;
  className?: string;
};

export function WhatsAppShareButtons({ text, onShare, shareLabel = "Compartilhar no WhatsApp", className }: Props) {
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("Mensagem copiada! Cole no WhatsApp onde quiser.");
    } catch {
      toast.error("Não foi possível copiar. Tente novamente.");
    }
  };

  return (
    <div className={`grid grid-cols-[1fr_auto] gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => onShare(`https://wa.me/?text=${encodeURIComponent(text)}`)}
        className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-transform"
      >
        <Share2 className="h-4 w-4" />
        {shareLabel}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copiar mensagem"
        title="Copiar mensagem"
        className="flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl bg-secondary text-foreground font-semibold text-sm border border-border active:scale-[0.98] transition-transform"
      >
        <Copy className="h-4 w-4" />
        Copiar
      </button>
    </div>
  );
}