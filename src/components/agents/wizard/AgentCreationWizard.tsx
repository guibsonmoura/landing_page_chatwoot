'use client';

import { useState, useEffect } from 'react';
import { useAgent } from '@/contexts/AgentContext';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Archetype, PersonalityTrait, ConversationFlow, WizardData } from '@/types/wizard';

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
import { BusinessStep } from './steps/BusinessStep';
import { ArchetypeSelector } from './steps/ArchetypeSelector';
import { PersonalityTraits } from './steps/PersonalityTraits';
import { ConversationFlows } from './steps/ConversationFlows';
import { ReviewStep } from './steps/ReviewStep';
import { generateAgentPrompt } from '@/lib/actions/wizard.actions';
import { getConversationFlows } from '@/lib/actions/template.actions';

// Usando os tipos importados de @/types/wizard
// Exportando o tipo WizardData para uso em outros componentes
export type { WizardData } from '@/types/wizard';

type AgentCreationWizardProps = {
  onComplete: (name: string, systemPrompt: string, wizardData: WizardData) => void;
  onCancel: () => void;
};

export function AgentCreationWizard({ onComplete, onCancel }: AgentCreationWizardProps) {
  // Usando o contexto global para o nome do agente
  const { agentName, setAgentName, setSystemPrompt } = useAgent();
  
  const [availableFlows, setAvailableFlows] = useState<ConversationFlow[]>([]);
  
  // Buscar fluxos de conversação disponíveis
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const data = await getConversationFlows();
        if (data) {
          setAvailableFlows(data);
        }
      } catch (error) {
        console.error('Erro ao buscar fluxos de conversação:', error);
      }
    };
    
    fetchFlows();
  }, []);
  
  const [wizardData, setWizardData] = useState<WizardData>({
    businessDescription: '',
    archetype: undefined,
    personality_traits: [],
    conversation_flow: undefined,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const steps = [
    { id: 'business', name: 'Seu Negócio' },
    { id: 'archetype', name: 'Arquétipo' },
    { id: 'personality', name: 'Personalidade' },
    { id: 'conversation', name: 'Fluxo de Conversa' },
    { id: 'review', name: 'Revisão' },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Seu Negócio
        return wizardData.businessDescription.trim().length > 0;
      case 1: // Arquétipo
        return !!wizardData.archetype;
      case 2: // Personalidade
        return wizardData.personality_traits.length > 0;
      case 3: // Fluxo de Conversa
        return !!wizardData.conversation_flow;
      case 4: // Revisão
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    // Se estiver no último passo (Revisão), completa o wizard e retorna à tela principal
    if (currentStep === steps.length - 1) {
      handleGeneratePrompt();
    } else {
      // Caso contrário, avança para o próximo passo
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    // Se estiver no primeiro passo, volta para a tela principal
    if (currentStep === 0) {
      onCancel(); // Volta para a tela principal
    } else {
      // Caso contrário, volta para o passo anterior
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!wizardData.archetype) {
      toast.error('Por favor, selecione um arquétipo antes de gerar o prompt.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAgentPrompt(wizardData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.agent_name && result.system_prompt) {
        setAgentName(result.agent_name);
        setGeneratedPrompt(result.system_prompt);
        // Prepara para finalizar, passando os dados gerados
        onComplete(result.agent_name, result.system_prompt, wizardData);
        toast.success('Agente configurado com sucesso!');
      } else {
        toast.error('Resposta inesperada ao gerar o prompt.');
      }
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      toast.error('Ocorreu um erro ao gerar o prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBusinessDescriptionChange = (description: string) => {
    setWizardData(prev => ({ ...prev, businessDescription: description }));
  };

  const handleArchetypeChange = (archetype: Archetype | null) => {
    setWizardData(prev => ({ ...prev, archetype: archetype || undefined }));
  };

  const handleTraitsChange = (traits: PersonalityTrait[]) => {
    setWizardData(prev => ({ ...prev, personality_traits: traits }));
  };

  const handleFlowChange = (flow: ConversationFlow | null) => {
    setWizardData(prev => ({ ...prev, conversation_flow: flow || undefined }));
  };



  return (
    <div className="flex flex-col h-full">
      <div className="pt-0 px-6 pb-2">
        <Stepper currentStep={currentStep} className="mb-6 px-6">
          {steps.map((step, index) => (
            <Step 
              key={index} 
              title={step.name} 
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
            <BusinessStep
              description={wizardData.businessDescription}
              onChange={handleBusinessDescriptionChange}
            />
          )}

          {currentStep === 1 && (
            <ArchetypeSelector
              selectedArchetype={wizardData.archetype}
              onSelect={handleArchetypeChange}
            />
          )}

          {currentStep === 2 && (
            <PersonalityTraits
              selectedTraits={wizardData.personality_traits}
              onChange={handleTraitsChange}
            />
          )}

          {currentStep === 3 && (
            <ConversationFlows
              selectedFlow={wizardData.conversation_flow}
              onChange={handleFlowChange}
            />
          )}

          {currentStep === 4 && (
            <ReviewStep data={wizardData} />
          )}
        </div>
      </div>

      {/* Botões invisíveis para comunicação com o rodapé do modal principal */}
      <button 
        data-wizard-back 
        onClick={handleBack}
        disabled={currentStep === 0}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <button 
        data-wizard-next 
        onClick={currentStep < steps.length - 1 ? handleNextStep : handleGeneratePrompt}
        disabled={!canProceed() || isGenerating}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
}
