import { useEffect, useState } from "react";
import { Login } from "@/components/Login";
import { Paywall } from "@/components/Paywall";
import { BottomNav, Tab } from "@/components/BottomNav";
import { AlbumView } from "@/views/AlbumView";
import { TradesView } from "@/views/TradesView";
import { ProfileView } from "@/views/ProfileView";
import {
  loadCounts,
  saveCounts,
  StickerCounts,
  loadProfile,
  Profile,
} from "@/lib/storage";
import { toast } from "sonner";

const AUTH_KEY = "cromo:auth:v1";
const PAID_KEY = "cromo:paid:v1";

const Index = () => {
  const [authed, setAuthed] = useState(false);
  const [paid, setPaid] = useState(false);
  const [tab, setTab] = useState<Tab>("album");
  const [counts, setCounts] = useState<StickerCounts>({});
  const [profile, setProfile] = useState<Profile>(loadProfile());

  useEffect(() => {
    setAuthed(localStorage.getItem(AUTH_KEY) === "1");
    setPaid(localStorage.getItem(PAID_KEY) === "1");
    setCounts(loadCounts());
  }, []);

  const handleTap = (id: string) => {
    setCounts((prev) => {
      const c = prev[id] ?? 0;
      let next: number;
      if (c === 0) next = 1;
      else if (c === 1) next = 2;
      else next = 0;
      const updated = { ...prev };
      if (next === 0) delete updated[id];
      else updated[id] = next;
      saveCounts(updated);
      return updated;
    });
  };

  if (!authed) {
    return (
      <Login
        onLogin={() => {
          localStorage.setItem(AUTH_KEY, "1");
          setAuthed(true);
        }}
      />
    );
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
      {tab === "perfil" && (
        <ProfileView
          counts={counts}
          profile={profile}
          setProfile={setProfile}
          onLogout={() => {
            localStorage.removeItem(AUTH_KEY);
            localStorage.removeItem(PAID_KEY);
            setAuthed(false);
            setPaid(false);
          }}
        />
      )}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
