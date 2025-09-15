"use client";

import { type ReactNode, Suspense, use } from "react";

const mockingEnabledPromise =
  typeof window !== "undefined" &&
  process.env.NEXT_RUNTIME !== "nodejs" &&
  process.env.NEXT_PUBLIC_MSW_ENABLED === "true"
    ? import("@/mock/browser").then(async ({ worker }) => {
        await worker.start({
          onUnhandledRequest: (req, print) => {
            if (req.url.includes("_next")) {
              return;
            }
            print.warning();
          },
        });
        console.log("[MSW] Browser worker started");
      })
    : Promise.resolve();

export function MSWProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  if (process.env.NODE_ENV === "production") {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={null}>
      <MSWProviderWrapper>{children}</MSWProviderWrapper>
    </Suspense>
  );
}

function MSWProviderWrapper({ children }: { children: ReactNode }) {
  use(mockingEnabledPromise);
  return <>{children}</>;
}
