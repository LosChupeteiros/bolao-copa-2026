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
import MobileHeader from "@/components/layout/MobileHeader";

interface ProfileUser { id: string; name: string; displayName: string; photoUrl: string; }
interface UserScoreData {
  totalPoints: number; pointsByRound: Record<Round, number>;
  betsCount: number; exactScores: number; championBonus: number;
}

const TAB_LABELS: Record<Round, string> = {
  r16: "2ª Fase", oitavas: "Oitavas", quartas: "Quartas",
  semi: "Semis", terceiro: "3º Lugar", final: "Final",
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
          fetch("/api/users"), fetch(`/api/bets?userId=${userId}`), fetch("/api/scores"),
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
        const s = scoresData.scores.find((x) => x.user.id === userId);
        if (s) setScoreData({ totalPoints: s.totalPoints, pointsByRound: s.pointsByRound, betsCount: s.betsCount, exactScores: s.exactScores, championBonus: s.championBonus });
      } finally { setLoading(false); }
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
      const w: "home" | "away" = parentBet.homeScore >= parentBet.awayScore ? "home" : "away";
      return resolveWinner(parentId, w);
    }
    const finalBet = betsMap.get("final");
    if (finalBet) {
      const w: "home" | "away" = finalBet.homeScore >= finalBet.awayScore ? "home" : "away";
      setPredictedChampion(resolveWinner("final", w));
    }
  }, [bets]);

  const matchesForRound = MATCHES.filter((m) => m.round === activeRound);

  if (loading) return (
    <div className="min-h-screen bg-copa flex items-center justify-center">
      <div className="text-4xl animate-bounce">⚽</div>
    </div>
  );
  if (!profileUser) return null;

  return (
    <div className="min-h-screen bg-copa pb-10">
      <MobileHeader
        leading={
          <div className="flex items-center gap-2">
            <Link href="/placar" className="icon-button" aria-label="Voltar para o placar">
              <ArrowLeft size={18} />
            </Link>
            {profileUser.photoUrl
              ? <img src={profileUser.photoUrl} alt={profileUser.displayName} className="h-11 w-11 rounded-full object-cover border-2 border-[var(--primary)]/35" />
              : <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center font-black text-sm">{profileUser.displayName[0]}</div>
            }
          </div>
        }
        title={profileUser.displayName}
        subtitle="Palpites da Copa 2026"
        trailing={scoreData && (
          <div className="rounded-2xl border border-white/8 bg-white/5 px-3.5 py-2 text-right">
            <div className="text-white font-black text-2xl leading-none">{scoreData.totalPoints}</div>
            <div className="text-[var(--text-dim)] text-[10px]">pts</div>
          </div>
        )}
      />

      <div className="max-w-lg mx-auto px-4 pt-5">

        {/* Stats */}
        {scoreData && (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden mb-5">
            <div className="grid grid-cols-3 divide-x divide-white/6">
              {[
                { value: scoreData.betsCount, label: "Palpites", color: "text-white" },
                { value: scoreData.exactScores, label: "Exatos", color: "text-[var(--secondary)]" },
                { value: scoreData.totalPoints, label: "Pontos", color: "text-[var(--primary)]" },
              ].map(({ value, label, color }) => (
                <div key={label} className="flex flex-col items-center py-4">
                  <div className={cn("font-black text-xl", color)}>{value}</div>
                  <div className="text-[var(--text-dim)] text-[10px] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            {predictedChampion && predictedChampion !== "A definir" && (
              <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-white/6">
                <Trophy size={12} className="text-[var(--secondary)]" />
                <span className="text-[var(--text-sub)] text-xs">
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
        <div className="-mx-4 mb-5 overflow-x-auto px-4 pb-1 scrollbar-hide">
          <div className="inline-flex min-w-full gap-2 rounded-2xl border border-white/7 bg-black/18 p-2">
          {ROUND_ORDER.map((round) => {
            const hasBets = bets.some((b) => MATCHES.find((m) => m.id === b.matchId && m.round === round));
            const active = activeRound === round;
            return (
              <button key={round} onClick={() => setActiveRound(round)}
                className={cn(
                  "relative flex-shrink-0 rounded-xl px-[1.125rem] py-3 text-[12px] font-black whitespace-nowrap transition-all",
                  active
                    ? "bg-[var(--primary)] text-white shadow-[0_8px_20px_rgba(22,184,98,0.24)]"
                    : hasBets
                    ? "text-[var(--text-sub)] hover:bg-white/6"
                    : "text-[var(--text-dim)] hover:bg-white/4"
                )}
              >
                {TAB_LABELS[round]}
                {hasBets && !active && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--secondary)]/80" />
                )}
              </button>
            );
          })}
          </div>
        </div>

        {/* Match cards */}
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
                  "bg-[var(--card)] border rounded-2xl overflow-hidden",
                  bet ? "border-[var(--primary)]/30" : "border-[var(--card-border)]"
                )}
              >
                <div className={cn("h-[3px]", bet ? "bg-gradient-to-r from-[var(--primary)]/0 via-[var(--primary)]/70 to-[var(--primary)]/0" : "bg-white/3")} />
                <div className="flex items-center gap-3 px-5 pt-4 pb-3">
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    {homeFlagUrl && <img src={homeFlagUrl} alt={resolved.homeLabel} className="flag-img w-12 h-[32px]" />}
                    <p className="text-[13px] font-black text-white leading-snug break-words">{resolved.homeLabel}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {bet ? (
                      <>
                        <div className="w-[3.75rem] h-[3.75rem] flex items-center justify-center rounded-[0.875rem] text-[2rem] font-black bg-black/40 border-2 border-[var(--primary)]/25 text-white">{bet.homeScore}</div>
                        <span className="text-white/15 text-lg font-black">—</span>
                        <div className="w-[3.75rem] h-[3.75rem] flex items-center justify-center rounded-[0.875rem] text-[2rem] font-black bg-black/40 border-2 border-[var(--primary)]/25 text-white">{bet.awayScore}</div>
                      </>
                    ) : (
                      <div className="text-[var(--text-dim)] text-xs px-3 text-center leading-snug">sem<br/>palpite</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col items-end gap-2">
                    {awayFlagUrl && <img src={awayFlagUrl} alt={resolved.awayLabel} className="flag-img w-12 h-[32px]" />}
                    <p className="text-[13px] font-black text-white leading-snug text-right break-words">{resolved.awayLabel}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 pb-4">
                  <span className="text-[var(--text-dim)] text-[10px]">{match.date}</span>
                  {locked && <span className="text-[var(--text-dim)] text-[10px]">🔒 encerrado</span>}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Points breakdown */}
        {scoreData && scoreData.totalPoints > 0 && (
          <div className="mt-5 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-4">
            <p className="text-[var(--text-dim)] text-[10px] font-black uppercase tracking-widest mb-3">Pontos por fase</p>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(scoreData.pointsByRound) as [string, number][])
                .filter(([, pts]) => pts > 0)
                .map(([round, pts]) => (
                  <span key={round} className="text-[11px] text-[var(--text-sub)] bg-white/5 border border-white/8 px-3 py-1.5 rounded-full font-semibold">
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
