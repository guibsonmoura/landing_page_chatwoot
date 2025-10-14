// Type declarations for wizard step components

declare module './ArchetypeSelector' {
  export interface ArchetypeSelectorProps {
    selectedArchetype?: string;
    onSelect: (id: string, name: string, niche: string, useCase: string) => void;
  }
  
  export function ArchetypeSelector(props: ArchetypeSelectorProps): JSX.Element;
}

declare module './PersonalityTraits' {
  export interface PersonalityTraitsProps {
    selectedTraits: string[];
    onChange: (traits: string[]) => void;
  }
  
  export function PersonalityTraits(props: PersonalityTraitsProps): JSX.Element;
}

declare module './ConversationFlows' {
  export interface ConversationFlowsProps {
    selectedFlows: string[];
    niche?: string;
    onChange: (flows: string[]) => void;
    customInstructions: string;
    onCustomInstructionsChange: (instructions: string) => void;
  }
  
  export function ConversationFlows(props: ConversationFlowsProps): JSX.Element;
}

declare module './ReviewPrompt' {
  export interface ReviewPromptProps {
    agentName: string;
    onAgentNameChange: (name: string) => void;
    generatedPrompt: string;
    onPromptChange: (prompt: string) => void;
    isGenerating: boolean;
    onRegenerate: () => void;
    wizardData: any;
  }
  
  export function ReviewPrompt(props: ReviewPromptProps): JSX.Element;
}
