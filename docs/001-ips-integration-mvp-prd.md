# PRD: Waylo–Confianza IPS integration (MVP)

**Status:** approved for implementation
**Date:** 2026-10-26
**Repository:** `waylo.ai`

> Terms: **EPS** is the patient's health insurer, **IPS** is the healthcare provider (clinic or hospital), and
> **cédula** is the Colombian national ID number.

## Problem and goal

Waylo already has a working citizen experience: authentication, triage, red flags, voice, attachments, profile,
preferences and a panel to store the EPS, cédula, authorization and a temporary code. Those data do not yet activate a
real connection with the IPS, though. The frontend must keep those capabilities and add a server-side bridge to
`waylo.ai-backend`, without exposing secrets or tokens to the browser.

The MVP lets a patient:

1. Authorize Waylo and select Confianza.
2. Enter their cédula and the temporary code issued by Confianza.
3. Link their Waylo account to their patient record in Confianza.
4. Ask the agent about their appointments.

## Scope

### Included

- Next.js Route Handlers as a BFF for the IPS integration.
- Link status in Waylo's settings.
- An explicit connection flow from the EPS panel.
- Server-side lookup of the IPS profile and appointments.
- Appointment context for the agent when the patient asks about them.
- Handling of an unavailable IPS, a missing link, an invalid code and an expired token.
- Unit tests for the routes and the integration client.

### Out of scope

- Creating, cancelling or rescheduling appointments.
- Checking availability.
- Clinical history, documents or clinical authorizations.
- Migrating Waylo's current authentication.
- Moving triage, voice, attachments or conversation storage to the backend.
- Direct communication from the browser with Confianza or with `waylo.ai-backend`.

## Actors and responsibilities

| Actor | Responsibility |
|---|---|
| Patient | Grants authorization, enters the cédula and the temporary code. |
| `waylo.ai` | Owns the UX, the patient session and the BFF routes. |
| `waylo.ai-backend` | Protects the link and adapts the canonical contract to Confianza. |
| Confianza IPS | Validates the one-time code and issues the limited token. |
| Waylo agent | Answers with IPS data only when an active link exists. |

## Approved flow

```text
EpsPanel
  -> POST /api/ips/link
  -> Next.js validates the Waylo session
  -> POST /internal/ips/link to the adapter backend
  -> POST /api/v1/integrations/agent/token on Confianza
  -> the backend encrypts and stores the IPS token
  -> GET /api/ips/appointments when the agent detects a question about appointments
  -> the backend decrypts the token and queries Confianza
  -> Waylo answers without showing tokens or credentials
```

## Frontend contract

The BFF routes are internal to `waylo.ai`:

- `GET /api/ips/link`: returns the link status.
- `POST /api/ips/link`: receives `document_type`, `document_number`, `eps` and `activation_code`.
- `DELETE /api/ips/link`: revokes Waylo's local link.
- `GET /api/ips/patient`: returns the normalized IPS profile.
- `GET /api/ips/appointments`: returns normalized appointments.

The routes require the existing Waylo session. No integration secret is sent from client components.

## Security rules

- `WAYLO_BACKEND_KEY` exists only in Next.js's server-side environment.
- `CONFIANZA_AGENT_KEY` exists only in `waylo.ai-backend`.
- The token issued by Confianza never reaches the browser or the BFF response.
- The temporary code is sent to the backend once and is never shown back.
- The patient cannot change their institutional EPS from Waylo.
- If the IPS does not answer, the agent does not invent appointments and local triage stays available.
- The agent performs no write operations in this MVP.

## Data and integration

The identity the BFF uses is the frontend's `session.id`, sent as `external_subject`. The adapter backend keeps its own
connection record and does not need to duplicate Waylo's authentication. Waylo's session remains the authority for the
browser.

## Visible states

- `none`: never connected.
- `active`: active link with a valid token.
- `expired`: the activation must be repeated.
- `deactivated`: Confianza rejected or deactivated the link.
- `unavailable`: the backend or the IPS is not available.

The local EPS `acceso` state is not treated as equivalent to the IPS link: one says valid local data exist, the other
confirms a real activation.

## Acceptance checks

- An unauthenticated user gets `401` and the adapter backend is never called.
- An invalid code is shown as a connection error, without arbitrarily deleting the profile.
- A successful connection shows `active` in settings.
- An explicit question about appointments queries Confianza only with an active link.
- The agent's answer includes only appointments returned by the IPS.
- A Confianza outage produces a controlled message and does not break triage.
- The frontend build and tests pass without changing existing features.

## Risks and decisions

- The frontend's current session and the backend's historical authentication are different systems. That is why the MVP
  uses a BFF plus `external_subject` instead of sharing cookies.
- Confianza does not yet return sex, primary site, appointment type or site name in the minimum contract. The MVP does
  not show those fields.
- Networks and test databases must be isolated before running a real validation; the production `.env` is never used for
  seeds or destructive tests.

## Evidence and related documentation

- The adapter's internal contract: `waylo.ai-backend/docs/001-ips-integration-mvp-prd.md`.
- Confianza's contract: `ConfianzaIPS/confianza-ips-backend/docs/006-waylo-agent-integration-mvp.md`.
- The institutional issuing flow: `ConfianzaIPS/confianza-ips-frontend/docs/006-waylo-agent-integration-mvp.md`.
