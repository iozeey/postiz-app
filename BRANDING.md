# Alprints branding fork

This fork exists for one reason: to white-label Postiz for `app.alprints.com`.
Everything else stays vanilla so upstream stays mergeable.

Marketing pages, privacy policy, terms and data-deletion instructions are **not**
here — they live in the separate `alprints-site` repo served at `alprints.com`.
Keep it that way; those pages change often and should never sit in a tree you
have to rebase.

## Branch layout

| Branch | Purpose |
| --- | --- |
| `main` | Untouched mirror of upstream. Never commit here. |
| `brand` | All Alprints changes. Always rebased onto a release tag. |

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

## The four branding surfaces

Keep changes inside these. Anything outside is a red flag that the diff is
growing and rebases are about to get expensive.

### 1. Assets — no conflict risk

Replace contents, keep filenames:

- `apps/frontend/public/logo.svg`
- `apps/frontend/public/logo-text.svg`
- `apps/frontend/public/favicon.ico`
- `apps/frontend/public/favicon.png`

### 2. Colours — zero conflict risk

Tailwind maps every colour to a CSS custom property (`var(--color-primary)`,
`var(--new-btn-primary)` and so on), defined in `apps/frontend/src/app/colors.scss`.

Do **not** edit that file. Add `apps/frontend/src/app/brand.scss` redefining the
tokens and import it *after* `colors.scss`. A new file never conflicts, and the
whole palette moves from one place.

### 3. UI copy — one file

23 strings contain "Postiz" in:

`libraries/react-shared-libraries/src/translation/locales/en/translation.json`

Edit only those values. Leave the keys alone — upstream looks them up by key, and
renaming one silently breaks a string.

Other locales still say "Postiz". Either fix the languages you actually serve or
restrict the language picker.

### 4. Page titles — ~12 one-line changes

Page metadata follows:

```ts
title: `${isGeneralServerSide() ? 'Postiz' : 'Gitroom'} Register`
```

Upstream already branches its own branding here, so this is a deliberate seam.

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

## AGPL-3.0

Postiz is AGPL-3.0. Running a **modified** version as a network service obliges
you to offer its source to your users. This fork being a public GitHub repo
satisfies that. If it is ever made private, the obligation does not go away —
you would have to publish the source another way.
