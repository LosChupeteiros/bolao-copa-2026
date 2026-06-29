import type { Match, Round } from "./types";

// ISO country codes for flag images (flagcdn.com)
export const TEAM_FLAGS: Record<string, string> = {
  "África do Sul": "za",
  "Canadá": "ca",
  "Brasil": "br",
  "Japão": "jp",
  "Alemanha": "de",
  "Paraguai": "py",
  "Holanda": "nl",
  "Marrocos": "ma",
  "Costa do Marfim": "ci",
  "Noruega": "no",
  "França": "fr",
  "Suécia": "se",
  "México": "mx",
  "Equador": "ec",
  "Inglaterra": "gb-eng",
  "RD Congo": "cd",
  "Bélgica": "be",
  "Senegal": "sn",
  "Estados Unidos": "us",
  "Bósnia": "ba",
  "Espanha": "es",
  "Áustria": "at",
  "Portugal": "pt",
  "Croácia": "hr",
  "Suíça": "ch",
  "Argélia": "dz",
  "Austrália": "au",
  "Egito": "eg",
  "Argentina": "ar",
  "Cabo Verde": "cv",
  "Colômbia": "co",
  "Gana": "gh",
};

export function getFlagUrl(teamLabel: string): string {
  const code = TEAM_FLAGS[teamLabel];
  if (!code) return "/flags/unknown.png";
  return `https://flagcdn.com/w80/${code}.png`;
}

// All 31 matches + 3rd place = 32 total
// kickoff in UTC milliseconds (Brazil is UTC-3, so 14h BRT = 17h UTC)
const BRT_OFFSET = 3 * 60 * 60 * 1000; // UTC-3

function brt(dateStr: string, h: number, m = 0): number {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.getTime() + (h * 60 + m) * 60 * 1000 + BRT_OFFSET;
}

