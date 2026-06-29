"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

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
      if (!res.ok) setError(data.error || "Erro ao entrar");
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

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-[0_8px_32px_rgba(0,156,59,0.35)]">
            <span className="text-4xl">🏆</span>
          </div>
          <h1 className="text-[30px] font-black text-white tracking-tight leading-none">
            Bolão Copa
          </h1>
          <div className="text-[var(--secondary)] font-black text-[30px] tracking-tight leading-none">
            2026
          </div>
          <p className="text-white/30 text-xs mt-3 tracking-widest uppercase">
            🇧🇷 Fase Eliminatória
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-[340px] bg-[var(--card)] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/6">
            <h2 className="text-white font-black text-base">Entrar</h2>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
            <div>
              <label className="text-white/35 text-[10px] font-black uppercase tracking-widest mb-2 block">
                Apelido
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Marcelo"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[var(--primary)]/50 focus:bg-white/6 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-white/35 text-[10px] font-black uppercase tracking-widest mb-2 block">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3.5 pr-12 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[var(--primary)]/50 focus:bg-white/6 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors rounded-full"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/8 border border-red-500/15 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 text-white font-black py-4 rounded-full transition-all text-sm flex items-center justify-center gap-2 mt-1 shadow-[0_4px_16px_rgba(0,156,59,0.3)]"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Entrar"}
            </button>

            <p className="text-center text-white/30 text-xs">
              Primeira vez?{" "}
              <Link href="/register" className="text-[var(--secondary)] font-black hover:underline">
                Criar conta
              </Link>
            </p>
          </form>
        </div>

        {/* Prizes teaser */}
        <div className="mt-8 flex gap-3">
          {[["🥇", "R$300", "1º"], ["🥈", "R$200", "2º"], ["🥉", "R$100", "3º"]].map(([medal, prize, place]) => (
            <div key={place} className="bg-white/3 border border-white/6 rounded-2xl px-5 py-3.5 text-center">
              <div className="text-xl mb-1">{medal}</div>
              <div className="text-[var(--secondary)] font-black text-sm">{prize}</div>
              <div className="text-white/25 text-[10px] mt-0.5">{place}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
