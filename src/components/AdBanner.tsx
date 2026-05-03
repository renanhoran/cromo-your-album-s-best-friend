import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot?: string;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX";

export function AdBanner({ slot }: AdBannerProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense pode não estar carregado ou aprovado ainda — silenciar
    }
  }, []);

  if (!slot) {
    // Sem slot configurado — não renderiza nada (evita erro antes da aprovação)
    return null;
  }

  return (
    <div className="w-full my-2 flex justify-center min-h-[80px]">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
