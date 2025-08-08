'use client';

import { useState, useEffect } from 'react';
import { getAgentArchetypes } from '@/lib/actions/template.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bot, Search, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Archetype } from '@/types/wizard';

// Usando o tipo Archetype importado de @/types/wizard

interface ArchetypeSelectorProps {
  selectedArchetype: Archetype | undefined | null;
  onSelect: (archetype: Archetype | null) => void;
};

export function ArchetypeSelector({ selectedArchetype, onSelect }: ArchetypeSelectorProps) {
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [filteredArchetypes, setFilteredArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [selectedUseCase, setSelectedUseCase] = useState<string>('');

  const uniqueNiches = Array.from(new Set(archetypes.map(a => a.niche))).filter(Boolean).sort();
  const uniqueUseCases = Array.from(new Set(archetypes.map(a => a.use_case))).filter(Boolean).sort();

  useEffect(() => {
    const fetchArchetypes = async () => {
      setLoading(true);
      try {
        const data = await getAgentArchetypes(selectedNiche, selectedUseCase);
        if (data) {
          setArchetypes(data);
          setFilteredArchetypes(data);
        }
      } catch (error) {
        console.error('Erro ao buscar arquétipos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArchetypes();
  }, [selectedNiche, selectedUseCase]);

  useEffect(() => {
    let filtered = [...archetypes];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        archetype => 
          archetype.name.toLowerCase().includes(query) || 
          archetype.description.toLowerCase().includes(query)
      );
    }
    
    if (selectedNiche) {
      filtered = filtered.filter(archetype => archetype.niche === selectedNiche);
    }
    
    if (selectedUseCase) {
      filtered = filtered.filter(archetype => archetype.use_case === selectedUseCase);
    }
    
    setFilteredArchetypes(filtered);
  }, [searchQuery, selectedNiche, selectedUseCase, archetypes]);

  const handleArchetypeSelect = (archetype: Archetype) => onSelect(archetype);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Selecione um Arquétipo</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Escolha um modelo pré-configurado como ponto de partida para o seu agente.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar arquétipos..."
            className="pl-9 border-slate-200 dark:border-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
          >
            <option value="">Todos os nichos</option>
            {uniqueNiches.map(niche => (
              <option key={niche} value={niche}>{niche}</option>
            ))}
          </select>
          
          <select
            className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            value={selectedUseCase}
            onChange={(e) => setSelectedUseCase(e.target.value)}
          >
            <option value="">Todos os casos de uso</option>
            {uniqueUseCases.map(useCase => (
              <option key={useCase} value={useCase}>{useCase}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <RadioGroup 
          value={selectedArchetype?.id} 
          onValueChange={(value) => {
            const archetype = archetypes.find(a => a.id === value);
            if (archetype) {
              handleArchetypeSelect(archetype);
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredArchetypes.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">
                Nenhum arquétipo encontrado para os filtros selecionados.
              </p>
            </div>
          ) : (
            filteredArchetypes.map((archetype) => (
              <div key={archetype.id} className="relative">
                <RadioGroupItem
                  value={archetype.id}
                  id={archetype.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={archetype.id}
                  className="block cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:border-blue-200 dark:hover:border-blue-800 peer-checked:border-blue-500 peer-checked:ring-1 peer-checked:ring-blue-500 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium mb-1 flex items-center gap-2">
                        {archetype.name}
                        {archetype.id === selectedArchetype?.id && (
                          <Badge variant="default" className="bg-blue-500 text-xs">Selecionado</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {archetype.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {archetype.niche && (
                          <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">
                            {archetype.niche}
                          </Badge>
                        )}
                        {archetype.use_case && (
                          <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">
                            {archetype.use_case}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            ))
          )}
        </RadioGroup>
      )}
    </div>
  );
}
