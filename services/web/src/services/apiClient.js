const DEFAULT_TIMEOUT = 15000;

const getEnv = (key, fallback = "") => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] ?? fallback;
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] ?? fallback;
  }
  return fallback;
};

export const API_BASE_URLS = {
  inventory: getEnv("VITE_INVENTORY_API_BASE_URL", "http://localhost:4001"),
  procurement: getEnv("VITE_PROCUREMENT_API_BASE_URL", "http://localhost:4002"),
};

const buildUrl = (service, path) => {
  const base = API_BASE_URLS[service] ?? API_BASE_URLS.inventory;
  const sanitizedBase = base.replace(/\/+$/, "");
  const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${sanitizedBase}${sanitizedPath}`;
};

const parseJson = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

const createError = (response, data) => {
  const error = new Error(
    data?.message || `Request failed with status ${response.status}`
  );
  error.status = response.status;
  error.data = data;
  return error;
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

export async function apiRequest(service, path, options = {}) {
  const { headers, body, timeout, ...rest } = options;
  const url = buildUrl(service, path);

  const response = await fetchWithTimeout(url, {
    ...rest,
    timeout,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw createError(response, data);
  }

  return data;
}

export const inventoryApi = {
  get: (path, options) => apiRequest("inventory", path, options),
  post: (path, body, options) =>
    apiRequest("inventory", path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    apiRequest("inventory", path, { ...options, method: "PUT", body }),
  delete: (path, options) =>
    apiRequest("inventory", path, { ...options, method: "DELETE" }),
};

export const procurementApi = {
  get: (path, options) => apiRequest("procurement", path, options),
  post: (path, body, options) =>
    apiRequest("procurement", path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    apiRequest("procurement", path, { ...options, method: "PUT", body }),
  delete: (path, options) =>
    apiRequest("procurement", path, { ...options, method: "DELETE" }),
};
