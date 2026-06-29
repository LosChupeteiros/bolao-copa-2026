"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Lock, Pencil } from "lucide-react";
import type { Match } from "@/lib/types";
import { isMatchLocked } from "@/lib/utils";
import { getFlagUrl } from "@/lib/matches";
import { cn } from "@/lib/utils";

interface BetCardProps {
  match: Match;
  homeLabel: string;
  awayLabel: string;
  existingBet?: { homeScore: number; awayScore: number };
  onConfirm: (homeScore: number, awayScore: number) => Promise<void>;
  totalMatches: number;
  currentIndex: number;
}

export default function BetCard({
  match,
  homeLabel,
  awayLabel,
  existingBet,
  onConfirm,
  totalMatches,
  currentIndex,
}: BetCardProps) {
  const locked = isMatchLocked(match.kickoff);
  const [homeScore, setHomeScore] = useState(existingBet?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(existingBet?.awayScore ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!existingBet);
  const [apiError, setApiError] = useState("");
  const homeRef = useRef<HTMLInputElement>(null);
  const awayRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHomeScore(existingBet?.homeScore ?? 0);
    setAwayScore(existingBet?.awayScore ?? 0);
    setSaved(!!existingBet);
    setApiError("");
  }, [match.id, existingBet]);

  const isDraw = homeScore === awayScore;

  async function handleConfirm() {
    if (locked || isDraw) return;
    setApiError("");
    setSaving(true);
    try {
      await onConfirm(homeScore, awayScore);
      setSaved(true);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function handleInput(
    val: string,
    setter: (n: number) => void,
    nextRef?: React.RefObject<HTMLInputElement | null>
  ) {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0) { setter(0); return; }
    if (n > 20) { setter(20); return; }
    setter(n);
    if (val.length >= 2 && nextRef?.current) nextRef.current.focus();
  }

  const homeFlagUrl = getFlagUrl(homeLabel);
  const awayFlagUrl = getFlagUrl(awayLabel);

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden transition-all",
      locked
        ? "bg-[var(--card)] border border-white/5 opacity-60"
        : saved
        ? "bg-[var(--card)] border border-[var(--primary)]/35 shadow-[0_0_0_1px_rgba(0,181,69,0.10)]"
        : "bg-[var(--card)] border border-[var(--card-border)]"
    )}>

      {/* Top accent bar */}
      <div className={cn(
        "h-[3px]",
        saved ? "bg-gradient-to-r from-[var(--primary)]/0 via-[var(--primary)] to-[var(--primary)]/0"
             : locked ? "bg-white/4"
             : "bg-white/4"
      )} />

      {/* Match section */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">

        {/* Home */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {homeFlagUrl
            ? <img src={homeFlagUrl} alt={homeLabel} className="flag-img w-12 h-[32px]" loading="lazy" />
            : <div className="w-12 h-[32px] rounded bg-white/5" />
          }
          <p className="text-[13px] font-black text-white leading-snug break-words">{homeLabel}</p>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {locked || saved ? (
            <>
              <ScoreBox value={homeScore} active={!locked && saved} />
              <span className="text-white/15 text-lg font-black">—</span>
              <ScoreBox value={awayScore} active={!locked && saved} />
            </>
          ) : (
            <>
              <input
                ref={homeRef}
                type="number" min={0} max={20} inputMode="numeric" pattern="[0-9]*"
                value={homeScore}
                onChange={(e) => handleInput(e.target.value, setHomeScore, awayRef)}
                onFocus={(e) => e.target.select()}
                className={cn("score-input", isDraw && "invalid")}
              />
              <span className="text-white/15 text-lg font-black">—</span>
              <input
                ref={awayRef}
                type="number" min={0} max={20} inputMode="numeric" pattern="[0-9]*"
                value={awayScore}
                onChange={(e) => handleInput(e.target.value, setAwayScore)}
                onFocus={(e) => e.target.select()}
                className={cn("score-input", isDraw && "invalid")}
              />
            </>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 min-w-0 flex flex-col items-end gap-2">
          {awayFlagUrl
            ? <img src={awayFlagUrl} alt={awayLabel} className="flag-img w-12 h-[32px]" loading="lazy" />
            : <div className="w-12 h-[32px] rounded bg-white/5" />
          }
          <p className="text-[13px] font-black text-white leading-snug text-right break-words">{awayLabel}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between px-5 pb-4">
        <span className="text-[var(--text-dim)] text-[10px] font-medium">{match.date}</span>
        <div className="flex items-center gap-1.5">
          {locked && (
            <span className="flex items-center gap-1 text-[var(--text-dim)] text-[10px]">
              <Lock size={9} /> encerrado
            </span>
          )}
          {!locked && saved && (
            <span className="flex items-center gap-1 text-[var(--primary)] text-[10px] font-bold">
              <Check size={9} strokeWidth={3} /> apostado
            </span>
          )}
          {!locked && !saved && (
            <span className="text-[var(--text-dim)] text-[10px]">{currentIndex + 1}/{totalMatches}</span>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="px-5 pb-5">
        {locked ? null : saved ? (
          <div className="flex gap-2">
            <div className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-[var(--primary)]/8 border border-[var(--primary)]/20 text-[var(--primary)] text-[13px] font-bold">
              <Check size={13} strokeWidth={3} /> Palpite confirmado
            </div>
            <button
              onClick={() => { setSaved(false); setApiError(""); }}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-[var(--card-border)] text-[var(--text-dim)] hover:text-white hover:border-white/15 transition-all"
              title="Editar"
            >
              <Pencil size={13} />
            </button>
          </div>
        ) : (
          <>
            {isDraw && (
              <p className="text-amber-400 text-[12px] text-center mb-3 font-medium">
                Eliminatória não tem empate — escolha um vencedor
              </p>
            )}
            {apiError && (
              <p className="text-red-400 text-[12px] text-center mb-3">{apiError}</p>
            )}
            <button
              onClick={handleConfirm}
              disabled={saving || isDraw}
              className={cn(
                "w-full font-black py-4 rounded-full text-[14px] flex items-center justify-center gap-2 transition-all",
                isDraw
                  ? "bg-white/4 text-white/15 cursor-not-allowed"
                  : saving
                  ? "bg-[var(--primary)]/70 text-white"
                  : "bg-[var(--primary)] text-white shadow-[0_4px_20px_rgba(0,181,69,0.30)] active:scale-[0.98]"
              )}
            >
              {saving
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Check size={15} strokeWidth={3} /> Confirmar Palpite</>
              }
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ScoreBox({ value, active }: { value: number; active: boolean }) {
  return (
    <div className={cn(
      "w-[3.75rem] h-[3.75rem] flex items-center justify-center rounded-[0.875rem] text-[2rem] font-black font-variant-numeric border-2",
      active
        ? "bg-black/40 text-white border-[var(--primary)]/30"
        : "bg-black/25 text-white/30 border-white/6"
    )}>
      {value}
    </div>
  );
}
