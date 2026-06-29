"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, User, Lock, Trophy } from "lucide-react";

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
    <div className="min-h-screen bg-copa">
      <div className="color-strip" />
      <div className="mx-auto flex min-h-[calc(100dvh-3px)] w-full max-w-md flex-col px-5 pb-7 pt-7">
        <div className="flex flex-1 flex-col justify-center gap-6">
          <section>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/12 text-[var(--primary)] shadow-[0_12px_36px_rgba(22,184,98,0.22)]">
                <Trophy size={28} strokeWidth={2.3} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--secondary)]">Fase eliminatória</p>
                <p className="mt-1 text-2xl font-black leading-none text-white">Bolão Copa 2026</p>
              </div>
            </div>
            <h1 className="text-[2.25rem] font-black leading-[1.02] text-white">
              Entre e faça seus palpites
            </h1>
            <p className="mt-3 max-w-[21rem] text-[15px] leading-6 text-[var(--text-sub)]">
              Acompanhe a família no mata-mata e veja quem dispara no placar.
            </p>
          </section>

          <form onSubmit={handleSubmit} className="soft-panel flex flex-col gap-4 p-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 px-1 text-[12px] font-black uppercase tracking-[0.10em] text-white/45">
                <User size={15} /> Apelido
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.replace(/\s/g, ""))}
                placeholder="Digite seu apelido"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                className="mobile-field min-h-16 px-4 text-[17px]"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 px-1 text-[12px] font-black uppercase tracking-[0.10em] text-white/45">
                <Lock size={15} /> Senha
              </span>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  className="mobile-field min-h-16 px-4 pr-16 text-[17px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="icon-button absolute right-2 top-1/2 -translate-y-1/2"
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-[13px] font-semibold text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-action mt-1 flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : "Entrar"
              }
            </button>

            <p className="text-center text-sm text-white/35">
              Primeira vez?{" "}
              <Link href="/register" className="font-black text-[var(--secondary)]">
                Criar conta
              </Link>
            </p>
          </form>

          <section>
            <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
              Premiação
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { place: "1º", prize: "R$ 300", color: "var(--gold)" },
                { place: "2º", prize: "R$ 200", color: "var(--silver)" },
                { place: "3º", prize: "R$ 100", color: "var(--bronze)" },
              ].map(({ place, prize, color }) => (
                <div key={place} className="soft-panel flex min-h-24 flex-col items-center justify-center gap-2 p-3 text-center">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-white/35">{place}</span>
                  <span className="text-base font-black leading-none" style={{ color }}>{prize}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
