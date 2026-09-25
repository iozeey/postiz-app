import { Metadata } from 'next';
import { Agent } from '@gitroom/frontend/components/agents/agent';
import { AgentChat } from '@gitroom/frontend/components/agents/agent.chat';
import { BRAND } from '@gitroom/frontend/brand';
export const metadata: Metadata = {
  title: `${BRAND} - Agent`,
  description: '',
};
export default async function Page() {
  return (
    <AgentChat />
  );
}
