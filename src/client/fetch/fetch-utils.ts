const getBody = <T>(c: Response | Request): Promise<T> => {
	const contentType = c.headers.get("content-type");

	if (contentType?.includes("application/json")) {
		return c.json();
	}

	if (contentType?.includes("application/pdf")) {
		return c.blob() as Promise<T>;
	}

	return c.text() as Promise<T>;
};

const getUrl = (baseUrl: string, contextUrl: string): string => {
	const url = new URL(contextUrl);
	const pathname = url.pathname;
	const search = url.search;

	const requestUrl = new URL(`${baseUrl}${pathname}${search}`);

	return requestUrl.toString();
};

export const customFetch = async <T>(
	baseUrl: string,
	url: string,
	options: RequestInit,
): Promise<T> => {
	const requestUrl = getUrl(baseUrl, url);

	const requestInit: RequestInit = {
		...options,
	};

	const request = new Request(requestUrl, requestInit);
	const response = await fetch(request);
	const data = await getBody<T>(response);

	return { status: response.status, data } as T;
};
