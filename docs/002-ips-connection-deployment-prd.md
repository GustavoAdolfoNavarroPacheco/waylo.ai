# PRD: Waylo–Confianza connection and deployment configuration

**Status:** partially implemented; deployment needs coordinated configuration
**Date:** 2026-10-28
**Repository:** `waylo.ai`

## Problem and goal

The connection from Settings → EPS could fail before the request was sent: when the cédula was saved on blur, the panel
cleared the in-memory value. Later, while typing the activation code, the button stayed disabled because the connection
requires a non-empty local cédula.

The goal is to keep the cédula the person just typed in memory until the connection is complete, without returning it from
the server or persisting it in plain text.

## Affected flow

```text
EpsPanel
  -> POST /api/ips/link
  -> WAYLO_BACKEND_URL/internal/ips/link
  -> X-Waylo-Internal-Key
  -> Confianza /api/v1/integrations/agent/token
  -> active state or a controlled error
```

## Scope

- Keep the typed cédula after a successful save.
- Keep the 5–12 digit validation and the six-digit code.
- Keep the cédula in the component's memory; the settings endpoint returns only a mask.
- Document the server-side variables the BFF needs to reach the adapter backend.

Out of scope: returning the decrypted cédula to the browser, changing Confianza's activation contract, or storing the
activation code in Waylo during this action.

## Deployment contract

In Production and Preview, `waylo.ai` needs `WAYLO_BACKEND_URL` pointing at the adapter backend and `WAYLO_BACKEND_KEY`
holding the same server-side secret that `waylo.ai-backend` exposes as `WAYLO_INTERNAL_KEY`. Neither variable may use the
`NEXT_PUBLIC_` prefix.

## Acceptance checks

- The cédula stays available after a successful `PATCH /api/eps`.
- With a valid cédula and a valid code, the button is enabled and the POST uses both values.
- The settings response still shows only the masked cédula.
- The BFF route, adapter and provider tests keep covering the exchange without exposing Confianza's token.

## Risks and limits

- The browser's memory is lost on reload; the person must then retype the cédula, by privacy design.
- The activation code is still single-use and depends on Confianza having `AGENT_API_KEY` and the key Waylo uses aligned.
- A `READY` deployment does not prove the link: the variables, an active `confianza` row in the Prisma catalog and a
  reachable database must also exist.
