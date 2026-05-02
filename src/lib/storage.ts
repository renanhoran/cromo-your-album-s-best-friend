import { STICKERS } from "@/data/stickers";

const KEY = "cromo:user-stickers:v1";
const PROFILE_KEY = "cromo:profile:v1";

export type StickerCounts = Record<string, number>;

export interface Profile {
  nome: string;
  cidade: string;
  avatar: string;
}

export function loadCounts(): StickerCounts {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StickerCounts;
  } catch {
    return {};
  }
}

export function saveCounts(counts: StickerCounts) {
  localStorage.setItem(KEY, JSON.stringify(counts));
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as Profile;
  } catch {}
  return { nome: "Você", cidade: "", avatar: "🧑" };
}

export function saveProfile(p: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

// Mock other users for matching demo
export interface MockUser {
  id: string;
  nome: string;
  cidade: string;
  avatar: string;
  counts: StickerCounts;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildMockUser(id: string, nome: string, cidade: string, avatar: string, seed: number): MockUser {
  const rnd = seededRandom(seed);
  const counts: StickerCounts = {};
  STICKERS.forEach((s) => {
    const r = rnd();
    if (r < 0.55) counts[s.id] = 1;
    else if (r < 0.75) counts[s.id] = 2 + Math.floor(rnd() * 3);
    // else 0 (missing)
  });
  return { id, nome, cidade, avatar, counts };
}

export const MOCK_USERS: MockUser[] = [
  buildMockUser("u1", "Lucas", "São Paulo, SP", "⚽️", 11),
  buildMockUser("u2", "Marina", "Rio de Janeiro, RJ", "🏆", 27),
  buildMockUser("u3", "Bruno", "Belo Horizonte, MG", "🥅", 53),
  buildMockUser("u4", "Camila", "Curitiba, PR", "🎯", 71),
  buildMockUser("u5", "Diego", "Porto Alegre, RS", "🔥", 91),
  buildMockUser("u6", "Aline", "Recife, PE", "✨", 113),
  buildMockUser("u7", "Felipe", "Salvador, BA", "🌟", 137),
  buildMockUser("u8", "Júlia", "Fortaleza, CE", "💫", 157),
];