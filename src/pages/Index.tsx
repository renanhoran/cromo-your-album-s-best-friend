import { useEffect, useRef, useState } from "react";
import { Login } from "@/components/Login";
import { Paywall } from "@/components/Paywall";
import { Onboarding } from "@/components/Onboarding";
import { BottomNav, Tab } from "@/components/BottomNav";
import { AlbumView } from "@/views/AlbumView";
import { TradesView } from "@/views/TradesView";
import { LocationsView } from "@/views/LocationsView";
import { ProfileView } from "@/views/ProfileView";
import { StickerCounts } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import logoIcon from "@/assets/logo-icon.png";
import { User as UserIcon } from "lucide-react";
import { TesteBanner } from "@/components/TesteBanner";
import { toast } from "sonner";

export interface Profile {
  nome: string;
  cidade: string;
  avatar: string;
  phone: string;
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [acesso, setAcesso] = useState<"carregando" | "livre" | "bloqueado">("carregando");
  const [diasRestantes, setDiasRestantes] = useState<number>(3);
  const [horasRestantes, setHorasRestantes] = useState<number>(72);
  const [isPremium, setIsPremium] = useState(false);
  const [plano, setPlano] = useState<"teste" | "basico" | "completo">("teste");
  const [showOnboard, setShowOnboard] = useState(false);
  const [tab, setTab] = useState<Tab>("album");
  const [counts, setCounts] = useState<StickerCounts>({});
  const [profile, setProfile] = useState<Profile>({
    nome: "",
    cidade: "",
    avatar: "⚽",
    phone: "",
  });

  // Detectar retorno do Stripe após pagamento
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const planoRetorno = params.get("plano");

