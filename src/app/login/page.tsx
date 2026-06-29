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
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
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

      <div className="flex-1 flex flex-col px-6 justify-center" style={{ paddingTop: "10vh", paddingBottom: "8vh" }}>

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="absolute w-24 h-24 rounded-full bg-[var(--primary)] opacity-20 blur-2xl" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-[0_8px_40px_rgba(0,156,59,0.45)]">
              <span className="text-[2.2rem]">🏆</span>
            </div>
          </div>
          <h1 className="text-[2rem] font-black text-white tracking-tight leading-none">Bolão Copa</h1>
          <p className="text-[2rem] font-black text-[var(--secondary)] tracking-tight leading-none">2026</p>
          <p className="text-white/30 text-[11px] mt-3 tracking-[0.18em] uppercase">🇧🇷 Fase Eliminatória</p>
        </div>

        {/* Form — sem card, inputs direto no fundo */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={17} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Apelido"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-white/7 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white text-[15px] placeholder-white/30 focus:outline-none focus:border-[var(--primary)]/60 focus:bg-white/9 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={17} />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full bg-white/7 border border-white/10 rounded-2xl pl-11 pr-12 py-4 text-white text-[15px] placeholder-white/30 focus:outline-none focus:border-[var(--primary)]/60 focus:bg-white/9 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-white/25 hover:text-white/60 rounded-full transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-[13px] bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full mt-3 font-black py-4 rounded-full text-[15px] transition-all flex items-center justify-center gap-2",
              loading
                ? "bg-[var(--primary)]/60 text-white/60"
                : "bg-[var(--primary)] text-white shadow-[0_6px_24px_rgba(0,156,59,0.45)] active:scale-[0.98]"
            )}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Entrar"}
          </button>

          <p className="text-center text-white/30 text-[13px] mt-2">
            Primeira vez?{" "}
            <Link href="/register" className="text-[var(--secondary)] font-black">
              Criar conta
            </Link>
          </p>
        </form>

        {/* Prizes */}
        <div className="mt-10">
          <p className="text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">Premiação</p>
          <div className="bg-white/4 border border-white/7 rounded-2xl flex items-stretch overflow-hidden">
            {[
              { medal: "🥇", prize: "R$300", place: "1º lugar", color: "var(--gold)" },
              { medal: "🥈", prize: "R$200", place: "2º lugar", color: "var(--silver)" },
              { medal: "🥉", prize: "R$100", place: "3º lugar", color: "var(--bronze)" },
            ].map(({ medal, prize, place, color }, i) => (
              <div
                key={place}
                className={cn(
                  "flex-1 flex flex-col items-center py-4 gap-1.5",
                  i > 0 && "border-l border-white/7"
                )}
              >
                <span className="text-[1.6rem] leading-none">{medal}</span>
                <span className="font-black text-sm leading-none" style={{ color }}>{prize}</span>
                <span className="text-white/20 text-[10px]">{place}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