export const MATCHES: Match[] = [
  // ── SEGUNDA FASE (R16) ───────────────────────────────────────────────────
  {
    id: "r16_1",
    round: "r16",
    home: "za",
    away: "ca",
    homeLabel: "África do Sul",
    awayLabel: "Canadá",
    date: "28/06 16h",
    kickoff: brt("2026-06-28", 16, 0),
  },
  {
    id: "r16_2",
    round: "r16",
    home: "br",
    away: "jp",
    homeLabel: "Brasil",
    awayLabel: "Japão",
    date: "29/06 14h",
    kickoff: brt("2026-06-29", 14, 0),
  },
  {
    id: "r16_3",
    round: "r16",
    home: "de",
    away: "py",
    homeLabel: "Alemanha",
    awayLabel: "Paraguai",
    date: "29/06 17h30",
    kickoff: brt("2026-06-29", 17, 30),
  },
  {
    id: "r16_4",
    round: "r16",
    home: "nl",
    away: "ma",
    homeLabel: "Holanda",
    awayLabel: "Marrocos",
    date: "29/06 22h",
    kickoff: brt("2026-06-29", 22, 0),
  },
  {
    id: "r16_5",
    round: "r16",
    home: "ci",
    away: "no",
    homeLabel: "Costa do Marfim",
    awayLabel: "Noruega",
    date: "30/06 14h",
    kickoff: brt("2026-06-30", 14, 0),
  },
  {
    id: "r16_6",
    round: "r16",
    home: "fr",
    away: "se",
    homeLabel: "França",
    awayLabel: "Suécia",
    date: "30/06 18h",
    kickoff: brt("2026-06-30", 18, 0),
  },
  {
    id: "r16_7",
    round: "r16",
    home: "mx",
    away: "ec",
    homeLabel: "México",
    awayLabel: "Equador",
    date: "30/06 22h",
    kickoff: brt("2026-06-30", 22, 0),
  },
  {
    id: "r16_8",
    round: "r16",
    home: "gb-eng",
    away: "cd",
    homeLabel: "Inglaterra",
    awayLabel: "RD Congo",
    date: "01/07 13h",
    kickoff: brt("2026-07-01", 13, 0),
  },
  {
    id: "r16_9",
    round: "r16",
    home: "be",
    away: "sn",
    homeLabel: "Bélgica",
    awayLabel: "Senegal",
    date: "01/07 17h",
    kickoff: brt("2026-07-01", 17, 0),
  },
  {
    id: "r16_10",
    round: "r16",
    home: "us",
    away: "ba",
    homeLabel: "Estados Unidos",
    awayLabel: "Bósnia",
    date: "01/07 21h",
    kickoff: brt("2026-07-01", 21, 0),
  },
  {
    id: "r16_11",
    round: "r16",
    home: "es",
    away: "at",
    homeLabel: "Espanha",
    awayLabel: "Áustria",
    date: "02/07 16h",
    kickoff: brt("2026-07-02", 16, 0),
  },
  {
    id: "r16_12",
    round: "r16",
    home: "pt",
    away: "hr",
    homeLabel: "Portugal",
    awayLabel: "Croácia",
    date: "02/07 20h",
    kickoff: brt("2026-07-02", 20, 0),
  },
  {
    id: "r16_13",
    round: "r16",
    home: "ch",
    away: "dz",
    homeLabel: "Suíça",
    awayLabel: "Argélia",
    date: "03/07 00h",
    kickoff: brt("2026-07-03", 0, 0),
  },
  {
    id: "r16_14",
    round: "r16",
    home: "au",
    away: "eg",
    homeLabel: "Austrália",
    awayLabel: "Egito",
    date: "03/07 15h",
    kickoff: brt("2026-07-03", 15, 0),
  },
  {
    id: "r16_15",
    round: "r16",
    home: "ar",
    away: "cv",
    homeLabel: "Argentina",
    awayLabel: "Cabo Verde",
    date: "03/07 19h",
    kickoff: brt("2026-07-03", 19, 0),
  },
  {
    id: "r16_16",
    round: "r16",
    home: "co",
    away: "gh",
    homeLabel: "Colômbia",
    awayLabel: "Gana",
    date: "03/07 22h30",
    kickoff: brt("2026-07-03", 22, 30),
  },

  // ── OITAVAS DE FINAL ─────────────────────────────────────────────────────
  // Oitavas 1: W(r16_3 Alemanha/Paraguai) × W(r16_6 França/Suécia)
  {
    id: "oitavas_1",
    round: "oitavas",
    home: "",
    away: "",
    homeLabel: "Vencedor Alemanha/Paraguai",
    awayLabel: "Vencedor França/Suécia",
    date: "04/07 18h",
    kickoff: brt("2026-07-04", 18, 0),
    dependsOn: { home: "r16_3", away: "r16_6" },
  },
  // Oitavas 2: W(r16_1 África do Sul/Canadá) × W(r16_4 Holanda/Marrocos)
  {
    id: "oitavas_2",
    round: "oitavas",
    home: "",
    away: "",
    homeLabel: "Vencedor África do Sul/Canadá",
    awayLabel: "Vencedor Holanda/Marrocos",
    date: "04/07 14h",
    kickoff: brt("2026-07-04", 14, 0),
    dependsOn: { home: "r16_1", away: "r16_4" },
  },
  // Oitavas 3: W(r16_12 Portugal/Croácia) × W(r16_11 Espanha/Áustria)
  {
    id: "oitavas_3",
    round: "oitavas",
    home: "",
    away: "",
    homeLabel: "Vencedor Portugal/Croácia",
    awayLabel: "Vencedor Espanha/Áustria",
    date: "06/07 16h",
    kickoff: brt("2026-07-06", 16, 0),
    dependsOn: { home: "r16_12", away: "r16_11" },
  },
  // Oitavas 4: W(r16_10 EUA/Bósnia) × W(r16_9 Bélgica/Senegal)
  {
    id: "oitavas_4",
    round: "oitavas",
    home: "",
    away: "",
    homeLabel: "Vencedor Estados Unidos/Bósnia",
    awayLabel: "Vencedor Bélgica/Senegal",
    date: "06/07 21h",
    kickoff: brt("2026-07-06", 21, 0),
    dependsOn: { home: "r16_10", away: "r16_9" },
  },
  // Oitavas 5: W(r16_2 Brasil/Japão) × W(r16_5 Costa do Marfim/Noruega)
  {
    id: "oitavas_5",
    round: "oitavas",
    home: "",
    away: "",
    homeLabel: "Vencedor Brasil/Japão",
    awayLabel: "Vencedor Costa do Marfim/Noruega",
    date: "05/07 17h",
    kickoff: brt("2026-07-05", 17, 0),
    dependsOn: { home: "r16_2", away: "r16_5" },
  },
  // Oitavas 6: W(r16_7 México/Equador) × W(r16_8 Inglaterra/RD Congo)
  {
    id: "oitavas_6",
    round: "oitavas",
    home: "",
    away: "",
    homeLabel: "Vencedor México/Equador",
    awayLabel: "Vencedor Inglaterra/RD Congo",
    date: "05/07 21h",
    kickoff: brt("2026-07-05", 21, 0),
    dependsOn: { home: "r16_7", away: "r16_8" },
  },
  // Oitavas 7: W(r16_15 Argentina/Cabo Verde) × W(r16_14 Austrália/Egito)
  {
    id: "oitavas_7",
    round: "oitavas",
    home: "",
    away: "",
    homeLabel: "Vencedor Argentina/Cabo Verde",
    awayLabel: "Vencedor Austrália/Egito",
    date: "07/07 13h",
    kickoff: brt("2026-07-07", 13, 0),
    dependsOn: { home: "r16_15", away: "r16_14" },
  },
  // Oitavas 8: W(r16_13 Suíça/Argélia) × W(r16_16 Colômbia/Gana)
  {
    id: "oitavas_8",
    round: "oitavas",
    home: "",
    away: "",
    homeLabel: "Vencedor Suíça/Argélia",
    awayLabel: "Vencedor Colômbia/Gana",
    date: "07/07 17h",
    kickoff: brt("2026-07-07", 17, 0),
    dependsOn: { home: "r16_13", away: "r16_16" },
  },

  // ── QUARTAS DE FINAL ─────────────────────────────────────────────────────
  {
    id: "quartas_1",
    round: "quartas",
    home: "",
    away: "",
    homeLabel: "Vencedor Oitavas 1",
    awayLabel: "Vencedor Oitavas 2",
    date: "09/07 17h",
    kickoff: brt("2026-07-09", 17, 0),
    dependsOn: { home: "oitavas_1", away: "oitavas_2" },
  },
  {
    id: "quartas_2",
    round: "quartas",
    home: "",
    away: "",
    homeLabel: "Vencedor Oitavas 3",
    awayLabel: "Vencedor Oitavas 4",
    date: "10/07 16h",
    kickoff: brt("2026-07-10", 16, 0),
    dependsOn: { home: "oitavas_3", away: "oitavas_4" },
  },
  {
    id: "quartas_3",
    round: "quartas",
    home: "",
    away: "",
    homeLabel: "Vencedor Oitavas 5",
    awayLabel: "Vencedor Oitavas 6",
    date: "11/07 18h",
    kickoff: brt("2026-07-11", 18, 0),
    dependsOn: { home: "oitavas_5", away: "oitavas_6" },
  },
  {
    id: "quartas_4",
    round: "quartas",
    home: "",
    away: "",
    homeLabel: "Vencedor Oitavas 7",
    awayLabel: "Vencedor Oitavas 8",
    date: "11/07 22h",
    kickoff: brt("2026-07-11", 22, 0),
    dependsOn: { home: "oitavas_7", away: "oitavas_8" },
  },

  // ── SEMIFINAIS ────────────────────────────────────────────────────────────
  {
    id: "semi_1",
    round: "semi",
    home: "",
    away: "",
    homeLabel: "Vencedor Quartas 1",
    awayLabel: "Vencedor Quartas 2",
    date: "14/07 16h",
    kickoff: brt("2026-07-14", 16, 0),
    dependsOn: { home: "quartas_1", away: "quartas_2" },
  },
  {
    id: "semi_2",
    round: "semi",
    home: "",
    away: "",
    homeLabel: "Vencedor Quartas 3",
    awayLabel: "Vencedor Quartas 4",
    date: "15/07 16h",
    kickoff: brt("2026-07-15", 16, 0),
    dependsOn: { home: "quartas_3", away: "quartas_4" },
  },

  // ── TERCEIRO LUGAR ────────────────────────────────────────────────────────
  {
    id: "terceiro",
    round: "terceiro",
    home: "",
    away: "",
    homeLabel: "Perdedor Semi 1",
    awayLabel: "Perdedor Semi 2",
    date: "18/07 18h",
    kickoff: brt("2026-07-18", 18, 0),
    dependsOn: { home: "semi_1", away: "semi_2" },
  },

  // ── FINAL ─────────────────────────────────────────────────────────────────
  {
    id: "final",
    round: "final",
    home: "",
    away: "",
    homeLabel: "Vencedor Semi 1",
    awayLabel: "Vencedor Semi 2",
    date: "19/07 16h",
    kickoff: brt("2026-07-19", 16, 0),
    dependsOn: { home: "semi_1", away: "semi_2" },
  },
];

