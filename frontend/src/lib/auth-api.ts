const AUTH_API_BASE = "/api/auth";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${AUTH_API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });
  } catch {
    throw new Error(`Network error — could not reach the server. (${path})`);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.detail ||
      payload?.message ||
      `Request failed with status ${response.status} (${path})`;
    throw new Error(message);
  }

  return payload as T;
}

export interface AuthUserRecord {
  id: string;
  email: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

export interface AuthLookupResult {
  exists: boolean;
  message: string;
  user?: AuthUserRecord;
}

export async function lookupAccountByEmail(email: string) {
  return requestJson<AuthLookupResult>("/lookup", {
    method: "POST",
    body: JSON.stringify({ email: normalizeEmail(email) }),
  });
}

export async function registerAccountByEmail(input: {
  email: string;
  fullName?: string;
  avatarUrl?: string;
  password?: string;
}) {
  return requestJson<AuthLookupResult>("/register", {
    method: "POST",
    body: JSON.stringify({
      email: normalizeEmail(input.email),
      full_name: input.fullName,
      avatar_url: input.avatarUrl,
      password: input.password,
    }),
  });
}

export async function updateGoogleProfile(input: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  age?: string;
  preferredLanguage?: string;
}) {
  return requestJson<{ success: boolean; message: string }>("/google-setup", {
    method: "POST",
    body: JSON.stringify({
      email: normalizeEmail(input.email),
      first_name: input.firstName,
      last_name: input.lastName,
      password: input.password,
      age: input.age,
      preferred_language: input.preferredLanguage,
    }),
  });
}