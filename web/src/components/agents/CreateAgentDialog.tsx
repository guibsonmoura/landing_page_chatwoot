'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Bot, Sparkles, Wand2, AlertTriangle, FileText, PenTool, Lightbulb, ChevronDown, MoreHorizontal, BookTemplate } from 'lucide-react';
import { AgentTemplateGallery } from './wizard/AgentTemplateGallery';

import { type Agent } from '@/types/agent';
import { createAgent, updateAgent, getAgents } from '@/lib/actions/agent.actions';
import { usePlanStore } from '@/stores/planStore';
import { AgentCreationWizard, WizardData } from './wizard/AgentCreationWizard';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Schema de validação consistente com a Server Action
const formSchema = z.object({
  agent_name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  system_prompt: z.string().min(10, 'O prompt deve ter pelo menos 10 caracteres.'),
});

type AgentDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  agentToEdit?: Agent | null;
};

export function CreateAgentDialog({ isOpen, onOpenChange, agentToEdit }: AgentDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentCount, setAgentCount] = useState<number>(0);
  const [isLimitReached, setIsLimitReached] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'manual' | 'templates' | 'wizard'>('manual');
  
  // Resetar para a tela principal sempre que o modal for aberto
  useEffect(() => {
    if (isOpen) {
      setCurrentView('manual');
    }
  }, [isOpen]);
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string | null>(null);

  const planFeatures = usePlanStore((state: any) => state.planFeatures);
  const maxAgents = planFeatures?.max_agents || 0;
  const isEditMode = Boolean(agentToEdit);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agent_name: '',
      system_prompt: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Busca agentes para verificar o limite
      const fetchAgents = async () => {
        const result = await getAgents();
        if (result.data) {
          const currentCount = result.data.length;
          setAgentCount(currentCount);
          setIsLimitReached(currentCount >= maxAgents);
        }
      };
      fetchAgents();
      
      // Reset do formulário
      if (isEditMode && agentToEdit) {
        form.reset({
          agent_name: agentToEdit.agent_name,
          system_prompt: agentToEdit.system_prompt,
        });
      } else {
        form.reset({
          agent_name: '',
          system_prompt: '',
        });
      }
    }
  }, [isOpen, agentToEdit, isEditMode, form, maxAgents]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('agent_name', values.agent_name);
    formData.append('system_prompt', values.system_prompt);

    let result;
    if (isEditMode && agentToEdit) {
      formData.append('id', agentToEdit.id);
      result = await updateAgent(formData);
    } else {
      // Adiciona metadados do método de criação
      const wizardData = {
        generation_method: 'manual'
      };
      formData.append('wizardData', JSON.stringify(wizardData));
      result = await createAgent(formData);
    }

    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isEditMode ? 'Agente atualizado com sucesso!' : 'Agente criado com sucesso!');
      onOpenChange(false);
      router.refresh();
    }
  }

  // Função para lidar com a criação de agente a partir do wizard
  const handleWizardComplete = async (name: string, systemPrompt: string, wizardData: WizardData) => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('agent_name', name);
    formData.append('system_prompt', systemPrompt);
    formData.append('wizardData', JSON.stringify(wizardData));
    
    const result = await createAgent(formData);
    
    setIsSubmitting(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Agente criado com sucesso!');
      onOpenChange(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1100px] h-[90vh] p-0 flex flex-col overflow-hidden rounded-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>{isEditMode ? 'Editar Agente' : 'Criar Novo Agente'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Modifique as configurações do seu agente existente.' 
              : 'Crie e configure um novo agente de IA a partir do zero, usando um template ou com o nosso gerador de almas.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-grow overflow-hidden">
          {/* Sidebar with illustration */}
          <div className="hidden md:flex md:w-1/4 bg-gradient-to-br from-blue-500 to-purple-600 p-6 flex-col justify-between text-white">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{isEditMode ? 'Editar Agente' : 'Novo Agente'}</h3>
              <p className="text-sm text-white/80">
                Configure seu agente de IA personalizado para interagir com seus clientes em diversos canais.
              </p>
            
              {currentView === 'manual' && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-medium text-white">Como criar manualmente</h3>
                  <p className="text-sm text-blue-100">
                    Escreva instruções detalhadas para o seu agente:
                  </p>
                  <ul className="space-y-3 text-sm text-white/80">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Defina o tom, personalidade e comportamento</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Inclua conhecimentos específicos que o agente deve ter</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Estabeleça limites sobre o que o agente pode ou não fazer</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {currentView === 'templates' && !isEditMode && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium text-white/90">Como escolher um template</h4>
                  <ul className="space-y-3 text-sm text-white/80">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Selecione um template que se aproxime do seu caso de uso</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Você poderá personalizar o prompt após selecionar um template</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {currentView === 'wizard' && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium text-white/90">Gerador de Almas</h4>
                  <p className="text-sm text-white/80">
                    Responda algumas perguntas para gerar um prompt personalizado para seu agente.
                  </p>
                </div>
              )}
            </div>
            
            {/* Exibir informações do plano */}
            <div className="mt-auto pt-6">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <AlertTriangle className="h-4 w-4" />
                <span>Limite: {agentCount}/{maxAgents} agentes</span>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {isEditMode ? 'Editar Agente' : 'Criar Novo Agente'}
                </h2>
              </div>
            </div>
            
            {/* Form content */}
            {(!isEditMode || (isEditMode && isOpen)) && (
              <div className="p-6 flex-1 overflow-y-auto">
                {isLimitReached && !isEditMode ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Limite de agentes atingido</h3>
                    <p className="text-sm text-slate-500 text-center max-w-md mb-6">
                      Você atingiu o limite de {maxAgents} agentes para o seu plano atual.
                      Atualize seu plano para criar mais agentes ou exclua algum agente existente.
                    </p>
                    <Button onClick={() => onOpenChange(false)}>Voltar</Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Campo Nome do Agente - visível apenas na tela inicial */}
                        {currentView === 'manual' && (
                          <FormField
                            control={form.control}
                            name="agent_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Agente</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Assistente de Vendas" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Nome que identifica seu agente no dashboard.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </form>
                    </Form>
                    
                    {/* Menu suspenso apenas na tela inicial */}
                    {currentView === 'manual' && (
                      <div className="flex justify-end mb-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <span>Ações</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setCurrentView('templates')} className="flex items-center gap-2">
                              <BookTemplate className="h-4 w-4" />
                              <span>Templates</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setCurrentView('wizard')} className="flex items-center gap-2">
                              <Wand2 className="h-4 w-4" />
                              <span>Gerador de Almas</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    
                    {currentView === 'manual' && (
                      <div className="space-y-4">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="system_prompt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Prompt do Sistema</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Textarea
                                        placeholder=""
                                        className={cn(
                                          "w-full h-[450px] max-h-[70vh] overflow-y-auto resize-none border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500",
                                          "pr-10"
                                        )}
                                        {...field}
                                      />
                                    </FormControl>
                                    <Wand2 className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </form>
                        </Form>
                      </div>
                    )}
                    
                    {currentView === 'templates' && !isEditMode && (
                      <div className="flex flex-col h-[calc(100vh-250px)]">
                        {/* Removidos os botões da parte superior */}
                        <AgentTemplateGallery 
                          selectedArchetypeId={selectedArchetypeId}
                          onArchetypeSelect={setSelectedArchetypeId}
                          agentName={form.watch('agent_name')}
                          onTemplateSelect={(prompt, name) => {
                            form.setValue('system_prompt', prompt, { shouldValidate: true });
                            if (!form.getValues('agent_name')) {
                              form.setValue('agent_name', name, { shouldValidate: true });
                            }
                            toast.info(`Template "${name}" aplicado.`);
                            setCurrentView('manual');
                          }}
                        />
                      </div>
                    )}
                    
                    {currentView === 'wizard' && (
                      <div className="flex-1 h-full">
                          <AgentCreationWizard 
                            onComplete={handleWizardComplete} 
                            onCancel={() => onOpenChange(false)} 
                          />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Footer com botões - conforme a tela atual */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0 left-0 right-0">
              <div className="flex gap-3 justify-end">
                {/* Botões para tela inicial (manual) */}
                {(isEditMode || currentView === 'manual') && (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => onOpenChange(false)} 
                      disabled={isSubmitting}
                      className="border-slate-200 dark:border-slate-700"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={isSubmitting || (!isEditMode && isLimitReached)}
                      className="px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-[-1px] active:translate-y-[1px]"
                    >
                      {isSubmitting ? 'Criando...' : isEditMode ? 'Atualizar Agente' : 'Criar Agente'}
                    </Button>
                  </>
                )}
                
                {/* Botões para tela de templates */}
                {currentView === 'templates' && !isEditMode && (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCurrentView('manual')}
                      className="border-slate-200 dark:border-slate-700"
                    >
                      Voltar
                    </Button>
                    <Button 
                      type="button"
                      variant="default"
                      onClick={() => {
                        if (selectedArchetypeId) {
                          // Simular a seleção do template e voltar para o modo manual
                          const selectedTemplate = document.querySelector(`[data-archetype-id="${selectedArchetypeId}"]`);
                          if (selectedTemplate) {
                            selectedTemplate.dispatchEvent(new Event('click'));
                          } else {
                            toast.info('Selecione um template para prosseguir');
                          }
                        } else {
                          toast.info('Selecione um template para prosseguir');
                        }
                      }}
                      disabled={!selectedArchetypeId}
                      className="px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-[-1px] active:translate-y-[1px]"
                    >
                      Avançar
                    </Button>
                  </>
                )}
                
                {/* Botões para tela do wizard */}
                {currentView === 'wizard' && !isEditMode && (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        const backButton = document.querySelector('[data-wizard-back]') as HTMLButtonElement;
                        if (backButton) {
                          if (backButton.disabled) {
                            setCurrentView('manual'); // Se está no primeiro passo, volta para tela principal
                          } else {
                            backButton.click(); // Senão, volta para o passo anterior
                          }
                        }
                      }}
                      className="border-slate-200 dark:border-slate-700"
                    >
                      Voltar
                    </Button>
                    <Button 
                      type="button"
                      variant="default"
                      onClick={() => {
                        const nextButton = document.querySelector('[data-wizard-next]') as HTMLButtonElement;
                        if (nextButton) {
                          nextButton.click();
                        }
                      }}
                      disabled={(() => {
                        const nextButton = document.querySelector('[data-wizard-next]') as HTMLButtonElement;
                        return nextButton?.disabled || false;
                      })()}
                      className="px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-[-1px] active:translate-y-[1px]"
                    >
                      Avançar
                    </Button>
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
