"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Trophy, ChevronRight } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import BetCard from "@/components/bolao/BetCard";
import { MATCHES, ROUND_ORDER, resolveMatchLabels } from "@/lib/matches";
import type { Bet, Round } from "@/lib/types";
import { cn } from "@/lib/utils";

const TAB_LABELS: Record<Round, string> = {
  r16: "2ª Fase",
  oitavas: "Oitavas",
  quartas: "Quartas",
  semi: "Semis",
  terceiro: "3° Lugar",
  final: "Final",
};

interface CurrentUser {
  id: string;
  name: string;
  displayName: string;
  photoUrl: string;
  isAdmin: boolean;
}

export default function BolaoPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [activeRound, setActiveRound] = useState<Round>("r16");
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json() as { user: CurrentUser | null };
        if (!meData.user) { router.push("/login"); return; }
        setUser(meData.user);

        const betsRes = await fetch(`/api/bets?userId=${meData.user.id}`);
        const betsData = await betsRes.json() as { bets: Bet[] };
        setBets(betsData.bets || []);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [router]);

  const betsMap = new Map(bets.map((b) => [b.matchId, b]));
  const matchesForRound = MATCHES.filter((m) => m.round === activeRound);
  const totalBets = bets.length;
  const totalMatches = MATCHES.length;
  const progress = Math.round((totalBets / totalMatches) * 100);

  const roundBetCount = (round: Round) =>
    bets.filter((b) => MATCHES.find((m) => m.id === b.matchId && m.round === round)).length;
  const roundMatchCount = (round: Round) => MATCHES.filter((m) => m.round === round).length;

  async function handleSaveBet(matchId: string, homeScore: number, awayScore: number) {
    const res = await fetch("/api/bets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore, awayScore }),
    });
    if (!res.ok) {
      const d = await res.json() as { error?: string };
      throw new Error(d.error || "Erro ao salvar");
    }
    setBets((prev) => {
      const existing = prev.findIndex((b) => b.matchId === matchId);
      const now = new Date().toISOString();
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], homeScore, awayScore, updatedAt: now };
        return next;
      }
      return [...prev, { id: Date.now().toString(), userId: user?.id || "", matchId, homeScore, awayScore, createdAt: now, updatedAt: now }];
    });
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function switchRound(round: Round) {
    const currentIdx = ROUND_ORDER.indexOf(activeRound);
    const nextIdx = ROUND_ORDER.indexOf(round);
    setDirection(nextIdx > currentIdx ? 1 : -1);
    setActiveRound(round);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-copa flex items-center justify-center">
        <div className="text-4xl animate-bounce">⚽</div>
      </div>
    );
  }

  return (
    <AppShell
      header={
        <header className="sticky top-0 z-40 bg-[var(--bg-mid)]/96 backdrop-blur-sm border-b border-white/5">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            {/* Avatar */}
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user?.displayName?.[0]}
              </div>
            )}

            {/* Name + progress */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-none truncate">{user?.displayName}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--primary)] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-[10px] text-[var(--text-dim)] flex-shrink-0">{totalBets}/{totalMatches}</span>
              </div>
            </div>

            <button onClick={handleLogout} className="text-white/25 hover:text-white/60 transition-colors p-1 flex-shrink-0">
              <LogOut size={16} />
            </button>
          </div>
        </header>
      }
    >
      <div className="max-w-lg mx-auto px-4 pt-3">

        {/* Round tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide mb-4 -mx-4 px-4">
          {ROUND_ORDER.map((round) => {
            const done = roundBetCount(round) === roundMatchCount(round);
            const active = activeRound === round;
            return (
              <button
                key={round}
                onClick={() => switchRound(round)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap",
                  active
                    ? "bg-[var(--primary)] text-white"
                    : done
                    ? "bg-[var(--primary)]/12 text-[var(--primary)] border border-[var(--primary)]/20"
                    : "bg-white/4 text-white/40 border border-white/6"
                )}
              >
                {TAB_LABELS[round]}{done && !active ? " ✓" : ""}
              </button>
            );
          })}
        </div>

        {/* Round header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-white font-bold text-base">{TAB_LABELS[activeRound]}</h2>
            <p className="text-[var(--text-dim)] text-[11px] mt-0.5">
              {roundBetCount(activeRound)}/{roundMatchCount(activeRound)} palpites
            </p>
          </div>
          {activeRound !== "r16" && (
            <p className="text-[var(--text-dim)] text-[10px] text-right max-w-[140px] leading-snug">
              Times resolvidos pelos seus palpites anteriores
            </p>
          )}
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRound}
            initial={{ x: direction * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -40, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col gap-2.5"
          >
            {matchesForRound.map((match, idx) => {
              const resolved = resolveMatchLabels(match, betsMap);
              const bet = betsMap.get(match.id);
              return (
                <BetCard
                  key={match.id}
                  match={match}
                  homeLabel={resolved.homeLabel}
                  awayLabel={resolved.awayLabel}
                  existingBet={bet}
                  onConfirm={(h, a) => handleSaveBet(match.id, h, a)}
                  totalMatches={matchesForRound.length}
                  currentIndex={idx}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Phase complete nudge */}
        {roundBetCount(activeRound) === roundMatchCount(activeRound) && activeRound !== "final" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 mb-2 bg-[var(--primary)]/8 border border-[var(--primary)]/20 rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-[var(--primary)] font-bold text-sm">Fase completa!</p>
              <p className="text-white/35 text-xs mt-0.5">Avance para a próxima</p>
            </div>
            <button
              onClick={() => {
                const nextRound = ROUND_ORDER[ROUND_ORDER.indexOf(activeRound) + 1];
                if (nextRound) switchRound(nextRound);
              }}
              className="bg-[var(--primary)] text-white rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1"
            >
              Próxima <ChevronRight size={13} />
            </button>
          </motion.div>
        )}

        {/* All done */}
        {totalBets === totalMatches && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 mb-2 bg-[var(--card)] border border-[var(--primary)]/30 rounded-xl p-5 text-center"
          >
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-white font-bold text-sm">Simulada completa!</p>
            <p className="text-white/40 text-xs mt-1">Todos os {totalMatches} palpites feitos.</p>
            <button
              onClick={() => router.push("/placar")}
              className="mt-3 bg-[var(--secondary)] text-[#050D1A] font-bold px-5 py-2 rounded-lg text-xs flex items-center gap-2 mx-auto"
            >
              <Trophy size={13} /> Ver Placar
            </button>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
