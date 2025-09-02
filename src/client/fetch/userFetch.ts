import { customFetch } from "@/client/fetch/fetch-utils";

const baseUrl =
	process.env.NEXT_PUBLIC_USER_API_BASE_URL || "http://localhost:8080";

export const userFetch = async <T>(
	url: string,
	options: RequestInit,
): Promise<T> => {
	return customFetch(baseUrl, url, options);
};
