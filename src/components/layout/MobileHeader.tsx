"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

export default function MobileHeader({
  title,
  subtitle,
  leading,
  trailing,
  className,
}: MobileHeaderProps) {
  return (
    <header className={cn("app-header", className)}>
      <div className="color-strip" />
      <div className="app-header-inner">
        {leading && <div className="flex shrink-0 items-center">{leading}</div>}
        <div className="min-w-0 flex-1">
          <h1 className="app-title">{title}</h1>
          {subtitle && <div className="app-subtitle">{subtitle}</div>}
        </div>
        {trailing && <div className="flex shrink-0 items-center">{trailing}</div>}
      </div>
    </header>
  );
}
