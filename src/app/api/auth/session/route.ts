import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getI } from "@/client/user/user/user";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

const unauthorized = () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return unauthorized();
  }

  try {
    const response = await getI({
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json(response.data, { status: response.status });
    }

    return NextResponse.json({ user: response.data }, { status: 200 });
  } catch (error) {
    console.error("[auth/session]", error);
    cookieStore.delete(AUTH_COOKIE_NAME);
    return NextResponse.json(
      { message: "Failed to verify session" },
      { status: 500 },
    );
  }
}
