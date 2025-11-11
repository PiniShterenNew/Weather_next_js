export interface FetchSecureOptions extends RequestInit {
  requireAuth?: boolean;
}

type ClerkServerModule = typeof import('@clerk/nextjs/server');

const ensureHttps = (url: string) => {
  if (url.startsWith('http://')) {
    throw new Error('Insecure HTTP protocol is not allowed. Use HTTPS for all requests.');
  }
};

const resolveAuthToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    try {
      const dynamicRequire = eval('require') as (moduleId: string) => ClerkServerModule;
      const serverModule = dynamicRequire('@clerk/nextjs/server');
      const authState = await serverModule.auth();
      try {
        const token = await authState.getToken();
        return token ?? null;
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }

  try {
    const { getToken } = await import('@clerk/nextjs');
    const token = await getToken();
    return token ?? null;
  } catch {
    return null;
  }
};

export const fetchSecure = async (
  input: string | URL,
  init: FetchSecureOptions = {},
): Promise<Response> => {
  const { requireAuth = true, ...requestInit } = init;
  const headers = new Headers(requestInit.headers);

  const url = typeof input === 'string' ? input : input.toString();
  ensureHttps(url.startsWith('/') ? `https://placeholder${url}` : url);

  if (requireAuth) {
    const token = await resolveAuthToken();
    if (!token) {
      throw new Error('Authorization token is required but could not be retrieved.');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (requestInit.body && !headers.has('Content-Type') && !(requestInit.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  return fetch(input, {
    ...requestInit,
    headers,
  });
};


