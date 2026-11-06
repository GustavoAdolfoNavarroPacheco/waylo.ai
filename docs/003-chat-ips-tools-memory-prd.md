# PRD: chat connected to the IPS and patient-scoped memory

**Status:** approved for implementation
**Date:** 2026-10-29
**Owning repository:** `waylo.ai`
**Companion repository:** `waylo.ai-backend`

## Problem and goal

Waylo's settings can create an active link with Confianza IPS, but the main chat still calls Reto directly from
`runTriage`. As a result the agent does not receive the session's external subject, does not enable the IPS tools, and can
claim it has no ability to manage appointments.

In addition, today's conversations live only in `localStorage`, with a limit of 15 conversations and a seven-day
retention. That history is no use as memory across conversations, devices or sessions.

The goal is to keep the current UX and triage, but connect the chat to the internal relay of `waylo.ai-backend`, enable the
IPS's patient-scoped operations, and add structured clinical memory that the patient explicitly confirms.

## Scope

### Included

- Keep `POST /api/triage` as the browser's entry point.
- Run red flags before any IPS call or tool.
- Send the `external_subject` from the server, based on the Waylo session.
- Send and receive the temporary appointment-confirmation token without persisting it.
- Show backend answers while keeping `TriageResponse` and the current card.
- Tell the model whether an active IPS link exists, without exposing tokens.
- Retrieve the confirmed memory relevant to each query.
- Propose structured memory only when the patient asks for it.
- Confirm, list, edit and delete memory through server-side routes.
- Delete memory by cascade when the account is deleted.
- Update documentation, tests and server-only variables.

### Out of scope

- Migrating authentication, sessions, limits or full conversations to the backend.
- Storing transcripts, files, full model answers or diagnoses.
- Changing `ConfianzaIPS` routes, models or permissions without contractual evidence.
- Exposing administrative, medical or staff routes as patient tools.
- Changing the voice UX, titles or streaming, other than the adjustments the new contract needs.

## Actors and responsibilities

| Actor | Responsibility |
|---|---|
| Patient | Links the IPS, confirms write operations and confirms memories. |
| `waylo.ai` | Session, limits, red flags, UX, BFF, its own memory and presentation. |
| `waylo.ai-backend` | LLM relay, tools, encrypted IPS tokens and normalization of the contract. |
| Confianza IPS | Institutional source of patient, history and appointments. |

## Approved flow

```text
ChatApp
  -> POST /api/triage
  -> red flags and limits
  -> confirmed Waylo memory + IPS status
  -> POST /internal/chat/completion
       external_subject = session.id
       optional pending_appointment_token
  -> Reto with patient-scoped tools
  -> IPS adapter -> Confianza
  -> final text + optional pending_appointment
  -> TriageResponse to the browser
```

## Memory

Memory is tied to `persona_id`, never to `session_id`, the browser or a conversation. The initial categories are
antecedent/condition, allergy, medication, surgery, pregnancy and other.

Each record has a readable value, optional JSON details, a current or resolved status, the origin `user_confirmed`,
consent and timestamps.

Rules:

- The model proposes memory only when the patient asks to remember a fact.
- The patient must confirm before it is saved.
- Memory must be reviewable, editable and deletable.
- `IPS_OFICIAL` takes precedence over `WAYLO_CONFIRMADO` on conflicts.
- A remembered fact does not replace the evaluation of current symptoms.
- Memory does not authorize diagnoses, prescriptions or urgency decisions.

## Contracts

The BFF sends the backend an internal payload that keeps `model`, `temperature`, `system` and `messages`, and adds:

```json
{
  "external_subject": "waylo-session-id",
  "pending_appointment_token": "temporary-opaque-token"
}
```

The backend may return:

```json
{
  "text": "{\"mensaje\":\"...\",\"listo\":false}",
  "pending_appointment": {
    "token": "...",
    "action": "create_appointment",
    "summary": "..."
  }
}
```

The pending token lives only in the chat state's memory and is removed on confirming, rejecting, switching conversation or
closing the session.

## Security and privacy

- The internal, provider and IPS keys stay server-side.
- The browser never receives Confianza tokens.
- The model receives only normalized, necessary results.
- Write operations require explicit confirmation.
- IPS errors degrade in a controlled way and do not produce invented data.
- Deleting the account deletes the persistent local memory.

## Acceptance checks

- A question about appointments with an active link uses the backend and does not call Reto from `waylo.ai`.
- A question about appointments without a link produces a controlled answer.
- The agent can use every patient-scoped tool the backend approves.
- Creating, cancelling and rescheduling never execute on the first proposal.
- The second request executes the same action only if the patient confirms.
- A red flag avoids IPS calls and tools before the urgent answer.
- A confirmed memory shows up in a later conversation of the same patient.
- An unconfirmed memory is never persisted.
- Editing, deleting the account or clearing memory removes the persistent data.
- No full conversations or attachments are persisted.

## Risks and operational pending items

- Production and Preview must have `WAYLO_BACKEND_URL`, `WAYLO_BACKEND_KEY`, `WAYLO_INTERNAL_KEY`, `RETO_KEY` and the
  Confianza configuration aligned. The values are never documented.
- The `confianza` row must be active in the backend's database.
- The connected flow needs a synthetic Confianza account and an end-to-end test separate from the unit tests.
- Clinical memory and the triage rules need professional review before being presented as a production clinical protocol.
