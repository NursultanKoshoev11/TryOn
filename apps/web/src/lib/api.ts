export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  full_name?: string;
};

export type Organization = {
  id: string;
  owner_user_id?: string;
  name: string;
  store_domain: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type Usage = {
  total_generations: number;
  monthly_generations: number;
  remaining_quota: number;
  success_rate: number;
  plan: string;
  period_start: string;
  period_end: string;
};

export type Generation = {
  id: string;
  product_id: string;
  product_name: string;
  status: string;
  created_at: string;
  output_count?: number;
  ai_provider?: string;
  processing_time_ms?: number | null;
  error_message?: string | null;
};

export type ApiKeyRecord = {
  id: string;
  name: string;
  key?: string;
  key_prefix: string;
  status: string;
  allowed_domains?: string;
  created_at: string;
  last_used_at?: string | null;
};

type JsonRecord = Record<string, unknown>;

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | (JsonRecord & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed");
  }

  return payload as T;
}

function authHeaders(token: string, hasBody = false) {
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchCurrentUser(token: string) {
  const response = await fetch(`${API_URL}/api/v1/me`, {
    headers: authHeaders(token),
  });

  return parseResponse<SessionUser>(response);
}

export async function fetchOrganizations(token: string) {
  const response = await fetch(`${API_URL}/api/v1/organizations`, {
    headers: authHeaders(token),
  });

  const payload = await parseResponse<{ organizations: Organization[] }>(response);
  return payload.organizations || [];
}

export async function fetchOrganization(token: string, organizationId: string) {
  const response = await fetch(
    `${API_URL}/api/v1/organizations/${organizationId}`,
    {
      headers: authHeaders(token),
    }
  );

  return parseResponse<Organization>(response);
}

export async function updateOrganization(
  token: string,
  organizationId: string,
  body: { name: string; store_domain: string }
) {
  const response = await fetch(
    `${API_URL}/api/v1/organizations/${organizationId}`,
    {
      method: "PATCH",
      headers: authHeaders(token, true),
      body: JSON.stringify(body),
    }
  );

  return parseResponse<Organization>(response);
}

export async function fetchUsage(token: string, organizationId: string) {
  const response = await fetch(
    `${API_URL}/api/v1/organizations/${organizationId}/usage`,
    {
      headers: authHeaders(token),
    }
  );

  return parseResponse<Usage>(response);
}

export async function fetchApiKeys(token: string, organizationId: string) {
  const response = await fetch(
    `${API_URL}/api/v1/organizations/${organizationId}/api-keys`,
    {
      headers: authHeaders(token),
    }
  );

  const payload = await parseResponse<{ api_keys: ApiKeyRecord[] }>(response);
  return payload.api_keys || [];
}

export async function createApiKey(
  token: string,
  organizationId: string,
  body: { name: string; allowed_domains?: string }
) {
  const response = await fetch(
    `${API_URL}/api/v1/organizations/${organizationId}/api-keys`,
    {
      method: "POST",
      headers: authHeaders(token, true),
      body: JSON.stringify(body),
    }
  );

  return parseResponse<ApiKeyRecord>(response);
}

export async function revokeApiKey(
  token: string,
  organizationId: string,
  keyId: string
) {
  const response = await fetch(
    `${API_URL}/api/v1/organizations/${organizationId}/api-keys/${keyId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    }
  );

  return parseResponse<{ message: string }>(response);
}

export async function rotateApiKey(
  token: string,
  organizationId: string,
  keyId: string
) {
  const response = await fetch(
    `${API_URL}/api/v1/organizations/${organizationId}/api-keys/${keyId}/rotate`,
    {
      method: "POST",
      headers: authHeaders(token),
    }
  );

  return parseResponse<ApiKeyRecord>(response);
}

export async function fetchGenerations(token: string, organizationId: string) {
  const response = await fetch(
    `${API_URL}/api/v1/organizations/${organizationId}/generations?limit=50`,
    {
      headers: authHeaders(token),
    }
  );

  const payload = await parseResponse<{ generations: Generation[] }>(response);
  return payload.generations || [];
}

export async function createOrganization(
  token: string,
  body: { name: string; store_domain: string }
) {
  const response = await fetch(`${API_URL}/api/v1/organizations`, {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify(body),
  });

  return parseResponse<Organization>(response);
}
