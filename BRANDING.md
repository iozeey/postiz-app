# White-label branding fork

This fork exists for one reason: to white-label Postiz for `app.example.com`.
Everything else stays vanilla so upstream stays mergeable.

Marketing pages, privacy policy, terms and data-deletion instructions are **not**
here — they live in the separate `marketing-site` repo served at `example.com`.
Keep it that way; those pages change often and should never sit in a tree you
have to rebase.

## Branch layout

| Branch | Purpose |
| --- | --- |
| `main` | Untouched mirror of upstream. Never commit here. |
| `brand` | All brand changes. Always rebased onto a release tag. |

We track **release tags**, never `upstream/main`. Tagged releases are what the
Docker images are built from, and they don't move under you mid-rebase.

## Updating to a new upstream release

```bash
git fetch upstream --tags
git tag -l | sort -V | tail -5          # pick the new release
git rebase --onto vX.Y.Z $(git merge-base brand <previous-tag>) brand
npm install && npm run build            # prove it still builds
git push --force-with-lease origin brand
```

Rebasing rather than merging means you resolve each conflict once instead of
carrying it forward forever. `--force-with-lease` refuses to clobber work
someone else pushed.

## The branding surfaces

Verified against v2.24.0 by actually doing it. Two of my original assumptions
were wrong; both corrections are below.

### 1. Assets — no conflict risk

`brand-mark.png`, `apple-touch-icon.png`, `favicon.png` and `favicon.ico` in
`apps/frontend/public/`, generated from `final logo.jpg`.

That source is a 600 DPI **CMYK JPEG with no alpha**, so the white background
was removed by flood-filling from the borders only — a global white-to-alpha
would punch holes through the white ring carrying the ALPRINTS.com lettering.
The tagline strip below the mark was cropped off; it is illegible at 28px.

**Correction:** `public/logo-text.svg` is dead weight — nothing renders it.

### 2. The header logo is a component, not an asset

`components/ui/logo-text.component.tsx` inlines the Postiz wordmark as SVG
paths, purple `#612BD3` included. It was replaced wholesale with a mark + text
lockup. The mark stays raster: the logo is a multi-colour gradient and does not
trace usefully to vector.

### 3. Colours — tokens are easy, hardcoded hex is not

`apps/frontend/src/app/brand.scss`, loaded after `colors.scss` from
`global.scss` (the single line changed in an existing file). Never edit
`colors.scss`.

**Correction:** upstream carries **14** purple/magenta tokens, not one, across
three near-identical purples — `#612bd3`, `#612ad5` and `#832ad5`. Grepping for
one misses the others. `brand.scss` derives all 14 from two seeds, so a rebrand
is a two-line edit there.

Tokens are only half of it. The same hexes are **hardcoded as Tailwind
arbitrary values** in roughly 36 places that ignore the token system entirely:

| Hex | Files |
| --- | --- |
| `#612bd3` | 21 |
| `#fc69ff` | 6 |
| `#d82d7e` | 4 |
| `#612ad5` | 4 |
| `#b69dec` | 1 |

`app/(app)/auth/layout.tsx` is the clearest case — `bg-[#0E0E0E]`,
`text-[#FC69FF]`. These need editing by hand, so a full palette swap is not a
one-file job.

### 4. UI copy — one file

`libraries/react-shared-libraries/src/translation/locales/en/translation.json`.
Edit values, never keys — upstream looks strings up by key.

Three strings were rewritten rather than renamed, and four deliberately still
say "Postiz":

- `check_n8n`, `chat_onboarding_description`, `cli_onboarding_description` and
  the MCP string name **real external tools** the user installs or types.
  "the brand CLI" would send them looking for something that does not exist.
- `join_10000_entrepreneurs_who_use_postiz` claimed 10,000 customers. Rewritten
  with no number.
- `faq_to_confirm_credit_card_information_postiz_will_hold` promised a $2 card
  hold, which is Postiz Cloud's Stripe behaviour and not necessarily ours.
- `faq_postiz_gitroom_is_proudly_open_source` now points at **our** fork, which
  is what AGPL-3.0 section 13 actually requires of a modified network service.

Other locales still say "Postiz". Fix the languages you serve, or restrict the
picker.

### 5. Do not rebrand the testimonials

`helpers/testomonials` holds Postiz's own named customers with photographs.
Relabelling them as the brand reviews would pass off other people's words as
ours. The block was removed from the auth layout along with the "Over 20,000+
Entrepreneurs" headline.

