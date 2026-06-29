"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronRight, Zap } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import BetCard from "@/components/bolao/BetCard";
import { MATCHES, ROUND_ORDER, resolveMatchLabels } from "@/lib/matches";
import type { Bet, Round } from "@/lib/types";
import { cn } from "@/lib/utils";

const TAB_LABELS: Record<Round, string> = {
  r16: "2ª Fase", oitavas: "Oitavas", quartas: "Quartas",
  semi: "Semis", terceiro: "3° Lugar", final: "Final",
};

interface CurrentUser {
  id: string; name: string; displayName: string; photoUrl: string; isAdmin: boolean;
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
      } catch { router.push("/login"); }
      finally { setLoading(false); }
    }
    void init();
  }, [router]);

  const betsMap = new Map(bets.map((b) => [b.matchId, b]));
  const matchesForRound = MATCHES.filter((m) => m.round === activeRound);
  const totalBets = bets.length;
  const totalMatches = MATCHES.length;
  const progress = Math.round((totalBets / totalMatches) * 100);

  const roundBetCount = (r: Round) => bets.filter((b) => MATCHES.find((m) => m.id === b.matchId && m.round === r)).length;
  const roundMatchCount = (r: Round) => MATCHES.filter((m) => m.round === r).length;

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
      const idx = prev.findIndex((b) => b.matchId === matchId);
      const now = new Date().toISOString();
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], homeScore, awayScore, updatedAt: now };
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
    const ci = ROUND_ORDER.indexOf(activeRound);
    const ni = ROUND_ORDER.indexOf(round);
    setDirection(ni > ci ? 1 : -1);
    setActiveRound(round);
  }

  if (loading) return (
    <div className="min-h-screen bg-copa flex items-center justify-center">
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-5xl">⚽</motion.div>
    </div>
  );

  const allDone = totalBets === totalMatches;
  const phaseDone = roundBetCount(activeRound) === roundMatchCount(activeRound);

  return (
    <AppShell
      header={
        <header className="sticky top-0 z-40 bg-[var(--bg-mid)]/96 backdrop-blur-md">
          <div className="color-strip" />
          <div className="max-w-lg mx-auto px-5 py-3.5 flex items-center gap-3">
            {user?.photoUrl
              ? <img src={user.photoUrl} alt={user.displayName} className="w-9 h-9 rounded-full object-cover border-2 border-[var(--primary)]/30 flex-shrink-0" />
              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center font-black text-sm flex-shrink-0">{user?.displayName?.[0]}</div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-[15px] leading-none truncate">{user?.displayName}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 rounded-full overflow-hidden bg-white/8">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                    initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.7, ease: "easeOut" }} />
                </div>
                <span className="text-[var(--text-dim)] text-[10px] flex-shrink-0 font-medium">{totalBets}/{totalMatches}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-dim)] hover:text-white hover:bg-white/6 transition-all flex-shrink-0">
              <LogOut size={15} />
            </button>
          </div>
          <div className="border-b border-white/5" />
        </header>
      }
    >
      <div className="max-w-lg mx-auto">

        {/* ── Phase tabs ── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pt-4 pb-3">
          {ROUND_ORDER.map((round) => {
            const done = roundBetCount(round) === roundMatchCount(round);
            const active = activeRound === round;
            return (
              <button
                key={round}
                onClick={() => switchRound(round)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black tracking-wide whitespace-nowrap transition-all",
                  active
                    ? "bg-[var(--primary)] text-white shadow-[0_4px_16px_rgba(0,181,69,0.40)]"
                    : done
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20"
                    : "bg-white/5 text-[var(--text-sub)] border border-white/8"
                )}
              >
                {done && !active && <span className="text-[8px]">✓</span>}
                {TAB_LABELS[round]}
              </button>
            );
          })}
        </div>

        {/* ── Round header ── */}
        <div className="flex items-end justify-between px-4 pb-3">
          <div>
            <h2 className="text-white font-black text-xl leading-none">{TAB_LABELS[activeRound]}</h2>
            <p className="text-[var(--text-dim)] text-[11px] mt-1 font-medium">
              {roundBetCount(activeRound)} de {roundMatchCount(activeRound)} palpites
            </p>
          </div>
          {activeRound !== "r16" && (
            <p className="text-[var(--text-dim)] text-[10px] text-right max-w-[120px] leading-snug">
              Times resolvidos pelos seus palpites
            </p>
          )}
        </div>

        {/* ── Match cards ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRound}
            initial={{ x: direction * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -40, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col gap-2.5 px-4 pb-4"
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

        {/* ── Phase complete nudge ── */}
        {phaseDone && activeRound !== "final" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-3 rounded-2xl border border-[var(--primary)]/25 bg-[var(--primary)]/8 p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-[var(--primary)] font-black text-sm">Fase completa! 🎉</p>
              <p className="text-[var(--text-sub)] text-xs mt-0.5">Avance para a próxima fase</p>
            </div>
            <button
              onClick={() => {
                const next = ROUND_ORDER[ROUND_ORDER.indexOf(activeRound) + 1];
                if (next) switchRound(next);
              }}
              className="bg-[var(--primary)] text-white rounded-full px-4 py-2.5 text-xs font-black flex items-center gap-1 shadow-[0_4px_12px_rgba(0,181,69,0.35)]"
            >
              Próxima <ChevronRight size={13} />
            </button>
          </motion.div>
        )}

        {/* ── All done ── */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 mb-3 rounded-2xl border border-[var(--secondary)]/25 bg-[var(--secondary)]/6 p-6 text-center"
          >
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-white font-black text-base">Simulada completa!</p>
            <p className="text-[var(--text-sub)] text-sm mt-1">Todos os {totalMatches} palpites feitos.</p>
            <button
              onClick={() => router.push("/placar")}
              className="mt-4 bg-[var(--secondary)] text-[var(--bg)] font-black px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 shadow-[0_4px_16px_rgba(255,209,0,0.25)]"
            >
              <Zap size={14} /> Ver Placar
            </button>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
