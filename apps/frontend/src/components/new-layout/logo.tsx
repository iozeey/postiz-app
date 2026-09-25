'use client';

// Brand sidebar mark. Inline SVG so it inherits the sidebar's colour.
export const Logo = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="mt-[8px] min-w-[40px] min-h-[40px] w-[40px] h-[40px] text-white"
      aria-hidden="true"
    >
      <rect x="2.6" y="3.6" width="18.8" height="17.8" rx="4.4" stroke="currentColor" strokeWidth="1.9" />
      <rect x="6.6" y="8.2" width="10.8" height="2.4" rx="1.2" fill="currentColor" />
      <rect x="6.6" y="12.6" width="6.6" height="2.4" rx="1.2" fill="currentColor" />
      <rect x="6.6" y="17" width="8.8" height="2.4" rx="1.2" fill="currentColor" opacity="0.45" />
    </svg>
  );
};
