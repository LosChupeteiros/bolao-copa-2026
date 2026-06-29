import type { Bet, MatchResult, ResultsMap, Round, UserScore } from "./types";
import type { User } from "./types";
import { MATCHES, MATCHES_BY_ID } from "./matches";

const POINTS_EXACT = 20;
const POINTS_WINNER = 10;
const POINTS_CHAMPION = 50;

function getBetWinner(bet: Bet): "home" | "away" {
  return bet.homeScore >= bet.awayScore ? "home" : "away";
}

export function calcBetPoints(bet: Bet, result: MatchResult): number {
  const exact =
    bet.homeScore === result.homeScore && bet.awayScore === result.awayScore;
  if (exact) return POINTS_EXACT;
  if (getBetWinner(bet) === result.winner) return POINTS_WINNER;
  return 0;
}

// Returns the team label the user predicted as champion (winner of the final)
export function getPredictedChampion(
  userBets: Bet[],
  results: ResultsMap
): string | null {
  const finalBet = userBets.find((b) => b.matchId === "final");
  if (!finalBet) return null;

  // Resolve the actual teams in the final based on user bets
  function resolveWinnerLabel(matchId: string, side: "home" | "away"): string {
    const match = MATCHES_BY_ID[matchId];
    if (!match) return "";
    if (!match.dependsOn) {
      return side === "home" ? match.homeLabel : match.awayLabel;
    }
    const parentId = side === "home" ? match.dependsOn.home : match.dependsOn.away;
    const parentBet = userBets.find((b) => b.matchId === parentId);
    if (!parentBet) return "";
    const parentWinner: "home" | "away" =
      parentBet.homeScore >= parentBet.awayScore ? "home" : "away";
    return resolveWinnerLabel(parentId, parentWinner);
  }

  const predictedWinner: "home" | "away" =
    finalBet.homeScore >= finalBet.awayScore ? "home" : "away";

  return resolveWinnerLabel("final", predictedWinner);
}

// Returns the actual champion label based on real results
export function getActualChampion(results: ResultsMap): string | null {
  const finalResult = results["final"];
  if (!finalResult) return null;

  function resolveActualWinner(matchId: string, side: "home" | "away"): string {
    const match = MATCHES_BY_ID[matchId];
    if (!match) return "";
    if (!match.dependsOn) {
      return side === "home" ? match.homeLabel : match.awayLabel;
    }
    const parentId = side === "home" ? match.dependsOn.home : match.dependsOn.away;
    const parentResult = results[parentId];
    if (!parentResult) return "";
    return resolveActualWinner(parentId, parentResult.winner);
  }

  return resolveActualWinner("final", finalResult.winner);
}

export function calcUserScore(
  user: Omit<User, "passwordHash">,
  userBets: Bet[],
  results: ResultsMap
): UserScore {
  const pointsByRound: Record<Round, number> = {
    r16: 0,
    oitavas: 0,
    quartas: 0,
    semi: 0,
    terceiro: 0,
    final: 0,
  };

  let correctWinners = 0;
  let exactScores = 0;

  for (const bet of userBets) {
    const result = results[bet.matchId];
    if (!result) continue;

    const pts = calcBetPoints(bet, result);
    const match = MATCHES_BY_ID[bet.matchId];
    if (match) {
      pointsByRound[match.round] += pts;
    }
    if (pts === POINTS_EXACT) exactScores++;
    if (pts >= POINTS_WINNER) correctWinners++;
  }

  // Champion bonus
  const predictedChampion = getPredictedChampion(userBets, results);
  const actualChampion = getActualChampion(results);
  const championBonus =
    predictedChampion && actualChampion && predictedChampion === actualChampion
      ? POINTS_CHAMPION
      : 0;

  const totalPoints =
    Object.values(pointsByRound).reduce((a, b) => a + b, 0) + championBonus;

  return {
    user,
    totalPoints,
    pointsByRound,
    betsCount: userBets.length,
    correctWinners,
    exactScores,
    championBonus,
  };
}

export { POINTS_EXACT, POINTS_WINNER, POINTS_CHAMPION };
