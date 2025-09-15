import { defineConfig } from "orval";

export default defineConfig({
  task: {
    input: "./schema/task-server.yaml",
    output: {
      target: "./src/client/task",
      schemas: "./src/client/task/schemas",
      client: "fetch",
      httpClient: "fetch",
      override: {
        mutator: {
          path: "./src/client/fetch/taskFetch.ts",
          name: "taskFetch",
        },
      },
      mode: "tags-split",
      mock: {
        type: "msw",
        useExamples: true,
        generateEachHttpStatus: true,
        indexMockFiles: true,
      },
      biome: true,
      clean: true,
    },
  },
  taskZod: {
    input: "./schema/task-server.yaml",
    output: {
      target: "./src/client/task",
      client: "zod",
      fileExtension: ".zod.ts",
      mode: "tags-split",
      biome: true,
    },
  },
  user: {
    input: "./schema/user-server.json",
    output: {
      target: "./src/client/user",
      schemas: "./src/client/user/schemas",
      client: "fetch",
      httpClient: "fetch",
      override: {
        mutator: {
          path: "./src/client/fetch/userFetch.ts",
          name: "userFetch",
        },
      },
      mode: "tags-split",
      mock: {
        type: "msw",
        useExamples: true,
        generateEachHttpStatus: true,
        indexMockFiles: true,
      },
      biome: true,
      clean: true,
    },
  },
  userZod: {
    input: "./schema/user-server.json",
    output: {
      target: "./src/client/user",
      client: "zod",
      fileExtension: ".zod.ts",
      mode: "tags-split",
      biome: true,
    },
  },
});
