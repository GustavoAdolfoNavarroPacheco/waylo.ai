# Agent evidence (milestone S2)

Ten real end-to-end runs, recorded on **2026-11-05**.

| File | What it contains |
| --- | --- |
| [`runs.jsonl`](./runs.jsonl) | One line per run: request, id, status, tools, retries, timings, and the observed calls to the model and to the IPS. |
| [`summary.json`](./summary.json) | Summary: 10 of 10 audited, 10 of 10 successful, tools used and retries recorded. |
| [`tooling/`](./tooling) | The scripts that generate them, and how to repeat the runs. |

## What was run

- The **real backend** ([`waylo.ai-backend`](https://github.com/GustavoAdolfoNavarroPacheco/waylo.ai-backend)), the **real
  model** (Reto) and the **real Confianza IPS API**, with a linked test patient. Read-only tools only: no appointment is
  booked, cancelled or moved.
- Four distinct tools (`get_patient_profile`, `list_appointment_catalog`, `find_earliest_availability`,
  `list_my_appointments`) and six IPS endpoints (`/patients/me`, `/services`, `/doctors`, `/sites`, `/availability`,
  `/appointments`).
- The source of truth for each run is the backend's `agent_executions` table. The script reads it at the end and flags the
  evidence as incomplete if anything is missing.
- The prompts and scenario labels in `runs.jsonl` are in Spanish, as recorded: the agent speaks Spanish, and they are what
  the product's users actually type.

## Injected failures

To demonstrate recovery, the script causes **two transient failures on purpose**: in run 4 the model answers 503 once, and
in run 7 the IPS does. The retry and the recovery belong to the real backend, not to the script.

`retry_count` counts only retries to the model. The retry to the IPS (run 7) shows in the observed calls (`ips_calls`), not
in that table.

## Privacy

The files contain no request bodies, headers, keys, tokens or data from the test patient. For each call only the method,
the path (with numbers replaced), the status and the time are kept.

## How to repeat them

It needs the backend cloned next to this repository (`../waylo.ai-backend`), with its `.env`, its migrations applied and at
least one active link with Confianza; and `RETO_KEY` in this repository's `.env.local`.

```bash
node docs/evidence/tooling/run-evidence.mjs
```

The script starts the backend with two observers (one in front of the model and one inside the process for the IPS), runs
the ten requests and rewrites these files.
