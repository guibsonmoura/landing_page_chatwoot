'use client';

import { useState, useEffect } from 'react';
import { getAgentArchetypes } from '@/lib/actions/template.actions';
import { AgentArchetype } from '@/types/wizard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Bot, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type AgentTemplateGalleryProps = {
  onTemplateSelect: (prompt: string, archetypeName: string) => void;
  selectedArchetypeId: string | null;
  onArchetypeSelect: (archetypeId: string) => void;
  agentName?: string;
};

export function AgentTemplateGallery({ 
  onTemplateSelect,
  selectedArchetypeId,
  onArchetypeSelect,
  agentName
}: AgentTemplateGalleryProps) {
  const [archetypes, setArchetypes] = useState<AgentArchetype[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedUseCase, setSelectedUseCase] = useState('all');
  const [niches, setNiches] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<string[]>([]);

  useEffect(() => {
    async function fetchArchetypes() {
      try {
        console.log('--- [AgentTemplateGallery] Iniciando busca de templates ---');
        setIsLoading(true);
        const data = await getAgentArchetypes();
        console.log(`--- [AgentTemplateGallery] Total de templates: ${data?.length || 0} ---`);
        
        if (data && data.length > 0) {
          // Extrair nichos e casos de uso únicos
          const uniqueNiches = Array.from(new Set(data.map(item => item.niche))).filter(Boolean);
          const uniqueUseCases = Array.from(new Set(data.map(item => item.use_case))).filter(Boolean);
          setNiches(uniqueNiches as string[]);
          setUseCases(uniqueUseCases as string[]);
        }
        
        setArchetypes(data || []);
      } catch (error) {
        console.error("--- [AgentTemplateGallery] Erro ao buscar templates ---", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchArchetypes();
  }, []);

  const handleSelect = (archetype: AgentArchetype) => {
    onArchetypeSelect(archetype.id);
    onTemplateSelect(archetype.final_prompt_template, archetype.name);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedNiche('all');
    setSelectedUseCase('all');
  };

  const filteredArchetypes = archetypes.filter((archetype) => {
    const matchesSearch = !searchQuery || 
      archetype.archetype_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      archetype.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesNiche = selectedNiche === 'all' || archetype.niche === selectedNiche;
    const matchesUseCase = selectedUseCase === 'all' || archetype.use_case === selectedUseCase;
    
    return matchesSearch && matchesNiche && matchesUseCase;
  });

  if (isLoading) {
    return <div className="text-center p-8 text-gray-500">Carregando templates...</div>;
  }

  if (archetypes.length === 0) {
    return <div className="text-center p-8 text-gray-500">Nenhum template encontrado.</div>;
  }

  return (
    <div className="flex flex-col h-full">
        
        {/* Filtros */}
        <div className="mb-2 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar arquétipos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-gray-200 dark:border-gray-700"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="Todos os nichos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os nichos</SelectItem>
                {niches.map((niche) => (
                  <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedUseCase} onValueChange={setSelectedUseCase}>
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="Todos os casos de uso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os casos de uso</SelectItem>
                {useCases.map((useCase) => (
                  <SelectItem key={useCase} value={useCase}>{useCase}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(searchQuery || selectedNiche !== 'all' || selectedUseCase !== 'all') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearFilters}
                className="h-9 px-3"
              >
                <X className="h-4 w-4 mr-1" /> Limpar filtros
              </Button>
            )}
          </div>
        </div>
        <div className="overflow-y-auto" style={{height: 'calc(100vh - 300px)', maxHeight: '500px'}}>
            <div className="grid grid-cols-1 gap-3 pb-40 pr-4">
                {filteredArchetypes.map((archetype) => (
                    <Card 
                        key={archetype.id} 
                        onClick={() => handleSelect(archetype)} 
                        className={cn(
                            'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 w-full overflow-hidden',
                            selectedArchetypeId === archetype.id 
                                ? 'border-blue-500 ring-2 ring-blue-500 shadow-xl'
                                : 'border-gray-200 dark:border-gray-700'
                        )}
                    >
                        <div className="flex flex-col p-3 pt-2">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 break-words">{archetype.name}</h3>
                                {selectedArchetypeId === archetype.id && (
                                    <CheckCircle className="h-6 w-6 flex-shrink-0 text-blue-500" />
                                )}
                            </div>
                            
                            <div className="flex items-center mt-2 space-x-2">
                                <Badge variant="outline" className="text-sm px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                    {archetype.niche}
                                </Badge>
                                <Badge variant="secondary" className="text-sm px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                                    {archetype.use_case}
                                </Badge>
                            </div>
                            
                            <p className="mt-2 mb-2 text-gray-700 dark:text-gray-300">
                                {archetype.description}
                            </p>
                            
                            <div className="mt-2">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Preview do Prompt</h4>
                                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md p-2 h-24 overflow-y-auto">
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                        {archetype.final_prompt_template}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
                
                {filteredArchetypes.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-500 space-y-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <Search className="h-8 w-8 text-gray-400" />
                        <p>Nenhum template encontrado com os filtros selecionados.</p>
                        <Button variant="outline" size="sm" onClick={handleClearFilters}>
                            Limpar filtros
                        </Button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
