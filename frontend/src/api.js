// Change VITE_API (e.g. in .env) if the WAR is deployed under another context path.
const API = import.meta.env.VITE_API || '/careconnect/api';
let csrf = '';
export const setCsrf = (t) => { csrf = t; };

async function call(method, path, body) {
  const res = await fetch(API + path, {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: method === 'GET' ? undefined : JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status });
  return data;
}
export const api = { get: (p) => call('GET', p), post: (p, b) => call('POST', p, b) };
