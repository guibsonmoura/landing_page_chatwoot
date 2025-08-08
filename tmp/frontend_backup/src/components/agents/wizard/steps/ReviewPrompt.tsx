'use client';

import { WizardData } from '@/types/wizard';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type ReviewPromptProps = {
  agentName: string;
  generatedPrompt: string;
  wizardData: WizardData;
  isGenerating: boolean;
  onRegenerate: () => void;
  onAgentNameChange: (name: string) => void;
  onPromptChange: (prompt: string) => void;
};

export function ReviewPrompt({
  agentName,
  generatedPrompt,
  wizardData,
  isGenerating,
  onRegenerate,
  onAgentNameChange,
  onPromptChange,
}: ReviewPromptProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Revise e Finalize seu Agente</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Abaixo está o prompt de sistema gerado com base nas suas seleções. Você pode editá-lo diretamente ou voltar para ajustar suas escolhas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <Label htmlFor="agentName">Nome do Agente</Label>
            <Input
              id="agentName"
              value={agentName}
              onChange={(e) => onAgentNameChange(e.target.value)}
              className="mt-1"
              placeholder="Ex: Agente de Suporte Nível 1"
            />
          </div>
          <div>
            <Label htmlFor="systemPrompt">Prompt do Sistema (Personalidade)</Label>
            <Textarea
              id="systemPrompt"
              value={generatedPrompt}
              onChange={(e) => onPromptChange(e.target.value)}
              className="min-h-[300px] mt-1"
              placeholder="O prompt do sistema gerado aparecerá aqui..."
            />
          </div>
          <Button onClick={onRegenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regerar Prompt
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Geração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Arquétipo</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">{wizardData.archetype_name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Traços de Personalidade</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {wizardData.personality_traits && wizardData.personality_traits.length > 0 ? (
                    wizardData.personality_traits.map((trait) => (
                      <Badge key={trait} variant="secondary">{trait}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Nenhum traço selecionado</p>
                  )}
                </div>
              </div>
               <div>
                <Label className="text-sm font-medium">Fluxos de Conversa</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                   {wizardData.conversation_flows && wizardData.conversation_flows.length > 0 ? (
                    wizardData.conversation_flows.map((flow) => (
                      <Badge key={flow} variant="secondary">{flow}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Nenhum fluxo selecionado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
