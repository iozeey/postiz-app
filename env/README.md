# Environment configuration

Two environments, one fork.

| | Local | Staging | Production |
| --- | --- | --- | --- |
| Runs | `pnpm run dev-backend` from source | Docker image | Docker image |
| URL | `http://localhost:4200` | `https://app-stage.example.com` | `https://app.example.com` |
| Config lives in | `.env` at the repo root (gitignored) | Dokploy staging env | Dokploy production env |
| Template | `env/local.example` | `env/staging.example` | `env/production.example` |

The marketing site (`marketing-site`) mirrors this with Astro's own mechanism —
`.env.development`, `.env.staging`, `.env.production` — so a URL is defined in
exactly one place per environment in both codebases.

Copy the template you need, fill in the secrets, and never commit the result.
`.env` is excluded via `.git/info/exclude`, not `.gitignore`, so the fork's
tracked diff against upstream stays clean.

## The one thing that will catch you out

`NEXT_PUBLIC_*` variables read inside a **client** component are inlined by
Next.js during `pnpm run build`. In production that build happens while the
Docker image is being built, so setting such a variable as runtime env in
compose or Dokploy **does nothing** — the old value is already baked into the
JavaScript shipped to the browser.

`NEXT_PUBLIC_TERMS_URL` and `NEXT_PUBLIC_PRIVACY_URL` are read in
`components/auth/register.tsx`, which is `'use client'`. They are therefore
declared as build args in `Dockerfile.dev`:

```bash
docker build --target dist -f Dockerfile.dev \
  --build-arg NEXT_PUBLIC_TERMS_URL=https://example.com/terms \
  --build-arg NEXT_PUBLIC_PRIVACY_URL=https://example.com/privacy-policy \
  -t yourbrand/postiz .
```

If you change either URL, **rebuild the image**. A restart will not pick it up.

Everything else, including `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` and
`NEXT_PUBLIC_ANALYTICS_DOMAIN`, is read in `app/(app)/layout.tsx`, which is a
server component. Those genuinely are runtime values and a restart is enough.

## Never set NOT_SECURED in production

`NOT_SECURED=true` disables `secure`, `httpOnly` and `sameSite` on the auth
cookie. It exists so local development works over plain HTTP. Setting it on a
public host means session cookies travel in the clear and are readable from
JavaScript. It is absent from `production.example` deliberately — keep it that
way.