### 6. Page titles — one line each

17 files use `isGeneralServerSide() ? 'Postiz' : 'Gitroom'`. Only the product
name was swapped, leaving the seam intact.

### 7. Links and analytics — environment variables, not code

Upstream hardcodes several destinations it owns. Three of them actively work
against you, so they are now read from the environment:

| Variable | Default | Replaces |
| --- | --- | --- |
| `NEXT_PUBLIC_TERMS_URL` | `https://example.com/terms` | `https://postiz.com/terms` |
| `NEXT_PUBLIC_PRIVACY_URL` | `https://example.com/privacy-policy` | `https://postiz.com/privacy` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `app.example.com` | `postiz.com` |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN` | `app.example.com` | `postiz.com` (DataFast) |

**These are `NEXT_PUBLIC_*`, so they are inlined into the client bundle at
BUILD time.** Changing one needs a rebuild, not a restart.

Why each matters:

- **Legal links** sent users signing up to *us* at Postiz's terms and privacy
  policy, which do not govern our service and name a different data controller.
- **Plausible** was hardcoded to `postiz.com` and not gated by any env check, so
  every pageview in our app was reported to Postiz's analytics property. A data
  leak outward and useless numbers for us.
- **The affiliate menu entry** pointing at `affiliate.postiz.com` was removed
  outright (58 lines in `layout/top.menu.tsx`). It was shown to every role, so
  our paying customers were one click from signing up to a competitor's
  affiliate programme.

Links to `docs.postiz.com` are **kept on purpose** — they document the actual
API and CLI we run, for the same reason four translation strings still say
"Postiz".

Still outstanding: `components/webhooks/webhooks.tsx` uses two sample avatars
hosted on `uploads.gitroom.com`. Cosmetic, inside a webhook example, but it is
an external dependency on Postiz's CDN.

### 8. Emails — the same variable, read server-side

`libraries/nestjs-libraries/src/brand.ts` is the backend twin of
`apps/frontend/src/brand.ts` and reads the same `NEXT_PUBLIC_BRAND_NAME`
(the image sets it as a runtime `ENV`, not only a build arg). Email subjects
and bodies that named the product use it: the digest subject
(`[Brand] Your latest notifications`), the admin login-switch notice and the
Listmonk welcome subject. The sender name and footer already come from
`EMAIL_FROM_NAME`.

The digest is a Temporal workflow, and workflow code runs in a sandbox with no
`process.env`. Each digest also lives forever through `continueAsNew`, so a
start argument would never reach the ones already running. The name therefore
rides on every `email` signal instead; anything queued before the change sends
a plain `Your latest notifications`.

Not touched: `agencies.service.ts`, upstream's agency directory, which links to
`postiz.com` and mails `nevo@postiz.com` when an agency is created.

## Rules that keep rebases cheap

1. **New files over edited files.** A new file can never conflict.
2. **Never reformat.** A stray Prettier run across a file turns a one-line change
   into a whole-file conflict.
3. **One concern per commit**, with a message saying what it rebrands. When a
   rebase blows up you need to know what a hunk was for.
4. **Don't fix upstream bugs here.** Send them upstream as a PR — then you carry
   nothing.
5. **Config over code.** `NEXT_PUBLIC_POSTIZ_OAUTH_DISPLAY_NAME` and
   `NEXT_PUBLIC_POSTIZ_OAUTH_LOGO_URL` already exist. Prefer an env var to a diff
   every time.

## Local vs production config

`env/README.md` has the detail. The short version:

- `env/local.example` -> copy to `.env` at the repo root. Ports are shifted
  (postgres 5442, redis 6389, backend 3001) around other stacks on this machine.
- `env/production.example` -> paste into Dokploy for `app.example.com`.

Two traps, both documented there:

1. `NEXT_PUBLIC_TERMS_URL` and `NEXT_PUBLIC_PRIVACY_URL` are read in a
   `'use client'` component, so Next inlines them during `pnpm run build` —
   which in production happens inside the Docker build. They are **build args**
   in `Dockerfile.dev`; setting them as runtime env does nothing.
2. `NOT_SECURED=true` belongs in local only. On a public host it strips
   `secure` and `httpOnly` from the auth cookie.

## AGPL-3.0

Postiz is AGPL-3.0. Running a **modified** version as a network service obliges
you to offer its source to your users. This fork being a public GitHub repo
satisfies that. If it is ever made private, the obligation does not go away —
you would have to publish the source another way.
