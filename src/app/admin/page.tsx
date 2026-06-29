"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, Loader } from "lucide-react";
import Image from "next/image";
import { MATCHES, ROUND_ORDER, ROUND_LABELS, getFlagUrl, resolveMatchLabels } from "@/lib/matches";
import type { MatchResult, Round } from "@/lib/types";
import { cn } from "@/lib/utils";
import MobileHeader from "@/components/layout/MobileHeader";

interface ResultsMap {
  [matchId: string]: MatchResult;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [results, setResults] = useState<ResultsMap>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [scores, setScores] = useState<{ homeScore: Record<string, number>; awayScore: Record<string, number> }>({ homeScore: {}, awayScore: {} });
  const [activeRound, setActiveRound] = useState<Round>("r16");

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    // test by calling the API
    const res = await fetch("/api/admin/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ matchId: "__test__", homeScore: 0, awayScore: 1 }),
    });
    if (res.status === 403) {
      setAuthError("Senha incorreta");
      return;
    }
    // 404 = match not found = password ok
    setAuthed(true);
    loadResults();
  }

  async function loadResults() {
    const res = await fetch("/api/admin/results");
    const data = await res.json() as { results: ResultsMap };
    setResults(data.results || {});

    // Init score inputs from existing results
    const hs: Record<string, number> = {};
    const as_: Record<string, number> = {};
    for (const [id, r] of Object.entries(data.results || {})) {
      hs[id] = r.homeScore;
      as_[id] = r.awayScore;
    }
    setScores({ homeScore: hs, awayScore: as_ });
  }

  async function handleSave(matchId: string) {
    const homeScore = scores.homeScore[matchId] ?? 0;
    const awayScore = scores.awayScore[matchId] ?? 0;

    if (homeScore === awayScore) {
      alert("Não pode haver empate na fase eliminatória. Se foi pênaltis, coloque 1 a mais pro vencedor nos pênaltis (ex: 2-1 em vez de 1-1).");
      return;
    }

    setSaving(matchId);
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ matchId, homeScore, awayScore }),
      });
      if (res.ok) {
        setSaved(matchId);
        setResults((prev) => ({
          ...prev,
          [matchId]: {
            matchId,
            homeScore,
            awayScore,
            winner: homeScore > awayScore ? "home" : "away",
            confirmedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => setSaved(null), 2000);
      }
    } finally {
      setSaving(null);
    }
  }

  const matchesForRound = MATCHES.filter((m) => m.round === activeRound);

  // Create a fake betsMap from results for label resolution
  const resultsBetsMap = new Map(
    Object.entries(results).map(([matchId, r]) => [
      matchId,
      { homeScore: r.homeScore, awayScore: r.awayScore },
    ])
  );

  if (!authed) {
    return (
      <div className="min-h-screen bg-copa flex items-center justify-center px-5 py-10">
        <div className="soft-panel w-full max-w-sm p-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)]/12 text-[var(--secondary)]">
              <Shield size={30} />
            </div>
            <h1 className="text-white font-black text-2xl leading-none">Área Admin</h1>
            <p className="text-[var(--text-sub)] text-sm mt-2">
              Inserir resultados dos jogos
            </p>
          </div>
          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha admin"
              className="mobile-field px-4"
            />
            {authError && (
              <p className="text-red-400 text-sm text-center">{authError}</p>
            )}
            <button
              type="submit"
              className="primary-action"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-copa pb-8">
      <MobileHeader
        leading={
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--secondary)]/20 bg-[var(--secondary)]/10 text-[var(--secondary)]">
            <Shield size={19} />
          </div>
        }
        title="Admin"
        subtitle="Resultados dos jogos"
      />

      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
          <p className="text-amber-400 text-xs">
            ⚠️ Sem empate na fase eliminatória. Se foi nos pênaltis, coloque como se o vencedor tivesse ganho por 1 gol a mais (ex: empate 1×1 → coloque 2×1 pro time que venceu nos pênaltis).
          </p>
        </div>

        {/* Round tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 -mx-4 px-4">
          {ROUND_ORDER.map((round) => (
            <button
              key={round}
              onClick={() => setActiveRound(round)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border",
                activeRound === round
                  ? "bg-[var(--secondary)] border-[var(--secondary)] text-[var(--bg)]"
                  : "bg-[var(--card)] border-[var(--card-border)] text-[var(--text-sub)]"
              )}
            >
              {ROUND_LABELS[round]}
            </button>
          ))}
        </div>

        {/* Match list */}
        <div className="flex flex-col gap-3">
          {matchesForRound.map((match) => {
            const resolved = resolveMatchLabels(match, resultsBetsMap);
            const result = results[match.id];
            const homeVal = scores.homeScore[match.id] ?? result?.homeScore ?? 0;
            const awayVal = scores.awayScore[match.id] ?? result?.awayScore ?? 0;
            const isSaving = saving === match.id;
            const isSaved = saved === match.id;

            const homeFlagUrl = getFlagUrl(resolved.homeLabel);
            const awayFlagUrl = getFlagUrl(resolved.awayLabel);

            return (
              <div
                key={match.id}
                className={cn(
                  "bg-[var(--card)] border rounded-2xl p-4",
                  result
                    ? "border-[var(--secondary)]/40"
                    : "border-[var(--card-border)]"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[var(--text-dim)]">📅 {match.date}</span>
                  {result && (
                    <span className="text-xs text-[var(--secondary)] font-medium">✓ Resultado salvo</span>
                  )}
                </div>

                <div className="flex items-center gap-3 justify-between">
                  {/* Home */}
                  <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    {homeFlagUrl && (
                      <Image src={homeFlagUrl} alt={resolved.homeLabel} width={48} height={36} unoptimized className="rounded" />
                    )}
                    <span className="text-xs text-white font-medium text-center line-clamp-2">{resolved.homeLabel}</span>
                  </div>

                  {/* Score inputs */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={homeVal}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          homeScore: { ...prev.homeScore, [match.id]: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="score-input"
                    />
                    <span className="text-[var(--text-dim)] text-lg">×</span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={awayVal}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          awayScore: { ...prev.awayScore, [match.id]: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="score-input"
                    />
                  </div>

                  {/* Away */}
                  <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    {awayFlagUrl && (
                      <Image src={awayFlagUrl} alt={resolved.awayLabel} width={48} height={36} unoptimized className="rounded" />
                    )}
                    <span className="text-xs text-white font-medium text-center line-clamp-2">{resolved.awayLabel}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSave(match.id)}
                  disabled={isSaving}
                  className={cn(
                    "mt-3 w-full font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2",
                    isSaved
                      ? "bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30"
                      : "bg-[var(--secondary)] hover:opacity-90 text-[var(--bg)]"
                  )}
                >
                  {isSaving ? (
                    <Loader size={15} className="animate-spin" />
                  ) : isSaved ? (
                    <><CheckCircle size={15} /> Salvo!</>
                  ) : (
                    "Confirmar Resultado"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
