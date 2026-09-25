import { LifetimeDeal } from '@gitroom/frontend/components/billing/lifetime.deal';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';
import { BRAND } from '@gitroom/frontend/brand';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? BRAND : 'Gitroom'} Lifetime deal`,
  description: '',
};
export default async function Page() {
  return <LifetimeDeal />;
}
