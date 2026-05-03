export const FLAGS: Record<string, string | null> = {
  // Grupo A
  MEX: 'mx', RSA: 'za', KOR: 'kr', CZE: 'cz',
  // Grupo B
  CAN: 'ca', BIH: 'ba', QAT: 'qa', SUI: 'ch',
  // Grupo C
  BRA: 'br', MAR: 'ma', HAI: 'ht', SCO: 'gb-sct',
  // Grupo D
  USA: 'us', PAR: 'py', AUS: 'au', TUR: 'tr',
  // Grupo E
  GER: 'de', CUW: 'cw', CIV: 'ci', ECU: 'ec',
  // Grupo F
  NED: 'nl', JPN: 'jp', SWE: 'se', TUN: 'tn',
  // Grupo G
  BEL: 'be', EGY: 'eg', IRN: 'ir', NZL: 'nz',
  // Grupo H
  ESP: 'es', CPV: 'cv', KSA: 'sa', URU: 'uy',
  // Grupo I
  FRA: 'fr', SEN: 'sn', IRQ: 'iq', NOR: 'no',
  // Grupo J
  ARG: 'ar', ALG: 'dz', AUT: 'at', JOR: 'jo',
  // Grupo K
  POR: 'pt', COD: 'cd', UZB: 'uz', COL: 'co',
  // Grupo L
  ENG: 'gb-eng', CRO: 'hr', GHA: 'gh', PAN: 'pa',
  // Especiais
  FWC: null, HISTORY: null, COCACOLA: null,
};

export function getFlagUrl(sigla: string, size: number = 40): string | null {
  const code = FLAGS[sigla];
  if (!code) return null;
  return `https://flagcdn.com/w${size}/${code}.png`;
}