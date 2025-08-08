'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Importação temporária do componente Stepper até que seja criado
const Stepper = ({ currentStep, className, children, ...props }: any) => (
  <div className={`flex items-center justify-between w-full relative ${className}`} {...props}>
    {children}
  </div>
);

const Step = ({ title, completed, current, index }: any) => (
  <div className="flex flex-col items-center">
    <div 
      className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all ${
        completed ? "bg-emerald-500 text-white shadow-sm" : 
        current ? "bg-indigo-600 text-white shadow-md" : 
        "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
      }`}
    >
      {completed ? <Check className="h-5 w-5" /> : current ? <span>{index + 1}</span> : <span>{index + 1}</span>}
    </div>
    <span 
      className={`mt-2 text-xs font-medium ${
        current ? "text-indigo-600 dark:text-indigo-400" : 
        completed ? "text-emerald-500 dark:text-emerald-400" : 
        "text-slate-500 dark:text-slate-400"
      }`}
    >
      {title}
    </span>
  </div>
);

// Importação dos componentes de etapas do wizard
import { ArchetypeSelector } from './steps/ArchetypeSelector';
// @ts-ignore - Importações com declarações de tipo no arquivo index.d.ts
import { PersonalityTraits } from './steps/PersonalityTraits';
// @ts-ignore - Importações com declarações de tipo no arquivo index.d.ts
import { ConversationFlows } from './steps/ConversationFlows';
// @ts-ignore - Importações com declarações de tipo no arquivo index.d.ts
import { ReviewPrompt } from './steps/ReviewPrompt';
import { generateAgentPrompt } from '@/lib/actions/wizard.actions';

export interface WizardData {
  generation_method: string;
  archetype_id?: string;
  archetype_name?: string;
  personality_traits: string[];
  conversation_flows: string[];
  custom_instructions?: string;
}

interface Trait {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

interface Flow {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

interface Archetype {
  id: string;
  name: string;
  description?: string;
  niche?: string;
  use_case?: string;
}

type AgentCreationWizardProps = {
  onComplete: (name: string, systemPrompt: string, wizardData: WizardData) => void;
  onCancel: () => void;
};

export function AgentCreationWizard({ onComplete, onCancel }: AgentCreationWizardProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<Trait[]>([]);
  
  const [selectedFlows, setSelectedFlows] = useState<Flow[]>([]);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  
  const [wizardData, setWizardData] = useState<WizardData>({
    generation_method: 'wizard',
    personality_traits: [],
    conversation_flows: []
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const steps = [
    'Selecionar Arquétipo',
    'Personalidade',
    'Fluxos de Conversa',
    'Revisão'
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Arquétipo
        return !!selectedArchetype;
      case 1: // Personalidade
        return Array.isArray(selectedTraits) && selectedTraits.length > 0;
      case 2: // Fluxos
        return Array.isArray(selectedFlows) && selectedFlows.length > 0;
      case 3: // Revisão
        return !!agentName && !!generatedPrompt;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Gerar prompt automaticamente quando chegar à etapa de revisão
      if (currentStep + 1 === 3) {
        generatePromptOnReview();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!selectedArchetype) return;
    
    setIsGenerating(true);
    
    try {
      // Preparar dados para enviar para a API
      const wizardDataForPrompt: WizardData = {
        generation_method: 'wizard',
        archetype_id: selectedArchetype.id,
        personality_traits: selectedTraits.map(trait => trait.id),
        conversation_flows: selectedFlows.map(flow => flow.id),
        custom_instructions: customInstructions
      };
      
      const result = await generateAgentPrompt(wizardDataForPrompt);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      if (result.agent_name && result.system_prompt) {
        setAgentName(result.agent_name);
        setGeneratedPrompt(result.system_prompt);
        
        // Atualizar os dados do wizard com o nome do arquétipo para exibição
        if (selectedArchetype) {
          setWizardData({
            ...wizardDataForPrompt,
            archetype_name: selectedArchetype.name
          });
        }
      }
    } catch (error) {
      console.error('Erro ao gerar prompt:', error);
      toast.error('Ocorreu um erro ao gerar o prompt. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    // Verificar se temos todos os dados necessários
    if (!agentName || !generatedPrompt || !selectedArchetype) {
      toast.error('Preencha todos os campos obrigatórios antes de criar o agente.');
      return;
    }
    
    // Preparar dados para enviar para a API
    const finalWizardData: WizardData = {
      generation_method: 'wizard',
      archetype_id: selectedArchetype.id,
      archetype_name: selectedArchetype.name,
      personality_traits: selectedTraits.map(trait => trait.id),
      conversation_flows: selectedFlows.map(flow => flow.id),
      custom_instructions: customInstructions
    };

    onComplete(agentName, generatedPrompt, finalWizardData);
  };

  // Função para gerar o prompt automaticamente quando chegar à etapa de revisão
  const generatePromptOnReview = () => {
    if (currentStep === 3 && !generatedPrompt && !isGenerating) {
      handleGeneratePrompt();
    }
  };

  // Função para lidar com a seleção de arquétipo
  const handleArchetypeSelected = (id: string, name: string, niche: string, useCase: string) => {
    setSelectedArchetype({
      id,
      name,
      niche,
      use_case: useCase
    });
    setCurrentStep(1);
  };

  const handleTraitsSelected = (traits: Trait[]) => {
    setSelectedTraits(traits);
  };

  const handleFlowsSelected = (flows: Flow[], instructions: string) => {
    setSelectedFlows(flows);
    setCustomInstructions(instructions);
  };

  useEffect(() => {
    if (currentStep === 3 && !generatedPrompt) {
      generatePromptOnReview();
    }
  }, [currentStep, generatedPrompt]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-2">
        <Stepper currentStep={currentStep} className="mb-10 px-6">
          {steps.map((step, index) => (
            <Step 
              key={index} 
              title={step} 
              index={index}
              completed={index < currentStep}
              current={index === currentStep}
            />
          ))}
          {/* Linhas conectoras entre os passos */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />
        </Stepper>

        <div className="mt-6">
          {currentStep === 0 && (
            <ArchetypeSelector
              selectedArchetype={selectedArchetype}
              onSelect={handleArchetypeSelected}
            />
          )}

          {currentStep === 1 && (
            <PersonalityTraits
              selectedTraits={selectedTraits}
              onChange={handleTraitsSelected}
            />
          )}

          {currentStep === 2 && (
            <ConversationFlows
              selectedFlows={selectedFlows}
              onChange={handleFlowsSelected}
              customInstructions={customInstructions}
            />
          )}

          {currentStep === 3 && (
            <ReviewPrompt
              agentName={agentName}
              systemPrompt={generatedPrompt}
              wizardData={{
                generation_method: 'wizard',
                archetype_id: selectedArchetype?.id,
                personality_traits: selectedTraits.map(trait => trait.id),
                conversation_flows: selectedFlows.map(flow => flow.id),
                custom_instructions: customInstructions,
                // Adicionar propriedades extras para compatibilidade com ReviewPrompt
                archetype_name: selectedArchetype?.name
              }}
              isGenerating={isGenerating}
              onGeneratePrompt={handleGeneratePrompt}
              onNameChange={setAgentName}
              onPromptChange={setGeneratedPrompt}
              selectedArchetype={selectedArchetype}
              selectedTraits={selectedTraits}
              selectedFlows={selectedFlows}
            />
          )}
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex justify-end gap-3">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="border-slate-200 dark:border-slate-700 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 bg-indigo-600 hover:bg-indigo-700"
            >
              Avançar
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 bg-emerald-600 hover:bg-emerald-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  Criar Agente
                  <Check className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
