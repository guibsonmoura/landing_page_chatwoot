'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';

import { getAgentById } from '@/lib/actions/agent.actions';
import { usePlanStore } from '@/stores/planStore';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KnowledgeBaseUploader } from '@/components/knowledge/KnowledgeBaseUploader';

// Tipos
type Agent = {
  id: string;
  tenant_id: string;
  agent_name: string;
  system_prompt: string | null;
};

type AgentDetailsPageProps = {
  params: {
    id: string;
  };
};

export default function AgentDetailsPage({ params }: AgentDetailsPageProps) {
  const { id } = params;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Acessa o estado do plano para verificar as features
  const planFeatures = usePlanStore((state) => state.planFeatures);
  const isRagEnabled = planFeatures?.rag_enabled === true;

  useEffect(() => {
    const fetchAgent = async () => {
      setIsLoading(true);
      const { data, error } = await getAgentById(id);

      if (error || !data) {
        notFound();
      } else {
        setAgent(data);
      }
      setIsLoading(false);
    };

    fetchAgent();
  }, [id]);

  if (isLoading) {
    // TODO: Adicionar um componente Skeleton para uma melhor UX
    return <div>Carregando...</div>;
  }

  if (!agent) {
    return null; // notFound() já foi chamado no useEffect
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{agent.agent_name}</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações e a base de conhecimento do seu agente.
          </p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          {isRagEnabled && (
            <TabsTrigger value="knowledge">Base de Conhecimento</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="settings">
          {/* Conteúdo da aba de configurações será adicionado aqui */}
          <p>Formulário para editar nome, prompt do sistema, etc.</p>
        </TabsContent>
        {isRagEnabled && (
          <TabsContent value="knowledge">
            {/* Conteúdo da aba de base de conhecimento será adicionado aqui */}
            <KnowledgeBaseUploader agentId={agent.id} tenantId={agent.tenant_id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

