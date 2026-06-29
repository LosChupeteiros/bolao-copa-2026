"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect /perfil → /perfil/[myUserId]
export default function PerfilRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      const res = await fetch("/api/auth/me");
      const data = await res.json() as { user: { id: string } | null };
      if (!data.user) {
        router.push("/login");
      } else {
        router.push(`/perfil/${data.user.id}`);
      }
    }
    void redirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-copa flex items-center justify-center">
      <div className="text-5xl animate-bounce">⚽</div>
    </div>
  );
}
