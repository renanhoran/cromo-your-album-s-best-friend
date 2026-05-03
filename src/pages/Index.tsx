import { useEffect, useState } from "react";
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

const ONBOARD_KEY = "cromo:onboarded:v1";

export interface Profile {
  nome: string;
  cidade: string;
  avatar: string;
  cpf_cnpj?: string;
  phone?: string;
  address?: string;
  address_number?: string;
  address_complement?: string;
  postal_code?: string;
  province?: string;
  city?: string;
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [acesso, setAcesso] = useState<"carregando" | "livre" | "bloqueado">("carregando");
  const [diasRestantes, setDiasRestantes] = useState<number>(3);
  const [showOnboard, setShowOnboard] = useState(false);
  const [tab, setTab] = useState<Tab>("album");
  const [counts, setCounts] = useState<StickerCounts>({});
  const [profile, setProfile] = useState<Profile>({
    nome: "",
    cidade: "",
    avatar: "⚽",
    cpf_cnpj: "",
    phone: "",
    address: "",
    address_number: "",
    address_complement: "",
    postal_code: "",
    province: "",
    city: "",
  });

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
    setShowOnboard(localStorage.getItem(ONBOARD_KEY) !== "1");
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load profile & stickers when user changes
  useEffect(() => {
    if (!user) {
      setCounts({});
      setAcesso("carregando");
      return;
    }
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
          cpf_cnpj: prof.cpf_cnpj ?? "",
          phone: prof.phone ?? "",
          address: prof.address ?? "",
          address_number: prof.address_number ?? "",
          address_complement: prof.address_complement ?? "",
          postal_code: prof.postal_code ?? "",
          province: prof.province ?? "",
          city: prof.city ?? "",
        });
        const premiumAtivo =
          !!prof.is_premium && !!prof.premium_ate && new Date(prof.premium_ate) > new Date();
        if (premiumAtivo) {
          setAcesso("livre");
          setDiasRestantes(0);
        } else {
          const iniciou = new Date((prof as any).teste_iniciado_em ?? prof.created_at ?? Date.now());
          const diffMs = Date.now() - iniciou.getTime();
          const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const restantes = Math.max(0, 3 - diffDias);
          setDiasRestantes(restantes);
          setAcesso(diffDias >= 3 ? "bloqueado" : "livre");
        }
      } else {
        const initial = {
          id: user.id,
          nome: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
          cidade: "",
          avatar: "⚽",
          cpf_cnpj: "",
          phone: "",
          address: "",
          address_number: "",
          address_complement: "",
          postal_code: "",
          province: "",
          city: "",
        };
        await supabase.from("profiles").insert(initial);
        setProfile({
          nome: initial.nome,
          cidade: initial.cidade,
          avatar: initial.avatar,
          cpf_cnpj: initial.cpf_cnpj,
          phone: initial.phone,
          address: initial.address,
          address_number: initial.address_number,
          address_complement: initial.address_complement,
          postal_code: initial.postal_code,
          province: initial.province,
          city: initial.city,
        });
        setAcesso("livre");
        setDiasRestantes(3);
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
    const next = c === 0 ? 1 : c === 1 ? 2 : 0;
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
        onDone={() => {
          localStorage.setItem(ONBOARD_KEY, "1");
          setShowOnboard(false);
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
        profile={profile}
        onProfileChange={updateProfile}
        diasTestados={3}
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
            className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-base font-bold"
          >
            {profile.avatar || (profile.nome?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
          </button>
        </div>
        {diasRestantes > 0 && diasRestantes <= 3 && tab !== "perfil" && (
          <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-primary">
              {diasRestantes === 1
                ? "Último dia de teste grátis"
                : `${diasRestantes} dias de teste grátis restantes`}
            </span>
            <button
              onClick={() => setAcesso("bloqueado")}
              className="text-xs text-primary font-semibold underline"
            >
              Assinar agora
            </button>
          </div>
        )}
      </header>
      {tab === "album" && <AlbumView counts={counts} onTap={handleTap} />}
      {tab === "trocas" && <TradesView counts={counts} />}
      {tab === "locais" && <LocationsView userId={user.id} userCity={profile.cidade} />}
      {tab === "perfil" && (
        <ProfileView
          counts={counts}
          profile={profile}
          setProfile={updateProfile}
          email={user.email ?? ""}
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
