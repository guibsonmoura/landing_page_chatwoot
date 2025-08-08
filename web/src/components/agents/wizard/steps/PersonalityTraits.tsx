'use client';

import { useState, useEffect } from 'react';
import { getPersonalityTraits } from '@/lib/actions/template.actions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Smile, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PersonalityTrait } from '@/types/wizard';

// Usando o tipo PersonalityTrait importado de @/types/wizard

interface PersonalityTraitsProps {
  selectedTraits: PersonalityTrait[];
  onChange: (traits: PersonalityTrait[]) => void;
};

export function PersonalityTraits({ selectedTraits, onChange }: PersonalityTraitsProps) {
  const [traits, setTraits] = useState<PersonalityTrait[]>([]);
  const [filteredTraits, setFilteredTraits] = useState<PersonalityTrait[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const uniqueCategories = Array.from(new Set(traits.map(t => t.category))).filter(Boolean).sort();

  useEffect(() => {
    const fetchTraits = async () => {
      console.log('--- [COMPONENT] PersonalityTraits: Fetching traits ---');
      setLoading(true);
      try {
        const fetchedTraits = await getPersonalityTraits();
        console.log('--- [COMPONENT] PersonalityTraits: API Response ---', fetchedTraits);

        if (fetchedTraits && fetchedTraits.length > 0) {
          console.log(`- Setting ${fetchedTraits.length} traits to state.`);
          setTraits(fetchedTraits);
          setFilteredTraits(fetchedTraits);
        } else {
          console.log('- No traits found or empty response.');
        }
      } catch (error) {
        console.error('--- [COMPONENT] PersonalityTraits: Error fetching traits ---', error);
      } finally {
        console.log('--- [COMPONENT] PersonalityTraits: Fetch complete, setting loading to false ---');
        setLoading(false);
      }
    };
    
    fetchTraits();
  }, []);

  useEffect(() => {
    let filtered = [...traits];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        trait => 
          trait.name.toLowerCase().includes(query) || 
          trait.description.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(trait => trait.category === selectedCategory);
    }
    
    setFilteredTraits(filtered);
  }, [searchQuery, selectedCategory, traits]);

  const handleToggleTrait = (trait: PersonalityTrait) => {
    const isSelected = selectedTraits.some(t => t.id === trait.id);
    const newSelectedTraits = isSelected
      ? selectedTraits.filter(t => t.id !== trait.id)
      : [...selectedTraits, trait];
    onChange(newSelectedTraits);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Selecione Traços de Personalidade</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Escolha até 5 traços de personalidade para definir o comportamento e tom do seu agente.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar traços..."
            className="pl-9 border-slate-200 dark:border-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedTraits.length > 5 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">
            Recomendamos selecionar no máximo 5 traços para melhores resultados.
          </p>
        </div>
      )}

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Smile className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Traços de Personalidade</span>
          </div>
          <Badge variant="outline" className="bg-white dark:bg-slate-800">
            {selectedTraits.length} selecionados
          </Badge>
        </div>

        <ScrollArea className="h-[400px] p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTraits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400">
                    Nenhum traço encontrado para os filtros selecionados.
                  </p>
                </div>
              ) : (
                filteredTraits.map((trait) => (
                  <div key={trait.id} className="flex items-start gap-3">
                    <Checkbox
                      id={`trait-${trait.id}`}
                      checked={selectedTraits.some(t => t.id === trait.id)}
                      onCheckedChange={() => handleToggleTrait(trait)}
                      className="mt-1"
                    />
                    <div>
                      <Label
                        htmlFor={`trait-${trait.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {trait.name}
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {trait.description}
                      </p>
                      {trait.category && (
                        <Badge
                          variant="outline"
                          className="mt-2 text-xs bg-slate-50 dark:bg-slate-800"
                        >
                          {trait.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
