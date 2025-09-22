"use client";

import { type ReactNode, Suspense, use } from "react";

const isBrowser = typeof window !== "undefined";

const isSecureMockContext = (() => {
  if (!isBrowser) {
    return false;
  }

  if (window.isSecureContext) {
    return true;
  }

  const hostname = window.location.hostname;
  const localhostAliases = ["localhost", "127.0.0.1", "[::1]"];

  if (localhostAliases.includes(hostname)) {
    return true;
  }

  if (hostname.endsWith(".localhost")) {
    return true;
  }

  return false;
})();

const shouldEnableMocking =
    isBrowser &&
    isSecureMockContext &&
    process.env.NEXT_RUNTIME !== "nodejs" &&
    process.env.NEXT_PUBLIC_MSW_ENABLED !== "false";

const mockingEnabledPromise = shouldEnableMocking
    ? import("@/mock/browser").then(async ({ worker }) => {
      if (!("serviceWorker" in navigator)) {
        console.warn(
            "[MSW] Service workers are not supported in this browser. Skipping worker registration.",
        );
        return;
      }

      try {
        await worker.start({
          onUnhandledRequest: (req, print) => {
            if (req.url.includes("_next")) {
              return;
            }
            print.warning();
          },
        });
        console.log("[MSW] Browser worker started");
      } catch (error) {
        const message =
            error instanceof Error ? error.message?.toLowerCase() : "";
        if (message.includes("insecure")) {
          console.warn(
              "[MSW] Browser worker could not start because the context is insecure.",
          );
          return;
        }

        console.error("[MSW] Browser worker failed to start", error);
      }
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

  if (isBrowser && !isSecureMockContext) {
    console.warn(
        "[MSW] Skipping worker registration because the current origin is not considered secure.",
    );
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
