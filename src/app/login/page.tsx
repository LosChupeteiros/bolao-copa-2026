"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim().replace(/\s+/g, "");
    if (!trimmed) { setError("Digite seu apelido"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, password }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) setError(data.error || "Apelido ou senha incorretos");
      else router.push("/bolao");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-copa flex flex-col">
      <div className="color-strip" />

      <div className="flex-1 flex flex-col justify-between px-6" style={{ paddingTop: "8vh", paddingBottom: "6vh" }}>

        {/* ── Logo ── */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-7">
            <div className="absolute w-32 h-32 rounded-full bg-[var(--primary)] opacity-15 blur-3xl" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-[0_10px_48px_rgba(0,181,69,0.50)]">
              <span style={{ fontSize: "2.6rem" }}>🏆</span>
            </div>
          </div>
          <h1 className="text-[2.4rem] font-black text-white tracking-tight leading-none">Bolão Copa</h1>
          <p className="text-[2.4rem] font-black text-[var(--secondary)] tracking-tight leading-none mt-1">2026</p>
          <p className="text-white/30 text-[11px] mt-3 tracking-[0.18em] uppercase">🇧🇷 Fase Eliminatória</p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">

          <div className="relative">
            <User
              className="absolute top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              style={{ left: 18 }}
              size={18}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/\s/g, ""))}
              placeholder="Apelido (sem espaços)"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="username"
              style={{ paddingLeft: "3.2rem" }}
              className="w-full bg-white/7 border border-white/10 rounded-2xl pr-4 py-5 text-white text-[16px] placeholder-white/25 focus:outline-none focus:border-[var(--primary)]/55 focus:bg-white/9 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              style={{ left: 18 }}
              size={18}
            />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
              style={{ paddingLeft: "3.2rem" }}
              className="w-full bg-white/7 border border-white/10 rounded-2xl pr-14 py-5 text-white text-[16px] placeholder-white/25 focus:outline-none focus:border-[var(--primary)]/55 focus:bg-white/9 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors rounded-full"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3">
              <p className="text-red-400 text-[13px]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full mt-2 font-black py-5 rounded-full text-[16px] flex items-center justify-center gap-2 transition-all",
              loading
                ? "bg-[var(--primary)]/60 text-white/50"
                : "bg-[var(--primary)] text-white shadow-[0_6px_28px_rgba(0,181,69,0.45)] active:scale-[0.98]"
            )}
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : "Entrar"
            }
          </button>

          <p className="text-center text-white/30 text-[14px] mt-1">
            Primeira vez?{" "}
            <Link href="/register" className="text-[var(--secondary)] font-black">
              Criar conta
            </Link>
          </p>
        </form>

        {/* ── Prizes ── */}
        <div>
          <p className="text-center text-white/20 text-[10px] font-black uppercase tracking-[0.18em] mb-3">
            Premiação
          </p>
          <div className="bg-white/4 border border-white/7 rounded-2xl flex items-stretch overflow-hidden">
            {[
              { medal: "🥇", prize: "R$ 300", place: "1º lugar", color: "var(--gold)" },
              { medal: "🥈", prize: "R$ 200", place: "2º lugar", color: "var(--silver)" },
              { medal: "🥉", prize: "R$ 100", place: "3º lugar", color: "var(--bronze)" },
            ].map(({ medal, prize, place, color }, i) => (
              <div
                key={place}
                className={cn("flex-1 flex flex-col items-center py-5 gap-2", i > 0 && "border-l border-white/7")}
              >
                <span className="text-[1.8rem] leading-none">{medal}</span>
                <span className="font-black text-[15px] leading-none" style={{ color }}>{prize}</span>
                <span className="text-white/20 text-[11px]">{place}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
