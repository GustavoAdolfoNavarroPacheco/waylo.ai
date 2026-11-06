# Milestone S2: real tools and traceability

Waylo uses the private `waylo.ai-backend` as a server-side relay to Grok/Reto. When the person has an active IPS link, the
frontend sends the `external subject` to the relay; the browser never receives the provider's keys or Confianza's token.

## Demonstrable tools

The backend exposes the real tools of the ConfianzaIPS adapter to the agent, among them:

- `list_appointment_catalog`: institutional services, doctors and sites.
- `find_earliest_availability`: the first available slots, taken from the real agenda.
- `list_my_appointments`: the linked patient's appointments.

There are also profile, availability by doctor and date, clinical history, certificates and appointment operations.
Creating, cancelling and rescheduling require explicit, signed confirmation.

## Errors and retries

The relay retries transient Grok/Reto and Confianza failures with bounded backoff. Permanent authorization errors are not
retried indefinitely. The agent receives the normalized errors and can continue the tool loop or explain that the IPS is
not available.

## Execution records

Every call to `POST /internal/chat/completion` returns an `execution_id`. The backend stores sanitized metadata (status,
tools, retries, duration and error code) in `agent_executions`; it stores no prompts, answers, arguments, tokens or keys.
The protected internal read is:

```bash
curl -H "X-Waylo-Internal-Key: $WAYLO_INTERNAL_KEY" \
  "http://localhost:3001/internal/chat/executions?limit=10"
```

The runner belongs to the separate repository
[`waylo.ai-backend`](https://github.com/GustavoAdolfoNavarroPacheco/waylo.ai-backend):
`scripts/record-s2-executions.mjs`. Run `npm run dev` in one terminal from the root of that checkout. In another terminal,
also from the backend root, load its `.env` and run the `s2:evidence` alias:

```bash
set -a
. ./.env
set +a

S2_INTERNAL_KEY="$WAYLO_INTERNAL_KEY" \
S2_EXTERNAL_SUBJECT="ID_OF_THE_LINKED_WAYLO_SESSION" \
npm run s2:evidence
```

The backend listens on `localhost:3001` by default. The subject must be the Waylo session with an active IPS link; the
backend's database must have its migrations applied, and `CONFIANZA_BASE_URL` must point at the real ConfianzaIPS
instance. The JSONL is saved to `waylo.ai-backend/docs/evidence/s2-executions.jsonl`, inside the backend checkout. The
script validates that all ten requests have an audited record and a successful status, that tools were recorded, and that
`list_appointment_catalog`, `find_earliest_availability` and `list_my_appointments` appear. It keeps the JSONL even if that
validation fails and exits with a non-zero code so incomplete evidence is detectable.

The runner calls the backend's private endpoint directly. To show the person-facing flow, demonstrate the chat from the
Waylo interface in the video. Mocks serve regression tests, not as evidence of real IPS calls.

A run recorded with real services, including two injected failures that the backend recovered from, is in
[`docs/evidence`](./evidence/README.md).

## Two-minute video script

1. The problem in one sentence: "Waylo helps a linked person query their IPS and find an appointment without inventing
   availability."
2. Show the chat running the catalog, the first available slots and the patient's appointments.
3. Show a 503 or a transient Reto error and the recovered retry; the `retry_count` field records those retries. Confianza's
   internal retries are not currently added to that counter.
4. Open the internal executions query and show ten `execution_id` values with their tools and retries.
5. Close with the concrete result and remind that writes require confirmation.
