import React from 'react';
import { BRAND, BRAND_MOTTO } from '@gitroom/frontend/brand';

// Brand header lockup — wordmark plus motto. The mark lives on as the favicon.
// Gradient comes from .brand-wordmark in brand.scss. Name and motto are read
// from the environment so no brand literal appears in source.
export const LogoTextComponent = () => {
  return (
    <div
      className="flex flex-col items-start gap-[3px] leading-none"
      style={{ filter: 'drop-shadow(0 0 26px rgba(120, 90, 220, 0.28))' }}
    >
      <span className="brand-wordmark text-[31px] font-bold tracking-[-0.042em] leading-none">
        {BRAND}
      </span>
      {!!BRAND_MOTTO && (
        <span
          className="text-[10px] font-medium uppercase leading-none"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            letterSpacing: '0.185em',
            marginLeft: '0.09em',
            color: 'var(--new-textItemBlur, #999)',
            whiteSpace: 'nowrap',
          }}
        >
          {BRAND_MOTTO}
        </span>
      )}
    </div>
  );
};
