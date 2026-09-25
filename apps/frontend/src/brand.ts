// Brand identity for this white-label. Nothing here names a company or a
// domain: the values come from the environment so the fork carries no brand
// literals in source. Defaults fall back to upstream's own name rather than
// ours, so an unset variable is obvious instead of silently correct.
export const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || 'Postiz';
export const BRAND_MOTTO = process.env.NEXT_PUBLIC_BRAND_MOTTO || '';
