import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "pwa_install_banner_dismissed";

export function PWAInstallBanner() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-ignore
      window.navigator.standalone === true;
    if (isStandalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    setDeferred(null);
    void choice;
  };

  if (!visible || !deferred) return null;

  return (
    <div className="sticky top-12 z-20 bg-primary text-primary-foreground px-3 py-2 flex items-center gap-2 shadow-[var(--shadow-card)]">
      <span className="text-sm font-semibold flex-1 leading-tight">
        📲 Instale o app no seu celular — funciona sem internet!
      </span>
      <button
        onClick={install}
        className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-full bg-primary-foreground text-primary text-xs font-bold"
      >
        <Download className="h-3.5 w-3.5" />
        Instalar
      </button>
      <button
        onClick={dismiss}
        aria-label="Dispensar"
        className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center hover:bg-primary-foreground/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}