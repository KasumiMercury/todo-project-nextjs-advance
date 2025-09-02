import { createOpenApiHttp } from "openapi-msw";
import type { paths } from "@/types/api/user";

const http = createOpenApiHttp<paths>({ baseUrl: "http://localhost:8080" });

// Mock data
const mockUsers = [
	{
		userId: "user-1",
		username: "testuser1234",
		createdAt: "2025-01-15T10:30:00Z",
		password: "veeeeeeeeeeeeeryStrongPassword",
	},
	{
		userId: "user-2",
		username: "sampleuser",
		createdAt: "2025-01-16T15:45:00Z",
		password: "anotherStrongPassword123",
	},
];

const mockToken =
	"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJ1c2VyIiwic3ViIjoidXNlci0xIiwic2NvcGUiOlsicmVhZCIsIndyaXRlIl19.sample_jwt_signature";

const mockJwks = {
	keys: [
		{
			kty: "RSA",
			e: "AQAB",
			kid: "nEpO3EdePSSOWX-2zjpizXBWtmcY2yB4-XbVGJJK8Oo",
			n: "9DfhZ92pIYxtxfWKpRuWAB1ybQbhfHhFgXtHsxVkmWMCyL5sa5RXsEXxiwmGQsCVN5pHAP2t0-GgeURgDOR1ugVdQwbQGX0qrFPSDtTe3BcdOFIGnbUtikDcVUj_PcgW3QWISNzZzSy_c6JayEIswhvNUReTiz3r5UFpKQ2N2CCCcflknFSU-_qX9MvSbge0zjjnqNd41KIBafdvlWD0LZS9LHbPA5rp1BfhX01NGPGs5NP8DczzEwYc-011SIULcMA7sU2B4DoxqGHDyprddhWM0PkeuSg3l1RUbtx1NEgS2WmJDt9snrrL6PQfftLo9hsHNhEMQbvLDUwYnX7Tow",
		},
	],
};

// Environment variables for deterministic error control
const forceSignupError = process.env.MSW_FORCE_SIGNUP_ERROR === "true";
const forceSigninError = process.env.MSW_FORCE_SIGNIN_ERROR === "true";
const forceUserGetError = process.env.MSW_FORCE_USER_GET_ERROR === "true";
const forceJwksError = process.env.MSW_FORCE_JWKS_ERROR === "true";

// Helper function to validate JWT token format
const isValidJwtFormat = (token: string) => {
	const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
	return jwtPattern.test(token);
};

// Helper function to extract user from token (mock implementation)
const getUserFromToken = (authHeader: string) => {
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return null;
	}

	const token = authHeader.substring(7);
	if (!isValidJwtFormat(token)) {
		return null;
	}

	// Mock: return first user for valid tokens
	return mockUsers[0];
};

