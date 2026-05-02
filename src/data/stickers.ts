import data from "./stickers-data.json";

export type StickerType = "escudo" | "jogador" | "especial" | "foto_time";

export interface Sticker {
  id: string;
  grupo: string;
  sigla_selecao: string;
  selecao: string;
  tipo: StickerType;
  nome: string;
}

export const STICKERS: Sticker[] = data as Sticker[];
