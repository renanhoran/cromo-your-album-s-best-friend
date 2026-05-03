interface TesteBannerProps {
  diasRestantes: number;
  horasRestantes: number;
  onVerPlanos: () => void;
}

export function TesteBanner({ diasRestantes, horasRestantes, onVerPlanos }: TesteBannerProps) {
  if (diasRestantes <= 0 && horasRestantes <= 0) return null;

  const urgente = horasRestantes <= 6;
  const ultimo = diasRestantes === 1 && !urgente;

  const bg = urgente
    ? "bg-red-500/15 border-red-500/30"
    : ultimo
    ? "bg-yellow-500/15 border-yellow-500/30"
    : "bg-primary/10 border-primary/20";

  const textColor = urgente ? "text-red-500" : ultimo ? "text-yellow-600" : "text-primary";

  const icone = urgente ? "🔴" : ultimo ? "⚠️" : "⏱";

  const mensagem = urgente
    ? "Seu teste grátis acaba em poucas horas"
    : ultimo
    ? "Último dia de teste grátis"
    : `${diasRestantes} dias de teste grátis restantes`;

  const ctaTexto = urgente ? "Assinar agora" : "Ver planos →";

  return (
    <div className={`w-full border-b px-4 py-2 flex items-center justify-between gap-2 ${bg}`}>
      <span className={`text-xs font-medium ${textColor}`}>
        {icone} {mensagem}
      </span>
      <button
        onClick={onVerPlanos}
        className={`text-xs font-bold underline underline-offset-2 shrink-0 ${textColor}`}
      >
        {ctaTexto}
      </button>
    </div>
  );
}