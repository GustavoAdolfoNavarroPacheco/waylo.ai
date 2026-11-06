# Operations

## Continuous integration

The [`frontend-ci.yml`](../.github/workflows/frontend-ci.yml) workflow runs on every push and pull request to `main`. It
installs the dependencies and runs `npm run lint`, `npm test` and `npm run build` with Node.js 24, the same as the Docker
image.

For now it uses `npm install --package-lock=false` because the lockfile is missing optional `@emnapi` entries and `npm ci`
cannot install it. When the lockfile is regenerated and validated, that step must be replaced with `npm ci` (and the same in
the [`Dockerfile`](../Dockerfile)).

Other workflows:

| Workflow | Purpose |
| --- | --- |
| [`commit-messages.yml`](../.github/workflows/commit-messages.yml) | Checks that the commits of each pull request follow the [convention](../CONTRIBUTING.md#commit-convention). |
| [`codeql.yml`](../.github/workflows/codeql.yml) | Static security analysis of JavaScript and TypeScript. |

[`dependabot.yml`](../.github/dependabot.yml) opens weekly pull requests with dependency updates.

## Like / dislike votes on Discord

Each time someone marks an AI message as useful or not useful, `/api/feedback` sends a notice to a Discord channel. Only the
vote, the message id, the language and whether the person has an account travel; never the conversation text. To enable it,
create a webhook in the channel (Server Settings → Integrations → Webhooks) and set `DISCORD_FEEDBACK_WEBHOOK_URL` in
`.env.local` and in the deployment environment. Without the variable the button works the same and nothing is sent. The
webhook URL is a secret: whoever has it can write to the channel.

## Server errors on Discord

With `DISCORD_ERRORS_WEBHOOK_URL` set, the server reports to a channel (for example `#errors`) whatever fails in production:
the AI gateway, voice, the IPS integration, the database and any error nobody catches (Next.js's `onRequestError` hook, in
`src/instrumentation.ts`). Each notice carries the place, the error, its code and the first lines of the stack. Passwords in
URLs, tokens, long keys and emails are hidden; the conversation text is never sent. The same error from the same place is
sent once a minute (with the count of repetitions omitted) and never more than 20 messages a minute. Nothing is sent in local
development. To report an error by hand in a route: `reportError("api/my-route", error)` from `@/lib/error-report`.
