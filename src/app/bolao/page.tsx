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
        <header className="sticky top-0 z-40 bg-[var(--bg-mid)]/97 backdrop-blur-md">
          <div className="color-strip" />
          <div className="max-w-lg mx-auto px-5 py-3.5 flex items-center gap-3">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.displayName}
                className="w-9 h-9 rounded-full object-cover border-2 border-[var(--primary)]/40 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-sm font-black flex-shrink-0">
                {user?.displayName?.[0]}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-[15px] leading-none truncate">{user?.displayName}</p>
              <p className="text-white/35 text-xs mt-0.5">{totalBets} de {totalMatches} palpites</p>
            </div>

            <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors rounded-full hover:bg-white/6">
              <LogOut size={16} />
            </button>
          </div>
          <div className="border-b border-white/5" />
        </header>
      }
    >
      <div className="max-w-lg mx-auto">

        {/* Hero card */}
        <div className="relative mx-4 mt-5 mb-5 rounded-2xl overflow-hidden border border-white/8">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 via-[var(--card)] to-[var(--accent)]/25" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--secondary)]/40 to-transparent" />
          <div className="relative px-5 py-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.12em] text-white/30 uppercase">Fase Eliminatória</p>
                <p className="text-white font-black text-2xl leading-tight mt-0.5">
                  Copa <span className="text-[var(--secondary)]">2026</span>
                </p>
                <p className="text-white/25 text-xs mt-1">🇧🇷 Brasil · EUA · Canadá · México</p>
              </div>
              <div className="bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 rounded-2xl px-4 py-2.5 text-center min-w-[60px]">
                <div className="text-[var(--secondary)] font-black text-3xl leading-none">{totalBets}</div>
                <div className="text-white/30 text-[10px] mt-0.5">/ {totalMatches}</div>
              </div>
            </div>

            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-white/25 text-[10px] mt-1.5">{progress}% dos palpites apostados</p>
          </div>
        </div>

        {/* Round tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-5 -mx-0 px-4">
          {ROUND_ORDER.map((round) => {
            const done = roundBetCount(round) === roundMatchCount(round);
            const active = activeRound === round;
            return (
              <button
                key={round}
                onClick={() => switchRound(round)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold transition-all whitespace-nowrap",
                  active
                    ? "bg-[var(--primary)] text-white shadow-[0_4px_12px_rgba(0,156,59,0.35)]"
                    : done
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/25"
                    : "bg-white/5 text-white/35 border border-white/8"
                )}
              >
                {done && !active ? "✓ " : ""}{TAB_LABELS[round]}
              </button>
            );
          })}
        </div>

        {/* Round header */}
        <div className="flex items-end justify-between px-4 mb-4">
          <div>
            <h2 className="text-white font-black text-xl leading-none">{TAB_LABELS[activeRound]}</h2>
            <p className="text-white/30 text-xs mt-1.5">
              {roundBetCount(activeRound)} de {roundMatchCount(activeRound)} palpites
            </p>
          </div>
          {activeRound !== "r16" && (
            <p className="text-white/25 text-[10px] text-right max-w-[130px] leading-snug">
              Times resolvidos pelos seus palpites
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
            className="flex flex-col gap-3 px-4 pb-4"
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
            className="mx-4 mt-1 mb-2 bg-[var(--primary)]/8 border border-[var(--primary)]/20 rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-[var(--primary)] font-black text-sm">Fase completa! 🎉</p>
              <p className="text-white/35 text-xs mt-0.5">Avance para a próxima fase</p>
            </div>
            <button
              onClick={() => {
                const nextRound = ROUND_ORDER[ROUND_ORDER.indexOf(activeRound) + 1];
                if (nextRound) switchRound(nextRound);
              }}
              className="bg-[var(--primary)] text-white rounded-full px-4 py-2.5 text-xs font-black flex items-center gap-1 shadow-[0_4px_12px_rgba(0,156,59,0.3)]"
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
            className="mx-4 mt-1 mb-2 bg-[var(--card)] border border-[var(--primary)]/30 rounded-2xl p-6 text-center"
          >
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-white font-black text-base">Simulada completa!</p>
            <p className="text-white/40 text-sm mt-1">Todos os {totalMatches} palpites feitos.</p>
            <button
              onClick={() => router.push("/placar")}
              className="mt-4 bg-[var(--secondary)] text-[#050D1A] font-black px-6 py-3 rounded-full text-sm flex items-center gap-2 mx-auto shadow-[0_4px_14px_rgba(255,223,0,0.25)]"
            >
              <Trophy size={14} /> Ver Placar
            </button>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
