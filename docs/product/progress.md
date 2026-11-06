# Project status log (session memory)

## Current status
- **Phase:** a working v1, ready for the first test of the red-flag filter.
- **Last update:** Next.js base, vital-emergency guardrail, local triage, seed sites and an accessible chat.

## Technical decisions adopted
- The model uses the Reto provider (`https://api.reto.pltk.mx/v1`, `grok-4.6`) with `RETO_KEY`. Temperature 0.1.
- Without an API key, the local questionnaire of 3 to 4 questions still works and never diagnoses.
- Vital-emergency alerts are evaluated before the LLM and cut the flow with a fixed message.
- Sites live in `src/data/providers.json` and are filtered by level and EPS.

## Pending
1. Clinical audit of the answers (phase 4).
2. Test the red-flag filter with `npm run test`.
