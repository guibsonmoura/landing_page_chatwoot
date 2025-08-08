'use client';

import { useState, useEffect } from 'react';
import { getConversationFlows } from '@/lib/actions/template.actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageSquare, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { ConversationFlow } from '@/types/wizard';

// Usando o tipo ConversationFlow importado de @/types/wizard
// Extendendo com campos adicionais se necessário
type Flow = ConversationFlow & {
  example?: string;
};

interface ConversationFlowsProps {
  selectedFlow: ConversationFlow | undefined;
  niche?: string;
  onChange: (flow: ConversationFlow | null) => void;
};

export function ConversationFlows({ 
  selectedFlow, 
  niche, 
  onChange 
}: ConversationFlowsProps) {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [filteredFlows, setFilteredFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const fetchFlows = async () => {
      console.log('--- [COMPONENT] ConversationFlows: Fetching flows ---');
      setLoading(true);
      try {
        const fetchedFlows = await getConversationFlows(niche);
        console.log('--- [COMPONENT] ConversationFlows: API Response ---', fetchedFlows);

        if (fetchedFlows && fetchedFlows.length > 0) {
          console.log(`- Setting ${fetchedFlows.length} flows to state.`);
          setFlows(fetchedFlows);
          setFilteredFlows(fetchedFlows);
        } else {
          console.log('- No flows found or empty response.');
        }
      } catch (error) {
        console.error('--- [COMPONENT] ConversationFlows: Error fetching flows ---', error);
      } finally {
        console.log('--- [COMPONENT] ConversationFlows: Fetch complete, setting loading to false ---');
        setLoading(false);
      }
    };
    
    fetchFlows();
  }, [niche]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = flows.filter(
        flow => 
          flow.name.toLowerCase().includes(query) || 
          flow.description.toLowerCase().includes(query)
      );
      setFilteredFlows(filtered);
    } else {
      setFilteredFlows(flows);
    }
  }, [searchQuery, flows]);

  const handleSelectionChange = (flowId: string) => {
    const selected = flows.find(f => f.id === flowId);
    onChange(selected || null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Fluxos de Conversação</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Selecione os fluxos de conversação que seu agente deve dominar e adicione instruções personalizadas.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Pesquisar por nome ou descrição..."
            className="pl-9 border-slate-200 dark:border-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchQuery && filteredFlows.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nenhum fluxo encontrado para "<strong>{searchQuery}</strong>".
            </p>
          </div>
        )}

        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Fluxo de Conversação</span>
            </div>
            <Badge variant="outline" className="bg-white dark:bg-slate-800">
              {selectedFlow ? '1 selecionado' : 'Nenhum selecionado'}
            </Badge>
          </div>

          <ScrollArea className="h-[400px] p-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup
                value={selectedFlow?.id}
                onValueChange={handleSelectionChange}
                className="space-y-3"
              >
                {filteredFlows.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">
                      Nenhum fluxo encontrado para os filtros selecionados.
                    </p>
                  </div>
                ) : (
                  filteredFlows.map((flow) => (
                    <div key={flow.id} className="flex items-start gap-3">
                      <RadioGroupItem value={flow.id} id={`flow-${flow.id}`} className="mt-1" />
                      <div className="w-full">
                        <Label
                          htmlFor={`flow-${flow.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {flow.name}
                        </Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {flow.description}
                        </p>
                        {flow.niche && (
                          <Badge
                            variant="outline"
                            className="mt-2 text-xs bg-slate-50 dark:bg-slate-800"
                          >
                            {flow.niche}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </RadioGroup>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
