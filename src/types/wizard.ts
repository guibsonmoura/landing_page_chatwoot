/**
 * Tipos compartilhados para o wizard de criação de agentes
 */

export interface Archetype {
  id: string;
  name: string;
  description: string;
  niche: string;
  use_case: string;
  example_prompt: string;
  is_active?: boolean;
  final_prompt_template?: string;
  base_template_structured?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  language_style_config: any; // ou um tipo mais específico se souber a estrutura do JSON
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ConversationFlow {
  id: string;
  name: string;
  description: string;
  conversation_flow_config: any; // ou um tipo mais específico se souber a estrutura do JSON
  niche?: string;
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WizardData {
  businessDescription: string;
  archetype?: Archetype;
  personality_traits: PersonalityTrait[];
  conversation_flow?: ConversationFlow;
}
