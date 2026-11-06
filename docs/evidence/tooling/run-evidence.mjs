// Runs the real Waylo agent ten times, end to end, and records what actually happened.
//
// Nothing here is simulated. The backend is the real one (waylo.ai-backend), it calls the real model (Reto) and the
// real institutional API (Confianza IPS), and its own audit table (agent_executions) is read back at the end.
// The traffic is only observed (method, path, status, time; never a body, a token or a key): a small proxy in front of
// the model, and a fetch observer preloaded into the backend for the institution's API (whose URL lives in the database).
// On two marked runs one request is answered with a 503 so the backend's own retry code has a real transient failure
// to recover from. Those two runs are labelled "inyectado" in the output.
//
// Usage: node docs/evidence/tooling/run-evidence.mjs   (from the repository root; needs ../waylo.ai-backend next to it)
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseEnv } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const backendDir = resolve(process.env.WAYLO_BACKEND_DIR ?? join(here, '..', '..', '..', '..', 'waylo.ai-backend'));
const frontendDir = resolve(process.env.WAYLO_FRONTEND_DIR ?? join(here, '..', '..', '..'));

const RETO_PROXY_PORT = 18788;
const IPS_PROXY_PORT = 18789;
const BACKEND_PORT = 13011;

// --- configuration: read quietly, never printed -----------------------------------------------------------------
process.loadEnvFile(join(backendDir, '.env'));
const frontendEnv = parseEnv(readFileSync(join(frontendDir, '.env.local'), 'utf8'));
const retoKey = frontendEnv.RETO_KEY;
const retoBase = (frontendEnv.RETO_BASE_URL || 'https://api.reto.pltk.mx/v1').replace(/\/+$/, '');
const model = frontendEnv.RETO_MODEL || 'grok-4.20-0309-non-reasoning';
if (!retoKey) throw new Error('RETO_KEY is missing from the frontend .env.local.');

// --- the observers ----------------------------------------------------------------------------------------------
let current = null; // the run being recorded
const armed = { reto: false, ips: false };

const dropHeaders = new Set(['host', 'connection', 'content-length', 'accept-encoding', 'transfer-encoding']);

function readBody(req) {
  return new Promise((resolveBody) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolveBody(Buffer.concat(chunks)));
  });
}

async function proxy(kind, req, res, targetBase) {
  const body = await readBody(req);
  const t0 = Date.now();
  const startedAt = t0 - (current?.t0 ?? t0);
  const url = new URL(req.url, 'http://local');

  if (armed[kind]) {
    armed[kind] = false;
    if (current) current.consumed[kind] = true;
    res.writeHead(503, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { code: 'INJECTED_TRANSIENT_FAILURE' } }));
    current?.events.push(
      { service: 'reto', n: current.events.filter((e) => e.service === 'reto').length + 1, at_ms: startedAt, status: 503, ms: Date.now() - t0, injected: true, decided_tools: [] },
    );
    return;
  }

  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) if (!dropHeaders.has(k) && typeof v === 'string') headers[k] = v;
  let upstream;
  let payload = Buffer.alloc(0);
  let status = 502;
  try {
    upstream = await fetch(`${targetBase}${kind === 'reto' ? url.pathname.replace(/^\/v1/, '') : url.pathname}${url.search}`, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
    });
    status = upstream.status;
    payload = Buffer.from(await upstream.arrayBuffer());
    const out = {};
    const ct = upstream.headers.get('content-type');
    if (ct) out['content-type'] = ct;
    res.writeHead(status, out);
    res.end(payload);
  } catch {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { code: 'PROXY_UPSTREAM_ERROR' } }));
  }

  if (!current) return;
  if (kind === 'reto') {
    let decided = [];
    let finish = null;
    try {
      const choice = JSON.parse(payload.toString('utf8'))?.choices?.[0];
      decided = (choice?.message?.tool_calls ?? []).map((c) => c?.function?.name).filter(Boolean);
      finish = choice?.finish_reason ?? null;
    } catch {
      /* not JSON: nothing to read */
    }
    current.events.push({
      service: 'reto',
      n: current.events.filter((e) => e.service === 'reto').length + 1,
      at_ms: startedAt,
      status,
      ms: Date.now() - t0,
      injected: false,
      decided_tools: decided,
      finish_reason: finish,
    });
  }
}

const retoServer = createServer((req, res) => void proxy('reto', req, res, retoBase));

// Control channel for the fetch observer inside the backend (see observe-ips.mjs).
const ipsServer = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://local');
  if (url.pathname === '/ips-arm') {
    const fail = armed.ips;
    if (fail) {
      armed.ips = false;
      if (current) current.consumed.ips = true;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ fail }));
    return;
  }
  if (url.pathname === '/ips-event' && req.method === 'POST') {
    const e = JSON.parse((await readBody(req)).toString('utf8'));
    current?.events.push({ service: 'ips', method: e.method, endpoint: e.endpoint, at_ms: e.at - current.t0, status: e.status, ms: e.ms, injected: Boolean(e.injected) });
  }
  res.writeHead(204);
  res.end();
});
await Promise.all([
  new Promise((ok) => retoServer.listen(RETO_PROXY_PORT, '127.0.0.1', ok)),
  new Promise((ok) => ipsServer.listen(IPS_PROXY_PORT, '127.0.0.1', ok)),
]);

