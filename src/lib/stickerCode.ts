import { STICKERS, type Sticker } from "@/data/stickers";

/**
 * Normalize a code like "BRA-14", "bra14", "BRA 14" to "BRA-014" (matching sticker IDs).
 * Returns null if it can't parse.
 */
export function normalizeCode(input: string): string | null {
  if (!input) return null;
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = cleaned.match(/^([A-Z]{2,4})(\d{1,3})$/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(3, "0")}`;
}

export function findStickerByCode(input: string): Sticker | null {
  const id = normalizeCode(input);
  if (!id) return null;
  return STICKERS.find((s) => s.id === id) ?? null;
}

export function parseCodeList(text: string): string[] {
  return text
    .split(/[\s,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}