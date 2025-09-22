"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { UserDetail } from "@/client/user/schemas/userDetail";

export function AppHeader() {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
        });

        if (!isMounted) {
          return;
        }

        if (response.ok) {
          const data = (await response.json()) as { user?: UserDetail };
          setUser(data.user ?? null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("[AppHeader] failed to load session", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("[AppHeader] logout failed", await response.text());
      }
    } catch (error) {
      console.error("[AppHeader] logout error", error);
    } finally {
      setIsLoggingOut(false);
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight sm:text-xl">
            タスク管理
          </span>
          <span className="text-sm text-muted-foreground">
            {isLoading ? "読み込み中..." : user?.username ?? "ユーザー名なし"}
          </span>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "ログアウト中..." : "ログアウト"}
        </Button>
      </div>
    </header>
  );
}