    if (paymentStatus === "success" && user) {
      window.history.replaceState({}, "", "/");
      setIsPremium(true);
      setAcesso("livre");
      setPlano((planoRetorno as "basico" | "completo") ?? "completo");
      supabase
        .from("profiles")
        .update({ is_premium: true, plano: planoRetorno ?? "completo" })
        .eq("id", user.id);
      toast.success(
        planoRetorno === "basico"
          ? "Plano Básico ativado! Bem-vindo ao Mania de Álbum 🎉"
          : "Plano Completo ativado! Aproveite a câmera IA 🎉"
      );
    }
  }, [user]);

  // Auth listener (set up before getSession)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load profile & stickers when user changes
  const loadedUserId = useRef<string | null>(null);
  const onboardingSetRef = useRef(false);
  useEffect(() => {
    if (!user) {
      setCounts({});
      setAcesso("carregando");
      loadedUserId.current = null;
      onboardingSetRef.current = false;
      return;
    }
    if (loadedUserId.current === user.id) return;
    loadedUserId.current = user.id;
    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (prof) {
        setProfile({
          nome: prof.nome ?? "",
          cidade: prof.cidade ?? "",
          avatar: prof.avatar ?? "⚽",
          phone: (prof as any).phone ?? "",
        });
        if (prof.is_premium) {
          setIsPremium(true);
          setPlano(((prof as any).plano as "basico" | "completo") ?? "completo");
          setAcesso("livre");
          setDiasRestantes(0);
          setHorasRestantes(0);
        } else {
          setIsPremium(false);
          setPlano("teste");
          const iniciou = new Date((prof as any).teste_iniciado_em ?? prof.created_at ?? Date.now());
          const fimTeste = new Date(iniciou.getTime() + 3 * 24 * 60 * 60 * 1000);
          const msRestantes = fimTeste.getTime() - Date.now();
          const dias = Math.max(0, Math.ceil(msRestantes / (1000 * 60 * 60 * 24)));
          const horas = Math.max(0, Math.ceil(msRestantes / (1000 * 60 * 60)));
          setDiasRestantes(dias);
          setHorasRestantes(horas);
          setAcesso(msRestantes <= 0 ? "bloqueado" : "livre");
        }
        if (!onboardingSetRef.current) {
          const jaViu = (prof as any).onboarding_concluido === true;
          setShowOnboard(!jaViu && !prof.is_premium);
          onboardingSetRef.current = true;
        }
      } else {
        const initial = {
          id: user.id,
          nome: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
          cidade: "",
          avatar: "⚽",
          phone: "",
          onboarding_concluido: false,
          teste_iniciado_em: new Date().toISOString(),
        };
        await supabase.from("profiles").insert(initial);
        setProfile({
          nome: initial.nome,
          cidade: initial.cidade,
          avatar: initial.avatar,
          phone: initial.phone,
        });
        setIsPremium(false);
        setPlano("teste");
        setAcesso("livre");
        setDiasRestantes(3);
        setHorasRestantes(72);
        setShowOnboard(true);
        onboardingSetRef.current = true;
      }

      const { data: stickers } = await supabase
        .from("user_stickers")
        .select("sticker_id, count")
        .eq("user_id", user.id);
      const map: StickerCounts = {};
      stickers?.forEach((s) => {
        map[s.sticker_id] = s.count;
      });
      setCounts(map);
    })();
  }, [user]);

  const handleTap = async (id: string) => {
    if (!user) return;
    const c = counts[id] ?? 0;
    const next = c >= 9 ? 0 : c + 1;
    setCounts((prev) => {
      const u = { ...prev };
      if (next === 0) delete u[id];
      else u[id] = next;
      return u;
    });
    if (next === 0) {
      await supabase.from("user_stickers").delete().eq("user_id", user.id).eq("sticker_id", id);
    } else {
      await supabase
        .from("user_stickers")
        .upsert({ user_id: user.id, sticker_id: id, count: next, updated_at: new Date().toISOString() }, { onConflict: "user_id,sticker_id" });
    }
  };

  const handleSetCount = async (id: string, next: number) => {
    if (!user) return;
    setCounts((prev) => {
      const u = { ...prev };
      if (next <= 0) delete u[id];
      else u[id] = next;
      return u;
    });
    if (next <= 0) {
      await supabase.from("user_stickers").delete().eq("user_id", user.id).eq("sticker_id", id);
    } else {
      await supabase
        .from("user_stickers")
        .upsert(
          { user_id: user.id, sticker_id: id, count: next, updated_at: new Date().toISOString() },
          { onConflict: "user_id,sticker_id" }
        );
    }
  };

  const updateProfile = async (p: Profile) => {
    setProfile(p);
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, ...p });
  };

  if (loading || (user && acesso === "carregando")) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  if (!session || !user) {
    return <Login />;
  }

  if (showOnboard) {
    return (
      <Onboarding
        onDone={async () => {
          setShowOnboard(false);
          if (user) {
            const { error } = await supabase
              .from("profiles")
              .update({ onboarding_concluido: true })
              .eq("id", user.id);
            if (error) console.error("Erro ao salvar onboarding:", error);
          }
        }}
      />
    );
  }

  if (acesso === "bloqueado") {
    return (
      <Paywall
        userId={user.id}
        email={user.email ?? ""}
        nome={profile.nome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => setTab("album")} className="flex items-center gap-2 font-black tracking-tight text-sm">
            <img src={logoIcon} alt="Mania de Álbum" className="h-7 w-7" />
            <span>MANIA DE ÁLBUM</span>
          </button>
          <button
            onClick={() => setTab("perfil")}
            aria-label="Abrir perfil"
            className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center"
          >
            <UserIcon className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </header>
      {!isPremium && (
        <TesteBanner
          diasRestantes={diasRestantes}
          horasRestantes={horasRestantes}
          onVerPlanos={() => setAcesso("bloqueado")}
        />
      )}
      {tab === "album" && (
        <AlbumView
          counts={counts}
          onTap={handleTap}
          onSetCount={handleSetCount}
          isPremium={isPremium}
          temCamera={plano === "teste" || plano === "completo"}
        />
      )}
      {tab === "trocas" && <TradesView counts={counts} isPremium={isPremium} />}
      {tab === "locais" && <LocationsView userId={user.id} userCity={profile.cidade} isPremium={isPremium} />}
      {tab === "perfil" && (
        <ProfileView
          counts={counts}
          profile={profile}
          setProfile={updateProfile}
          email={user.email ?? ""}
          plano={plano}
          userId={user.id}
          onLogout={async () => {
            await supabase.auth.signOut();
            setAcesso("carregando");
          }}
        />
      )}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
