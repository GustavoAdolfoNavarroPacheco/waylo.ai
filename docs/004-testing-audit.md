# Citizen frontend testing audit

Cut-off date: 2026-10-29

## Scope

The App Router routes, the server-side clients, the session, the preferences, the clinical memory and the IPS read limits
were reviewed. The audit focused on deterministic behavior and does not persist or expose real credentials.

## Coverage added

- Preferences: language and voice validation, cookie fallback, language labels and voice selection.
- Security: scrypt hashing, distinct salts and rejection of corrupted hashes.
- Clinical memory: only active records, serialization limits and cleaning of structured content.
- IPS reads: mandatory session, server-side subject propagation, `Cache-Control: no-store`, typed errors and safe
  unavailability reporting.
- Sessions: closing other devices, protection of the current session, UUID validation, not-found handling and
  degradation on persistence errors.

## Evidence

- `git diff --check`: passed.
- The five new TypeScript files were parsed with the TypeScript compiler available in the workspace: no syntax errors.
- The suite could not be run locally because that checkout had neither `node_modules/.bin/vitest` nor `next`.
- A temporary install that left `package-lock.json` unmodified was blocked by the environment's restricted network. The
  lockfile is already documented as unfit for `npm ci` until its optional `@emnapi` entries are regenerated.

## Risks and pending work

The current evidence includes no coverage percentage and no real-browser test. The next improvement should regenerate and
validate the lockfile, install `@vitest/coverage-v8` reproducibly and publish coverage thresholds per package. Production
verification must check the session, the Waylo backend and the connected IPS separately.
