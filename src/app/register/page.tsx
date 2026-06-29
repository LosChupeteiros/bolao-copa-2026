"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, UserPlus, Lock, User, X } from "lucide-react";
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
    if (!photo) {
      setError("Adicione uma foto para o pessoal te reconhecer 📸");
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

      <div className="flex-1 flex flex-col px-6 py-10 justify-center">

        {/* Logo compact */}
        <div className="text-center mb-8">
          <p className="text-[1.6rem] font-black text-white leading-none">Bolão Copa</p>
          <p className="text-[1.6rem] font-black text-[var(--secondary)] leading-none">2026 🇧🇷</p>
        </div>

        {/* Photo upload — destaque central */}
        <div className="flex flex-col items-center mb-7">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative group"
          >
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center overflow-hidden transition-all border-2",
              photoPreview
                ? "border-[var(--primary)]/50"
                : "border-dashed border-white/20 hover:border-[var(--primary)]/50 bg-white/4"
            )}>
              {photoPreview ? (
                <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-white/30 group-hover:text-white/60 transition-colors">
                  <Camera size={26} />
                  <span className="text-[11px] font-bold">Foto</span>
                </div>
              )}
            </div>
            {photoPreview && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPhoto(""); setPhotoPreview(""); }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md"
              >
                <X size={11} />
              </button>
            )}
          </button>
          <p className="text-white/25 text-[11px] mt-2.5 text-center">
            {photoPreview ? "Toque para trocar a foto" : "Foto obrigatória — o pessoal precisa te ver!"}
          </p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          <div className="relative">
            <User className="absolute top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" style={{ left: 18 }} size={17} />
            <input
              type="text"
              value={displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              placeholder="Primeiro nome"
              style={{ paddingLeft: "3.2rem" }}
              className="w-full bg-white/7 border border-white/10 rounded-2xl pr-4 py-4 text-white text-[15px] placeholder-white/30 focus:outline-none focus:border-[var(--primary)]/60 focus:bg-white/9 transition-all"
              required
            />
          </div>

          {/* Apelido derivado */}
          {name && (
            <div className="flex items-center gap-2 px-1">
              <p className="text-white/25 text-[11px]">Apelido para login:</p>
              <p className="text-[var(--secondary)] font-black text-[11px]">{name}</p>
            </div>
          )}

          <div className="relative">
            <Lock className="absolute top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" style={{ left: 18 }} size={17} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha (mín. 4 caracteres)"
              style={{ paddingLeft: "3.2rem" }}
              className="w-full bg-white/7 border border-white/10 rounded-2xl pr-4 py-4 text-white text-[15px] placeholder-white/30 focus:outline-none focus:border-[var(--primary)]/60 focus:bg-white/9 transition-all"
              required
              minLength={4}
            />
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
            ) : (
              <>
                <UserPlus size={17} />
                Entrar na bolada!
              </>
            )}
          </button>

          <p className="text-center text-white/30 text-[13px] mt-2">
            Já tem conta?{" "}
            <Link href="/login" className="text-[var(--secondary)] font-black">
              Fazer login
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}
