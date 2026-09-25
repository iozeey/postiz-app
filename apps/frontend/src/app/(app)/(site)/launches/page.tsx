export const dynamic = 'force-dynamic';
import { LaunchesComponent } from '@gitroom/frontend/components/launches/launches.component';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';
import { BRAND } from '@gitroom/frontend/brand';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? `${BRAND} Calendar` : 'Gitroom Launches'}`,
  description: '',
};
export default async function Index() {
  return <LaunchesComponent />;
}
