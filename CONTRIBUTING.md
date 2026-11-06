# Contributing to Waylo.ai

Thanks for wanting to help! Waylo guides people who do not feel well, so we take clarity, safety and privacy very seriously.
This guide summarizes how to work in the repository.

> [!IMPORTANT]
> The code is proprietary (see [LICENSE](./LICENSE)). You may propose changes through a pull request; by doing so you grant
> the rights holders the right to use, modify and distribute your contribution as part of the project.

## Before you start

1. Check whether an [issue](https://github.com/GustavoAdolfoNavarroPacheco/waylo.ai/issues) about the same thing already
   exists.
2. For a large change, open an issue first to agree on the approach.
3. Read [`AGENTS.md`](./AGENTS.md): it defines what Waylo must **never** do (diagnose, prescribe, give doses) and the warning
   signs that cut the flow. Any change that touches that behavior needs clinical review. (That file is written in Spanish
   because it holds the product's user-facing wording.)

## Set up your environment

```bash
nvm use            # Node 24 (see .nvmrc)
npm install        # installs dependencies and enables the commit hook
cp .env.example .env.local
npm run db:migrate # creates the tables in the database
npm run dev        # http://localhost:3000
```

The variables and their meaning are in the [README](./README.md#environment-variables). Never commit `.env.local`, keys,
tokens or real personal data.

## Workflow

1. Create a branch from `main`: `feat/short-name`, `fix/short-name`, `docs/...`, `chore/...`.
2. Make small, focused changes. One pull request, one idea.
3. Before pushing, check that everything passes:

   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. Open the pull request against `main` and fill in the template. If it changes what users see, add a screenshot.

## Commit convention

Every commit is written as `type: description`, all lowercase, in English, with no emojis or codes such as `:memo:`. The
valid types are `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` and `revert`, with an
optional scope: `fix(chat): keep the draft when the reply fails`.

It is checked in two places with the same script, [`scripts/check-commit-message.mjs`](./scripts/check-commit-message.mjs),
which needs no dependencies:

- **The `commit-msg` hook (on your machine).** It rejects the commit before it is created. `npm install` enables it
  automatically (the `prepare` script); if you use `--ignore-scripts`, enable it by hand with
  `git config core.hooksPath .githooks`. It can be skipped with `--no-verify`, which is why the next check exists.
- **The pull request check (on GitHub).** The `Commit messages` workflow reviews the commits of every pull request. To make
  it block merging, mark the `Conventional commits` check as required in
  *Settings → Branches → Branch protection rules → main*.

If the check fails, rewrite the messages with `git rebase -i` (the `reword` option) and push with
`git push --force-with-lease`. Merges written by GitHub are not checked. Do not add `Co-authored-by` lines for AI assistants.

## Style and quality

- **Strict TypeScript**, and reuse existing components before creating new ones.
- **Design:** use the tokens in [`src/app/globals.css`](./src/app/globals.css) (monochrome, light and dark). No ad-hoc
  colors; levels of care are told apart by weight and contrast, not by color.
- **User-facing copy:** plain, short language. The three languages (`es`, `en`, `pt`) must keep the same shape;
  `src/i18n/messages.test.ts` checks it.
- **Accessibility:** enough contrast, visible focus, respect for `prefers-reduced-motion`, labels on controls.
- **Tests:** all new logic comes with Vitest tests. Any change to warning-sign detection must add cases to
  `src/lib/red-flags.test.ts`.
- **Privacy:** do not log conversation text or health data. Secrets live only on the server.

## Documentation

If your change alters behavior, update the README or the matching document in [`docs/`](./docs/README.md).

## Conduct

Taking part means accepting the [Code of Conduct](./CODE_OF_CONDUCT.md). For vulnerabilities, **do not open a public
issue**: follow [SECURITY.md](./SECURITY.md).
