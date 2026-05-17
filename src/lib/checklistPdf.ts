import jsPDF from "jspdf";
import QRCode from "qrcode";
import { STICKERS, type Sticker } from "@/data/stickers";
import type { StickerCounts } from "@/lib/storage";

const COUNTRY_ORDER: Record<string, string[]> = {
  A: ["MEX", "RSA", "KOR", "CZE"],
  B: ["CAN", "BIH", "QAT", "SUI"],
  C: ["BRA", "MAR", "HAI", "SCO"],
  D: ["USA", "PAR", "AUS", "TUR"],
  E: ["GER", "CUW", "CIV", "ECU"],
  F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "EGY", "IRN", "NZL"],
  H: ["ESP", "CPV", "KSA", "URU"],
  I: ["FRA", "SEN", "IRQ", "NOR"],
  J: ["ARG", "ALG", "AUT", "JOR"],
  K: ["POR", "COD", "UZB", "COL"],
  L: ["ENG", "CRO", "GHA", "PAN"],
};

const GROUP_ORDER = ["FWC1", ...Object.keys(COUNTRY_ORDER), "FWC2", "CC"];

function bucketFor(s: Sticker): string {
  if (s.grupo === "FWC") {
    const n = parseInt(s.id.split("-")[1] ?? "0", 10);
    return n <= 8 ? "FWC1" : "FWC2";
  }
  return s.grupo;
}

function groupLabel(g: string): string {
  if (g === "FWC1") return "FWC — Especiais";
  if (g === "FWC2") return "FWC — História da Copa";
  if (g === "CC") return "Coca-Cola";
  return `Grupo ${g}`;
}

interface CountryBlock {
  sigla: string;
  nome: string;
  items: Sticker[];
}

function buildGroups(): Map<string, CountryBlock[]> {
  const map = new Map<string, Map<string, CountryBlock>>();
  for (const s of STICKERS) {
    const b = bucketFor(s);
    if (!map.has(b)) map.set(b, new Map());
    const inner = map.get(b)!;
    if (!inner.has(s.sigla_selecao)) {
      inner.set(s.sigla_selecao, { sigla: s.sigla_selecao, nome: s.selecao, items: [] });
    }
    inner.get(s.sigla_selecao)!.items.push(s);
  }
  const out = new Map<string, CountryBlock[]>();
  for (const g of GROUP_ORDER) {
    const inner = map.get(g);
    if (!inner) continue;
    const order = COUNTRY_ORDER[g];
    const list = [...inner.values()];
    if (order) {
      list.sort((a, b) => order.indexOf(a.sigla) - order.indexOf(b.sigla));
    }
    list.forEach((c) => c.items.sort((a, b) => a.id.localeCompare(b.id)));
    out.set(g, list);
  }
  return out;
}

// cores (RGB)
const PRIMARY: [number, number, number] = [11, 95, 255];
const ACCENT: [number, number, number] = [22, 163, 74];
const MUTED: [number, number, number] = [107, 114, 128];
const BORDER: [number, number, number] = [229, 231, 235];
const HEADER: [number, number, number] = [15, 23, 42];
const DUPE: [number, number, number] = [245, 158, 11];
const SOFT_BG: [number, number, number] = [241, 245, 249];
const TRACK: [number, number, number] = [226, 232, 240];

