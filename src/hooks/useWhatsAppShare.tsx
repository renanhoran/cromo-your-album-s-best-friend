import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hasWhatsAppConsent, WhatsAppConsentDialog } from "@/components/WhatsAppConsentDialog";
import { toast } from "sonner";

export function useWhatsAppShare(origem: string) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const pendingUrlRef = useRef<string | null>(null);

  const openWhatsApp = (url: string) => {
    const w = window.open(url, "_blank");
    if (!w) window.location.href = url;
  };

  const share = useCallback(
    async (url: string) => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) {
        toast.error("Faça login para compartilhar.");
        return;
      }
      const ok = await hasWhatsAppConsent(uid);
      if (ok) {
        openWhatsApp(url);
        return;
      }
      setUserId(uid);
      pendingUrlRef.current = url;
      setOpen(true);
    },
    []
  );

  const dialog = userId ? (
    <WhatsAppConsentDialog
      open={open}
      onOpenChange={setOpen}
      userId={userId}
      origem={origem}
      onAccepted={() => {
        const url = pendingUrlRef.current;
        pendingUrlRef.current = null;
        if (url) openWhatsApp(url);
      }}
    />
  ) : null;

  return { share, dialog };
}