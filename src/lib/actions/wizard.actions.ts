'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';
import { WizardData } from '@/components/agents/wizard/AgentCreationWizard';
// @ts-ignore - OpenAI package may not be typed correctly
import OpenAI from 'openai';

export async function generateAgentPrompt(wizardData: WizardData) {
  // Lazy initialization of OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  if (!process.env.OPENAI_API_KEY) {
    logger.error('OpenAI API key not configured');
    throw new Error('A variável de ambiente OPENAI_API_KEY não está configurada.');
  }

  try {
    const cookieStore = cookies();
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { error: 'Não autorizado. Faça login para continuar.' };
    }

    // Buscar detalhes do arquétipo
    let archetypeDetails = null;
    if (wizardData.archetype_id) {
      const { data: archetype } = await supabase
        .from('agent_archetypes')
        .select('*')
        .eq('id', wizardData.archetype_id)
        .single();
      
      archetypeDetails = archetype;
    }

    // Buscar detalhes dos traços de personalidade
    let personalityTraits: any[] = [];
    if (wizardData.personality_traits && wizardData.personality_traits.length > 0) {
      const { data: traits } = await supabase
        .from('personality_traits')
        .select('*')
        .in('id', wizardData.personality_traits);
      
      personalityTraits = traits || [];
    }

    // Buscar detalhes dos fluxos de conversa
    let conversationFlows: any[] = [];
    if (wizardData.conversation_flows && wizardData.conversation_flows.length > 0) {
      const { data: flows } = await supabase
        .from('conversation_flows')
        .select('*')
        .in('id', wizardData.conversation_flows);
      
      conversationFlows = flows || [];
    }

    // Preparar o prompt para o OpenAI
    const promptData = {
      archetype: archetypeDetails,
      personality_traits: personalityTraits,
      conversation_flows: conversationFlows,
      custom_instructions: wizardData.custom_instructions || ''
    };

    // Chamar a API do OpenAI para gerar o prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em criar prompts de sistema para agentes de IA. 
          Sua tarefa é gerar um prompt de sistema detalhado e um nome para um agente de IA baseado nas informações fornecidas.`
        },
        {
          role: "user",
          content: `Crie um prompt de sistema e um nome para um agente de IA com as seguintes características:
          
          ${archetypeDetails ? `ARQUÉTIPO: ${archetypeDetails.name}
          DESCRIÇÃO DO ARQUÉTIPO: ${archetypeDetails.description || 'N/A'}
          NICHO: ${archetypeDetails.niche || 'N/A'}
          CASO DE USO: ${archetypeDetails.use_case || 'N/A'}` : 'ARQUÉTIPO: Não especificado'}
          
          TRAÇOS DE PERSONALIDADE:
          ${personalityTraits.map((trait: any) => `- ${trait.name}: ${trait.description || 'N/A'}`).join('\n')}
          
          FLUXOS DE CONVERSA:
          ${conversationFlows.map((flow: any) => `- ${flow.name}: ${flow.description || 'N/A'}`).join('\n')}
          
          INSTRUÇÕES PERSONALIZADAS:
          ${wizardData.custom_instructions || 'N/A'}
          
          Por favor, forneça:
          1. Um nome apropriado para o agente (máximo 50 caracteres)
          2. Um prompt de sistema completo que defina claramente a personalidade, comportamento e capacidades do agente.
          
          Responda no seguinte formato JSON:
          {
            "agent_name": "Nome do Agente",
            "system_prompt": "Prompt do sistema completo aqui..."
          }`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Extrair e retornar o resultado
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      return { error: 'Não foi possível gerar o prompt. Tente novamente.' };
    }

    try {
      const parsedResponse = JSON.parse(responseContent);
      return {
        agent_name: parsedResponse.agent_name,
        system_prompt: parsedResponse.system_prompt
      };
    } catch (e) {
      logger.error('Failed to parse OpenAI JSON response', e);
      return null;
    }

  } catch (error: any) {
    logger.error('Failed to generate prompt with OpenAI', error);
    return { error: error.message || 'Erro ao gerar o prompt do agente.' };
  }
}
