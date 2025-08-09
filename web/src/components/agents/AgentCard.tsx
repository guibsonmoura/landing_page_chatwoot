import { Brain, Edit, Trash2, Settings, MessageSquare, BrainCircuit, Bot, Sparkles } from 'lucide-react';
import { type Agent } from '@/types/agent';
import { cn } from '@/lib/utils';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  // Função para determinar o modelo e a cor do agente com base no llm_config
  const getModelDetails = (llmConfig: any) => {
    // Extrair o modelo do llm_config se disponível
    const model = llmConfig?.model || llmConfig?.provider || 'default';
    const modelLower = model.toLowerCase();
    
    if (modelLower.includes('gpt-4')) {
      return {
        icon: (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center ring-2 ring-indigo-200/50 dark:ring-indigo-700/30 shadow-sm">
            <Bot className="h-6 w-6" />
          </div>
        ),
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        borderColor: 'border-indigo-200 dark:border-indigo-800',
        modelName: 'GPT-4'
      };
    } else if (modelLower.includes('gpt-3.5') || modelLower.includes('gpt3.5')) {
      return {
        icon: (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/40 dark:to-teal-800/30 text-teal-600 dark:text-teal-400 flex items-center justify-center ring-2 ring-teal-200/50 dark:ring-teal-700/30 shadow-sm">
            <Bot className="h-6 w-6" />
          </div>
        ),
        color: 'from-teal-500 to-teal-600',
        bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        borderColor: 'border-teal-200 dark:border-teal-800',
        modelName: 'GPT-3.5'
      };
    } else if (modelLower.includes('claude')) {
      return {
        icon: (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/30 text-amber-600 dark:text-amber-400 flex items-center justify-center ring-2 ring-amber-200/50 dark:ring-amber-700/30 shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
        ),
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        modelName: 'Claude'
      };
    } else {
      return {
        icon: (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/40 dark:to-slate-700/30 text-slate-600 dark:text-slate-400 flex items-center justify-center ring-2 ring-slate-200/50 dark:ring-slate-700/30 shadow-sm">
            <Brain className="h-6 w-6" />
          </div>
        ),
        color: 'from-slate-500 to-slate-600',
        bgColor: 'bg-slate-50 dark:bg-slate-900/20',
        borderColor: 'border-slate-200 dark:border-slate-800',
        modelName: 'IA'
      };
    }
  };

  const modelDetails = getModelDetails(agent.llm_config);
  
  // Função para determinar o ícone e a cor da plataforma
  const getPlatformDetails = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'whatsapp':
      case 'whatsapp_evolution_api':
        return {
          icon: (
            <div className="h-5 w-5 flex items-center justify-center">
              <img 
                src="/images/platforms/whatsapp-logo.png" 
                alt="WhatsApp" 
                className="h-full w-full object-contain" 
              />
            </div>
          ),
          bgColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        };
      case 'instagram':
        return {
          icon: (
            <div className="h-5 w-5 flex items-center justify-center">
              <img 
                src="/images/platforms/instagram-logo.png" 
                alt="Instagram" 
                className="h-full w-full object-contain" 
              />
            </div>
          ),
          bgColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        };
      case 'webchat':
        return {
          icon: (
            <div className="h-5 w-5 flex items-center justify-center">
              <img 
                src="/images/platforms/webchat_logo.png" 
                alt="Webchat" 
                className="h-full w-full object-contain" 
              />
            </div>
          ),
          bgColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        };
      default:
        return {
          icon: (
            <div className="h-5 w-5 flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </div>
          ),
          bgColor: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
        };
    }
  };
  
  // Extrair uma descrição resumida do system_prompt
  const getShortDescription = () => {
    if (!agent.system_prompt) return "Sem descrição";
    return agent.system_prompt.length > 100 
      ? agent.system_prompt.substring(0, 100) + "..." 
      : agent.system_prompt;
  };

  // Função para normalizar os nomes das plataformas
  const normalizePlatformName = (platform: string): string => {
    if (platform.toLowerCase() === 'whatsapp' || platform.toLowerCase() === 'whatsapp_evolution_api') {
      return 'WhatsApp';
    }
    return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  };

  return (
    <Card className="relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
      <div 
        className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${modelDetails.color} z-10`}
        style={{ marginTop: '-1px', width: 'calc(100% + 2px)', marginLeft: '-1px' }}
      />
      
      <CardHeader className="p-5 pb-0 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {modelDetails.icon}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {agent.agent_name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {modelDetails.modelName}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-slate-200 dark:border-slate-700 shadow-lg">
                <DropdownMenuLabel className="text-slate-500 dark:text-slate-400">Ações</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => onEdit(agent)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="h-4 w-4 text-slate-500" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950 dark:focus:text-red-400 flex items-center gap-2 cursor-pointer"
                  onClick={() => onDelete(agent)}
                >
                  <Trash2 className="h-4 w-4" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "px-2 py-1 font-medium",
                agent.is_active 
                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900" 
                  : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800"
              )}
            >
              <span className={cn(
                "mr-1.5 h-2 w-2 rounded-full inline-block",
                agent.is_active ? "bg-green-500" : "bg-slate-400"
              )} />
              {agent.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
            
            {/* Badge para indicar se o prompt está configurado */}
            {agent.system_prompt && (
              <Badge 
                variant="outline" 
                className="px-2 py-1 font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900"
              >
                <span className="mr-1.5 h-2 w-2 rounded-full inline-block bg-blue-500" />
                Prompt Configurado
              </Badge>
            )}
          </div>
        </div>

        {/* Seção para exibir canais e RAGs vinculados */}
        {((agent.channels && agent.channels.length > 0) || (agent.knowledge_bases && agent.knowledge_bases.length > 0)) && (
          <div className="mb-4">
            {/* Canais vinculados */}
            {agent.channels && agent.channels.length > 0 && (
              <div className="flex flex-col gap-3 p-3 rounded-md border bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <MessageSquare className="h-4 w-4" />
                  <h4 className="text-sm font-medium">Canais Conectados</h4>
                </div>
                <div className="flex flex-wrap gap-2 pl-1">
                  {agent.channels.map((channel) => {
                    const platformDetails = getPlatformDetails(channel.platform);
                    return (
                      <Badge 
                        key={channel.id} 
                        variant="secondary" 
                        className={`font-normal text-xs flex items-center gap-2 px-3 py-2 ${platformDetails.bgColor}`}
                      >
                        {platformDetails.icon}
                        <span>{normalizePlatformName(channel.platform)} - {channel.account}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Base de conhecimento vinculada - apenas documentos processados */}
            {agent.knowledge_bases && agent.knowledge_bases.filter(kb => kb.status === 'processed').length > 0 && (
              <div className="flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-700/50 ring-1 ring-purple-200/50 dark:ring-purple-700/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/30 rounded-lg ring-2 ring-purple-300/50 dark:ring-purple-600/30">
                    <BrainCircuit className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Base de Conhecimento</h4>
                    <p className="text-xs text-purple-600 dark:text-purple-400">IA Avançada • RAG Enabled</p>
                  </div>
                  <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                    Premium
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {agent.knowledge_bases
                    .filter(kb => kb.status === 'processed')
                    .map((kb) => (
                      <Badge key={kb.id} variant="secondary" className="font-normal text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {kb.file_name || `Documento ${kb.id.slice(0, 8)}`}
                      </Badge>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
