"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Lock, User, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-copa">
      <div className="color-strip" />
      <div className="mx-auto flex min-h-[calc(100dvh-3px)] w-full max-w-md flex-col px-5 pb-7 pt-8">
        <div className="flex flex-1 flex-col justify-center gap-6">
          <section>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--secondary)]/20 bg-[var(--secondary)]/12 text-[var(--secondary)]">
                <Trophy size={25} />
              </div>
              <div>
                <p className="text-xl font-black leading-none text-white">Bolão Copa</p>
                <p className="mt-1 text-xl font-black leading-none text-[var(--secondary)]">2026</p>
              </div>
            </div>
            <h1 className="text-[2rem] font-black leading-[1.03] text-white">Crie sua conta</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text-sub)]">
              Escolha seu nome. A foto é opcional.
            </p>
          </section>

          <form onSubmit={handleSubmit} className="soft-panel flex flex-col gap-3.5 p-4">
            <div className="flex items-center gap-4 rounded-2xl border border-white/7 bg-white/4 p-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 transition-all",
                  photoPreview
                    ? "border-[var(--primary)]/55"
                    : "border-white/12 bg-gradient-to-br from-[var(--primary)]/22 to-[var(--accent)]/20 text-white"
                )}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-black">
                    {(displayName.trim()[0] || name[0] || "?").toUpperCase()}
                  </span>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white">
                  {photoPreview ? "Foto escolhida" : "Avatar com inicial"}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-sub)]">
                  {photoPreview ? "Toque para trocar ou remova para usar a inicial." : "Toque se quiser adicionar uma foto."}
                </p>
              </div>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => { setPhoto(""); setPhotoPreview(""); }}
                  className="icon-button h-9 w-9"
                  aria-label="Remover foto"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />

            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
              <input
                type="text"
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                placeholder="Primeiro nome"
                className="mobile-field pl-12 pr-4"
                required
              />
            </div>

            {name && (
              <div className="flex items-center gap-2 px-1">
                <p className="text-xs text-white/35">Apelido:</p>
                <p className="text-xs font-black text-[var(--secondary)]">{name}</p>
              </div>
            )}

            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha (mín. 4 caracteres)"
                className="mobile-field pl-12 pr-4"
                required
                minLength={4}
              />
            </div>

            {error && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] font-semibold text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-action mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Entrar na bolada
                </>
              )}
            </button>

            <p className="text-center text-sm text-white/35">
              Já tem conta?{" "}
              <Link href="/login" className="font-black text-[var(--secondary)]">
                Fazer login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
