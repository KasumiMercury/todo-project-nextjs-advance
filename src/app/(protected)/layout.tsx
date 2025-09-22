import type { ReactNode } from "react";
import { AppHeader } from "./_components/app-header";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">
        <AppHeader />
        <main className="flex-1 px-4 py-10 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
