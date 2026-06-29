"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Lock, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
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
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  posInRound: number;
  roundTotal: number;
  roundLabel: string;
  roundEmoji: string;
}

export default function BetCard({
  match, homeLabel, awayLabel, existingBet,
  onConfirm, onPrev, onNext, canPrev, canNext,
  posInRound, roundTotal, roundLabel, roundEmoji,
}: BetCardProps) {
  const locked = isMatchLocked(match.kickoff);
  const [homeScore, setHomeScore] = useState(existingBet?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(existingBet?.awayScore ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!existingBet);
  const [editing, setEditing] = useState(false);
  const [apiError, setApiError] = useState("");
  const homeRef = useRef<HTMLInputElement>(null);
  const awayRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHomeScore(existingBet?.homeScore ?? 0);
    setAwayScore(existingBet?.awayScore ?? 0);
    setSaved(!!existingBet);
    setEditing(false);
    setApiError("");
  }, [match.id, existingBet]);

  const isDraw = homeScore === awayScore;
  const showInputs = !locked && (!saved || editing);
  const roundProgress = (posInRound + 1) / roundTotal;

  async function handleConfirm() {
    if (locked || isDraw) return;
    setApiError("");
    setSaving(true);
    try {
      await onConfirm(homeScore, awayScore);
      setSaved(true);
      setEditing(false);
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

  function cancelEdit() {
    setEditing(false);
    setHomeScore(existingBet?.homeScore ?? 0);
    setAwayScore(existingBet?.awayScore ?? 0);
    setApiError("");
  }

  const homeFlagUrl = getFlagUrl(homeLabel);
  const awayFlagUrl = getFlagUrl(awayLabel);

  return (
    <div className="h-full flex flex-col">

      {/* ── Phase indicator ── */}
      <div className="px-5 pt-6 pb-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[var(--primary)] font-black text-[13px] tracking-wide">
            {roundEmoji} {roundLabel}
          </span>
          <span className="text-[var(--text-dim)] text-[12px] font-semibold">
            {posInRound + 1} / {roundTotal}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
            initial={{ width: 0 }}
            animate={{ width: `${roundProgress * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* ── Teams + Score ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-2">
        <div className="w-full">

          <div className="flex items-center gap-2">

            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
              {homeFlagUrl
                ? <img
                    src={homeFlagUrl}
                    alt={homeLabel}
                    className="flag-img"
                    style={{ width: 72, height: 48, borderRadius: 8, boxShadow: "0 4px 18px rgba(0,0,0,0.45)" }}
                    loading="lazy"
                  />
                : <div style={{ width: 72, height: 48, borderRadius: 8 }} className="bg-white/6" />
              }
              <p className="text-white font-black text-[15px] text-center leading-tight px-1 break-words">
                {homeLabel}
              </p>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-2.5">
                {showInputs ? (
                  <>
                    <input
                      ref={homeRef}
                      type="number" min={0} max={20} inputMode="numeric" pattern="[0-9]*"
                      value={homeScore}
                      onChange={(e) => handleInput(e.target.value, setHomeScore, awayRef)}
                      onFocus={(e) => e.target.select()}
                      className={cn("score-input-xl", isDraw && "invalid")}
                    />
                    <span className="text-white/15 font-black text-2xl select-none">×</span>
                    <input
                      ref={awayRef}
                      type="number" min={0} max={20} inputMode="numeric" pattern="[0-9]*"
                      value={awayScore}
                      onChange={(e) => handleInput(e.target.value, setAwayScore)}
                      onFocus={(e) => e.target.select()}
                      className={cn("score-input-xl", isDraw && "invalid")}
                    />
                  </>
                ) : (
                  <>
                    <ScoreBoxXL value={homeScore} active={saved && !locked} />
                    <span className="text-white/15 font-black text-2xl select-none">×</span>
                    <ScoreBoxXL value={awayScore} active={saved && !locked} />
                  </>
                )}
              </div>

              {/* Status under score */}
              {locked && (
                <span className="flex items-center gap-1 text-[var(--text-dim)] text-[11px] font-medium">
                  <Lock size={10} /> encerrado
                </span>
              )}
              {!locked && saved && !editing && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-[var(--primary)] text-[11px] font-black"
                >
                  <Check size={10} strokeWidth={3} /> confirmado
                </motion.span>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
              {awayFlagUrl
                ? <img
                    src={awayFlagUrl}
                    alt={awayLabel}
                    className="flag-img"
                    style={{ width: 72, height: 48, borderRadius: 8, boxShadow: "0 4px 18px rgba(0,0,0,0.45)" }}
                    loading="lazy"
                  />
                : <div style={{ width: 72, height: 48, borderRadius: 8 }} className="bg-white/6" />
              }
              <p className="text-white font-black text-[15px] text-center leading-tight px-1 break-words">
                {awayLabel}
              </p>
            </div>

          </div>

          {/* Date */}
          <p className="text-center text-[var(--text-dim)] text-[12px] mt-7 font-medium">
            {match.date}
          </p>

          {/* Warnings */}
          {showInputs && isDraw && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-amber-400 text-[13px] text-center mt-4"
            >
              Eliminatória não tem empate — escolha um vencedor
            </motion.p>
          )}
          {apiError && (
            <p className="text-red-400 text-[13px] text-center mt-4">{apiError}</p>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="px-5 pb-28 flex-shrink-0">

        {locked ? (
          <div className="flex items-center justify-center gap-2 py-5 rounded-2xl bg-white/4 border border-white/7 text-[var(--text-dim)] text-[14px]">
            <Lock size={14} /> Palpite encerrado
          </div>
        ) : saved && !editing ? (
          <div className="flex gap-2.5">
            <div className="flex-1 flex items-center justify-center gap-2 py-5 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/25 text-[var(--primary)] text-[14px] font-bold">
              <Check size={15} strokeWidth={3} /> Palpite confirmado
            </div>
            <button
              onClick={() => setEditing(true)}
              className="w-14 flex-shrink-0 flex items-center justify-center rounded-2xl border border-white/8 text-[var(--text-dim)] hover:text-white hover:border-white/16 transition-all"
            >
              <Pencil size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={saving || isDraw}
            className={cn(
              "w-full py-5 rounded-2xl font-black text-[15px] transition-all flex items-center justify-center gap-2",
              isDraw
                ? "bg-white/5 text-white/15 cursor-not-allowed"
                : saving
                ? "bg-[var(--primary)]/70 text-white"
                : "bg-[var(--primary)] text-white shadow-[0_6px_28px_rgba(0,200,83,0.35)] active:scale-[0.98]"
            )}
          >
            {saving
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Check size={16} strokeWidth={3} /> {editing ? "Atualizar Palpite" : "Confirmar Palpite"}</>
            }
          </button>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={onPrev}
            disabled={!canPrev}
            className={cn(
              "flex items-center gap-1 px-4 py-3 rounded-full text-[13px] font-semibold transition-all",
              canPrev
                ? "text-[var(--text-sub)] hover:text-white hover:bg-white/6 active:bg-white/10"
                : "text-white/10 cursor-not-allowed"
            )}
          >
            <ChevronLeft size={15} /> Anterior
          </button>

          {editing ? (
            <button
              onClick={cancelEdit}
              className="text-[var(--text-dim)] text-[13px] px-4 py-3 rounded-full hover:text-white transition-colors"
            >
              Cancelar
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={!canNext}
              className={cn(
                "flex items-center gap-1 px-4 py-3 rounded-full text-[13px] font-semibold transition-all",
                !canNext
                  ? "text-white/10 cursor-not-allowed"
                  : saved
                  ? "text-[var(--secondary)] hover:bg-[var(--secondary)]/10 active:bg-[var(--secondary)]/15 font-black"
                  : "text-[var(--text-sub)] hover:text-white hover:bg-white/6 active:bg-white/10"
              )}
            >
              {saved ? "Próximo" : "Pular"} <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBoxXL({ value, active }: { value: number; active: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center font-black",
        active
          ? "bg-black/45 text-white border-2 border-[var(--primary)]/30"
          : "bg-black/30 text-white/25 border-2 border-white/7"
      )}
      style={{ width: "5.5rem", height: "5.5rem", borderRadius: "1rem", fontSize: "2.9rem", fontVariantNumeric: "tabular-nums" }}
    >
      {value}
    </div>
  );
}
