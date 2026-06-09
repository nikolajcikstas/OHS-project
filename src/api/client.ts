const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const USE_STUBS = import.meta.env.VITE_USE_STUBS !== 'false';

export function isUsingStubs(): boolean {
  return USE_STUBS;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export { request, API_BASE, USE_STUBS };
