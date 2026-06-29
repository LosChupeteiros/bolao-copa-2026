"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { MATCHES, ROUND_ORDER, ROUND_LABELS, resolveMatchLabels, getFlagUrl } from "@/lib/matches";
import type { Bet, Round } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isMatchLocked } from "@/lib/utils";

interface ProfileUser { id: string; name: string; displayName: string; photoUrl: string; }
interface UserScoreData {
  totalPoints: number;
  pointsByRound: Record<Round, number>;
  betsCount: number;
  exactScores: number;
  championBonus: number;
}

const TAB_LABELS: Record<Round, string> = {
  r16: "2ª Fase", oitavas: "Oitavas", quartas: "Quartas",
  semi: "Semis", terceiro: "3° Lugar", final: "Final",
};

export default function PerfilPage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [scoreData, setScoreData] = useState<UserScoreData | null>(null);
  const [activeRound, setActiveRound] = useState<Round>("r16");
  const [loading, setLoading] = useState(true);
  const [predictedChampion, setPredictedChampion] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, betsRes, scoresRes] = await Promise.all([
          fetch("/api/users"),
          fetch(`/api/bets?userId=${userId}`),
          fetch("/api/scores"),
        ]);
        const usersData = await usersRes.json() as { users: ProfileUser[] };
        const user = usersData.users.find((u) => u.id === userId);
        if (!user) { router.push("/placar"); return; }
        setProfileUser(user);

        const betsData = await betsRes.json() as { bets: Bet[] };
        setBets(betsData.bets || []);

        const scoresData = await scoresRes.json() as {
          scores: Array<{ user: { id: string }; totalPoints: number; pointsByRound: Record<Round, number>; betsCount: number; exactScores: number; championBonus: number }>;
        };
        const userScore = scoresData.scores.find((s) => s.user.id === userId);
        if (userScore) setScoreData({ totalPoints: userScore.totalPoints, pointsByRound: userScore.pointsByRound, betsCount: userScore.betsCount, exactScores: userScore.exactScores, championBonus: userScore.championBonus });
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [userId, router]);

  const betsMap = new Map(bets.map((b) => [b.matchId, b]));

  useEffect(() => {
    if (bets.length === 0) return;
    function resolveWinner(matchId: string, side: "home" | "away"): string {
      const match = MATCHES.find((m) => m.id === matchId);
      if (!match) return "";
      if (!match.dependsOn) {
        const labels = resolveMatchLabels(match, betsMap);
        return side === "home" ? labels.homeLabel : labels.awayLabel;
      }
      const parentId = side === "home" ? match.dependsOn.home : match.dependsOn.away;
      const parentBet = betsMap.get(parentId);
      if (!parentBet) return "A definir";
      const parentWinner: "home" | "away" = parentBet.homeScore >= parentBet.awayScore ? "home" : "away";
      return resolveWinner(parentId, parentWinner);
    }
    const finalBet = betsMap.get("final");
    if (finalBet) {
      const winner: "home" | "away" = finalBet.homeScore >= finalBet.awayScore ? "home" : "away";
      setPredictedChampion(resolveWinner("final", winner));
    }
  }, [bets]);

  const matchesForRound = MATCHES.filter((m) => m.round === activeRound);

  if (loading) {
    return (
      <div className="min-h-screen bg-copa flex items-center justify-center">
        <div className="text-4xl animate-bounce">⚽</div>
      </div>
    );
  }
  if (!profileUser) return null;

  return (
    <div className="min-h-screen bg-copa">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-mid)]/96 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/placar" className="p-1 text-white/30 hover:text-white/70 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          {profileUser.photoUrl ? (
            <img src={profileUser.photoUrl} alt={profileUser.displayName} className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center font-bold text-xs flex-shrink-0">
              {profileUser.displayName[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-none truncate">{profileUser.displayName}</p>
            <p className="text-white/30 text-[11px] mt-0.5">palpites da copa 2026</p>
          </div>
          {scoreData && (
            <div className="text-right flex-shrink-0">
              <div className="text-white font-black text-xl leading-none">{scoreData.totalPoints}</div>
              <div className="text-white/30 text-[10px]">pts</div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 pb-10">

        {/* Stats */}
        {scoreData && (
          <div className="bg-[var(--card)] border border-white/6 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-3 gap-2 text-center divide-x divide-white/5">
              <div>
                <div className="text-white font-black text-lg">{scoreData.betsCount}</div>
                <div className="text-white/30 text-[10px] mt-0.5">Palpites</div>
              </div>
              <div>
                <div className="text-[var(--secondary)] font-black text-lg">{scoreData.exactScores}</div>
                <div className="text-white/30 text-[10px] mt-0.5">Placares exatos</div>
              </div>
              <div>
                <div className="text-[var(--primary)] font-black text-lg">{scoreData.totalPoints}</div>
                <div className="text-white/30 text-[10px] mt-0.5">Pontos</div>
              </div>
            </div>

            {predictedChampion && predictedChampion !== "A definir" && (
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-2">
                <Trophy size={12} className="text-[var(--secondary)]" />
                <span className="text-white/50 text-xs">
                  Campeão: <span className="text-[var(--secondary)] font-bold">{predictedChampion}</span>
                </span>
                {getFlagUrl(predictedChampion) && (
                  <img src={getFlagUrl(predictedChampion)} alt={predictedChampion} className="flag-img w-7 h-[19px]" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Round tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-4 -mx-4 px-4">
          {ROUND_ORDER.map((round) => {
            const hasBets = bets.some((b) => MATCHES.find((m) => m.id === b.matchId && m.round === round));
            return (
              <button
                key={round}
                onClick={() => setActiveRound(round)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap",
                  activeRound === round
                    ? "bg-[var(--primary)] text-white"
                    : hasBets
                    ? "bg-white/4 text-white/50 border border-white/8"
                    : "bg-white/3 text-white/20 border border-white/4"
                )}
              >
                {TAB_LABELS[round]}
              </button>
            );
          })}
        </div>

        {/* Match list */}
        <div className="flex flex-col gap-2.5">
          {matchesForRound.map((match, idx) => {
            const resolved = resolveMatchLabels(match, betsMap);
            const bet = betsMap.get(match.id);
            const locked = isMatchLocked(match.kickoff);
            const homeFlagUrl = getFlagUrl(resolved.homeLabel);
            const awayFlagUrl = getFlagUrl(resolved.awayLabel);

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  "bg-[var(--card)] border rounded-xl overflow-hidden",
                  bet ? "border-[var(--primary)]/30" : "border-white/5"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                  <span className="text-white/25 text-[11px]">{match.date}</span>
                  {locked && <span className="text-white/25 text-[11px]">🔒 Encerrado</span>}
                </div>

                {/* Match row */}
                <div className="flex items-center gap-3 px-4 py-4">
                  {/* Home */}
                  <div className="flex-1 min-w-0">
                    {homeFlagUrl && <img src={homeFlagUrl} alt={resolved.homeLabel} className="flag-img w-10 h-[27px] mb-2" />}
                    <p className="text-[13px] font-bold text-white leading-snug break-words">{resolved.homeLabel}</p>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {bet ? (
                      <>
                        <div className="w-11 h-11 flex items-center justify-center rounded-lg text-xl font-black text-white border border-[var(--primary)]/30 bg-[var(--primary)]/6">
                          {bet.homeScore}
                        </div>
                        <span className="text-white/20 font-bold">×</span>
                        <div className="w-11 h-11 flex items-center justify-center rounded-lg text-xl font-black text-white border border-[var(--primary)]/30 bg-[var(--primary)]/6">
                          {bet.awayScore}
                        </div>
                      </>
                    ) : (
                      <div className="text-white/20 text-xs px-2 text-center leading-snug">
                        sem<br/>palpite
                      </div>
                    )}
                  </div>

                  {/* Away */}
                  <div className="flex-1 min-w-0 flex flex-col items-end">
                    {awayFlagUrl && <img src={awayFlagUrl} alt={resolved.awayLabel} className="flag-img w-10 h-[27px] mb-2" />}
                    <p className="text-[13px] font-bold text-white leading-snug text-right break-words">{resolved.awayLabel}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
