import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";

const Sucesso = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const plano = params.get("plano");
  const isBasico = plano === "basico";
  const titulo = isBasico ? "Plano Básico ativado!" : "Plano Completo ativado!";
  const sub1 = isBasico
    ? "Acesso completo liberado. Suas figurinhas estão salvas."
    : "Acesso completo com câmera IA liberado.";
  const sub2 = isBasico
    ? "Quer adicionar a câmera IA? Faça upgrade por R$ 20,00 no seu perfil."
    : "Suas figurinhas estão salvas. Aproveite!";
  return (
    <div className="min-h-screen bg-background px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-[420px] text-center flex flex-col items-center">
        <div className="h-20 w-20 rounded-full bg-primary/15 flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-primary" strokeWidth={3} />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-3">
          {titulo}
        </h1>
        <p className="text-muted-foreground mb-1">{sub1}</p>
        <p className="text-muted-foreground mb-8">{sub2}</p>
        <Button
          onClick={() => navigate("/")}
          className="w-full h-14 text-base font-bold rounded-xl"
          style={{ backgroundColor: "#1DB954", color: "#000" }}
        >
          Ir pro meu álbum
        </Button>
      </div>
    </div>
  );
};

export default Sucesso;