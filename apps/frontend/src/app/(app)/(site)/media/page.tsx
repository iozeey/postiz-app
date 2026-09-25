import { MediaLayoutComponent } from '@gitroom/frontend/components/new-layout/layout.media.component';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';
import { BRAND } from '@gitroom/frontend/brand';

export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? BRAND : 'Gitroom'} Media`,
  description: '',
};

export default async function Page() {
  return <MediaLayoutComponent />
}
