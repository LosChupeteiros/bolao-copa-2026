"use client";

import BottomNav from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export default function AppShell({ children, header }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header}
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
