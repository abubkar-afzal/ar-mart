const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type ApiFetchOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function api<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

// Server-side helper (no cookies) for RSC fetches
export async function apiPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return (await res.json()) as T;
}