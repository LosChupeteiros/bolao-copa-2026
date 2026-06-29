"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/placar",  label: "Placar",   icon: Trophy  },
  { href: "/bolao",   label: "Palpites", icon: Target  },
  { href: "/perfil",  label: "Perfil",   icon: User    },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-mid)]/98 backdrop-blur-xl border-t border-white/7">
      <div className="max-w-lg mx-auto flex pb-safe">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-3.5 transition-all",
                active ? "text-[var(--secondary)]" : "text-white/22 hover:text-white/40"
              )}
            >
              <div className={cn(
                "w-12 h-9 flex items-center justify-center rounded-full transition-all duration-200",
                active ? "bg-[var(--secondary)]/14" : ""
              )}>
                <Icon
                  size={active ? 22 : 20}
                  strokeWidth={active ? 2.5 : 1.6}
                />
              </div>
              <span className={cn(
                "text-[9px] font-black tracking-widest uppercase",
                active ? "text-[var(--secondary)]" : "text-white/22"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
