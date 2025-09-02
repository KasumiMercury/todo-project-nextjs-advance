import type { HttpHandler } from "msw";
import { getHealthMock } from "@/client/task/health/health.msw";
import { getTaskMock } from "@/client/task/task/task.msw";
import { getUserMock } from "@/client/user/user/user.msw";

export const handlers: HttpHandler[] = [
	...getTaskMock(),
	...getHealthMock(),
	...getUserMock(),
];
