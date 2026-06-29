"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, UserPlus, X } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleDisplayNameChange(val: string) {
    setDisplayName(val);
    const slug = val.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9À-ÿ]/g, "");
    setName(slug);
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 200;
        const ratio = Math.min(MAX / img.width, MAX / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        setPhoto(base64);
        setPhotoPreview(base64);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!photo) {
      setError("Adicione uma foto de perfil para o pessoal te reconhecer 📸");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, displayName, password, photoUrl: photo }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
      } else {
        router.push("/bolao");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-copa flex flex-col">
      <div className="color-strip" />

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">

        <div className="mb-6 text-center">
          <div className="text-4xl mb-2">⚽</div>
          <h1 className="text-2xl font-black text-white">
            Entrar no <span className="text-[var(--secondary)]">Bolão</span>
          </h1>
          <p className="text-white/30 text-sm mt-1">Copa do Mundo 2026 🇧🇷</p>
        </div>

        <div className="w-full max-w-sm bg-[var(--card)] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/6">
            <h2 className="text-white font-black text-base">Criar sua conta</h2>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
            {/* Photo upload */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-white/15 hover:border-[var(--primary)] flex items-center justify-center overflow-hidden transition-colors bg-white/3"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-white/25">
                      <Camera size={24} />
                      <span className="text-xs font-bold">Foto</span>
                    </div>
                  )}
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhoto(""); setPhotoPreview(""); }}
                    className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
              <p className="text-white/25 text-xs text-center">
                Obrigatória — o pessoal precisa te reconhecer!
              </p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </div>

            <div>
              <label className="text-white/35 text-[10px] font-black uppercase tracking-widest mb-2 block">
                Seu nome completo
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                placeholder="ex: Marcelo Silva"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[var(--primary)]/50 focus:bg-white/6 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="text-white/35 text-[10px] font-black uppercase tracking-widest mb-2 block">
                Apelido <span className="normal-case text-white/20 font-normal">(sem espaços)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.replace(/\s/g, ""))}
                placeholder="ex: Marcelo"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[var(--primary)]/50 focus:bg-white/6 transition-all text-sm font-mono"
                required
              />
              <p className="text-white/20 text-[11px] mt-1.5">Você usará esse apelido para entrar</p>
            </div>

            <div>
              <label className="text-white/35 text-[10px] font-black uppercase tracking-widest mb-2 block">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 4 caracteres"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[var(--primary)]/50 focus:bg-white/6 transition-all text-sm"
                required
                minLength={4}
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/8 border border-red-500/15 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 text-white font-black py-4 rounded-full transition-all flex items-center justify-center gap-2 text-sm shadow-[0_4px_16px_rgba(0,156,59,0.3)]"
            >
              {loading ? (
                <span className="animate-spin text-lg">⚽</span>
              ) : (
                <>
                  <UserPlus size={16} />
                  Entrar na bolada!
                </>
              )}
            </button>
          </form>

          <div className="px-6 pb-5 text-center">
            <p className="text-white/25 text-sm">
              Já tem conta?{" "}
              <Link href="/login" className="text-[var(--secondary)] font-black hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
