// Preloaded into the backend process (node --import). It watches the calls the backend makes to the institution's API
// (Confianza IPS) and reports method, path, status and time to the evidence runner. It never reads a body, a header or
// a token. When the runner has armed a failure, it answers ONE request with a 503 so the backend's own retry code has
// a real transient failure to recover from. Everything else goes through untouched.
const control = process.env.OBSERVE_CTRL;
const watchedHost = process.env.OBSERVE_HOST;
const original = globalThis.fetch;

const normalize = (path) => path.replace(/\/\d+(?=\/|$)/g, '/{id}');

async function report(event) {
  await original(`${control}/ips-event`, { method: 'POST', body: JSON.stringify(event) }).catch(() => undefined);
}

globalThis.fetch = async function observedFetch(input, init) {
  let url;
  try {
    url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
  } catch {
    return original(input, init);
  }
  if (!control || url.host !== watchedHost) return original(input, init);

  const method = String(init?.method ?? (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase();
  const startedAt = Date.now();
  const armed = await original(`${control}/ips-arm`)
    .then((r) => r.json())
    .catch(() => ({ fail: false }));

  if (armed.fail) {
    await report({ method, endpoint: normalize(url.pathname), at: startedAt, status: 503, ms: Date.now() - startedAt, injected: true });
    return new Response(JSON.stringify({ error: { code: 'INJECTED_TRANSIENT_FAILURE' } }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  let response;
  try {
    response = await original(input, init);
  } catch (error) {
    await report({ method, endpoint: normalize(url.pathname), at: startedAt, status: 0, ms: Date.now() - startedAt, injected: false });
    throw error;
  }
  await report({ method, endpoint: normalize(url.pathname), at: startedAt, status: response.status, ms: Date.now() - startedAt, injected: false });
  return response;
};
