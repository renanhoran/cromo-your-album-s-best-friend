import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase popula a sessão automaticamente quando vem com type=recovery
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Mínimo 6 caracteres");
    if (password !== confirm) return toast.error("As senhas não conferem");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada!");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-black text-center">Redefinir senha</h1>
        <p className="text-sm text-muted-foreground text-center">
          {ready ? "Digite sua nova senha" : "Validando link..."}
        </p>
        <div className="space-y-1">
          <Label htmlFor="password">Nova senha</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading || !ready} className="w-full h-12 font-semibold">
          {loading ? "Salvando..." : "Atualizar senha"}
        </Button>
      </form>
    </div>
  );
}
