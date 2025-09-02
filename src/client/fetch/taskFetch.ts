import {customFetch} from "@/client/fetch/fetch-utils";

const baseUrl = process.env.NEXT_PUBLIC_TASK_API_BASE_URL || "http://localhost:8080";

export const taskFetch = async <T>(
    url: string,
    options: RequestInit,
): Promise<T> => {
  return customFetch(baseUrl, url, options);
};
