import type { SetupServerApi } from "msw/node";

let server: SetupServerApi | null = null;

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_MSW_ENABLED !== "false"
    ) {
      try {
        if (server) {
          server.close();
        }

        delete require.cache[require.resolve("./mock/handlers")];
        delete require.cache[require.resolve("./mock/node")];

        const { server: newServer } = await import("./mock/node");
        server = newServer;

        server.listen({
          onUnhandledRequest: (req, print) => {
            const excludedPaths = [
              "/_next",
              "/favicon.ico",
              "/__nextjs",
              "?_rsc=",
              "/_next/static",
              "/_next/webpack",
              "/api/",
              ".woff",
              ".woff2",
              ".ttf",
              ".png",
              ".jpg",
              ".jpeg",
              ".svg",
              ".ico",
              ".css",
              ".js",
              ".map",
            ];

            if (excludedPaths.some((path) => req.url.includes(path))) {
              return;
            }

            // Only show warnings for actual unhandled API requests
            if (req.url.startsWith("http") && req.url.includes("/api/")) {
              print.warning();
            }
          },
        });

        console.log("[MSW] Mock server is running");

        process.on("SIGTERM", () => server?.close());
        process.on("SIGINT", () => server?.close());
      } catch (error) {
        console.error("[MSW] Failed to start mock server:", error);
      }
    }
  }
}

// biome-ignore lint/correctness/noUnusedFunctionParameters: required for instrumentation interface
// biome-ignore lint/suspicious/noExplicitAny: instrumentation requires any types
export async function onRequestError(error: any, request: any, context: any) {
  console.error("Request error:", error);
}
