// Thin fetch wrapper around the Odolog API. Deliberately framework-agnostic
// (no DOM/React imports) so this whole file can be reused as-is in a future
// React Native build — only the API_URL source would need to change.

const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });

  if (res.status === 401) {
    const err = new Error('Not signed in.');
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  googleLoginUrl: () => `${API_URL}/auth/google`,
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  listVehicles: () => request('/api/vehicles'),
  addVehicle: (vehicle) => request('/api/vehicles', { method: 'POST', body: JSON.stringify(vehicle) }),

  listServiceLogs: (vehicleId) => request(`/api/vehicles/${vehicleId}/logs`),
  getServiceLog: (vehicleId, logId) => request(`/api/vehicles/${vehicleId}/logs/${logId}`),
  addServiceLog: (vehicleId, log) =>
    request(`/api/vehicles/${vehicleId}/logs`, { method: 'POST', body: JSON.stringify(log) }),
};
