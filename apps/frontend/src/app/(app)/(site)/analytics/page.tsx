export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { PlatformAnalytics } from '@gitroom/frontend/components/platform-analytics/platform.analytics';
import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';
import { BRAND } from '@gitroom/frontend/brand';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? BRAND : 'Gitroom'} Analytics`,
  description: '',
};
export default async function Index() {
  return <PlatformAnalytics />;
}
