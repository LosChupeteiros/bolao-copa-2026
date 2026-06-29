"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Zap } from "lucide-react";
import { MATCHES, resolveMatchLabels } from "@/lib/matches";
import type { Bet, Round } from "@/lib/types";
import BetCard from "@/components/bolao/BetCard";
import BottomNav from "@/components/layout/BottomNav";
import MobileHeader from "@/components/layout/MobileHeader";
import { isMatchLocked } from "@/lib/utils";

const ROUND_INFO: Record<Round, { label: string; emoji: string }> = {
  r16:      { label: "2ª Fase",          emoji: "⚡" },
  oitavas:  { label: "Oitavas de Final", emoji: "🏟️" },
  quartas:  { label: "Quartas de Final", emoji: "🔥" },
  semi:     { label: "Semifinal",        emoji: "⭐" },
  terceiro: { label: "3° Lugar",         emoji: "🥉" },
  final:    { label: "Grande Final",     emoji: "🏆" },
};

interface CurrentUser {
  id: string; name: string; displayName: string; photoUrl: string; isAdmin: boolean;
}

function getOpenMatches() {
  return MATCHES.filter((match) => !isMatchLocked(match.kickoff));
}

export default function BolaoPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [betsMap, setBetsMap] = useState<Map<string, Bet>>(new Map());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roundIntro, setRoundIntro] = useState<Round | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const openMatches = getOpenMatches();

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json() as { user: CurrentUser | null };
        if (!meData.user) { router.push("/login"); return; }
        setUser(meData.user);

        const betsRes = await fetch(`/api/bets?userId=${meData.user.id}`);
        const betsData = await betsRes.json() as { bets: Bet[] };
        const betsArr = betsData.bets || [];

        const map = new Map<string, Bet>();
        for (const b of betsArr) map.set(b.matchId, b);
        setBetsMap(map);

        const bettableMatches = getOpenMatches();
        const firstUnbet = bettableMatches.findIndex((m) => !map.has(m.id));

        if (bettableMatches.length === 0 || firstUnbet < 0) {
          setShowSummary(true);
        } else {
          setCurrentIdx(firstUnbet);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [router]);

  useEffect(() => {
    if (!loading && !showSummary && openMatches.length > 0 && currentIdx >= openMatches.length) {
      setCurrentIdx(openMatches.length - 1);
    }
  }, [currentIdx, loading, openMatches.length, showSummary]);

  async function saveBet(matchId: string, h: number, a: number) {
    const res = await fetch("/api/bets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore: h, awayScore: a }),
    });
    if (!res.ok) {
      const d = await res.json() as { error?: string };
      throw new Error(d.error || "Erro ao salvar");
    }
    setBetsMap((prev) => {
      const next = new Map(prev);
      const existing = prev.get(matchId);
      const now = new Date().toISOString();
      next.set(matchId, existing
        ? { ...existing, homeScore: h, awayScore: a, updatedAt: now }
        : { id: Date.now().toString(), userId: user?.id ?? "", matchId, homeScore: h, awayScore: a, createdAt: now, updatedAt: now }
      );
      return next;
    });
  }

  function doAdvance() {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= openMatches.length) {
      setShowSummary(true);
      return;
    }
    const currRound = openMatches[currentIdx].round as Round;
    const nextRound = openMatches[nextIdx].round as Round;
    if (currRound !== nextRound) {
      setRoundIntro(nextRound);
      setTimeout(() => {
        setRoundIntro(null);
        setSlideDir(1);
        setCurrentIdx(nextIdx);
      }, 1900);
    } else {
      setSlideDir(1);
      setCurrentIdx(nextIdx);
    }
  }

  async function handleConfirmBet(matchId: string, h: number, a: number) {
    await saveBet(matchId, h, a);
    setTimeout(() => doAdvance(), 380);
  }

  function handlePrev() {
    if (currentIdx > 0) {
      setSlideDir(-1);
      setCurrentIdx((i) => i - 1);
    }
  }

  function handleNext() {
    if (currentIdx < openMatches.length - 1) {
      setSlideDir(1);
      setCurrentIdx((i) => i + 1);
    } else {
      setShowSummary(true);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-copa flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
        transition={{ repeat: Infinity, duration: 1.3 }}
        className="text-5xl"
      >⚽</motion.div>
    </div>
  );

  const totalMatches = openMatches.length;
  const totalBets = openMatches.filter((match) => betsMap.has(match.id)).length;
  const missingBets = totalMatches - totalBets;
  const progress = totalMatches > 0 ? totalBets / totalMatches : 1;
  const currentMatch = openMatches[currentIdx];
  const roundInfo = currentMatch ? ROUND_INFO[currentMatch.round as Round] : null;

  /* ── Summary screen ── */
  if (showSummary) {
    return (
      <div className="min-h-screen bg-copa flex flex-col">
        <div className="color-strip" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 180 }}
            className="flex flex-col items-center gap-7 w-full"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[var(--secondary)] blur-3xl opacity-30 scale-150" />
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] flex items-center justify-center text-[3.2rem] shadow-[0_8px_48px_rgba(255,214,0,0.35)]">
                🏆
              </div>
            </div>

            <div>
              <h1 className="text-[2rem] font-black text-white leading-none">
                {totalMatches === 0
                  ? "Palpites encerrados"
                  : missingBets === 0
                  ? "Palpites em dia!"
                  : "Fim dos jogos abertos"}
              </h1>
              <p className="text-[var(--text-sub)] mt-3 text-[15px] leading-relaxed">
                {totalMatches === 0
                  ? "Nenhum jogo está aberto para novos palpites agora."
                  : missingBets === 0
                  ? `Você preencheu todos os ${totalMatches} jogos que ainda estão abertos.`
                  : `Ainda faltam ${missingBets} palpites nos jogos abertos.`}
              </p>
            </div>

            <div className="w-full flex gap-3">
              <div className="flex-1 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 text-center">
                <div className="text-[1.8rem] font-black text-white leading-none">{totalBets}</div>
                <div className="text-[var(--text-dim)] text-[11px] mt-1.5">palpites</div>
              </div>
              <div className="flex-1 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 text-center">
                <div className="text-[1.8rem] font-black text-[var(--primary)] leading-none">6</div>
                <div className="text-[var(--text-dim)] text-[11px] mt-1.5">fases</div>
              </div>
            </div>

            <button
              onClick={() => router.push("/placar")}
              className="w-full py-5 rounded-2xl font-black text-base bg-[var(--secondary)] text-black shadow-[0_6px_28px_rgba(255,214,0,0.30)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Zap size={18} /> Ver Placar Geral
            </button>

            {totalMatches > 0 && (
              <button
                onClick={() => { setShowSummary(false); setCurrentIdx(0); }}
                className="text-[var(--text-sub)] text-sm hover:text-white transition-colors"
              >
                Revisar palpites →
              </button>
            )}
          </motion.div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!currentMatch) {
    return null;
  }

  const resolved = resolveMatchLabels(currentMatch, betsMap);
  const existingBet = betsMap.get(currentMatch.id);
  const roundMatches = openMatches.filter((m) => m.round === currentMatch.round);
  const posInRound = roundMatches.findIndex((m) => m.id === currentMatch.id);

  return (
    <div className="bg-copa flex flex-col" style={{ height: "100dvh" }}>

      {/* Round intro overlay */}
      <AnimatePresence>
        {roundIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/92 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.65, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 200 }}
              className="text-center px-8"
            >
              <div className="text-[5.5rem] leading-none mb-5">{ROUND_INFO[roundIntro].emoji}</div>
              <p className="text-[var(--text-dim)] text-[11px] font-black uppercase tracking-[0.22em] mb-2.5">
                Próxima fase
              </p>
              <h2 className="text-white text-[2.2rem] font-black leading-none">
                {ROUND_INFO[roundIntro].label}
              </h2>
              <p className="text-[var(--text-sub)] mt-3 text-[14px]">
                {openMatches.filter((m) => m.round === roundIntro).length} jogos
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <MobileHeader
        leading={
          user?.photoUrl
            ? <img
                src={user.photoUrl}
                alt={user.displayName}
                className="h-11 w-11 rounded-full object-cover border-2 border-[var(--primary)]/35"
              />
            : <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center font-black text-sm">
                {user?.displayName?.[0]}
              </div>
        }
        title={user?.displayName ?? "Palpites"}
        subtitle={
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-bold text-[var(--text-dim)]">
              {totalBets}/{totalMatches}
            </span>
          </div>
        }
        trailing={
          <button onClick={handleLogout} className="icon-button" aria-label="Sair">
            <LogOut size={16} />
          </button>
        }
      />

      {/* Main — fill remaining height */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        <AnimatePresence mode="wait" custom={slideDir}>
          <motion.div
            key={currentMatch.id}
            custom={slideDir}
            variants={{
              enter:  (d: number) => ({ x: d > 0 ? "55%" : "-55%", opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit:   (d: number) => ({ x: d > 0 ? "-55%" : "55%", opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 overflow-y-auto"
          >
            <BetCard
              match={currentMatch}
              homeLabel={resolved.homeLabel}
              awayLabel={resolved.awayLabel}
              existingBet={existingBet}
              onConfirm={(h, a) => handleConfirmBet(currentMatch.id, h, a)}
              onPrev={handlePrev}
              onNext={handleNext}
              canPrev={currentIdx > 0}
              canNext={currentIdx < openMatches.length - 1}
              posInRound={posInRound}
              roundTotal={roundMatches.length}
              roundLabel={roundInfo?.label ?? ""}
              roundEmoji={roundInfo?.emoji ?? ""}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
