export type StickerType = "escudo" | "jogador" | "especial" | "foto_time";

export interface Sticker {
  id: string;
  grupo: string;
  sigla_selecao: string;
  selecao: string;
  tipo: StickerType;
  nome: string;
}

// Sample dataset for MVP. Real dataset can replace this file.
const teams: Array<{ sigla: string; nome: string; grupo: string; players: string[] }> = [
  { sigla: "BRA", nome: "Brasil", grupo: "A", players: ["Alisson", "Marquinhos", "Vinicius Jr", "Rodrygo", "Neymar", "Casemiro", "Raphinha", "Bruno Guimarães", "Militão", "Endrick", "Danilo", "Ederson", "Lucas Paquetá", "Richarlison", "Antony", "Gabriel Jesus", "Gabriel Martinelli", "Bremer"] },
  { sigla: "ARG", nome: "Argentina", grupo: "B", players: ["E. Martínez", "Romero", "Otamendi", "De Paul", "Fernández", "Mac Allister", "Messi", "J. Álvarez", "Di María", "Lautaro", "Molina", "Tagliafico", "Paredes", "Acuña", "Lo Celso", "Foyth", "Garnacho", "Dybala"] },
  { sigla: "FRA", nome: "França", grupo: "C", players: ["Maignan", "Koundé", "Upamecano", "Saliba", "T. Hernández", "Camavinga", "Tchouaméni", "Griezmann", "Mbappé", "Dembélé", "Giroud", "Coman", "Rabiot", "Konaté", "Kolo Muani", "Thuram", "Pavard", "Fofana"] },
  { sigla: "ENG", nome: "Inglaterra", grupo: "D", players: ["Pickford", "Walker", "Stones", "Maguire", "Shaw", "Rice", "Bellingham", "Foden", "Saka", "Kane", "Sterling", "Grealish", "Henderson", "Trippier", "Alexander-Arnold", "Mount", "Rashford", "Watkins"] },
  { sigla: "ESP", nome: "Espanha", grupo: "E", players: ["Simón", "Carvajal", "Le Normand", "Laporte", "Cucurella", "Rodri", "Pedri", "Gavi", "Yamal", "Morata", "Nico Williams", "Olmo", "Fabián", "Merino", "Joselu", "Oyarzabal", "Ferran", "Zubimendi"] },
  { sigla: "GER", nome: "Alemanha", grupo: "F", players: ["Neuer", "Kimmich", "Rüdiger", "Tah", "Raum", "Andrich", "Gündoğan", "Musiala", "Wirtz", "Havertz", "Sané", "Kroos", "Müller", "Füllkrug", "Goretzka", "Mittelstädt", "Schlotterbeck", "Pavlović"] },
  { sigla: "POR", nome: "Portugal", grupo: "G", players: ["Diogo Costa", "Cancelo", "Pepe", "Dias", "Mendes", "B. Fernandes", "Vitinha", "B. Silva", "Ronaldo", "Leão", "Félix", "Neves", "Otávio", "Palhinha", "Conceição", "Ramos", "Dalot", "Inácio"] },
  { sigla: "NED", nome: "Holanda", grupo: "H", players: ["Verbruggen", "Dumfries", "De Vrij", "Van Dijk", "Aké", "Veerman", "Schouten", "Reijnders", "Gakpo", "Depay", "Simons", "Malen", "Weghorst", "Bergwijn", "Frimpong", "De Ligt", "Koopmeiners", "Xavi"] },
  { sigla: "USA", nome: "EUA", grupo: "A", players: ["Turner", "Dest", "Richards", "Robinson", "Adams", "McKennie", "Pulisic", "Reyna", "Weah", "Balogun", "Aaronson", "Musah", "Ferreira", "Pepi", "Scally", "Yedlin", "Acosta", "Morris"] },
  { sigla: "MEX", nome: "México", grupo: "A", players: ["Ochoa", "Sánchez", "Moreno", "Montes", "Gallardo", "Álvarez", "Herrera", "Lozano", "Vega", "Martín", "Antuna", "Funes Mori", "Chávez", "Rodríguez", "Romo", "Pineda", "Araujo", "Jiménez"] },
  { sigla: "CAN", nome: "Canadá", grupo: "A", players: ["Borjan", "Davies", "Vitória", "Miller", "Johnston", "Eustáquio", "Hutchinson", "Buchanan", "David", "Larin", "Cavallini", "Hoilett", "Laryea", "Adekugbe", "Kone", "Osorio", "Millar", "Wotherspoon"] },
  { sigla: "CRO", nome: "Croácia", grupo: "B", players: ["Livaković", "Juranović", "Lovren", "Gvardiol", "Sosa", "Brozović", "Modrić", "Kovačić", "Perišić", "Kramarić", "Petković", "Pašalić", "Vlašić", "Majer", "Orsić", "Sučić", "Erlić", "Budimir"] },
  { sigla: "URU", nome: "Uruguai", grupo: "C", players: ["Rochet", "Varela", "Giménez", "Araújo", "Olivera", "Bentancur", "Valverde", "Ugarte", "Pellistri", "Núñez", "Suárez", "Cavani", "De Arrascaeta", "Coates", "Vecino", "Torreira", "Viña", "Gómez"] },
  { sigla: "BEL", nome: "Bélgica", grupo: "D", players: ["Courtois", "Castagne", "Vertonghen", "Faes", "Carrasco", "Tielemans", "De Bruyne", "Witsel", "Hazard", "Lukaku", "Mertens", "Trossard", "Doku", "Lukebakio", "Onana", "Théate", "De Ketelaere", "Openda"] },
  { sigla: "JPN", nome: "Japão", grupo: "E", players: ["Gonda", "Sakai", "Yoshida", "Itakura", "Nagatomo", "Endō", "Morita", "Kamada", "Kubo", "Mitoma", "Maeda", "Tomiyasu", "Asano", "Itō", "Minamino", "Doan", "Tanaka", "Ueda"] },
  { sigla: "MAR", nome: "Marrocos", grupo: "F", players: ["Bono", "Hakimi", "Saiss", "Aguerd", "Mazraoui", "Amrabat", "Ounahi", "Amallah", "Ziyech", "En-Nesyri", "Boufal", "Cheddira", "Ezzalzouli", "Sabiri", "Attiat-Allah", "Dari", "Hamdallah", "Aboukhlal"] },
];

