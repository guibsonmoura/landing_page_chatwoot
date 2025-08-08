import { getAgentsWithRelations } from '@/lib/actions/agent.actions';
import AgentClientPage from './client-page';

// Esta é uma página de servidor (Server Component)
export default async function AgentsPage() {
  // 1. Busca os dados no servidor com relacionamentos
  const { data: agents, error } = await getAgentsWithRelations();

  // 2. Lida com o estado de erro no servidor
  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar agentes: {error}</div>;
  }

  // 3. Passa os dados para o componente de cliente, que cuidará da interatividade
  return <AgentClientPage initialAgents={agents || []} />;
}