export const userHandlers = [
	// User signup
	http.post("/auth/v1/sign_up", async ({ request, response }) => {
		const body = (await request.json()) as {
			username?: string;
			password?: string;
		};

		// Validation errors
		const errors: Array<{
			field: string;
			message: string;
			rejectedValue: string;
		}> = [];

		if (!body.username || body.username.trim() === "") {
			errors.push({
				field: "username",
				message: "ユーザー名は必須です",
				rejectedValue: body.username || "",
			});
		} else if (!/^[a-zA-Z0-9]+$/.test(body.username)) {
			errors.push({
				field: "username",
				message: "ユーザー名に半角英数字以外が使用されています",
				rejectedValue: body.username,
			});
		}

		if (!body.password || body.password.trim() === "") {
			errors.push({
				field: "password",
				message: "パスワードは必須です",
				rejectedValue: body.password || "",
			});
		}

		if (errors.length > 0) {
			return response(400).json({
				type: "about:blank",
				title: "Validation Failed",
				status: 400,
				detail: "入力内容にエラーがあります",
				instance: "/auth/v1/sign_up",
				properties: {
					errors: errors.reduce(
						(acc, error, index) => {
							acc[index.toString()] = error as any;
							return acc;
						},
						{} as any,
					),
				} as any,
			});
		}

		// Check if username already exists
		const existingUser = mockUsers.find(
			(user) => user.username === body.username,
		);
		if (existingUser) {
			return response(400).json({
				type: "about:blank",
				title: "Bad Request",
				status: 400,
				detail: `ユーザーの作成に失敗しました：[ユーザー名${body.username}はすでに使用されています]`,
				instance: "/auth/v1/sign_up",
			});
		}

		if (forceSignupError) {
			return response.untyped(
				new Response(
					JSON.stringify({
						type: "about:blank",
						title: "Internal Server Error",
						status: 500,
						detail: "ユーザー作成中にサーバーエラーが発生しました",
						instance: "/auth/v1/sign_up",
					}),
					{
						status: 500,
						headers: { "Content-Type": "application/json" },
					},
				),
			);
		}

		// Create new user
		const newUser = {
			userId: `user-${Date.now()}`,
			username: body.username as string,
			createdAt: new Date().toISOString(),
			password: body.password as string,
		};

		mockUsers.push(newUser);

		return response(200).json({
			username: newUser.username,
			userId: newUser.userId,
			createdAt: newUser.createdAt,
		});
	}),

	// User signin
	http.post("/auth/v1/sign_in", async ({ request, response }) => {
		const body = (await request.json()) as {
			username?: string;
			password?: string;
		};

		// Validation errors
		const errors: Array<{
			field: string;
			message: string;
			rejectedValue: string;
		}> = [];

		if (!body.username || body.username.trim() === "") {
			errors.push({
				field: "username",
				message: "ユーザー名は必須です",
				rejectedValue: body.username || "",
			});
		} else if (!/^[a-zA-Z0-9]+$/.test(body.username)) {
			errors.push({
				field: "username",
				message: "ユーザー名に半角英数字以外が使用されています",
				rejectedValue: body.username,
			});
		}

		if (!body.password || body.password.trim() === "") {
			errors.push({
				field: "password",
				message: "パスワードは必須です",
				rejectedValue: body.password || "",
			});
		}

		if (errors.length > 0) {
			return response(400).json({
				type: "about:blank",
				title: "Validation Failed",
				status: 400,
				detail: "入力内容にエラーがあります",
				instance: "/auth/v1/sign_in",
				properties: {
					errors: errors.reduce(
						(acc, error, index) => {
							acc[index.toString()] = error as any;
							return acc;
						},
						{} as any,
					),
				} as any,
			});
		}

		// Check credentials
		const user = mockUsers.find(
			(u) => u.username === body.username && u.password === body.password,
		);

		if (!user) {
			return response(401).json({
				type: "about:blank",
				title: "Unauthorized",
				status: 401,
				detail: "ユーザ名かパスワードが正しくありません",
				instance: "/auth/v1/sign_in",
			});
		}

		if (forceSigninError) {
			return response.untyped(
				new Response(
					JSON.stringify({
						type: "about:blank",
						title: "Internal Server Error",
						status: 500,
						detail: "認証処理中にサーバーエラーが発生しました",
						instance: "/auth/v1/sign_in",
					}),
					{
						status: 500,
						headers: { "Content-Type": "application/json" },
					},
				),
			);
		}

		return response(200).json({
			token: mockToken,
		});
	}),

	// Get current user
	http.get("/api/v1/users/i", ({ request, response }) => {
		const authHeader = request.headers.get("Authorization");
		const user = getUserFromToken(authHeader || "");

		if (!user) {
			if (authHeader && !authHeader.startsWith("Bearer ")) {
				return response(401).json({
					type: "about:blank",
					title: "Authentication Failed",
					status: 401,
					detail: "Full authentication is required to access this resource",
					instance: "/api/v1/users/i",
				});
			}

			const token = authHeader?.substring(7) || "";
			if (!isValidJwtFormat(token)) {
				return response(401).json({
					type: "about:blank",
					title: "invalid_token",
					status: 401,
					detail:
						"An error occurred while attempting to decode the Jwt: Malformed token",
					instance: "/api/v1/users/i",
				});
			}

			return response(401).json({
				type: "about:blank",
				title: "invalid_token",
				status: 401,
				detail:
					"An error occurred while attempting to decode the Jwt: Invalid signature",
				instance: "/api/v1/users/i",
			});
		}

		if (forceUserGetError) {
			return response.untyped(
				new Response(
					JSON.stringify({
						type: "about:blank",
						title: "Internal Server Error",
						status: 500,
						detail: "ユーザー情報取得中にサーバーエラーが発生しました",
						instance: "/api/v1/users/i",
					}),
					{
						status: 500,
						headers: { "Content-Type": "application/json" },
					},
				),
			);
		}

		return response(200).json({
			username: user.username,
			userId: user.userId,
			createdAt: user.createdAt,
		});
	}),

	// JWKS endpoint
	http.get("/.well-known/jwks.json", ({ response }) => {
		if (forceJwksError) {
			return response.untyped(
				new Response(
					JSON.stringify({
						type: "about:blank",
						title: "Internal Server Error",
						status: 500,
						detail: "JWKs取得中にサーバーエラーが発生しました",
					}),
					{
						status: 500,
						headers: { "Content-Type": "application/json" },
					},
				),
			);
		}

		return response.untyped(
			new Response(JSON.stringify(mockJwks), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);
	}),
];
