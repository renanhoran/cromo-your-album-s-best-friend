// Mapeia sigla FIFA (3 letras) para emoji da bandeira do país.
// Para entradas não-país (ex: FWC - abertura), retorna string vazia.
const FIFA_TO_ISO2: Record<string, string> = {
  MEX: "MX", RSA: "ZA", KOR: "KR", CAN: "CA", USA: "US",
  ARG: "AR", BRA: "BR", FRA: "FR", GER: "DE", ESP: "ES",
  POR: "PT", ENG: "GB", ITA: "IT", NED: "NL", BEL: "BE",
  CRO: "HR", SUI: "CH", DEN: "DK", SWE: "SE", NOR: "NO",
  POL: "PL", AUT: "AT", SCO: "GB", WAL: "GB", IRL: "IE",
  TUR: "TR", UKR: "UA", SRB: "RS", CZE: "CZ", HUN: "HU",
  ROU: "RO", GRE: "GR", ALB: "AL", SVK: "SK", SVN: "SI",
  RUS: "RU", JPN: "JP", AUS: "AU", IRN: "IR", KSA: "SA",
  QAT: "QA", UAE: "AE", IRQ: "IQ", JOR: "JO", UZB: "UZ",
  CHN: "CN", PRK: "KP",
  EGY: "EG", MAR: "MA", TUN: "TN", ALG: "DZ", SEN: "SN",
  CIV: "CI", GHA: "GH", NGA: "NG", CMR: "CM", MLI: "ML",
  ANG: "AO", CPV: "CV",
  COL: "CO", URU: "UY", PAR: "PY", PER: "PE", CHI: "CL",
  ECU: "EC", VEN: "VE", BOL: "BO",
  CRC: "CR", PAN: "PA", HON: "HN", JAM: "JM", HAI: "HT",
  CUR: "CW", SLV: "SV", GUA: "GT",
  NZL: "NZ",
};

function isoToFlagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

export function flagFromSigla(sigla: string): string {
  const iso = FIFA_TO_ISO2[sigla?.toUpperCase()];
  if (!iso) return "";
  return isoToFlagEmoji(iso);
}