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
      <header className="sticky top-0 z-40 bg-[var(--bg-mid)]/97 backdrop-blur-md">
        <div className="color-strip" />
        <div className="max-w-lg mx-auto px-5 py-3.5 flex items-center gap-3">
          <Link href="/placar" className="w-9 h-9 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors rounded-full hover:bg-white/6">
            <ArrowLeft size={18} />
          </Link>
          {profileUser.photoUrl ? (
            <img src={profileUser.photoUrl} alt={profileUser.displayName} className="w-9 h-9 rounded-full object-cover border-2 border-[var(--primary)]/30 flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center font-black text-sm flex-shrink-0">
              {profileUser.displayName[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-[15px] leading-none truncate">{profileUser.displayName}</p>
            <p className="text-white/30 text-xs mt-0.5">palpites da Copa 2026</p>
          </div>
          {scoreData && (
            <div className="text-right flex-shrink-0">
              <div className="text-white font-black text-2xl leading-none">{scoreData.totalPoints}</div>
              <div className="text-white/30 text-[10px]">pts</div>
            </div>
          )}
        </div>
        <div className="border-b border-white/5" />
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 pb-8">

        {/* Stats card */}
        {scoreData && (
          <div className="bg-[var(--card)] border border-white/8 rounded-2xl overflow-hidden mb-5">
            <div className="grid grid-cols-3 divide-x divide-white/5">
              <div className="flex flex-col items-center py-4">
                <div className="text-white font-black text-xl">{scoreData.betsCount}</div>
                <div className="text-white/30 text-[10px] mt-0.5">Palpites</div>
              </div>
              <div className="flex flex-col items-center py-4">
                <div className="text-[var(--secondary)] font-black text-xl">{scoreData.exactScores}</div>
                <div className="text-white/30 text-[10px] mt-0.5">Exatos</div>
              </div>
              <div className="flex flex-col items-center py-4">
                <div className="text-[var(--primary)] font-black text-xl">{scoreData.totalPoints}</div>
                <div className="text-white/30 text-[10px] mt-0.5">Pontos</div>
              </div>
            </div>

            {predictedChampion && predictedChampion !== "A definir" && (
              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-center gap-2">
                <Trophy size={13} className="text-[var(--secondary)] flex-shrink-0" />
                <span className="text-white/50 text-xs">
                  Campeão: <span className="text-[var(--secondary)] font-black">{predictedChampion}</span>
                </span>
                {getFlagUrl(predictedChampion) && (
                  <img src={getFlagUrl(predictedChampion)} alt={predictedChampion} className="flag-img w-8 h-[21px]" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Round tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 mb-5">
          {ROUND_ORDER.map((round) => {
            const hasBets = bets.some((b) => MATCHES.find((m) => m.id === b.matchId && m.round === round));
            return (
              <button
                key={round}
                onClick={() => setActiveRound(round)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold transition-all whitespace-nowrap",
                  activeRound === round
                    ? "bg-[var(--primary)] text-white shadow-[0_4px_12px_rgba(0,156,59,0.35)]"
                    : hasBets
                    ? "bg-white/5 text-white/50 border border-white/10"
                    : "bg-white/3 text-white/20 border border-white/5"
                )}
              >
                {TAB_LABELS[round]}
              </button>
            );
          })}
        </div>

        {/* Match list */}
        <div className="flex flex-col gap-3">
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
                  "bg-[var(--card)] border rounded-2xl overflow-hidden",
                  bet ? "border-[var(--primary)]/30" : "border-white/6"
                )}
              >
                {/* Match row */}
                <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                  {/* Home */}
                  <div className="flex-1 min-w-0">
                    {homeFlagUrl && <img src={homeFlagUrl} alt={resolved.homeLabel} className="flag-img w-12 h-[32px] mb-2.5" />}
                    <p className="text-[14px] font-black text-white leading-snug break-words">{resolved.homeLabel}</p>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {bet ? (
                      <>
                        <div className="w-14 h-14 flex items-center justify-center rounded-2xl text-2xl font-black text-white border border-[var(--primary)]/35 bg-[var(--primary)]/8">
                          {bet.homeScore}
                        </div>
                        <span className="text-white/20 font-bold">×</span>
                        <div className="w-14 h-14 flex items-center justify-center rounded-2xl text-2xl font-black text-white border border-[var(--primary)]/35 bg-[var(--primary)]/8">
                          {bet.awayScore}
                        </div>
                      </>
                    ) : (
                      <div className="text-white/20 text-xs px-3 text-center leading-snug">
                        sem<br/>palpite
                      </div>
                    )}
                  </div>

                  {/* Away */}
                  <div className="flex-1 min-w-0 flex flex-col items-end">
                    {awayFlagUrl && <img src={awayFlagUrl} alt={resolved.awayLabel} className="flag-img w-12 h-[32px] mb-2.5" />}
                    <p className="text-[14px] font-black text-white leading-snug text-right break-words">{resolved.awayLabel}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between px-5 pb-4">
                  <span className="text-white/20 text-[11px]">{match.date}</span>
                  {locked && <span className="text-white/20 text-[11px]">🔒 encerrado</span>}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Points breakdown */}
        {scoreData && scoreData.totalPoints > 0 && (
          <div className="mt-5 bg-[var(--card)] border border-white/6 rounded-2xl p-4">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">Pontos por fase</p>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(scoreData.pointsByRound) as [string, number][])
                .filter(([, pts]) => pts > 0)
                .map(([round, pts]) => (
                  <span key={round} className="text-[11px] text-white/50 bg-white/5 border border-white/8 px-3 py-1.5 rounded-full font-semibold">
                    {ROUND_LABELS[round as keyof typeof ROUND_LABELS]}: <span className="text-white font-black">{pts}</span>
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
