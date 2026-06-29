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
        "bg-[var(--card)] border rounded-xl overflow-hidden transition-colors",
        locked
          ? "border-white/5 opacity-75"
          : saved
          ? "border-[var(--primary)]/50"
          : "border-[var(--card-border)]"
      )}
    >
      {/* Header: jogo info */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-[var(--text-dim)] text-[11px] font-medium tracking-wide">
          {currentIndex + 1}/{totalMatches}
        </span>
        <span className="text-[var(--text-dim)] text-[11px] tracking-wide">
          {match.date}
        </span>
      </div>

      {/* Match body */}
      <div className="flex items-center gap-3 px-4 py-5">

        {/* Home team */}
        <div className="flex-1 min-w-0">
          {homeFlagUrl ? (
            <img
              src={homeFlagUrl}
              alt={homeLabel}
              className="flag-img w-10 h-[27px] mb-2"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-[27px] bg-white/5 rounded-sm mb-2" />
          )}
          <p className="text-[13px] font-bold text-white leading-snug break-words">
            {homeLabel}
          </p>
        </div>

        {/* Score area */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {locked || saved ? (
            <>
              <ScoreBox value={homeScore} active={!locked && saved} />
              <span className="text-white/20 text-base font-bold">×</span>
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
              <span className="text-white/20 text-base font-bold">×</span>
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
              className="flag-img w-10 h-[27px] mb-2"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-[27px] bg-white/5 rounded-sm mb-2" />
          )}
          <p className="text-[13px] font-bold text-white leading-snug text-right break-words">
            {awayLabel}
          </p>
        </div>
      </div>

      {/* Footer: action */}
      <div className="px-4 pb-4">
        {locked ? (
          <div className="flex items-center justify-center gap-1.5 text-white/25 text-xs py-2">
            <Lock size={11} />
            <span>Encerrado</span>
          </div>
        ) : saved ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center justify-center gap-1.5 text-[var(--primary)] text-xs font-semibold py-2.5 rounded-lg bg-[var(--primary)]/8 border border-[var(--primary)]/20">
              <Check size={12} strokeWidth={3} />
              Palpite confirmado
            </div>
            <button
              onClick={() => { setSaved(false); setApiError(""); }}
              className="p-2.5 text-white/25 hover:text-white/60 transition-colors rounded-lg border border-white/6"
              title="Editar palpite"
            >
              <Pencil size={12} />
            </button>
          </div>
        ) : (
          <>
            {isDraw && (
              <p className="text-amber-400/90 text-[11px] text-center mb-2.5 font-medium">
                Copa eliminatória não tem empate — escolha um vencedor
              </p>
            )}
            {apiError && (
              <p className="text-red-400 text-[11px] text-center mb-2.5">{apiError}</p>
            )}
            <button
              onClick={handleConfirm}
              disabled={saving || isDraw}
              className={cn(
                "w-full font-bold py-3 rounded-lg transition-all text-sm flex items-center justify-center gap-2",
                isDraw
                  ? "bg-white/4 text-white/20 cursor-not-allowed"
                  : "bg-[var(--primary)] hover:bg-[var(--primary-dark)] active:scale-[0.98] text-white"
              )}
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={14} strokeWidth={3} />
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
        "w-12 h-12 flex items-center justify-center rounded-lg text-2xl font-black border",
        active
          ? "text-white border-[var(--primary)]/35 bg-[var(--primary)]/6"
          : "text-white/35 border-white/8 bg-white/3"
      )}
    >
      {value}
    </div>
  );
}
