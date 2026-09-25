import { Metadata } from 'next';
import { Agent } from '@gitroom/frontend/components/agents/agent';
import { BRAND } from '@gitroom/frontend/brand';
export const metadata: Metadata = {
  title: `${BRAND} - Agent`,
  description: 'agents',
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Agent>{children}</Agent>;
}
