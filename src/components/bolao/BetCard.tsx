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
    <div
      className={cn(
        "bg-[var(--card)] border rounded-2xl overflow-hidden transition-all",
        locked
          ? "border-white/5 opacity-70"
          : saved
          ? "border-[var(--primary)]/50 shadow-[0_0_0_1px_rgba(0,156,59,0.12)]"
          : "border-[var(--card-border)]"
      )}
    >
      {/* Match section */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-3">

        {/* Home team */}
        <div className="flex-1 min-w-0">
          {homeFlagUrl ? (
            <img
              src={homeFlagUrl}
              alt={homeLabel}
              className="flag-img w-12 h-[32px] mb-2.5"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-[32px] bg-white/5 rounded mb-2.5" />
          )}
          <p className="text-[14px] font-black text-white leading-snug break-words">
            {homeLabel}
          </p>
        </div>

        {/* Score area */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {locked || saved ? (
            <>
              <ScoreBox value={homeScore} active={!locked && saved} />
              <span className="text-white/20 text-base">×</span>
              <ScoreBox value={awayScore} active={!locked && saved} />
            </>
          ) : (
            <>
              <input
                ref={homeRef}
                type="number"
                min={0}
                max={20}
                inputMode="numeric"
                pattern="[0-9]*"
                value={homeScore}
                onChange={(e) => handleInput(e.target.value, setHomeScore, awayRef)}
                onFocus={(e) => e.target.select()}
                className={cn("score-input", isDraw && "invalid")}
              />
              <span className="text-white/20 text-base">×</span>
              <input
                ref={awayRef}
                type="number"
                min={0}
                max={20}
                inputMode="numeric"
                pattern="[0-9]*"
                value={awayScore}
                onChange={(e) => handleInput(e.target.value, setAwayScore)}
                onFocus={(e) => e.target.select()}
                className={cn("score-input", isDraw && "invalid")}
              />
            </>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 min-w-0 flex flex-col items-end">
          {awayFlagUrl ? (
            <img
              src={awayFlagUrl}
              alt={awayLabel}
              className="flag-img w-12 h-[32px] mb-2.5"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-[32px] bg-white/5 rounded mb-2.5" />
          )}
          <p className="text-[14px] font-black text-white leading-snug text-right break-words">
            {awayLabel}
          </p>
        </div>
      </div>

      {/* Meta row: date + locked indicator */}
      <div className="flex items-center justify-between px-5 pb-4">
        <span className="text-white/20 text-[11px]">{match.date}</span>
        <div className="flex items-center gap-1.5">
          {locked && (
            <span className="flex items-center gap-1 text-white/20 text-[11px]">
              <Lock size={9} /> encerrado
            </span>
          )}
          {!locked && !saved && (
            <span className="text-white/15 text-[11px]">{currentIndex + 1}/{totalMatches}</span>
          )}
          {saved && !locked && (
            <span className="flex items-center gap-1 text-[var(--primary)]/60 text-[11px] font-medium">
              <Check size={9} strokeWidth={3} /> apostado
            </span>
          )}
        </div>
      </div>

      {/* Footer: action */}
      <div className="px-5 pb-5">
        {locked ? null : saved ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center justify-center gap-2 text-[var(--primary)] text-sm font-bold py-3 rounded-full bg-[var(--primary)]/8 border border-[var(--primary)]/20">
              <Check size={14} strokeWidth={3} />
              Palpite confirmado
            </div>
            <button
              onClick={() => { setSaved(false); setApiError(""); }}
              className="w-11 h-11 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors rounded-full border border-white/8 hover:border-white/20"
              title="Editar palpite"
            >
              <Pencil size={13} />
            </button>
          </div>
        ) : (
          <>
            {isDraw && (
              <p className="text-amber-400/90 text-xs text-center mb-3 font-medium">
                Copa eliminatória não tem empate — escolha um vencedor
              </p>
            )}
            {apiError && (
              <p className="text-red-400 text-xs text-center mb-3">{apiError}</p>
            )}
            <button
              onClick={handleConfirm}
              disabled={saving || isDraw}
              className={cn(
                "w-full font-black py-4 rounded-full transition-all text-sm flex items-center justify-center gap-2",
                isDraw
                  ? "bg-white/4 text-white/20 cursor-not-allowed"
                  : "bg-[var(--primary)] hover:bg-[var(--primary-dark)] active:scale-[0.98] text-white shadow-[0_4px_16px_rgba(0,156,59,0.25)]"
              )}
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={15} strokeWidth={3} />
                  Confirmar Palpite
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ScoreBox({ value, active }: { value: number; active: boolean }) {
  return (
    <div
      className={cn(
        "w-14 h-14 flex items-center justify-center rounded-2xl text-2xl font-black border",
        active
          ? "text-white border-[var(--primary)]/40 bg-[var(--primary)]/8"
          : "text-white/35 border-white/8 bg-white/3"
      )}
    >
      {value}
    </div>
  );
}
