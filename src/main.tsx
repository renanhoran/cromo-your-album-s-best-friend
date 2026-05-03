import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const savedTheme = localStorage.getItem("cromo:theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const useDark = savedTheme ? savedTheme === "dark" : prefersDark || true;
document.documentElement.classList.toggle("dark", useDark);

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker (required for beforeinstallprompt) — only in
// top-level browsing contexts and outside Lovable preview iframes.
if ("serviceWorker" in navigator) {
  const inIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  const isPreviewHost =
    location.hostname.includes("lovableproject.com") ||
    location.hostname.includes("lovable.app");
  if (!inIframe && !isPreviewHost) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
  }
}
