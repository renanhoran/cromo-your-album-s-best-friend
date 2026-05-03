export function AdBanner({ label = "Anúncio" }: { label?: string }) {
  return (
    <div className="w-full rounded-xl border border-dashed border-border bg-secondary/60 px-4 py-3 text-center text-xs text-muted-foreground">
      <span className="opacity-60 mr-2">{label}</span>
      <span className="font-semibold text-foreground/70">
        Suas figurinhas chegam mais rápido com o Mania de Álbum Pro 🚀
      </span>
    </div>
  );
}