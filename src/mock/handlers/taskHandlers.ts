import { createOpenApiHttp } from "openapi-msw";
import type { paths } from "@/types/api/task";

const http = createOpenApiHttp<paths>({ baseUrl: "http://localhost:8080" });

// Mock data
const mockTasks = [
	{
		id: "task-1",
		title: "Sample Task 1",
	},
	{
		id: "task-2",
		title: "Sample Task 2",
	},
];

const mockHealthStatus = {
	status: "UP" as const,
	timestamp: new Date().toISOString(),
	components: {
		database: {
			status: "UP" as const,
			details: {
				connection: "PostgreSQL",
				responseTime: "5ms",
			} as any,
		},
	},
};

// Environment variables for deterministic error control
const forceHealthError = process.env.MSW_FORCE_HEALTH_ERROR === "true";
const forceTasksError = process.env.MSW_FORCE_TASKS_ERROR === "true";
const forceTaskCreateError = process.env.MSW_FORCE_TASK_CREATE_ERROR === "true";
const forceTaskGetError = process.env.MSW_FORCE_TASK_GET_ERROR === "true";
const forceTaskUpdateError = process.env.MSW_FORCE_TASK_UPDATE_ERROR === "true";
const forceTaskDeleteError = process.env.MSW_FORCE_TASK_DELETE_ERROR === "true";

// Helper function to simulate authentication check
const isAuthenticated = (request: Request) => {
	const authHeader = request.headers.get("Authorization");
	return authHeader?.startsWith("Bearer ") ?? false;
};

export const taskHandlers = [
	// Health check endpoint
	http.get("/health", ({ response }) => {
		if (forceHealthError) {
			return response(503).json({
				status: "DOWN",
				timestamp: new Date().toISOString(),
				components: {
					database: {
						status: "DOWN",
						details: {
							error: "Connection refused",
						} as any,
					},
				},
			});
		}

		return response(200).json(mockHealthStatus);
	}),

	// Get all tasks
	http.get("/tasks", ({ request, response }) => {
		if (!isAuthenticated(request)) {
			return response(401).json({
				code: 401,
				message: "Unauthorized",
				details: "User ID not found in token",
			});
		}

		if (forceTasksError) {
			return response(500).json({
				code: 500,
				message: "Internal server error",
				details: "database connection failed",
			});
		}

		return response(200).json(mockTasks);
	}),

	// Create a new task
	http.post("/tasks", async ({ request, response }) => {
		if (!isAuthenticated(request)) {
			return response(401).json({
				code: 401,
				message: "Unauthorized",
				details: "User ID not found in token",
			});
		}

		const body = (await request.json()) as { title?: string };

		if (!body.title || body.title.trim() === "") {
			return response(400).json({
				code: 400,
				message: "Bad request",
				details: "title field is required and cannot be empty",
			});
		}

		if (body.title.length > 255) {
			return response(400).json({
				code: 400,
				message: "Bad request",
				details: "title field cannot exceed 255 characters",
			});
		}

		if (forceTaskCreateError) {
			return response(500).json({
				code: 500,
				message: "Internal server error",
				details: "database connection failed",
			});
		}

		const newTask = {
			id: `task-${Date.now()}`,
			title: body.title,
		};

		mockTasks.push(newTask);
		return response(201).json(newTask);
	}),

	// Get a single task
	http.get("/tasks/{taskId}", ({ request, params, response }) => {
		if (!isAuthenticated(request)) {
			return response(401).json({
				code: 401,
				message: "Unauthorized",
				details: "User ID not found in token",
			});
		}

		const task = mockTasks.find((t) => t.id === params.taskId);

		if (!task) {
			return response(404).json({
				code: 404,
				message: "Task not found",
			});
		}

		if (forceTaskGetError) {
			return response(500).json({
				code: 500,
				message: "Internal server error",
				details: "database connection failed",
			});
		}

		return response(200).json(task);
	}),

	// Update a task
	http.put("/tasks/{taskId}", async ({ request, params, response }) => {
		if (!isAuthenticated(request)) {
			return response(401).json({
				code: 401,
				message: "Unauthorized",
				details: "User ID not found in token",
			});
		}

		const taskIndex = mockTasks.findIndex((t) => t.id === params.taskId);

		if (taskIndex === -1) {
			return response(404).json({
				code: 404,
				message: "Task not found",
			});
		}

		const body = (await request.json()) as { title?: string };

		if (body.title && body.title.length > 255) {
			return response(400).json({
				code: 400,
				message: "Bad request",
				details: "task title cannot exceed 255 characters",
			});
		}

		if (forceTaskUpdateError) {
			return response(500).json({
				code: 500,
				message: "Internal server error",
				details: "database connection failed",
			});
		}

		if (body.title) {
			const task = mockTasks[taskIndex];
			if (task) {
				task.title = body.title;
			}
		}

		const updatedTask = mockTasks[taskIndex];
		if (updatedTask) {
			return response(200).json(updatedTask);
		}

		return response(404).json({
			code: 404,
			message: "Task not found",
		});
	}),

	// Delete a task
	http.delete("/tasks/{taskId}", ({ request, params, response }) => {
		if (!isAuthenticated(request)) {
			return response(401).json({
				code: 401,
				message: "Unauthorized",
				details: "User ID not found in token",
			});
		}

		const taskIndex = mockTasks.findIndex((t) => t.id === params.taskId);

		if (forceTaskDeleteError) {
			return response(500).json({
				code: 500,
				message: "Internal server error",
				details: "database connection failed",
			});
		}

		if (taskIndex !== -1) {
			mockTasks.splice(taskIndex, 1);
		}
		return response(204).empty();
	}),
];
