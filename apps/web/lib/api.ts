// Browser-facing URL (must be set in apps/web/.env.local, e.g. http://localhost:4000)
const BROWSER_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// Server-side (RSC / route handlers) URL. NEXT_PUBLIC_* vars are also readable
// server-side; if the developer points them at a LAN IP so phones can connect,
// prefer the plain-localhost fallback for our own fetches. If neither works,
// API_INTERNAL_URL lets you override explicitly.
function pickServerUrl(): string {
  if (process.env.API_INTERNAL_URL) return process.env.API_INTERNAL_URL;
  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (pub && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(pub)) return pub;
  return 'http://localhost:4000';
}
const SERVER_API_URL = pickServerUrl();

export type ApiFetchOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function api<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const res = await fetch(`${BROWSER_API_URL}${path}`, {
    ...opts,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  }).catch((err) => {
    throw new Error(
      `Cannot reach the API at ${BROWSER_API_URL}. Is "npm run dev:api" running? (${String(err)})`,
    );
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

// Server-side helper (no cookies) for RSC fetches. Uses SERVER_API_URL and
// logs failures instead of swallowing them silently.
export async function apiPublic<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${SERVER_API_URL}${path}`, { cache: 'no-store' });
  } catch (err) {
    console.error(
      `[armart] Could not reach the API at ${SERVER_API_URL}${path}. ` +
        `Start it with "npm run dev:api". (${String(err)})`,
    );
    throw new Error(`API unreachable at ${SERVER_API_URL}`);
  }
  if (!res.ok) {
    console.error(`[armart] API returned ${res.status} for ${path} (server URL: ${SERVER_API_URL})`);
    throw new Error(`Failed: ${res.status}`);
  }
  return (await res.json()) as T;
}