// --- the patient the agent acts for (never printed or stored in clear) ------------------------------------------
const { PrismaClient } = createRequire(join(backendDir, 'package.json'))('@prisma/client');
const prisma = new PrismaClient();
const link = await prisma.externalIpsLink.findFirst({
  where: { status: 'ACTIVE', OR: [{ tokenExpiresAt: null }, { tokenExpiresAt: { gt: new Date() } }] },
  orderBy: { linkedAt: 'asc' },
  select: { externalSubject: true, ipsId: true },
});
if (!link) throw new Error('There is no active IPS link to run the agent for.');
// The institution's address lives in the database, not in the environment: that is the host to observe.
const ips = await prisma.ips.findUnique({ where: { id: link.ipsId }, select: { baseUrl: true } });
await prisma.$disconnect();
if (!ips) throw new Error('The link points to an IPS that does not exist.');
const externalSubject = link.externalSubject;
console.log(`IPS observada: ${new URL(ips.baseUrl).host}`);

// --- the real backend, with the model behind an observer and a fetch observer preloaded for the IPS ----------------
const backend = spawn(process.execPath, ['--import', 'tsx', '--import', pathToFileURL(join(here, 'observe-ips.mjs')).href, 'src/server.ts'], {
  cwd: backendDir,
  env: {
    ...process.env,
    PORT: String(BACKEND_PORT),
    RETO_KEY: retoKey,
    RETO_BASE_URL: `http://127.0.0.1:${RETO_PROXY_PORT}/v1`,
    RETO_MODEL: model,
    OBSERVE_CTRL: `http://127.0.0.1:${IPS_PROXY_PORT}`,
    OBSERVE_HOST: new URL(ips.baseUrl).host,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let backendTail = '';
for (const stream of [backend.stdout, backend.stderr]) stream.on('data', (d) => (backendTail = (backendTail + d).slice(-1500)));

const api = `http://127.0.0.1:${BACKEND_PORT}`;
const internalKey = process.env.WAYLO_INTERNAL_KEY;

async function shutdown() {
  backend.kill();
  retoServer.close();
  ipsServer.close();
}

try {
  for (let i = 0; i < 60; i += 1) {
    const up = await fetch(`${api}/health`).then((r) => r.status < 500).catch(() => false);
    if (up) break;
    if (i === 59) throw new Error(`The backend did not start. Last lines: ${backendTail.replace(/postgres(ql)?:\/\/\S+/g, '[db]')}`);
    await new Promise((r) => setTimeout(r, 500));
  }

  // The agent speaks Spanish, so its system prompt and the prompts below are in Spanish on purpose: they are what the
  // product's users actually type, and what was recorded in runs.jsonl.
  const system =
    'Eres Waylo, un navegador del sistema de salud: orientas a la persona sobre a qué nivel de atención acudir y consultas la IPS con tus herramientas reales. ' +
    'No diagnosticas, no recetas y no inventas datos: si una herramienta falla, lo dices. Solo lectura: no apartes, canceles ni muevas citas. ' +
    'Responde en español, breve y con viñetas.';

  const scenarios = [
    { id: 'profile-1', label: 'Perfil institucional', text: '¿A qué IPS y sede estoy vinculado? Revisa mi perfil institucional.' },
    { id: 'catalog-1', label: 'Catálogo de servicios', text: '¿Qué servicios y médicos tiene mi IPS?' },
    { id: 'earliest-1', label: 'Primer cupo, medicina general', text: 'Desde ayer me duele el oído, sin fiebre. ¿Cuál es el cupo de medicina general más pronto? Solo consulta, no apartes nada.' },
    { id: 'appointments-1', label: 'Mis citas (fallo en el modelo)', inject: 'reto', text: 'Lista mis citas actuales. No inventes ninguna.' },
    { id: 'earliest-2', label: 'Primer cupo, prioritaria', text: 'Necesito atención prioritaria hoy. ¿Cuál es el primer cupo disponible? Solo consulta.' },
    { id: 'catalog-2', label: 'Tipos de cita', text: 'Antes de pedir cita, dime qué tipos de cita puedo pedir.' },
    { id: 'earliest-3', label: 'Primer cupo (fallo en la IPS)', inject: 'ips', text: 'Busca el primer cupo de medicina general. Solo consulta, no apartes nada.' },
    { id: 'appointments-2', label: 'Citas pendientes', text: '¿Ya tengo alguna cita pendiente? Revísalo.' },
    { id: 'chain-1', label: 'Citas y luego cupo', text: 'Revisa mis citas y, si no tengo una de medicina general, dime el primer cupo disponible. Solo consulta.' },
    { id: 'profile-2', label: 'Sede asignada', text: 'Confírmame mis datos institucionales y qué sede tengo asignada.' },
  ];

  const runs = [];
  const replies = [];
  for (let index = 0; index < scenarios.length; index += 1) {
    const s = scenarios[index];
    current = { t0: Date.now(), events: [], consumed: { reto: false, ips: false } };
    if (s.inject) armed[s.inject] = true;

    let response;
    let body = null;
    let networkError = null;
    const started = Date.now();
    try {
      response = await fetch(`${api}/internal/chat/completion`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-waylo-internal-key': internalKey },
        body: JSON.stringify({ model, temperature: 0, system, external_subject: externalSubject, messages: [{ role: 'user', content: s.text }] }),
      });
      body = await response.json().catch(() => null);
    } catch (error) {
      networkError = error instanceof Error ? error.message : 'network_error';
    }
    const clientMs = Date.now() - started;
    const injectedConsumed = s.inject ? current.consumed[s.inject] : null;
    armed.reto = false;
    armed.ips = false;

    runs.push({
      run: index + 1,
      scenario: s.id,
      label: s.label,
      prompt: s.text,
      execution_id: body?.execution_id ?? response?.headers.get('x-waylo-execution-id') ?? null,
      http_status: response?.status ?? null,
      ok: Boolean(response?.ok),
      client_ms: clientMs,
      error: networkError ?? body?.error?.code ?? null,
      injected_failure: s.inject ? { service: s.inject === 'reto' ? 'modelo (Reto)' : 'IPS (Confianza)', status: 503, consumed: injectedConsumed } : null,
      reply_chars: typeof body?.text === 'string' ? body.text.length : 0,
      provider_calls: current.events.filter((e) => e.service === 'reto'),
      ips_calls: current.events.filter((e) => e.service === 'ips'),
    });
    replies.push({ run: index + 1, scenario: s.id, text: body?.text ?? null });
    console.log(`run ${String(index + 1).padStart(2)} ${s.id.padEnd(15)} http=${response?.status ?? 'ERR'} ${clientMs}ms`);
  }
  current = null;

  // The backend's own audit table is the source of truth for status, tools and retries.
  const audit = await fetch(`${api}/internal/chat/executions?limit=50`, { headers: { 'x-waylo-internal-key': internalKey } });
  const auditBody = await audit.json().catch(() => null);
  const byId = new Map((auditBody?.executions ?? []).map((e) => [e.id, e]));
  const final = runs.map((r) => {
    const e = r.execution_id ? byId.get(r.execution_id) : null;
    return {
      ...r,
      audit_found: Boolean(e),
      agent_status: e?.status ?? null,
      tool_names: e?.tool_names ?? [],
      tool_count: e?.tool_count ?? null,
      retry_count: e?.retry_count ?? null,
      server_ms: e?.duration_ms ?? null,
      error: r.error ?? e?.error_code ?? null,
    };
  });

  const required = ['list_appointment_catalog', 'find_earliest_availability', 'list_my_appointments'];
  const seen = new Set(final.flatMap((r) => r.tool_names));
  const problems = [
    final.some((r) => !r.audit_found) ? `${final.filter((r) => !r.audit_found).length} without an audit record` : null,
    final.some((r) => r.agent_status !== 'succeeded') ? `${final.filter((r) => r.agent_status !== 'succeeded').length} without a successful status` : null,
    final.some((r) => r.tool_names.length === 0) ? `${final.filter((r) => r.tool_names.length === 0).length} without tools` : null,
    required.filter((t) => !seen.has(t)).length ? `missing: ${required.filter((t) => !seen.has(t)).join(', ')}` : null,
    final.some((r) => r.injected_failure && !r.injected_failure.consumed) ? 'an injected failure was never used' : null,
  ].filter(Boolean);

  mkdirSync(join(here), { recursive: true });
  writeFileSync(join(here, '..', 'runs.jsonl'), final.map((r) => JSON.stringify(r)).join('\n') + '\n');
  // Only the replies that carry no personal data are kept (catalog and open slots); the rest are replaced by a note.
  const safe = new Set(['catalog-1', 'catalog-2', 'earliest-1', 'earliest-2', 'earliest-3']);
  const redacted = replies.map((x) => (safe.has(x.scenario) ? x : { run: x.run, scenario: x.scenario, text: '[redacted: the reply carried test-patient data]' }));
  writeFileSync(join(here, '..', 'replies.redacted.json'), JSON.stringify(redacted, null, 2));
  writeFileSync(
    join(here, '..', 'summary.json'),
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        runs: final.length,
        audited: final.filter((r) => r.audit_found).length,
        succeeded: final.filter((r) => r.agent_status === 'succeeded').length,
        tools_used: [...seen].sort(),
        retries_recorded: final.filter((r) => (r.retry_count ?? 0) > 0).map((r) => ({ run: r.run, retry_count: r.retry_count })),
        problems,
      },
      null,
      2,
    ),
  );
  console.log(problems.length ? `INCOMPLETE: ${problems.join('; ')}` : 'EVIDENCE COMPLETE');
  if (problems.length) process.exitCode = 1;
} finally {
  await shutdown();
}
