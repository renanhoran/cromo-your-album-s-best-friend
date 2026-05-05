import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

export function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível iniciar o login com Google");
      return;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha email e senha");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: nome || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      const msg = err?.message ?? "Erro ao autenticar";
      if (msg.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos");
      } else if (msg.includes("already registered") || msg.includes("already been registered")) {
        toast.error("Este email já está cadastrado. Faça login.");
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Confirme seu email antes de entrar");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) {
      toast.error("Digite seu email primeiro");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Enviamos um link de redefinição para seu email");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-background">
      <div className="max-w-md w-full text-center">
        <img src={logoLight} alt="Mania de Álbum" className="mx-auto mb-6 max-h-24 w-auto dark:hidden" />
        <img src={logoDark} alt="Mania de Álbum" className="mx-auto mb-6 max-h-24 w-auto hidden dark:block" />
        <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
          Complete seu álbum da Copa 2026 mais rápido. Encontre trocas em segundos.
        </p>

        <Button onClick={handleGoogle} variant="outline" className="w-full h-12 text-base font-semibold bg-card">
          <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar com Google
        </Button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou com email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar conta</TabsTrigger>
          </TabsList>

          <form onSubmit={handleEmailSubmit} className="mt-4 space-y-3 text-left">
            {mode === "signup" && (
              <div className="space-y-1">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold">
              {loading ? "Aguarde..." : mode === "signup" ? "Criar conta" : "Entrar"}
            </Button>
            {mode === "signin" && (
              <button
                type="button"
                onClick={handleForgot}
                className="w-full text-xs text-muted-foreground underline mt-1"
              >
                Esqueci minha senha
              </button>
            )}
          </form>
        </Tabs>

        <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
          15 dias grátis com tudo incluso — sem precisar colocar cartão.<br />
          Depois, escolha o plano que faz mais sentido pra você.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Ao continuar você concorda com os{" "}
          <a href="/termos" target="_blank" rel="noreferrer" className="underline text-primary">
            Termos de Uso
          </a>{" "}
          e com a{" "}
          <a href="/privacidade" target="_blank" rel="noreferrer" className="underline text-primary">
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </div>
  );
}