export async function generateChecklistPdf(
  counts: StickerCounts,
  opts?: { nome?: string }
): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const MARGIN = 12;

  const groups = buildGroups();

  const total = STICKERS.length;
  let have = 0;
  let dup = 0;
  STICKERS.forEach((s) => {
    const c = counts[s.id] ?? 0;
    if (c >= 1) have++;
    if (c >= 2) dup += c - 1;
  });
  const miss = total - have;
  const pct = Math.round((100 * have) / total);

  let pageNum = 1;

  const drawHeader = () => {
    doc.setFillColor(...HEADER);
    doc.rect(0, 0, W, 22, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Mania de Álbum  ·  Copa do Mundo 2026", MARGIN, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Checklist personalizado das suas figurinhas", MARGIN, 18);
    doc.setFontSize(8);
    doc.text("app.maniadealbum.com.br", W - MARGIN, 12, { align: "right" });

    // legend
    const ly = 18;
    const lx = W - MARGIN - 70;
    doc.setFontSize(7);
    doc.setFillColor(...ACCENT);
    doc.rect(lx, ly - 2.5, 3, 3, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text("✓", lx + 0.8, ly);
    doc.setFont("helvetica", "normal");
    doc.text("tenho", lx + 4, ly);
    const lx2 = lx + 18;
    doc.setFillColor(...DUPE);
    doc.rect(lx2, ly - 2.5, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.text("2+", lx2 + 0.5, ly);
    doc.setFont("helvetica", "normal");
    doc.text("repetida", lx2 + 5, ly);
    const lx3 = lx2 + 20;
    doc.setDrawColor(255);
    doc.setFillColor(...HEADER);
    doc.rect(lx3, ly - 2.5, 3, 3, "FD");
    doc.text("preciso", lx3 + 5, ly);
  };

  const drawFooter = () => {
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      "Gerado por Mania de Álbum  ·  app.maniadealbum.com.br",
      MARGIN,
      H - 8
    );
    doc.text(`Página ${pageNum}`, W - MARGIN, H - 8, { align: "right" });
  };

  let y = 30;
  drawHeader();

  // stats bar
  doc.setFillColor(...SOFT_BG);
  doc.roundRect(MARGIN, y, W - 2 * MARGIN, 14, 2, 2, "F");
  doc.setTextColor(...HEADER);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${have}/${total}`, MARGIN + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Tenho", MARGIN + 4, y + 10);
  doc.setTextColor(...HEADER);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${miss}`, MARGIN + 34, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Preciso", MARGIN + 34, y + 10);
  doc.setTextColor(...HEADER);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${dup}`, MARGIN + 58, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Repetidas", MARGIN + 58, y + 10);

  const pbx = MARGIN + 82;
  const pbw = W - 2 * MARGIN - 86;
  doc.setFillColor(...TRACK);
  doc.roundRect(pbx, y + 5, pbw, 4, 1, 1, "F");
  doc.setFillColor(...PRIMARY);
  doc.roundRect(pbx, y + 5, (pbw * have) / total, 4, 1, 1, "F");
  doc.setTextColor(...HEADER);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`${pct}% completo`, pbx, y + 3.5);
  if (opts?.nome) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Colecionador: ${opts.nome}`,
      W - MARGIN,
      y + 3.5,
      { align: "right" }
    );
  }

  y += 18;

  const BOX = 5.2;
  const GAP = 1.2;
  const PER_ROW = 20;

  const needSpace = (extra: number) => {
    if (y + extra > H - 12) {
      drawFooter();
      doc.addPage();
      pageNum += 1;
      drawHeader();
      y = 28;
    }
  };

  for (const [g, countries] of groups) {
    if (!countries.length) continue;
    needSpace(14);

    // group header
    doc.setFillColor(...PRIMARY);
    doc.rect(MARGIN, y, W - 2 * MARGIN, 7, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(groupLabel(g), MARGIN + 3, y + 5);
    const gTotal = countries.reduce((a, c) => a + c.items.length, 0);
    const gHave = countries.reduce(
      (a, c) => a + c.items.filter((s) => (counts[s.id] ?? 0) >= 1).length,
      0
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${gHave}/${gTotal}`, W - MARGIN - 3, y + 5, { align: "right" });
    y += 9;

    for (const c of countries) {
      const rows = Math.ceil(c.items.length / PER_ROW);
      const blockH = 6 + rows * (BOX + GAP) + 3;
      needSpace(blockH);

      doc.setTextColor(...HEADER);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`${c.nome}  (${c.sigla})`, MARGIN, y + 4);
      const ch = c.items.filter((s) => (counts[s.id] ?? 0) >= 1).length;
      doc.setTextColor(...MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`${ch}/${c.items.length}`, W - MARGIN, y + 4, { align: "right" });
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, y + 5, W - MARGIN, y + 5);
      y += 7;

      let col = 0;
      for (const s of c.items) {
        const cx = MARGIN + col * (BOX + GAP);
        const cy = y;
        const cnt = counts[s.id] ?? 0;
        const num = s.id.split("-").pop() ?? "";
        if (cnt >= 2) {
          doc.setFillColor(...DUPE);
          doc.setDrawColor(...DUPE);
          doc.rect(cx, cy, BOX, BOX, "FD");
          doc.setTextColor(255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6);
        } else if (cnt >= 1) {
          doc.setFillColor(...ACCENT);
          doc.setDrawColor(...ACCENT);
          doc.rect(cx, cy, BOX, BOX, "FD");
          doc.setTextColor(255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(...BORDER);
          doc.setLineWidth(0.2);
          doc.rect(cx, cy, BOX, BOX, "FD");
          doc.setTextColor(...MUTED);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6);
        }
        doc.text(num, cx + BOX / 2, cy + BOX / 2 + 1.2, { align: "center" });
        col += 1;
        if (col >= PER_ROW) {
          col = 0;
          y += BOX + GAP;
        }
      }
      if (col !== 0) y += BOX + GAP;
      y += 3;
    }
  }

  // QR Code final
  const QR_BLOCK_H = 62;
  if (y + QR_BLOCK_H > H - 12) {
    drawFooter();
    doc.addPage();
    pageNum += 1;
    drawHeader();
    y = 28;
  }

  const qrDataUrl = await QRCode.toDataURL("https://app.maniadealbum.com.br", {
    margin: 1,
    width: 480,
    errorCorrectionLevel: "M",
  });

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.roundRect(MARGIN, y, W - 2 * MARGIN, 60, 3, 3, "FD");

  const qrSize = 45;
  const qrX = MARGIN + 6;
  const qrY = y + (60 - qrSize) / 2;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  const tx = qrX + qrSize + 8;
  let ty = y + 12;
  doc.setTextColor(...HEADER);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Baixe o app Mania de Álbum", tx, ty);
  ty += 6;
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Leitor de figurinhas por IA — direto da foto", tx, ty);
  ty += 5;
  doc.text("Controle tenho / preciso / repetidas e ache", tx, ty);
  ty += 4;
  doc.text("pessoas próximas pra trocar.", tx, ty);
  ty += 8;
  doc.setTextColor(...PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("app.maniadealbum.com.br", tx, ty);
  ty += 6;
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Aponte a câmera do celular para o QR Code", tx, ty);

  drawFooter();

  return doc.output("blob");
}

export async function downloadChecklistPdf(
  counts: StickerCounts,
  opts?: { nome?: string }
) {
  const blob = await generateChecklistPdf(counts, opts);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "checklist-do-album.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}