export const MATCHES_BY_ID: Record<string, Match> = Object.fromEntries(
  MATCHES.map((m) => [m.id, m])
);

export const ROUND_ORDER: Round[] = [
  "r16",
  "oitavas",
  "quartas",
  "semi",
  "terceiro",
  "final",
];

export const ROUND_LABELS: Record<Round, string> = {
  r16: "Segunda Fase",
  oitavas: "Oitavas de Final",
  quartas: "Quartas de Final",
  semi: "Semifinais",
  terceiro: "3º Lugar",
  final: "Final",
};

export function getMatchesByRound(round: Round): Match[] {
  return MATCHES.filter((m) => m.round === round);
}

// Given a bet map (matchId -> {home, away winner label}), resolve dynamic labels
// for knockout matches based on prior bets
export function resolveMatchLabels(
  match: Match,
  userBets: Map<string, { homeScore: number; awayScore: number }>
): { homeLabel: string; awayLabel: string } {
  if (!match.dependsOn) {
    return { homeLabel: match.homeLabel, awayLabel: match.awayLabel };
  }

  const homeParent = MATCHES_BY_ID[match.dependsOn.home];
  const awayParent = MATCHES_BY_ID[match.dependsOn.away];

  function resolveWinner(parentMatch: Match): string {
    if (!parentMatch) return "A definir";
    const bet = userBets.get(parentMatch.id);
    if (!bet) return resolveMatchLabels(parentMatch, userBets).homeLabel + "/" + resolveMatchLabels(parentMatch, userBets).awayLabel;
    const winner = bet.homeScore >= bet.awayScore ? "home" : "away";
    const labels = resolveMatchLabels(parentMatch, userBets);
    return winner === "home" ? labels.homeLabel : labels.awayLabel;
  }

  // For "terceiro", reverse winner (it's the loser)
  if (match.round === "terceiro") {
    function resolveLoser(parentMatch: Match): string {
      if (!parentMatch) return "A definir";
      const bet = userBets.get(parentMatch.id);
      if (!bet) return "A definir";
      const loser = bet.homeScore >= bet.awayScore ? "away" : "home";
      const labels = resolveMatchLabels(parentMatch, userBets);
      return loser === "home" ? labels.homeLabel : labels.awayLabel;
    }
    return {
      homeLabel: resolveLoser(homeParent),
      awayLabel: resolveLoser(awayParent),
    };
  }

  return {
    homeLabel: resolveWinner(homeParent),
    awayLabel: resolveWinner(awayParent),
  };
}

export function getTeamFlagFromLabel(label: string): string {
  const code = TEAM_FLAGS[label];
  if (!code) return "";
  return `https://flagcdn.com/w80/${code}.png`;
}
