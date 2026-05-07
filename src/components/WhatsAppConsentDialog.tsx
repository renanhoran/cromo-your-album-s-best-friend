import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const WHATSAPP_CONSENT_VERSION = "2026-05-07";
export const WHATSAPP_CONSENT_TIPO = "compartilhar_whatsapp";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  origem: string;
  onAccepted: () => void;
}

export function WhatsAppConsentDialog({ open, onOpenChange, userId, origem, onAccepted }: Props) {
  const [marcado, setMarcado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAceitar = async () => {
    if (!marcado) {
      toast.error("Você precisa marcar o consentimento para continuar.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("lgpd_consents").insert({
        user_id: userId,
        tipo: WHATSAPP_CONSENT_TIPO,
        versao: WHATSAPP_CONSENT_VERSION,
        aceito: true,
        user_agent: navigator.userAgent,
        origem,
      });
      if (error) throw error;
      try {
        localStorage.setItem(`lgpd:${WHATSAPP_CONSENT_TIPO}:${userId}`, WHATSAPP_CONSENT_VERSION);
      } catch {}
      onOpenChange(false);
      onAccepted();
    } catch (err: any) {
      toast.error(err?.message ?? "Não foi possível registrar seu consentimento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar pelo WhatsApp</DialogTitle>
          <DialogDescription>
            Antes de continuar, precisamos do seu consentimento conforme a LGPD (Lei nº 13.709/2018).
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-foreground space-y-2 leading-relaxed">
          <p>
            Ao compartilhar, o app abrirá o WhatsApp com uma mensagem contendo:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>sua lista de figurinhas (repetidas e/ou que você precisa);</li>
            <li>seu nome de perfil, quando preenchido;</li>
            <li>seu número de WhatsApp, quando cadastrado no Perfil;</li>
            <li>um link para o app Mania de Álbum.</li>
          </ul>
          <p className="text-muted-foreground">
            O Mania de Álbum não envia mensagens em seu nome. Você é quem decide para quem
            mandar e o que enviar dentro do WhatsApp. Esses dados podem ser vistos pelas
            pessoas para quem você compartilhar.
          </p>
          <p className="text-muted-foreground">
            Você pode revogar este consentimento a qualquer momento na aba Perfil. Saiba mais
            na{" "}
            <a href="/privacidade" target="_blank" rel="noreferrer" className="underline text-primary">
              Política de Privacidade
            </a>
            .
          </p>
        </div>

        <label className="flex items-start gap-2 cursor-pointer mt-2">
          <Checkbox
            checked={marcado}
            onCheckedChange={(v) => setMarcado(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm leading-snug">
            Li e concordo em compartilhar meus dados pelo WhatsApp conforme descrito acima.
          </span>
        </label>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleAceitar} disabled={!marcado || loading}>
            {loading ? "Registrando..." : "Aceitar e continuar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export async function hasWhatsAppConsent(userId: string): Promise<boolean> {
  try {
    const cached = localStorage.getItem(`lgpd:${WHATSAPP_CONSENT_TIPO}:${userId}`);
    if (cached === WHATSAPP_CONSENT_VERSION) return true;
  } catch {}
  const { data } = await supabase
    .from("lgpd_consents")
    .select("id, versao, aceito")
    .eq("user_id", userId)
    .eq("tipo", WHATSAPP_CONSENT_TIPO)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const ok = !!data && data.aceito === true && data.versao === WHATSAPP_CONSENT_VERSION;
  if (ok) {
    try {
      localStorage.setItem(`lgpd:${WHATSAPP_CONSENT_TIPO}:${userId}`, WHATSAPP_CONSENT_VERSION);
    } catch {}
  }
  return ok;
}