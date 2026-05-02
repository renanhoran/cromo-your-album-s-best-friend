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

const ONBOARD_KEY = "cromo:onboarded:v1";

export interface Profile {
  nome: string;
  cidade: string;
  avatar: string;
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const [tab, setTab] = useState<Tab>("album");
  const [counts, setCounts] = useState<StickerCounts>({});
  const [profile, setProfile] = useState<Profile>({ nome: "", cidade: "", avatar: "⚽" });

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
      setIsPremium(false);
      setPremiumChecked(false);
      return;
    }
    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (prof) {
        setProfile({ nome: prof.nome ?? "", cidade: prof.cidade ?? "", avatar: prof.avatar ?? "⚽" });
        const ativo =
          !!prof.is_premium && !!prof.premium_ate && new Date(prof.premium_ate) > new Date();
        setIsPremium(ativo);
      } else {
        const initial = {
          id: user.id,
          nome: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
          cidade: "",
          avatar: "⚽",
        };
        await supabase.from("profiles").insert(initial);
        setProfile({ nome: initial.nome, cidade: initial.cidade, avatar: initial.avatar });
        setIsPremium(false);
      }
      setPremiumChecked(true);

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

  if (loading || (user && !premiumChecked)) {
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

  if (!isPremium) {
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
          <button onClick={() => setTab("album")} className="font-black tracking-tight text-sm">
            CROMO <span className="text-primary">⚽</span>
          </button>
          <button
            onClick={() => setTab("perfil")}
            aria-label="Abrir perfil"
            className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-base font-bold"
          >
            {profile.avatar || (profile.nome?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
          </button>
        </div>
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
            setIsPremium(false);
          }}
        />
      )}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
