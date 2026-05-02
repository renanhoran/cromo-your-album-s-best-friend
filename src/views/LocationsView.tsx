import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, MapPin, Calendar, Clock, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Filter = "ponto_fixo" | "evento";

interface Location {
  id: string;
  nome: string;
  endereco: string | null;
  cidade: string;
  estado: string | null;
  tipo: string | null;
  horario: string | null;
  descricao: string | null;
  data_evento: string | null;
  created_by: string | null;
}

export function LocationsView({ userId, userCity }: { userId: string; userCity: string }) {
  const [filter, setFilter] = useState<Filter>("ponto_fixo");
  const [locations, setLocations] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    endereco: "",
    cidade: userCity || "",
    data_evento: "",
    descricao: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from("trade_locations")
      .select("*")
      .eq("ativo", true)
      .order("created_at", { ascending: false });
    setLocations((data as Location[]) ?? []);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (userCity && !form.cidade) setForm((f) => ({ ...f, cidade: userCity }));
  }, [userCity]);

  const filtered = locations.filter((l) => l.tipo === filter);

  const handleCreate = async () => {
    if (!form.nome.trim() || !form.cidade.trim() || !form.data_evento) {
      toast.error("Preencha nome, cidade e data");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("trade_locations").insert({
      nome: form.nome,
      endereco: form.endereco || null,
      cidade: form.cidade,
      tipo: "evento",
      data_evento: new Date(form.data_evento).toISOString(),
      descricao: form.descricao || null,
      created_by: userId,
    });
    setSaving(false);
    if (error) {
      toast.error("Erro ao criar evento");
      return;
    }
    toast.success("Evento publicado! 🎉");
    setOpen(false);
    setForm({ nome: "", endereco: "", cidade: userCity || "", data_evento: "", descricao: "" });
    fetchLocations();
  };

  return (
    <div className="pb-24 relative min-h-screen">
      <header className="sticky top-12 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 pt-4 pb-3">
          <p className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Copa 2026</p>
          <h1 className="text-2xl font-black tracking-tight">Pontos de troca</h1>
          <div className="flex gap-2 mt-3">
            {(["ponto_fixo", "evento"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "shrink-0 px-4 h-9 rounded-full text-sm font-semibold border transition-all",
                  filter === f
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-foreground border-border"
                )}
              >
                {f === "ponto_fixo" ? "Pontos fixos" : "Eventos"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-2">📍</div>
            <p className="font-semibold text-foreground">Nada por aqui ainda</p>
            <p className="text-sm">{filter === "evento" ? "Crie o primeiro evento!" : "Em breve mais pontos."}</p>
          </div>
        )}
        {filtered.map((l) => (
          <LocationCard key={l.id} loc={l} />
        ))}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed bottom-24 right-4 z-30 h-14 px-5 rounded-full text-primary-foreground font-bold flex items-center gap-2 shadow-[var(--shadow-pop)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-5 w-5" />
            Criar evento
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Criar evento de troca</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 mt-4">
            <Field label="Nome do evento">
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Encontrão na Praça"
              />
            </Field>
            <Field label="Endereço">
              <Input
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                placeholder="Rua, número, bairro"
              />
            </Field>
            <Field label="Cidade">
              <Input
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                placeholder="Cidade"
              />
            </Field>
            <Field label="Data e hora">
              <Input
                type="datetime-local"
                value={form.data_evento}
                onChange={(e) => setForm({ ...form, data_evento: e.target.value })}
              />
            </Field>
            <Field label="Descrição">
              <Textarea
                maxLength={200}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Detalhes do encontro (máx 200)"
              />
            </Field>
            <Button onClick={handleCreate} disabled={saving} className="w-full h-12 font-bold">
              {saving ? "Publicando..." : "Publicar evento"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function LocationCard({ loc }: { loc: Location }) {
  const isEvent = loc.tipo === "evento";
  const Icon = isEvent ? Calendar : Store;
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
            isEvent ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold leading-tight">{loc.nome}</div>
          {loc.endereco && (
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {loc.endereco} · {loc.cidade}
              </span>
            </div>
          )}
          {loc.horario && (
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {loc.horario}
            </div>
          )}
          {loc.data_evento && (
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Calendar className="h-3 w-3 shrink-0" />
              {new Date(loc.data_evento).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
          {loc.descricao && <p className="text-sm text-foreground/80 mt-2">{loc.descricao}</p>}
          <div className="mt-2 flex gap-1.5">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                isEvent
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary/10 text-primary"
              )}
            >
              {isEvent ? "Evento" : "Ponto fixo"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
