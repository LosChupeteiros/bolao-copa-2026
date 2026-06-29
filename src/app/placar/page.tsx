"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import type { UserScore } from "@/lib/types";
import { ROUND_LABELS } from "@/lib/matches";
import { cn } from "@/lib/utils";

interface CurrentUser { id: string; name: string; displayName: string; }

const MEDALS = ["🥇", "🥈", "🥉"];
const PRIZE_LABELS = ["R$ 300", "R$ 200", "R$ 100"];
const PRIZE_COLORS = ["var(--gold)", "var(--silver)", "var(--bronze)"];

export default function PlacarPage() {
  const router = useRouter();
  const [scores, setScores] = useState<UserScore[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const [meRes, scoresRes] = await Promise.all([fetch("/api/auth/me"), fetch("/api/scores")]);
      const meData = await meRes.json() as { user: CurrentUser | null };
      if (!meData.user) { router.push("/login"); return; }
      setCurrentUser(meData.user);
      const scoresData = await scoresRes.json() as { scores: UserScore[] };
      setScores(scoresData.scores || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-copa flex items-center justify-center">
        <div className="text-4xl animate-bounce">🏆</div>
      </div>
    );
  }

  return (
    <AppShell
      header={
        <header className="sticky top-0 z-40 bg-[var(--bg-mid)]/96 backdrop-blur-sm border-b border-white/5">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-base leading-none">Placar Geral</h1>
              <p className="text-white/30 text-[11px] mt-1">Copa do Mundo 2026</p>
            </div>
            <button
              onClick={() => { setRefreshing(true); void loadData(); }}
              disabled={refreshing}
              className="text-white/30 hover:text-white/60 transition-colors p-1.5"
            >
              <RefreshCw size={15} className={cn(refreshing && "animate-spin")} />
            </button>
          </div>
        </header>
      }
    >
      <div className="max-w-lg mx-auto px-4 pt-4">

        {/* Prize banner */}
        <div className="mb-4 bg-[var(--card)] border border-white/6 rounded-xl overflow-hidden">
          {/* Title strip */}
          <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
            <span className="text-[var(--secondary)] text-xs font-bold tracking-widest uppercase">Premiação</span>
          </div>
          {/* Prizes row */}
          <div className="grid grid-cols-3 divide-x divide-white/5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center py-3 gap-0.5">
                <span className="text-xl">{MEDALS[i]}</span>
                <span className="font-black text-sm" style={{ color: PRIZE_COLORS[i] }}>{PRIZE_LABELS[i]}</span>
                <span className="text-white/30 text-[10px]">{i + 1}º lugar</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-white/5">
            <p className="text-white/30 text-[10px] text-center">
              Vencedor: 10 pts · Placar exato: 20 pts · Campeão: +50 pts bônus
            </p>
          </div>
        </div>

        {/* Leaderboard */}
        {scores.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-sm">Ninguém fez palpites ainda</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {scores.map((score, idx) => {
              const isMe = score.user.id === currentUser?.id;
              const isTop3 = idx < 3;

              return (
                <motion.div
                  key={score.user.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link
                    href={`/perfil/${score.user.id}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors",
                      isMe
                        ? "bg-[var(--primary)]/6 border-[var(--primary)]/30"
                        : "bg-[var(--card)] border-[var(--card-border)] active:border-[var(--card-border-hover)]"
                    )}
                  >
                    {/* Rank */}
                    <div className="w-7 flex-shrink-0 text-center">
                      {isTop3 ? (
                        <span className="text-xl leading-none">{MEDALS[idx]}</span>
                      ) : (
                        <span className="text-white/30 text-sm font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Photo */}
                    <div className="relative flex-shrink-0">
                      {score.user.photoUrl ? (
                        <img
                          src={score.user.photoUrl}
                          alt={score.user.displayName}
                          className={cn(
                            "w-11 h-11 rounded-full object-cover border",
                            isMe ? "border-[var(--primary)]/50 ring-brasil" : "border-white/10"
                          )}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[var(--primary)] flex items-center justify-center font-bold text-sm">
                          {score.user.displayName[0]}
                        </div>
                      )}
                    </div>

                    {/* Name + badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-white font-bold text-sm truncate max-w-[140px]">
                          {score.user.displayName}
                        </span>
                        {isMe && (
                          <span className="text-[9px] bg-[var(--primary)]/15 text-[var(--primary)] px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                            você
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-white/30 text-[11px]">{score.betsCount} palpites</span>
                        {score.exactScores > 0 && (
                          <span className="text-[10px] bg-[var(--secondary)]/10 text-[var(--secondary)] px-1.5 py-0.5 rounded font-medium">
                            🎯 {score.exactScores}
                          </span>
                        )}
                        {score.championBonus > 0 && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-medium">
                            🏆 +50
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <div
                        className="text-2xl font-black leading-none"
                        style={{ color: isTop3 ? PRIZE_COLORS[idx] : isMe ? "var(--primary)" : "white" }}
                      >
                        {score.totalPoints}
                      </div>
                      <div className="text-white/30 text-[10px] mt-0.5">pts</div>
                    </div>
                  </Link>

                  {/* Points breakdown — compact */}
                  {score.totalPoints > 0 && (
                    <div className="flex gap-1.5 flex-wrap px-1 mt-1 mb-1">
                      {(Object.entries(score.pointsByRound) as [string, number][])
                        .filter(([, pts]) => pts > 0)
                        .map(([round, pts]) => (
                          <span key={round} className="text-[10px] text-white/25 bg-white/4 px-2 py-0.5 rounded">
                            {ROUND_LABELS[round as keyof typeof ROUND_LABELS]}: {pts}
                          </span>
                        ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="text-center text-white/20 text-[11px] mt-5 mb-2">
          Toque em um jogador para ver os palpites
        </p>
      </div>
    </AppShell>
  );
}
