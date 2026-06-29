"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Lock, Pencil } from "lucide-react";
import type { Match } from "@/lib/types";
import { getFlagUrl } from "@/lib/matches";
import { cn, isMatchLocked } from "@/lib/utils";

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
  const homeFlagUrl = getFlagUrl(homeLabel);
  const awayFlagUrl = getFlagUrl(awayLabel);

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

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <div className="rounded-2xl border border-white/7 bg-white/4 p-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="truncate text-[13px] font-black tracking-wide text-[var(--primary)]">
              {roundEmoji} {roundLabel}
            </span>
            <span className="shrink-0 rounded-full bg-black/24 px-2.5 py-1 text-[12px] font-black text-[var(--text-sub)]">
              {posInRound + 1}/{roundTotal}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/7">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
              initial={{ width: 0 }}
              animate={{ width: `${roundProgress * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 pt-3 pb-20">
        <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center">
          <div className="flex items-center gap-2">
            <TeamSide label={homeLabel} flagUrl={homeFlagUrl} />

            <div className="flex-shrink-0 flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-2.5">
                {showInputs ? (
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
                      className={cn("score-input-xl", isDraw && "invalid")}
                    />
                    <span className="select-none text-2xl font-black text-white/15">x</span>
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
                      className={cn("score-input-xl", isDraw && "invalid")}
                    />
                  </>
                ) : (
                  <>
                    <ScoreBoxXL value={homeScore} active={saved && !locked} />
                    <span className="select-none text-2xl font-black text-white/15">x</span>
                    <ScoreBoxXL value={awayScore} active={saved && !locked} />
                  </>
                )}
              </div>

              {locked && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-dim)]">
                  <Lock size={10} /> encerrado
                </span>
              )}
              {!locked && saved && !editing && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-[11px] font-black text-[var(--primary)]"
                >
                  <Check size={10} strokeWidth={3} /> confirmado
                </motion.span>
              )}
            </div>

            <TeamSide label={awayLabel} flagUrl={awayFlagUrl} align="right" />
          </div>

          <p className="mt-6 text-center text-[12px] font-medium text-[var(--text-dim)]">
            {match.date}
          </p>

          {showInputs && isDraw && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-[13px] text-amber-400"
            >
              Eliminatória não tem empate. Escolha um vencedor.
            </motion.p>
          )}
          {apiError && (
            <p className="mt-4 text-center text-[13px] text-red-400">{apiError}</p>
          )}

          <div className="mt-5 flex w-full justify-center">
            <div className="grid w-[20rem] max-w-[calc(100vw-2rem)] grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-3">
              <RoundActionButton
                onClick={onPrev}
                disabled={!canPrev}
                tone="neutral"
                label="Voltar"
              >
                <ChevronLeft size={20} />
              </RoundActionButton>

              {locked ? (
                <div className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border border-white/7 bg-white/4 px-4 text-[14px] font-black text-[var(--text-dim)]">
                  <Lock size={15} /> Encerrado
                </div>
              ) : saved && !editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--primary)]/28 bg-[var(--primary)]/12 px-4 text-[14px] font-black text-[var(--primary)] transition-all active:scale-[0.98]"
                >
                  <Pencil size={15} /> Editar palpite
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={saving || isDraw}
                  className={cn(
                    "flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full px-4 text-[15px] font-black transition-all",
                    isDraw
                      ? "bg-white/5 text-white/18 cursor-not-allowed"
                      : saving
                      ? "bg-[var(--primary)]/70 text-white"
                      : "bg-[var(--primary)] text-white shadow-[0_10px_28px_rgba(22,184,98,0.30)] active:scale-[0.98]"
                  )}
                >
                  {saving
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Check size={16} strokeWidth={3} /> {editing ? "Atualizar" : "Confirmar"}</>
                  }
                </button>
              )}

              <RoundActionButton
                onClick={onNext}
                disabled={!canNext}
                tone="gold"
                label={saved ? "Próximo" : "Pular"}
              >
                <ChevronRight size={20} />
              </RoundActionButton>
            </div>

            {editing && (
              <button
                onClick={cancelEdit}
                className="mx-auto mt-3 block rounded-full px-4 py-2 text-[13px] font-semibold text-[var(--text-dim)] hover:text-white"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamSide({
  label,
  flagUrl,
  align = "left",
}: {
  label: string;
  flagUrl: string;
  align?: "left" | "right";
}) {
  return (
    <div className={cn("flex-1 flex flex-col items-center gap-3 min-w-0", align === "right" && "items-center")}>
      {flagUrl
        ? <img
            src={flagUrl}
            alt={label}
            className="flag-img h-12 w-[72px] rounded-lg shadow-[0_4px_18px_rgba(0,0,0,0.45)]"
            loading="lazy"
          />
        : <div className="h-12 w-[72px] rounded-lg bg-white/6" />
      }
      <p className="break-words px-1 text-center text-[15px] font-black leading-tight text-white">
        {label}
      </p>
    </div>
  );
}

function RoundActionButton({
  children,
  disabled,
  label,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
  tone: "neutral" | "gold";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95",
        disabled
          ? "border-white/5 bg-white/3 text-white/12 cursor-not-allowed"
          : tone === "gold"
          ? "border-[var(--secondary)]/20 bg-[var(--secondary)]/10 text-[var(--secondary)] hover:bg-[var(--secondary)]/16"
          : "border-white/10 bg-white/6 text-[var(--text-sub)] hover:text-white"
      )}
      aria-label={label}
    >
      {children}
    </button>
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
