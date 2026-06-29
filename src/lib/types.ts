export interface User {
  id: string;
  name: string; // login slug sem espaço, ex: "Marcelo"
  displayName: string; // nome de exibição
  photoUrl: string; // base64 ou URL
  passwordHash: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Bet {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  matchId: string;
  homeScore: number;
  awayScore: number;
  winner: "home" | "away"; // copa eliminatória não tem empate (vai pra pênaltis)
  confirmedAt: string;
}

export type ResultsMap = Record<string, MatchResult>;

export type Round = "r16" | "oitavas" | "quartas" | "semi" | "terceiro" | "final";

export interface Match {
  id: string;
  round: Round;
  home: string; // country code, ex: "br"
  away: string;
  homeLabel: string; // ex: "Brasil"
  awayLabel: string; // ex: "Japão"
  date: string; // data legível
  kickoff: number; // timestamp ms UTC para lock
  dependsOn?: {
    home: string; // matchId cujo vencedor joga como mandante
    away: string; // matchId cujo vencedor joga como visitante
  };
}

export interface UserScore {
  user: Omit<User, "passwordHash">;
  totalPoints: number;
  pointsByRound: Record<Round, number>;
  betsCount: number;
  correctWinners: number;
  exactScores: number;
  championBonus: number;
}

export interface SessionPayload {
  userId: string;
  name: string;
}
