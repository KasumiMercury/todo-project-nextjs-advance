import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getI, signInJson } from "@/client/user/user/user";
import type { SignInDto } from "@/client/user/schemas/signInDto";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24,
};

export async function POST(request: Request) {
  let credentials: SignInDto;

  try {
    credentials = (await request.json()) as SignInDto;
  } catch (error) {
    console.error("[auth/login] invalid json", error);
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!credentials?.username || !credentials?.password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 },
    );
  }

  try {
    const signInResponse = await signInJson(credentials);

    if (signInResponse.status !== 200) {
      return NextResponse.json(signInResponse.data, {
        status: signInResponse.status,
      });
    }

    const token = signInResponse.data.token;
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, token, cookieOptions);

    const userResponse = await getI({
      headers: { Authorization: `Bearer ${token}` },
    });

    if (userResponse.status !== 200) {
      console.warn("[auth/login] failed to fetch user detail", userResponse);
      return NextResponse.json(
        { message: "Login succeeded but user info is unavailable" },
        { status: 200 },
      );
    }

    return NextResponse.json({ user: userResponse.data }, { status: 200 });
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 },
    );
  }
}
