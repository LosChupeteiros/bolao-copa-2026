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

  // Auto-generate slug from displayName
  function handleDisplayNameChange(val: string) {
    setDisplayName(val);
    const slug = val.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9À-ÿ]/g, "");
    setName(slug);
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress to base64 max ~200px
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
    <div className="min-h-screen bg-copa flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <div className="text-5xl mb-2">⚽</div>
        <h1 className="text-2xl font-extrabold text-white">
          Entrar no <span className="text-[var(--secondary)]">Bolão</span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Copa do Mundo 2026 🇧🇷</p>
      </div>

      <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-2xl">
        <h2 className="text-lg font-bold mb-5 text-white">Criar sua conta</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Photo upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-[var(--card-border)] hover:border-[var(--primary)] flex items-center justify-center overflow-hidden transition-colors bg-[rgba(255,255,255,0.03)]"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Foto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-[var(--text-dim)]">
                    <Camera size={24} />
                    <span className="text-xs">Foto</span>
                  </div>
                )}
              </button>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => { setPhoto(""); setPhotoPreview(""); }}
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <p className="text-[var(--text-dim)] text-xs">
              Foto obrigatória — o pessoal precisa te reconhecer!
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </div>

          {/* Display name */}
          <div>
            <label className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-1.5 block">
              Seu nome completo
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              placeholder="ex: Marcelo Silva"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              required
            />
          </div>

          {/* Slug / login name */}
          <div>
            <label className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-1.5 block">
              Apelido para login{" "}
              <span className="text-[var(--text-dim)] normal-case">(sem espaços)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/\s/g, ""))}
              placeholder="ex: Marcelo"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all font-mono"
              required
            />
            <p className="text-[var(--text-dim)] text-xs mt-1">
              Você usará esse apelido para entrar
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-1.5 block">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 4 caracteres"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-white placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              required
              minLength={4}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <span className="animate-spin text-lg">⚽</span>
            ) : (
              <>
                <UserPlus size={18} />
                Entrar na bolada!
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-[var(--text-dim)] text-sm">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="text-[var(--secondary)] font-semibold hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
