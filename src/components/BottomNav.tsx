import { cn } from "@/lib/utils";
import { Home, Users, User } from "lucide-react";

export type Tab = "album" | "trocas" | "perfil";

const items: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "album", label: "Álbum", icon: Home },
  { id: "trocas", label: "Trocas", icon: Users },
  { id: "perfil", label: "Perfil", icon: User },
];

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border">
      <div className="max-w-md mx-auto grid grid-cols-3">
        {items.map((it) => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="text-[11px] font-semibold">{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}