function pad(n: number) {
  return String(n).padStart(3, "0");
}

function buildStickers(): Sticker[] {
  const list: Sticker[] = [];

  // Especiais (FWC) - troféu, mascote, pôster, bola
  const especiais = ["Troféu", "Mascote", "Pôster Oficial", "Bola Oficial", "Estádio Final", "Logo Copa 2026"];
  especiais.forEach((nome, i) => {
    list.push({ id: `FWC-${pad(i)}`, grupo: "Especiais", sigla_selecao: "FWC", selecao: "Copa 2026", tipo: "especial", nome });
  });

  teams.forEach((t) => {
    list.push({ id: `${t.sigla}-${pad(0)}`, grupo: t.grupo, sigla_selecao: t.sigla, selecao: t.nome, tipo: "escudo", nome: `Escudo ${t.nome}` });
    list.push({ id: `${t.sigla}-${pad(1)}`, grupo: t.grupo, sigla_selecao: t.sigla, selecao: t.nome, tipo: "foto_time", nome: `${t.nome} - Foto do time` });
    t.players.forEach((p, i) => {
      list.push({ id: `${t.sigla}-${pad(i + 2)}`, grupo: t.grupo, sigla_selecao: t.sigla, selecao: t.nome, tipo: "jogador", nome: p });
    });
  });

  return list;
}

export const STICKERS: Sticker[] = buildStickers();