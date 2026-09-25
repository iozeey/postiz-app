import { getT } from '@gitroom/react/translation/get.translation.service.backend';

export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import loadDynamic from 'next/dynamic';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
import { MantineWrapper } from '@gitroom/react/helpers/mantine.wrapper';
import { Toaster } from '@gitroom/react/toaster/toaster';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));
const points = [
  'One calendar across every channel',
  'Client approvals before anything publishes',
  'Analytics that show what actually worked',
];

const channels = [
  'Facebook',
  'Instagram',
  'X',
  'LinkedIn',
  'TikTok',
  'YouTube',
  'Pinterest',
  'Threads',
];

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getT();

  return (
    <MantineWrapper>
      <Toaster />
      <div className="bg-[#0E0E0E] flex flex-1 p-[12px] gap-[12px] min-h-screen w-screen text-white">
        {/*<style>{`html, body {overflow-x: hidden;}`}</style>*/}
        <ReturnUrlComponent />
        <div className="flex flex-col py-[40px] px-[20px] flex-1 lg:w-[600px] lg:flex-none rounded-[12px] text-white p-[12px] bg-[#1A1919]">
          <div className="w-full max-w-[440px] mx-auto justify-center gap-[20px] h-full flex flex-col text-white">
            <LogoTextComponent />
            <div className="flex">{children}</div>
          </div>
        </div>
        <div className="flex-1 hidden lg:flex flex-col justify-center px-[64px] py-[64px] overflow-hidden">
          <div className="max-w-[560px]">
            <h2 className="text-[clamp(26px,2.6vw,38px)] font-semibold leading-[1.15] tracking-[-0.02em] m-0">
              Social scheduling for people with a business to run
            </h2>
            <p className="text-[17px] leading-[1.6] mt-[20px] mb-0 text-white/55">
              Plan the month, schedule once, and let it publish. Every channel in
              one calendar, with sign-off before anything goes out.
            </p>

            <ul className="list-none p-0 mt-[36px] mb-0 flex flex-col gap-[15px]">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-[12px] text-[15px] text-white/75">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="mt-[3px] shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.5 8.4l3 3 6-6.4"
                      stroke="var(--new-btn-primary)"
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-[44px]">
              <div className="text-[11px] uppercase tracking-[0.1em] text-white/35 mb-[13px]">
                Publishes to
              </div>
              <div className="flex flex-wrap gap-[7px]">
                {channels.map((channel) => (
                  <span
                    key={channel}
                    className="text-[12.5px] text-white/60 border border-white/12 rounded-full px-[11px] py-[4px]"
                  >
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MantineWrapper>
  );
}
