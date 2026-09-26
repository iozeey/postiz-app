// Brand identity for this white-label. Nothing here names a company or a
// domain: the values come from the environment so the fork carries no brand
// literals in source. Defaults fall back to upstream's own name rather than
// ours, so an unset variable is obvious instead of silently correct.
export const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || 'Postiz';
export const BRAND_MOTTO = process.env.NEXT_PUBLIC_BRAND_MOTTO || '';

// Optional onboarding tutorial, given as a YouTube video id. Upstream embeds
// its own branded video here; a white-label that has not recorded one should
// not show a reviewer or a client someone else's marketing, so the whole step
// is skipped when this is unset.
export const BRAND_TUTORIAL_VIDEO =
  process.env.NEXT_PUBLIC_BRAND_TUTORIAL_VIDEO || '';
