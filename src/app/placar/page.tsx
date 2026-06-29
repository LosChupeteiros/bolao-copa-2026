"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, RefreshCw } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import MobileHeader from "@/components/layout/MobileHeader";
import type { UserScore } from "@/lib/types";
import { ROUND_LABELS } from "@/lib/matches";
import { cn } from "@/lib/utils";

interface CurrentUser { id: string; name: string; displayName: string; }

const PODIUM_BG = [
  "bg-gradient-to-r from-[rgba(255,215,0,0.11)] to-transparent border-[rgba(255,215,0,0.24)]",
  "bg-gradient-to-r from-[rgba(184,196,208,0.09)] to-transparent border-[rgba(184,196,208,0.20)]",
  "bg-gradient-to-r from-[rgba(205,139,74,0.09)] to-transparent border-[rgba(205,139,74,0.20)]",
];
const PRIZES = [
  { place: "1", prize: "R$ 300", label: "Campeão", color: "var(--gold)" },
  { place: "2", prize: "R$ 200", label: "Vice", color: "var(--silver)" },
  { place: "3", prize: "R$ 100", label: "Terceiro", color: "var(--bronze)" },
];
const PRIZE_COLORS = PRIZES.map((p) => p.color);

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
    } finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { void loadData(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-copa flex items-center justify-center">
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-5xl">🏆</motion.div>
    </div>
  );

  return (
    <AppShell
      header={
        <MobileHeader
          title="Placar Geral"
          subtitle="Copa do Mundo 2026"
          trailing={
            <button
              onClick={() => { setRefreshing(true); void loadData(); }}
              disabled={refreshing}
              className="icon-button"
              aria-label="Atualizar placar"
            >
              <RefreshCw size={17} className={cn(refreshing && "animate-spin")} />
            </button>
          }
        />
      }
    >
      <div className="max-w-lg mx-auto px-4 pt-5 pb-4">

        {/* Prize banner */}
        <div className="mb-6 soft-panel overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/7">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--secondary)]/12 text-[var(--secondary)]">
              <Award size={21} />
            </div>
            <div className="min-w-0">
              <p className="text-white font-black leading-none">Premiação</p>
              <p className="mt-1 text-[12px] text-[var(--text-sub)]">
                Ranking final do bolão
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-3.5">
            {PRIZES.map(({ place, prize, label, color }) => (
              <div key={place} className="flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-white/4 py-3 pl-4 pr-7">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-black"
                    style={{ color, background: "rgba(255,255,255,0.06)" }}
                  >
                    {place}º
                  </div>
                  <p className="truncate text-sm font-black text-white">{label}</p>
                </div>
                <p className="mr-1 shrink-0 text-[17px] font-black leading-none" style={{ color }}>{prize}</p>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <div className="rounded-2xl border border-white/7 bg-black/16 px-3 py-2 text-center text-[11px] text-[var(--text-sub)]">
              Vencedor 10 pts · Exato 20 pts · Campeão +50 pts
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {scores.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-[var(--text-sub)] text-sm font-semibold">Ninguém apostou ainda</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {scores.map((score, idx) => {
              const isMe = score.user.id === currentUser?.id;
              const isTop3 = idx < 3;
              const cardClass = isTop3
                ? PODIUM_BG[idx]
                : isMe
                ? "bg-[var(--primary)]/6 border-[var(--primary)]/25"
                : "bg-[var(--card)] border-[var(--card-border)]";

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
                      "grid grid-cols-[2rem_3rem_minmax(0,1fr)_4.5rem] items-center gap-3 overflow-hidden rounded-2xl border px-4 py-4 pr-8 transition-all active:scale-[0.98]",
                      cardClass
                    )}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {isTop3
                        ? <span
                            className="mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-black"
                            style={{ color: PRIZE_COLORS[idx], background: "rgba(255,255,255,0.06)" }}
                          >
                            {idx + 1}º
                          </span>
                        : <span className="text-[var(--text-dim)] text-sm font-black">{idx + 1}</span>
                      }
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {score.user.photoUrl
                        ? <img
                            src={score.user.photoUrl}
                            alt={score.user.displayName}
                            className={cn(
                              "w-12 h-12 rounded-full object-cover border-2",
                              isMe ? "border-[var(--primary)]/50 ring-brasil" : "border-white/10"
                            )}
                          />
                        : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center font-black text-base">
                            {score.user.displayName[0]}
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-black text-[14px] truncate">
                          {score.user.displayName}
                        </span>
                        {isMe && (
                          <span className="text-[9px] bg-[var(--primary)]/15 text-[var(--primary)] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                            você
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[var(--text-dim)] text-[11px]">{score.betsCount} palpites</span>
                        {score.exactScores > 0 && (
                          <span className="text-[10px] bg-[var(--secondary)]/10 text-[var(--secondary)] px-1.5 py-0.5 rounded-full font-bold">
                            🎯 {score.exactScores}
                          </span>
                        )}
                        {score.championBonus > 0 && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
                            🏆 +50
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="mr-3 justify-self-end rounded-2xl bg-black/18 px-3 py-2 text-center">
                      <div
                        className="whitespace-nowrap text-[14px] font-black leading-none tabular-nums"
                        style={{ color: isTop3 ? PRIZE_COLORS[idx] : isMe ? "var(--primary)" : "white" }}
                      >
                        {score.totalPoints} pts
                      </div>
                    </div>
                  </Link>

                  {/* Points breakdown */}
                  {score.totalPoints > 0 && (
                    <div className="flex gap-1.5 flex-wrap px-2 mt-2">
                      {(Object.entries(score.pointsByRound) as [string, number][])
                        .filter(([, pts]) => pts > 0)
                        .map(([round, pts]) => (
                          <span
                            key={round}
                            className="text-[10px] text-[var(--text-dim)] bg-white/4 border border-white/6 px-2.5 py-1 rounded-full"
                          >
                            {ROUND_LABELS[round as keyof typeof ROUND_LABELS]}:{" "}
                            <span className="text-white/60 font-bold">{pts}</span>
                          </span>
                        ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="text-center text-[var(--text-dim)] text-[11px] mt-7 mb-1">
          Toque para ver os palpites de cada jogador
        </p>
      </div>
    </AppShell>
  );
}
