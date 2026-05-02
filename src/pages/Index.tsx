import { useEffect, useState } from "react";
import { Login } from "@/components/Login";
import { Paywall } from "@/components/Paywall";
import { BottomNav, Tab } from "@/components/BottomNav";
import { AlbumView } from "@/views/AlbumView";
import { TradesView } from "@/views/TradesView";
import { LocationsView } from "@/views/LocationsView";
import { ProfileView } from "@/views/ProfileView";
import { StickerCounts } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

const PAID_KEY = "cromo:paid:v1";

export interface Profile {
  nome: string;
  cidade: string;
  avatar: string;
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
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
    setPaid(localStorage.getItem(PAID_KEY) === "1");
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load profile & stickers when user changes
  useEffect(() => {
    if (!user) {
      setCounts({});
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
      } else {
        const initial = {
          id: user.id,
          nome: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
          cidade: "",
          avatar: "⚽",
        };
        await supabase.from("profiles").insert(initial);
        setProfile({ nome: initial.nome, cidade: initial.cidade, avatar: initial.avatar });
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  if (!session || !user) {
    return <Login />;
  }

  if (!paid) {
    return (
      <Paywall
        onUnlock={() => {
          localStorage.setItem(PAID_KEY, "1");
          setPaid(true);
          toast.success("Acesso liberado! Bom álbum 🎉");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
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
            localStorage.removeItem(PAID_KEY);
            setPaid(false);
          }}
        />
      )}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
