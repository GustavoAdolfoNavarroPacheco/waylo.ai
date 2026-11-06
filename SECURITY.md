# Security policy

Waylo serves people who describe how they feel, so security and privacy are part of the product. If you find a
vulnerability, we want to know and to fix it calmly.

## How to report a vulnerability

**Do not open a public issue.** Use GitHub's private reporting:

1. Go to the [**Security**](https://github.com/GustavoAdolfoNavarroPacheco/waylo.ai/security) tab of the repository.
2. Click **Report a vulnerability**.
3. Describe the problem, the steps to reproduce it and its likely impact.

If you cannot use that channel, send the maintainers a direct message on GitHub to
[@GustavoAdolfoNavarroPacheco](https://github.com/GustavoAdolfoNavarroPacheco) asking for a private channel; do not put
the technical details in a public place.

## What to expect

- We will acknowledge receipt and tell you once we have reviewed it, as soon as we can.
- We will keep you informed about the fix and, if you wish, credit you when it is published.
- We ask for reasonable time to fix the issue before any public disclosure.

## Which versions get fixes

Only the `main` branch and the production deployment at [waylo-ai.vercel.app](https://waylo-ai.vercel.app). The project does
not publish tagged versions yet.

## What we are interested in

Sessions and authentication, exposure of keys or tokens, access to another person's data, ways around the warning signs or
the clinical limits (Waylo diagnosing or prescribing), model injection that leaks data, and failures in the IPS integration.

## What not to include in your report

**Never** attach real patient data, medical records, identity documents, passwords, keys or live tokens. Use synthetic or
masked data.

## How we protect information

- Keys (`WAYLO_BACKEND_KEY`, `RETO_KEY`, webhooks) live only on the server and never carry the `NEXT_PUBLIC_` prefix.
- The browser never receives the IPS token: the `/api/ips/*` and `/api/triage` routes delegate to a private backend.
- Warning signs are evaluated **before** the model and do not query institutional data.
- Conversations are stored in the person's browser, not on the server; clinical memory only includes what the person
  confirmed, and they can delete it.
- Error notices sent to Discord hide passwords, tokens, long keys and emails, and never include the conversation text.
- `.env*` files are in `.gitignore`; only `.env.example` is versioned.

## Dependencies

Dependencies are watched with Dependabot and the code is analyzed with CodeQL (see `.github/`).
