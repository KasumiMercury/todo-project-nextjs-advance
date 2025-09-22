import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { taskCreateTask, taskGetAllTasks } from "@/client/task/task/task";
import type { TaskCreate } from "@/client/task/schemas/taskCreate";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

type TaskError = {
  code?: number;
  message: string;
  details?: string;
};

const unauthorizedResponse = () =>
  NextResponse.json({ message: "Unauthorized" }, { status: 401 });

export async function GET() {
  const cookiesStore = await cookies();
    const token = cookiesStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return unauthorizedResponse();
  }

  try {
    const response = await taskGetAllTasks({
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error("[tasks][GET]", error);
    return NextResponse.json(
      { message: "Failed to load tasks" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const cookiesStore = await cookies();
  const token = cookiesStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return unauthorizedResponse();
  }

  let payload: TaskCreate;

  try {
    payload = (await request.json()) as TaskCreate;
  } catch (error) {
    console.error("[tasks][POST] invalid json", error);
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!payload?.title?.trim()) {
    return NextResponse.json(
      { message: "Title is required" },
      { status: 400 },
    );
  }

  try {
    const response = await taskCreateTask(payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 201) {
      return NextResponse.json(response.data, { status: 201 });
    }

    return NextResponse.json(response.data as TaskError, {
      status: response.status,
    });
  } catch (error) {
    console.error("[tasks][POST]", error);
    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 },
    );
  }
}
