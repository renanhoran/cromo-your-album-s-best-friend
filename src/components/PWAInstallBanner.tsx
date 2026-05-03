import { useEffect, useState } from "react";
import { X, Smartphone } from "lucide-react";

const STORAGE_KEY = "pwa_banner_dismissed";

function detectDevice() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /Android/.test(ua);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;
  return { isIOS, isAndroid, isSafari, isStandalone };
}

export function PWAInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [device, setDevice] = useState({ isIOS: false, isAndroid: false, isSafari: false });
  const [deferred, setDeferred] = useState<any>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    const { isIOS, isAndroid, isSafari, isStandalone } = detectDevice();

    if (isStandalone) return;

    setDevice({ isIOS, isAndroid, isSafari });

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
    });

    if (isIOS || isAndroid) {
      setTimeout(() => setVisible(true), 2000);
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    setShowIOSGuide(false);
  };

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        localStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
      }
    } else if (device.isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowIOSGuide(true);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div className="sticky top-12 z-20 bg-primary text-primary-foreground px-3 py-2.5 flex items-center gap-2 shadow-md">
        <Smartphone className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold flex-1 leading-tight">
          📲 Instale o app — acesse mais rápido!
        </span>
        <button
          onClick={handleInstall}
          className="shrink-0 h-8 px-3 rounded-full bg-primary-foreground text-primary text-xs font-bold"
        >
          Instalar
        </button>
        <button
          onClick={dismiss}
          aria-label="Fechar"
          className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center hover:bg-primary-foreground/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full bg-background rounded-t-2xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📲</div>
              <h2 className="text-lg font-black">Instalar Mania de Álbum</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione à tela inicial e acesse como um app
              </p>
            </div>

            {device.isIOS ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">1</div>
                  <p className="text-sm pt-1">Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta pra cima) na barra do Safari</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">2</div>
                  <p className="text-sm pt-1">Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">3</div>
                  <p className="text-sm pt-1">Toque em <strong>"Adicionar"</strong> no canto superior direito</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">1</div>
                  <p className="text-sm pt-1">Toque nos <strong>3 pontinhos</strong> no canto superior direito do Chrome</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">2</div>
                  <p className="text-sm pt-1">Toque em <strong>"Adicionar à tela inicial"</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">3</div>
                  <p className="text-sm pt-1">Toque em <strong>"Adicionar"</strong> para confirmar</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
            >
              Entendi
            </button>
            <button
              onClick={dismiss}
              className="w-full mt-2 py-2 text-sm text-muted-foreground"
            >
              Não mostrar novamente
            </button>
          </div>
        </div>
      )}
    </>
  );
}
