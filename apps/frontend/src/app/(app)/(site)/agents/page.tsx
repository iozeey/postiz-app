import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BRAND } from '@gitroom/frontend/brand';

export const metadata: Metadata = {
  title: `${BRAND} - Agent`,
  description: '',
};

export default async function Page() {
  return redirect('/agents/new');
}
