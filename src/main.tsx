import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const savedTheme = localStorage.getItem("cromo:theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const useDark = savedTheme ? savedTheme === "dark" : prefersDark || true;
document.documentElement.classList.toggle("dark", useDark);

createRoot(document.getElementById("root")!).render(<App />);
