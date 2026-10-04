// Server-side brand identity for this white-label, the counterpart of
// apps/frontend/src/brand.ts. It reads the same NEXT_PUBLIC_BRAND_NAME, which
// the image bakes in as a runtime ENV too, so one variable names the product
// everywhere. Same fallback rule as the frontend: an unset variable shows
// upstream's name, which is obviously wrong rather than silently correct.
export const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || 'Postiz';
