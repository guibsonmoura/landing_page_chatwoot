'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlusCircle, Loader2, Trash2 } from 'lucide-react';

import { type Agent } from '@/types/agent';
import { deleteAgent } from '@/lib/actions/agent.actions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import { AgentCard } from '@/components/agents/AgentCard';

interface AgentClientPageProps {
  initialAgents: Agent[];
}

export default function AgentClientPage({ initialAgents }: AgentClientPageProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // State for dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const handleOpenCreateDialog = () => {
    setAgentToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (agent: Agent) => {
    setAgentToEdit(agent);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!agentToDelete) return;

    setIsDeleting(true);
    const result = await deleteAgent(agentToDelete.id);
    setIsDeleting(false);

    if (result.error) {
      toast.error('Erro ao deletar agente', { description: result.error });
    } else {
      toast.success('Agente deletado com sucesso!');
      router.refresh(); // Agora isso vai funcionar!
    }
    setAgentToDelete(null);
  };

  return (
    <>
      <CreateAgentDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        agentToEdit={agentToEdit}
      />

      <AlertDialog open={!!agentToDelete} onOpenChange={() => setAgentToDelete(null)}>
        <AlertDialogContent className="border-0 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente o agente
              <span className="font-bold text-slate-900 dark:text-white"> {agentToDelete?.agent_name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting}
              className="border-slate-200 dark:border-slate-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Confirmar exclusão
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500">
                <path d="M12 2a8 8 0 0 0-8 8v1h16V10a8 8 0 0 0-8-8Z"></path>
                <path d="M12 17v-2"></path>
                <path d="M8.5 17a2.5 2.5 0 0 0 5 0"></path>
                <path d="M20 10v3a8 8 0 0 1-16 0v-3"></path>
              </svg>
              Meus Agentes
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Configure agentes de IA personalizados para interagir com seus clientes
            </p>
          </div>
          <Button 
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Agente
          </Button>
        </div>

        {initialAgents.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onEdit={handleOpenEditDialog}
                  onDelete={(agent) => setAgentToDelete(agent)}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-slate-500">
                  <path d="M12 2a8 8 0 0 0-8 8v1h16V10a8 8 0 0 0-8-8Z"></path>
                  <path d="M12 17v-2"></path>
                  <path d="M8.5 17a2.5 2.5 0 0 0 5 0"></path>
                  <path d="M20 10v3a8 8 0 0 1-16 0v-3"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-1">Nenhum agente encontrado</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
                Você ainda não criou nenhum agente. Crie seu primeiro agente para começar.  
              </p>
              <Button 
                onClick={handleOpenCreateDialog}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar meu primeiro agente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
