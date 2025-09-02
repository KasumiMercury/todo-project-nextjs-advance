import type { HttpHandler } from "msw";
import { taskHandlers } from "./taskHandlers";
import { userHandlers } from "./userHandlers";

export const handlers: HttpHandler[] = [...taskHandlers, ...userHandlers];
